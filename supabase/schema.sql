-- Tarbiya platformasi: o‘qituvchi va o‘quvchi kabinetlari.
-- Supabase loyihasida: SQL Editor → New query → ushbu faylni to‘liq joylang → Run.
-- Faylni qayta ishga tushirish xavfsiz: jadvallar va ma’lumotlar saqlanib qoladi, funksiyalar yangilanadi.
--
-- Jadvallarga to‘g‘ridan-to‘g‘ri kirish yopiq (RLS yoqilgan, siyosat yo‘q).
-- Sayt faqat quyidagi t_* funksiyalarini chaqiradi; har bir funksiya sessiya tokeni va rolni tekshiradi.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.t_users (
  id uuid primary key default gen_random_uuid(),
  login text not null unique,
  pass_hash text not null,
  role text not null check (role in ('teacher', 'student')),
  full_name text not null,
  school text not null default '',
  cls text not null default '',
  teacher_code text unique,
  teacher_id uuid references public.t_users (id) on delete set null,
  grp text not null default '' check (grp in ('', 'tajriba', 'nazorat')),
  created_at timestamptz not null default now()
);
create index if not exists t_users_teacher_idx on public.t_users (teacher_id);

create table if not exists public.t_sessions (
  token_hash text primary key,
  user_id uuid not null references public.t_users (id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists t_sessions_user_idx on public.t_sessions (user_id);

create table if not exists public.t_attempts (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.t_users (id) on delete cascade,
  teacher_id uuid references public.t_users (id) on delete set null,
  test_id text not null,
  title text not null,
  kind text not null default 'test',
  correct int not null,
  total int not null,
  pct int not null,
  survey_pct int,
  stage text not null default '',
  grp text not null default '',
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists t_attempts_teacher_idx on public.t_attempts (teacher_id, created_at desc);
create index if not exists t_attempts_student_idx on public.t_attempts (student_id, created_at desc);

alter table public.t_users enable row level security;
alter table public.t_sessions enable row level security;
alter table public.t_attempts enable row level security;
revoke all on public.t_users, public.t_sessions, public.t_attempts from anon, authenticated;

-- ---------- ichki yordamchilar (tashqaridan chaqirilmaydi) ----------

create or replace function public.t__hash_token(p_token text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create or replace function public.t__user(p_token text) returns public.t_users
language plpgsql security definer set search_path = public, extensions as $$
declare u public.t_users;
begin
  select tu.* into u from public.t_sessions s join public.t_users tu on tu.id = s.user_id
   where s.token_hash = public.t__hash_token(p_token) and s.expires_at > now();
  if u.id is null then
    raise exception 'Sessiya tugagan. Qaytadan kiring.' using errcode = 'P0001', hint = 'auth';
  end if;
  return u;
end $$;

create or replace function public.t__user_json(u public.t_users) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', u.id, 'login', u.login, 'role', u.role, 'full_name', u.full_name,
    'school', u.school, 'cls', u.cls, 'grp', u.grp,
    'teacher_code', u.teacher_code, 'teacher_id', u.teacher_id,
    'teacher_name', (select t.full_name from public.t_users t where t.id = u.teacher_id)
  )
$$;

create or replace function public.t__session(p_user uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare tok text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from public.t_sessions where expires_at < now();
  insert into public.t_sessions (token_hash, user_id, expires_at)
  values (public.t__hash_token(tok), p_user, now() + interval '30 days');
  return tok;
end $$;

revoke all on function public.t__hash_token(text), public.t__user(text), public.t__user_json(public.t_users), public.t__session(uuid) from public, anon, authenticated;

-- ---------- ochiq funksiyalar ----------

create or replace function public.t_check_code(p_code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('full_name', full_name, 'school', school)
    from public.t_users where role = 'teacher' and teacher_code = upper(trim(p_code))
$$;

create or replace function public.t_register(
  p_role text, p_login text, p_password text, p_full_name text,
  p_school text default '', p_cls text default '', p_teacher_code text default ''
) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  lg text := lower(trim(p_login));
  nm text := trim(coalesce(p_full_name, ''));
  t_id uuid;
  code text;
  u public.t_users;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if p_role not in ('teacher', 'student') then
    raise exception 'Noto‘g‘ri rol.' using errcode = 'P0001';
  end if;
  if lg !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'Login 3–32 belgidan iborat bo‘lsin: lotin harflari, raqamlar, nuqta, chiziqcha.' using errcode = 'P0001';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Parol kamida 6 belgidan iborat bo‘lsin.' using errcode = 'P0001';
  end if;
  if length(nm) < 3 or length(nm) > 120 then
    raise exception 'Familiya va ismni to‘liq kiriting.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.t_users where login = lg) then
    raise exception 'Bu login band. Boshqa login tanlang.' using errcode = 'P0001';
  end if;

  if p_role = 'student' then
    select id into t_id from public.t_users
     where role = 'teacher' and teacher_code = upper(trim(coalesce(p_teacher_code, '')));
    if t_id is null then
      raise exception 'O‘qituvchi kodi topilmadi. Kodni o‘qituvchingizdan qayta so‘rang.' using errcode = 'P0001';
    end if;
  else
    loop
      code := '';
      for i in 1..6 loop
        code := code || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % length(alphabet)), 1);
      end loop;
      exit when not exists (select 1 from public.t_users where teacher_code = code);
    end loop;
  end if;

  insert into public.t_users (login, pass_hash, role, full_name, school, cls, teacher_code, teacher_id)
  values (lg, extensions.crypt(p_password, extensions.gen_salt('bf')), p_role, nm,
          left(trim(coalesce(p_school, '')), 120), left(trim(coalesce(p_cls, '')), 20),
          case when p_role = 'teacher' then code end, t_id)
  returning * into u;

  return json_build_object('token', public.t__session(u.id), 'user', public.t__user_json(u));
end $$;

create or replace function public.t_login(p_login text, p_password text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u public.t_users;
begin
  select * into u from public.t_users where login = lower(trim(p_login));
  if u.id is null or u.pass_hash <> extensions.crypt(coalesce(p_password, ''), u.pass_hash) then
    raise exception 'Login yoki parol noto‘g‘ri.' using errcode = 'P0001';
  end if;
  return json_build_object('token', public.t__session(u.id), 'user', public.t__user_json(u));
end $$;

create or replace function public.t_logout(p_token text) returns json
language sql security definer set search_path = public, extensions as $$
  delete from public.t_sessions where token_hash = public.t__hash_token(p_token);
  select json_build_object('ok', true);
$$;

create or replace function public.t_me(p_token text) returns json
language sql security definer set search_path = public, extensions as $$
  select public.t__user_json(public.t__user(p_token))
$$;

create or replace function public.t_submit(
  p_token text, p_test_id text, p_title text, p_kind text, p_details jsonb,
  p_survey_pct int default null, p_stage text default ''
) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.t_users := public.t__user(p_token);
  n int;
  ok int;
  new_id bigint;
begin
  if u.role <> 'student' then
    raise exception 'Natijalar faqat o‘quvchi profilidan yuboriladi.' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_details) <> 'array' then
    raise exception 'Javoblar formati noto‘g‘ri.' using errcode = 'P0001';
  end if;
  n := jsonb_array_length(p_details);
  if n < 1 or n > 100 or octet_length(p_details::text) > 100000 then
    raise exception 'Javoblar hajmi noto‘g‘ri.' using errcode = 'P0001';
  end if;
  if length(coalesce(p_test_id, '')) not between 1 and 64 or length(coalesce(p_title, '')) not between 1 and 200 then
    raise exception 'Test nomi noto‘g‘ri.' using errcode = 'P0001';
  end if;
  if p_survey_pct is not null and p_survey_pct not between 0 and 100 then
    raise exception 'So‘rovnoma natijasi noto‘g‘ri.' using errcode = 'P0001';
  end if;
  select count(*) into ok from jsonb_array_elements(p_details) e where (e ->> 'ok')::boolean is true;

  insert into public.t_attempts (student_id, teacher_id, test_id, title, kind, correct, total, pct, survey_pct, stage, grp, details)
  values (u.id, u.teacher_id, p_test_id, p_title,
          case when p_kind in ('test', 'diag', 'keys', 'krossvord', 'oyin') then p_kind else 'test' end,
          ok, n, round(100.0 * ok / n), p_survey_pct,
          case when p_stage in ('dastlabki', 'yakuniy') then p_stage else '' end,
          u.grp, p_details)
  returning id into new_id;
  return json_build_object('id', new_id, 'correct', ok, 'total', n, 'pct', round(100.0 * ok / n));
end $$;

create or replace function public.t_my_attempts(p_token text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u public.t_users := public.t__user(p_token);
begin
  return (select coalesce(json_agg(json_build_object(
    'id', a.id, 'test_id', a.test_id, 'title', a.title, 'kind', a.kind, 'correct', a.correct, 'total', a.total,
    'pct', a.pct, 'survey_pct', a.survey_pct, 'stage', a.stage, 'grp', a.grp, 'created_at', a.created_at
  ) order by a.created_at desc), '[]'::json)
  from public.t_attempts a where a.student_id = u.id);
end $$;

create or replace function public.t_attempt(p_token text, p_id bigint) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.t_users := public.t__user(p_token);
  r json;
begin
  select json_build_object(
    'id', a.id, 'test_id', a.test_id, 'title', a.title, 'kind', a.kind, 'correct', a.correct, 'total', a.total,
    'pct', a.pct, 'survey_pct', a.survey_pct, 'stage', a.stage, 'grp', a.grp, 'created_at', a.created_at,
    'details', a.details, 'student_name', s.full_name)
    into r
    from public.t_attempts a join public.t_users s on s.id = a.student_id
   where a.id = p_id and (a.student_id = u.id or a.teacher_id = u.id);
  if r is null then
    raise exception 'Natija topilmadi.' using errcode = 'P0001';
  end if;
  return r;
end $$;

create or replace function public.t_teacher_data(p_token text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u public.t_users := public.t__user(p_token);
begin
  if u.role <> 'teacher' then
    raise exception 'Bu bo‘lim faqat o‘qituvchilar uchun.' using errcode = 'P0001';
  end if;
  return json_build_object(
    'students', (select coalesce(json_agg(json_build_object(
        'id', s.id, 'login', s.login, 'full_name', s.full_name, 'school', s.school, 'cls', s.cls,
        'grp', s.grp, 'created_at', s.created_at) order by s.full_name), '[]'::json)
      from public.t_users s where s.teacher_id = u.id),
    'attempts', (select coalesce(json_agg(json_build_object(
        'id', a.id, 'student_id', a.student_id, 'test_id', a.test_id, 'title', a.title, 'kind', a.kind,
        'correct', a.correct, 'total', a.total, 'pct', a.pct, 'survey_pct', a.survey_pct,
        'stage', a.stage, 'grp', a.grp, 'created_at', a.created_at) order by a.created_at desc), '[]'::json)
      from public.t_attempts a where a.teacher_id = u.id)
  );
end $$;

create or replace function public.t_set_group(p_token text, p_student uuid, p_grp text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u public.t_users := public.t__user(p_token);
begin
  if u.role <> 'teacher' then
    raise exception 'Bu amal faqat o‘qituvchilar uchun.' using errcode = 'P0001';
  end if;
  if coalesce(p_grp, '') not in ('', 'tajriba', 'nazorat') then
    raise exception 'Guruh noto‘g‘ri.' using errcode = 'P0001';
  end if;
  update public.t_users set grp = coalesce(p_grp, '') where id = p_student and teacher_id = u.id;
  if not found then
    raise exception 'O‘quvchi topilmadi.' using errcode = 'P0001';
  end if;
  return json_build_object('ok', true);
end $$;

grant execute on function
  public.t_check_code(text),
  public.t_register(text, text, text, text, text, text, text),
  public.t_login(text, text),
  public.t_logout(text),
  public.t_me(text),
  public.t_submit(text, text, text, text, jsonb, int, text),
  public.t_my_attempts(text),
  public.t_attempt(text, bigint),
  public.t_teacher_data(text),
  public.t_set_group(text, uuid, text)
to anon, authenticated;
