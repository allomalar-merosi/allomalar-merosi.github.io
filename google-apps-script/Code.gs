/* Allomalar merosi platformasi — server (Google Apps Script).
   Bu fayl avtomatik yig‘ilgan: assets/core.js + google-apps-script/adapter.gs.js.
   O‘rnatish tartibi README.md da. */

/* Platformaning server mantig‘i: ro‘yxatdan o‘tish, kirish, natijalarni saqlash, o‘qituvchi paneli.
   Bir xil kod ikki joyda ishlaydi:
   - Google Apps Script (google-apps-script/Code.gs; tools/build-gs.js orqali yig‘iladi) — jadval Google Sheets;
   - brauzerdagi sinov rejimi (assets/api.js) — jadval localStorage.
   store: rows(table), add(table, row), update(table, id, patch), remove(table, id)
   env:   now() -> ms, random() -> [0,1) */

var TABLES = {
  teachers: ["id", "name", "school", "login", "salt", "hash", "code", "stage", "created"],
  students: ["id", "name", "cls", "login", "salt", "hash", "code", "group", "created"],
  sessions: ["id", "uid", "role", "expires"],
  attempts: ["id", "sid", "code", "kind", "quizId", "title", "score", "total", "pct", "survey", "group", "stage", "answers", "created"]
};

function sha256(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  var bytes = unescape(encodeURIComponent(ascii));
  var k = [], h = [], primes = 0;
  for (var c = 2; primes < 64; c++) {
    var isP = true;
    for (var d = 2; d * d <= c; d++) if (c % d === 0) { isP = false; break; }
    if (isP) {
      if (primes < 8) h[primes] = (Math.pow(c, 0.5) * 4294967296) | 0;
      k[primes++] = (Math.pow(c, 1 / 3) * 4294967296) | 0;
    }
  }
  var words = [], bitLen = bytes.length * 8;
  bytes += "\x80";
  while (bytes.length % 64 - 56) bytes += "\x00";
  for (var i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << ((3 - i) % 4) * 8;
  words[words.length] = (bitLen / 4294967296) | 0;
  words[words.length] = bitLen | 0;
  for (var j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), old = h.slice(0);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = h[0], e = h[4];
      var t1 = h[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
      h = [(t1 + t2) | 0].concat(h);
      h[4] = (h[4] + t1) | 0;
      h.length = 8;
    }
    for (i = 0; i < 8; i++) h[i] = (h[i] + old[i]) | 0;
  }
  var out = "";
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (h[i] >> (j * 8)) & 255; out += (b < 16 ? "0" : "") + b.toString(16); }
  return out;
}

