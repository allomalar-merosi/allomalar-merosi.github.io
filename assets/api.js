/* O‘qituvchi va o‘quvchi kabinetlari uchun ma’lumotlar qatlami.
   CONFIG.supabaseUrl va CONFIG.supabaseKey berilgan bo‘lsa, Supabase’dagi t_* funksiyalari chaqiriladi (supabase/schema.sql).
   Aks holda “sinov rejimi” ishlaydi: barcha profillar va natijalar shu brauzerda saqlanadi. */
(function () {
  "use strict";

  var CFG = window.CONFIG || {};
  var REMOTE = !!(CFG.supabaseUrl && CFG.supabaseKey);
  var MODE = REMOTE ? "remote" : "demo";
  var SESSION_KEY = "tarbiya.session.v1";
  var DEMO_KEY = "tarbiya.demo.v1";

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function fail(message, auth) {
    var e = new Error(message);
    if (auth) e.auth = true;
    return Promise.reject(e);
  }

  /* ---------- Supabase (PostgREST RPC) ---------- */

  function rpc(fn, args) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var headers = { "Content-Type": "application/json", apikey: CFG.supabaseKey };
    if (/^eyJ/.test(CFG.supabaseKey)) headers.Authorization = "Bearer " + CFG.supabaseKey;
    return fetch(base + "/rest/v1/rpc/" + fn, { method: "POST", headers: headers, body: JSON.stringify(args || {}) })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
          if (res.ok) return data;
          var msg = data && data.message ? data.message : "Server xatosi (" + res.status + ").";
          if (res.status === 404) msg = "Server sozlanmagan: supabase/schema.sql hali ishga tushirilmagan.";
          if (res.status === 401) msg = "Server kaliti noto‘g‘ri (config.js dagi supabaseKey).";
          return fail(msg, data && data.hint === "auth");
        });
      }, function () {
        return fail("Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.");
      });
  }

  var remote = {
    checkCode: function (code) { return rpc("t_check_code", { p_code: code }); },
    register: function (f) {
      return rpc("t_register", { p_role: f.role, p_login: f.login, p_password: f.password, p_full_name: f.full_name, p_school: f.school || "", p_cls: f.cls || "", p_teacher_code: f.teacher_code || "" });
    },
    login: function (login, password) { return rpc("t_login", { p_login: login, p_password: password }); },
    logout: function (token) { return rpc("t_logout", { p_token: token }); },
    me: function (token) { return rpc("t_me", { p_token: token }); },
    submit: function (token, r) {
      return rpc("t_submit", { p_token: token, p_test_id: r.test_id, p_title: r.title, p_kind: r.kind, p_details: r.details, p_survey_pct: r.survey_pct == null ? null : r.survey_pct, p_stage: r.stage || "" });
    },
    myAttempts: function (token) { return rpc("t_my_attempts", { p_token: token }); },
    attempt: function (token, id) { return rpc("t_attempt", { p_token: token, p_id: id }); },
    teacherData: function (token) { return rpc("t_teacher_data", { p_token: token }); },
    setGroup: function (token, studentId, grp) { return rpc("t_set_group", { p_token: token, p_student: studentId, p_grp: grp }); }
  };

  /* ---------- sinov rejimi (brauzer xotirasi) ---------- */

  function db() { return load(DEMO_KEY, { users: [], sessions: {}, attempts: [], seq: 0 }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function hash(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode("tarbiya:" + s)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    return Promise.resolve("plain:" + s);
  }
  function userJson(d, u) {
    var t = u.teacher_id ? d.users.filter(function (x) { return x.id === u.teacher_id; })[0] : null;
    return { id: u.id, login: u.login, role: u.role, full_name: u.full_name, school: u.school, cls: u.cls, grp: u.grp,
      teacher_code: u.teacher_code || null, teacher_id: u.teacher_id || null, teacher_name: t ? t.full_name : null };
  }
  function session(d, u) {
    var tok = uid() + uid();
    d.sessions[tok] = u.id;
    return tok;
  }
  function who(d, token) {
    var id = d.sessions[token];
    return id ? d.users.filter(function (u) { return u.id === id; })[0] : null;
  }
  function attemptRow(a) {
    var r = {};
    Object.keys(a).forEach(function (k) { if (k !== "details") r[k] = a[k]; });
    return r;
  }

  var demo = {
    checkCode: function (code) {
      var t = db().users.filter(function (u) { return u.role === "teacher" && u.teacher_code === String(code || "").trim().toUpperCase(); })[0];
      return Promise.resolve(t ? { full_name: t.full_name, school: t.school } : null);
    },
    register: function (f) {
      var d = db();
      var lg = String(f.login || "").trim().toLowerCase();
      var nm = String(f.full_name || "").trim();
      if (!/^[a-z0-9._-]{3,32}$/.test(lg)) return fail("Login 3–32 belgidan iborat bo‘lsin: lotin harflari, raqamlar, nuqta, chiziqcha.");
      if (String(f.password || "").length < 6) return fail("Parol kamida 6 belgidan iborat bo‘lsin.");
      if (nm.length < 3) return fail("Familiya va ismni to‘liq kiriting.");
      if (d.users.some(function (u) { return u.login === lg; })) return fail("Bu login band. Boshqa login tanlang.");
      var teacher = null, code = null;
      if (f.role === "student") {
        teacher = d.users.filter(function (u) { return u.role === "teacher" && u.teacher_code === String(f.teacher_code || "").trim().toUpperCase(); })[0];
        if (!teacher) return fail("O‘qituvchi kodi topilmadi. Kodni o‘qituvchingizdan qayta so‘rang.");
      } else {
        var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        do {
          code = "";
          for (var i = 0; i < 6; i++) code += abc.charAt(Math.floor(Math.random() * abc.length));
        } while (d.users.some(function (u) { return u.teacher_code === code; }));
      }
      return hash(f.password).then(function (h) {
        var u = { id: uid(), login: lg, pass: h, role: f.role, full_name: nm, school: String(f.school || "").trim(), cls: String(f.cls || "").trim(),
          teacher_code: code, teacher_id: teacher ? teacher.id : null, grp: "", created_at: new Date().toISOString() };
        d.users.push(u);
        var tok = session(d, u);
        save(DEMO_KEY, d);
        return { token: tok, user: userJson(d, u) };
      });
    },
    login: function (login, password) {
      var d = db();
      var u = d.users.filter(function (x) { return x.login === String(login || "").trim().toLowerCase(); })[0];
      return hash(password).then(function (h) {
        if (!u || u.pass !== h) return fail("Login yoki parol noto‘g‘ri.");
        var tok = session(d, u);
        save(DEMO_KEY, d);
        return { token: tok, user: userJson(d, u) };
      });
    },
    logout: function (token) {
      var d = db();
      delete d.sessions[token];
      save(DEMO_KEY, d);
      return Promise.resolve({ ok: true });
    },
    me: function (token) {
      var d = db(), u = who(d, token);
      return u ? Promise.resolve(userJson(d, u)) : fail("Sessiya tugagan. Qaytadan kiring.", true);
    },
    submit: function (token, r) {
      var d = db(), u = who(d, token);
      if (!u) return fail("Sessiya tugagan. Qaytadan kiring.", true);
      if (u.role !== "student") return fail("Natijalar faqat o‘quvchi profilidan yuboriladi.");
      var ok = r.details.filter(function (x) { return x.ok; }).length, n = r.details.length;
      var a = { id: ++d.seq, student_id: u.id, teacher_id: u.teacher_id, test_id: r.test_id, title: r.title, kind: r.kind || "test",
        correct: ok, total: n, pct: Math.round(100 * ok / n), survey_pct: r.survey_pct == null ? null : r.survey_pct,
        stage: r.stage || "", grp: u.grp || "", details: r.details, created_at: new Date().toISOString() };
      d.attempts.push(a);
      if (!save(DEMO_KEY, d)) return fail("Brauzer xotirasi to‘lgan yoki yopiq, natija saqlanmadi.");
      return Promise.resolve({ id: a.id, correct: a.correct, total: a.total, pct: a.pct });
    },
    myAttempts: function (token) {
      var d = db(), u = who(d, token);
      if (!u) return fail("Sessiya tugagan. Qaytadan kiring.", true);
      return Promise.resolve(d.attempts.filter(function (a) { return a.student_id === u.id; }).reverse().map(attemptRow));
    },
    attempt: function (token, id) {
      var d = db(), u = who(d, token);
      if (!u) return fail("Sessiya tugagan. Qaytadan kiring.", true);
      var a = d.attempts.filter(function (x) { return x.id === Number(id) && (x.student_id === u.id || x.teacher_id === u.id); })[0];
      if (!a) return fail("Natija topilmadi.");
      var s = d.users.filter(function (x) { return x.id === a.student_id; })[0];
      var r = JSON.parse(JSON.stringify(a));
      r.student_name = s ? s.full_name : "";
      return Promise.resolve(r);
    },
    teacherData: function (token) {
      var d = db(), u = who(d, token);
      if (!u) return fail("Sessiya tugagan. Qaytadan kiring.", true);
      if (u.role !== "teacher") return fail("Bu bo‘lim faqat o‘qituvchilar uchun.");
      return Promise.resolve({
        students: d.users.filter(function (s) { return s.teacher_id === u.id; })
          .map(function (s) { return { id: s.id, login: s.login, full_name: s.full_name, school: s.school, cls: s.cls, grp: s.grp, created_at: s.created_at }; })
          .sort(function (a, b) { return a.full_name.localeCompare(b.full_name); }),
        attempts: d.attempts.filter(function (a) { return a.teacher_id === u.id; }).reverse().map(attemptRow)
      });
    },
    setGroup: function (token, studentId, grp) {
      var d = db(), u = who(d, token);
      if (!u) return fail("Sessiya tugagan. Qaytadan kiring.", true);
      var s = d.users.filter(function (x) { return x.id === studentId && x.teacher_id === u.id; })[0];
      if (!s) return fail("O‘quvchi topilmadi.");
      s.grp = grp || "";
      d.attempts.forEach(function (a) { if (a.student_id === s.id && !a.grp) a.grp = s.grp; });
      save(DEMO_KEY, d);
      return Promise.resolve({ ok: true });
    }
  };

  /* ---------- umumiy interfeys ---------- */

  var impl = REMOTE ? remote : demo;
  var current = null;

  function token() {
    var s = load(SESSION_KEY, null);
    return s && s.mode === MODE ? s.token : null;
  }
  function withToken(fn) {
    return function () {
      var args = [token()].concat([].slice.call(arguments));
      if (!args[0]) return fail("Avval tizimga kiring.", true);
      return fn.apply(null, args).catch(function (e) {
        if (e.auth) { try { localStorage.removeItem(SESSION_KEY); } catch (x) {} current = null; }
        throw e;
      });
    };
  }
  function start(res) {
    save(SESSION_KEY, { mode: MODE, token: res.token });
    current = res.user;
    return res.user;
  }

  window.API = {
    mode: MODE,
    user: function () { return current; },
    restore: function () {
      if (!token()) return Promise.resolve(null);
      return withToken(impl.me)().then(function (u) { current = u; return u; }, function (e) {
        if (!e.auth) throw e;
        return null;
      });
    },
    checkCode: function (code) { return impl.checkCode(code); },
    register: function (f) { return impl.register(f).then(start); },
    login: function (login, password) { return impl.login(login, password).then(start); },
    logout: function () {
      var t = token();
      try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
      current = null;
      return t ? impl.logout(t).catch(function () {}) : Promise.resolve();
    },
    submit: withToken(impl.submit),
    myAttempts: withToken(impl.myAttempts),
    attempt: withToken(impl.attempt),
    teacherData: withToken(impl.teacherData),
    setGroup: withToken(impl.setGroup)
  };
})();