function createCore(store, env) {
  var SESSION_DAYS = 60;
  var KINDS = { quiz: 1, lesson: 1, diagnostic: 1, case: 1, game: 1, crossword: 1 };

  function rid(n, alphabet) {
    alphabet = alphabet || "abcdefghijklmnopqrstuvwxyz0123456789";
    var s = "";
    for (var i = 0; i < n; i++) s += alphabet.charAt(Math.floor(env.random() * alphabet.length));
    return s;
  }
  function fail(msg) { return { ok: false, error: msg }; }
  function str(v, max) { return String(v == null ? "" : v).trim().slice(0, max || 200); }
  function normLogin(v) { return str(v, 60).toLowerCase(); }
  function find(table, pred) {
    var rows = store.rows(table);
    for (var i = 0; i < rows.length; i++) if (pred(rows[i])) return rows[i];
    return null;
  }
  function loginTaken(login) {
    return !!(find("teachers", function (r) { return r.login === login; }) || find("students", function (r) { return r.login === login; }));
  }
  function checkCredentials(login, password) {
    if (!/^[a-z0-9._@+-]{3,60}$/.test(login)) return "Login 3–60 belgidan iborat bo‘lsin: lotin harflari, raqamlar yoki email (masalan, ali@gmail.com). Bo‘sh joy va kirill harflari mumkin emas.";
    if (String(password || "").length < 4) return "Parol kamida 4 belgidan iborat bo‘lsin.";
    return null;
  }
  function hashPw(salt, pw) { return sha256(salt + ":" + pw); }
  function publicTeacher(t) { return { role: "teacher", id: t.id, name: t.name, school: t.school, login: t.login, code: t.code, stage: t.stage || "dastlabki" }; }
  function publicStudent(s, t) {
    return { role: "student", id: s.id, name: s.name, cls: s.cls, login: s.login, code: s.code, group: s.group || "", teacher: t ? t.name : "", school: t ? t.school : "", stage: t ? (t.stage || "dastlabki") : "dastlabki" };
  }
  function teacherByCode(code) { return find("teachers", function (r) { return r.code === code; }); }
  function newSession(uid, role) {
    var token = rid(32);
    store.add("sessions", { id: token, uid: uid, role: role, expires: env.now() + SESSION_DAYS * 864e5 });
    return token;
  }
  function auth(token) {
    if (!token) return null;
    var s = find("sessions", function (r) { return r.id === token; });
    if (!s || Number(s.expires) < env.now()) return null;
    if (s.role === "teacher") {
      var t = find("teachers", function (r) { return r.id === s.uid; });
      return t ? { role: "teacher", rec: t } : null;
    }
    var st = find("students", function (r) { return r.id === s.uid; });
    return st ? { role: "student", rec: st } : null;
  }
  function userOf(a) {
    return a.role === "teacher" ? publicTeacher(a.rec) : publicStudent(a.rec, teacherByCode(a.rec.code));
  }
  function attemptOut(r, withAnswers) {
    var o = { id: r.id, sid: r.sid, kind: r.kind, quizId: r.quizId, title: r.title, score: Number(r.score), total: Number(r.total), pct: Number(r.pct), survey: r.survey === "" || r.survey == null ? null : Number(r.survey), group: r.group, stage: r.stage, created: Number(r.created) };
    if (withAnswers) { try { o.answers = JSON.parse(r.answers || "null"); } catch (e) { o.answers = null; } }
    return o;
  }

  var actions = {
    registerTeacher: function (q) {
      var login = normLogin(q.login), err = checkCredentials(login, q.password);
      if (str(q.name).length < 3) return fail("Ism-familiyangizni to‘liq kiriting.");
      if (err) return fail(err);
      if (loginTaken(login)) return fail("Bu login band. Boshqa login tanlang.");
      var code;
      do { code = rid(6, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"); } while (teacherByCode(code));
      var salt = rid(16);
      var t = { id: "t" + rid(10), name: str(q.name, 80), school: str(q.school, 120), login: login, salt: salt, hash: hashPw(salt, q.password), code: code, stage: "dastlabki", created: env.now() };
      store.add("teachers", t);
      return { ok: true, token: newSession(t.id, "teacher"), user: publicTeacher(t) };
    },

    registerStudent: function (q) {
      var code = str(q.code, 10).toUpperCase().replace(/\s/g, "");
      var t = teacherByCode(code);
      if (!t) return fail("O‘qituvchi kodi topilmadi. Kodni o‘qituvchingizdan qayta so‘rang.");
      var login = normLogin(q.login), err = checkCredentials(login, q.password);
      if (str(q.name).length < 3) return fail("Ism-familiyangizni to‘liq kiriting.");
      if (!str(q.cls)) return fail("Sinfingizni kiriting, masalan: 8-A.");
      if (err) return fail(err);
      if (loginTaken(login)) return fail("Bu login band. Boshqa login tanlang.");
      var salt = rid(16);
      var s = { id: "s" + rid(10), name: str(q.name, 80), cls: str(q.cls, 20), login: login, salt: salt, hash: hashPw(salt, q.password), code: code, group: "", created: env.now() };
      store.add("students", s);
      return { ok: true, token: newSession(s.id, "student"), user: publicStudent(s, t) };
    },

    login: function (q) {
      var login = normLogin(q.login);
      var t = find("teachers", function (r) { return r.login === login; });
      var rec = t || find("students", function (r) { return r.login === login; });
      if (!rec || hashPw(rec.salt, String(q.password || "")) !== rec.hash) return fail("Login yoki parol noto‘g‘ri.");
      var role = t ? "teacher" : "student";
      return { ok: true, token: newSession(rec.id, role), user: userOf({ role: role, rec: rec }) };
    },

    logout: function (q) {
      if (q.token) store.remove("sessions", q.token);
      return { ok: true };
    },

    me: function (q, a) { return { ok: true, user: userOf(a) }; },

    submitAttempt: function (q, a) {
      if (a.role !== "student") return fail("Natijani faqat o‘quvchi yubora oladi.");
      if (!KINDS[q.kind]) return fail("Noma’lum topshiriq turi.");
      var t = teacherByCode(a.rec.code);
      var total = Math.max(0, Math.min(1000, Number(q.total) || 0));
      var score = Math.max(0, Math.min(total, Number(q.score) || 0));
      var answers = JSON.stringify(q.answers == null ? null : q.answers);
      if (answers.length > 30000) return fail("Javoblar hajmi juda katta.");
      var r = {
        id: "a" + rid(10), sid: a.rec.id, code: a.rec.code, kind: q.kind, quizId: str(q.quizId, 40), title: str(q.title, 120),
        score: score, total: total, pct: total ? Math.round(score / total * 100) : 0,
        survey: q.survey == null ? "" : Math.max(0, Math.min(100, Math.round(Number(q.survey) || 0))),
        group: a.rec.group || "", stage: q.kind === "diagnostic" && t ? (t.stage || "dastlabki") : "",
        answers: answers, created: env.now()
      };
      store.add("attempts", r);
      return { ok: true, attempt: attemptOut(r, false) };
    },

    myAttempts: function (q, a) {
      if (a.role !== "student") return fail("Bu bo‘lim o‘quvchilar uchun.");
      var list = store.rows("attempts").filter(function (r) { return r.sid === a.rec.id; }).map(function (r) { return attemptOut(r, true); });
      return { ok: true, attempts: list };
    },

    teacherData: function (q, a) {
      if (a.role !== "teacher") return fail("Bu bo‘lim o‘qituvchilar uchun.");
      var code = a.rec.code;
      var students = store.rows("students").filter(function (s) { return s.code === code; })
        .map(function (s) { return { id: s.id, name: s.name, cls: s.cls, login: s.login, group: s.group || "", created: Number(s.created) }; });
      var attempts = store.rows("attempts").filter(function (r) { return r.code === code; }).map(function (r) { return attemptOut(r, true); });
      return { ok: true, user: publicTeacher(a.rec), students: students, attempts: attempts };
    },

    setGroup: function (q, a) {
      if (a.role !== "teacher") return fail("Bu amal o‘qituvchilar uchun.");
      var g = q.group === "tajriba" || q.group === "nazorat" ? q.group : "";
      var s = find("students", function (r) { return r.id === q.studentId && r.code === a.rec.code; });
      if (!s) return fail("O‘quvchi topilmadi.");
      store.update("students", s.id, { group: g });
      return { ok: true };
    },

    setStage: function (q, a) {
      if (a.role !== "teacher") return fail("Bu amal o‘qituvchilar uchun.");
      var st = q.stage === "yakuniy" ? "yakuniy" : "dastlabki";
      store.update("teachers", a.rec.id, { stage: st });
      return { ok: true, stage: st };
    },

    resetPassword: function (q, a) {
      if (a.role !== "teacher") return fail("Bu amal o‘qituvchilar uchun.");
      var s = find("students", function (r) { return r.id === q.studentId && r.code === a.rec.code; });
      if (!s) return fail("O‘quvchi topilmadi.");
      if (String(q.password || "").length < 4) return fail("Parol kamida 4 belgidan iborat bo‘lsin.");
      var salt = rid(16);
      store.update("students", s.id, { salt: salt, hash: hashPw(salt, q.password) });
      return { ok: true };
    }
  };

  var PUBLIC = { registerTeacher: 1, registerStudent: 1, login: 1, logout: 1 };

  return function handle(q) {
    q = q || {};
    var fn = actions[q.action];
    if (!fn) return fail("Noma’lum so‘rov.");
    if (PUBLIC[q.action]) return fn(q);
    var a = auth(q.token);
    if (!a) return { ok: false, error: "Sessiya tugagan. Qaytadan kiring.", auth: false };
    return fn(q, a);
  };
}


/* ---- Google Sheets ombori va veb-ilova kirish nuqtasi ---- */

function sheetStore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cache = {};
  function sheet(table) {
    var sh = ss.getSheetByName(table);
    if (!sh) {
      sh = ss.insertSheet(table);
      sh.getRange(1, 1, sh.getMaxRows(), TABLES[table].length).setNumberFormat("@");
      sh.getRange(1, 1, 1, TABLES[table].length).setValues([TABLES[table]]).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    return sh;
  }
  function load(table) {
    if (!cache[table]) {
      var cols = TABLES[table];
      var values = sheet(table).getDataRange().getValues().slice(1);
      cache[table] = values.map(function (row) {
        var o = {};
        cols.forEach(function (c, i) { o[c] = row[i] === undefined ? "" : String(row[i]); });
        return o;
      });
    }
    return cache[table];
  }
  function rowIndex(table, id) {
    var rows = load(table);
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return i;
    return -1;
  }
  return {
    rows: function (table) { return load(table).map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; return o; }); },
    add: function (table, rec) {
      var cols = TABLES[table];
      var sh = sheet(table);
      var row = cols.map(function (c) { return rec[c] == null ? "" : String(rec[c]); });
      sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat("@").setValues([row]);
      var o = {};
      cols.forEach(function (c, i) { o[c] = row[i]; });
      load(table).push(o);
    },
    update: function (table, id, patch) {
      var i = rowIndex(table, id);
      if (i < 0) return;
      var cols = TABLES[table];
      var rec = load(table)[i];
      for (var k in patch) rec[k] = String(patch[k]);
      sheet(table).getRange(i + 2, 1, 1, cols.length).setValues([cols.map(function (c) { return rec[c]; })]);
    },
    remove: function (table, id) {
      var i = rowIndex(table, id);
      if (i < 0) return;
      sheet(table).deleteRow(i + 2);
      load(table).splice(i, 1);
    }
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents);
    var handle = createCore(sheetStore_(), { now: function () { return Date.now(); }, random: Math.random });
    return json_(handle(req));
  } catch (err) {
    return json_({ ok: false, error: "Server xatosi: " + err.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: "Allomalar merosi platformasi", time: new Date().toISOString() });
}
