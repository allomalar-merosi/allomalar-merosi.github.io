(function () {
  "use strict";

  var D = window.DATA;
  var CFG = window.CONFIG || {};
  var app = document.getElementById("app");
  var RESULTS_KEY = "tarbiya.results.v1";
  var PROGRESS_KEY = "tarbiya.progress.v1";

  /* ---------- yordamchilar ---------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function scholar(id) {
    for (var i = 0; i < D.scholars.length; i++) if (D.scholars[i].id === id) return D.scholars[i];
    return null;
  }

  function method(id) {
    for (var i = 0; i < D.methods.length; i++) if (D.methods[i].id === id) return D.methods[i];
    return null;
  }

  function lesson(id) {
    var ls = D.grade8.lessons;
    for (var i = 0; i < ls.length; i++) if (ls[i].id === id) return { lesson: ls[i], index: i };
    return null;
  }

  function star(cls) {
    return '<svg class="' + (cls || "star") + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="5" y="5" width="14" height="14" fill="currentColor"/>' +
      '<rect x="5" y="5" width="14" height="14" fill="currentColor" transform="rotate(45 12 12)"/></svg>';
  }

  function portrait(s, cls) {
    cls = "portrait " + (cls || "");
    if (s.img) return '<img class="' + cls + '" src="' + esc(s.img) + '" alt="' + esc(s.name) + '" loading="lazy">';
    var ini = s.name.split(" ").filter(function (w) { return w.length > 2; }).slice(-1)[0] || s.name;
    return '<span class="' + cls + ' ph" aria-hidden="true">' + esc(ini.charAt(0)) + "</span>";
  }

  function levelOf(p) {
    if (p >= 80) return { key: "yuqori", name: "Yuqori" };
    if (p >= 55) return { key: "orta", name: "O‘rta" };
    return { key: "past", name: "Past" };
  }

  function round1(x) {
    return Math.round(x * 10) / 10;
  }

  /* ---------- test banki va variantlar ---------- */

  var B = window.BANK || { pools: {}, cases: [], crosswords: [] };
  var QUIZZES = {};
  var seq = 0;

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function fromBank(list) {
    return (list || []).map(function (x) { return { q: x[0], a: x[1].slice(), c: 0 }; });
  }

  function poolFor(id) {
    var m, f;
    if (id === "diag") return D.diagnostic.test.concat(fromBank(B.pools.diag));
    if (id === "sinf-8") {
      var all = [];
      D.grade8.lessons.forEach(function (l) { all = all.concat(poolFor("dars-" + l.id)); });
      return all.concat(fromBank(B.pools["sinf-8"]));
    }
    if ((m = id.match(/^sinf-(\d+)$/)) && D.grades[m[1]]) return D.grades[m[1]].quiz.concat(fromBank(B.pools[id]));
    if ((m = id.match(/^dars-(\w+)$/)) && (f = lesson(m[1]))) return f.lesson.quiz.concat(fromBank(B.pools[id]));
    return [];
  }

  function testInfo(id) {
    var m, f, pool = poolFor(id), title, n;
    if (!pool.length) return null;
    if (id === "diag") { title = "Diagnostika"; n = 15; }
    else if (id === "sinf-8") { title = "8-sinf yakuniy testi"; n = 20; }
    else if ((m = id.match(/^sinf-(\d+)$/))) { title = m[1] + "-sinf nazorat testi"; n = 10; }
    else { f = lesson(id.slice(5)); title = "8-sinf, " + (f.index + 1) + "-dars: " + f.lesson.title; n = 5; }
    return { id: id, title: title, n: Math.min(n, pool.length), pool: pool.length };
  }

  /* Bankdan n ta savolni tasodifiy tanlaydi, javoblar tartibini ham aralashtiradi. */
  function variant(id, n) {
    var seen = {};
    var uniq = poolFor(id).filter(function (it) { if (seen[it.q]) return false; seen[it.q] = 1; return true; });
    return shuffle(uniq).slice(0, n).map(function (it) {
      var order = shuffle(it.a.map(function (_, i) { return i; }));
      return { q: it.q, a: order.map(function (i) { return it.a[i]; }), c: order.indexOf(it.c) };
    });
  }

  function isStudent() { var u = window.API && API.user(); return !!(u && u.role === "student"); }

  function sendNote() {
    var u = window.API && API.user();
    if (!u) return '<p class="send-note muted">Natija o‘qituvchingizga borishi uchun <a href="#kirish">o‘quvchi profili bilan kiring</a>.</p>';
    if (u.role === "student") return '<p class="send-note muted">Natija avtomatik ravishda o‘qituvchingiz ' + esc(u.teacher_name || "") + "ga yuboriladi.</p>";
    return '<p class="send-note muted">O‘qituvchi profilida natijalar saqlanmaydi, bu — ko‘rib chiqish rejimi.</p>';
  }

  /* O‘quvchi profilida bo‘lsa, natijani o‘qituvchiga yuboradi. */
  function record(kind, testId, title, details, msgEl, extra) {
    if (!isStudent()) return Promise.resolve(null);
    if (msgEl) { msgEl.textContent = "Natija yuborilmoqda…"; msgEl.className = "send-msg"; }
    var payload = { kind: kind, test_id: testId, title: title, details: details };
    if (extra) Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
    return API.submit(payload).then(function (r) {
      if (msgEl) { msgEl.textContent = "Natija o‘qituvchingizga yuborildi."; msgEl.className = "send-msg ok"; }
      return r;
    }, function (e) {
      if (msgEl) { msgEl.textContent = "Natija yuborilmadi: " + e.message; msgEl.className = "send-msg bad"; }
      throw e;
    });
  }

  /* ---------- test komponenti ---------- */

  function quizHtml(testId) {
    var info = testInfo(testId);
    if (!info) return "";
    var items = variant(testId, info.n);
    var key = "qz" + (++seq);
    QUIZZES[key] = { id: testId, title: info.title, items: items };
    var html = '<form class="quiz" data-key="' + key + '" data-quiz="' + esc(testId) + '">' +
      '<p class="quiz-meta muted">' + info.pool + " ta savollik bankdan " + info.n + " tasi tasodifiy tanlandi. Har bir o‘quvchida savollar va javoblar tartibi turlicha.</p>";
    items.forEach(function (it, qi) {
      html += '<fieldset class="q" data-c="' + it.c + '"><legend><span class="qn">' + (qi + 1) + '.</span> ' + esc(it.q) + "</legend>";
      it.a.forEach(function (ans, ai) {
        var id = key + "-" + qi + "-" + ai;
        html += '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="' + key + "-" + qi + '" value="' + ai + '"> <span>' + esc(ans) + "</span></label>";
      });
      html += "</fieldset>";
    });
    var best = load(PROGRESS_KEY, {})[testId];
    html += '<div class="quiz-foot"><button type="submit" class="btn">Tekshirish</button>' +
      '<button type="button" class="btn ghost" data-act="new">Yangi variant</button>' +
      '<output class="quiz-out" aria-live="polite">' + (best != null ? "Oldingi eng yaxshi natija: " + best + "%" : "") + "</output></div>" +
      '<p class="send-msg" role="status"></p>' + sendNote() + "</form>";
    return html;
  }

  function bindQuiz(form) {
    var q = QUIZZES[form.getAttribute("data-key")];
    form.querySelector('[data-act="new"]').addEventListener("click", function () {
      var holder = document.createElement("div");
      holder.innerHTML = quizHtml(q.id);
      var fresh = holder.firstChild;
      form.parentNode.replaceChild(fresh, form);
      bindQuiz(fresh);
      fresh.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.getAttribute("data-done")) return;
      var sets = form.querySelectorAll("fieldset.q");
      var right = 0, answered = 0, details = [];
      sets.forEach(function (fs, qi) {
        var it = q.items[qi];
        var chosen = fs.querySelector("input:checked");
        var ch = chosen ? Number(chosen.value) : -1;
        fs.querySelectorAll(".opt").forEach(function (o, i) { o.classList.toggle("is-correct", i === it.c); });
        fs.classList.add(ch === it.c ? "ok" : "bad");
        if (chosen) answered++;
        if (ch === it.c) right++;
        details.push({ q: it.q, chosen: ch < 0 ? "—" : it.a[ch], correct: it.a[it.c], ok: ch === it.c });
      });
      if (answered < sets.length && !form.getAttribute("data-warned") && isStudent()) {
        form.setAttribute("data-warned", "1");
        sets.forEach(function (fs) { fs.classList.remove("ok", "bad"); fs.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-correct"); }); });
        form.querySelector(".quiz-out").textContent = (sets.length - answered) + " ta savol javobsiz. Yana “Tekshirish”ni bossangiz, ular xato hisoblanadi.";
        return;
      }
      form.setAttribute("data-done", "1");
      form.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
      form.querySelector('button[type="submit"]').disabled = true;
      var pct = Math.round(right / sets.length * 100);
      form.querySelector(".quiz-out").textContent = right + " / " + sets.length + " to‘g‘ri (" + pct + "%)" + (answered < sets.length ? ". Javobsiz savollar xato hisoblandi." : "");
      var prog = load(PROGRESS_KEY, {});
      if (prog[q.id] == null || pct > prog[q.id]) { prog[q.id] = pct; save(PROGRESS_KEY, prog); }
      record("test", q.id, q.title, details, form.querySelector(".send-msg")).catch(function () {});
    });
  }

  function bindQuizzes() {
    app.querySelectorAll("form.quiz[data-key]").forEach(bindQuiz);
  }

  /* ---------- sahifalar ---------- */

  function gradeCard(n) {
    var is8 = n === 8;
    var g = is8 ? D.grade8 : D.grades[n];
    return '<a class="grade-card' + (is8 ? " is-main" : "") + '" href="#sinf-' + n + '">' +
      '<span class="grade-num">' + n + '<small>-sinf</small></span>' +
      '<span class="grade-meta"><span class="chip">' + esc(g.level) + "</span>" + (is8 ? '<span class="chip gold">Tajriba moduli</span>' : "") + "</span>" +
      '<span class="grade-focus">' + esc(g.focus) + "</span></a>";
  }

  function viewHome() {
    var r = D.research;
    var grades = [5, 6, 7, 8, 9, 10, 11].map(gradeCard).join("");
    return '<section class="hero">' +
      '<p class="eyebrow">Dissertatsiya aprobatsiyasi uchun onlayn platforma</p>' +
      "<h1>" + esc(r.title) + "</h1>" +
      '<p class="lede">' + esc(r.subtitle) + "</p>" +
      '<div class="hero-actions"><a class="btn" href="#sinf-8">8-sinf modulini ochish</a><a class="btn ghost" href="#diagnostika">Diagnostikani boshlash</a><a class="btn ghost" href="#kirish">Kirish / ro‘yxatdan o‘tish</a></div>' +
      "</section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Sinflar bo‘yicha bo‘limlar</h2></div>" +
      '<p class="muted">Har bir sinf bo‘limida darslikdagi malaka talablari, allomalar merosiga asoslangan mavzular, interfaol metodlar va nazorat testi bor. 8-sinf — tadqiqotning tajriba sinfi.</p>' +
      '<div class="grade-grid">' + grades + "</div></section>" +
      '<section class="block two-col"><div><div class="sec-head">' + star() + "<h2>Tadqiqot maqsadi</h2></div><p>" + esc(r.goal) + '</p><a class="link" href="#tadqiqot">Tajriba-sinov tartibi →</a></div>' +
      '<div><div class="sec-head">' + star() + "<h2>Platforma tarkibi</h2></div><ul class=\"plain\">" +
      '<li><a href="#allomalar">Allomalar</a> — ' + D.scholars.length + " ta mutafakkir, asarlari va tarbiyaviy g‘oyalari</li>" +
      '<li><a href="#metodlar">Metodlar</a> — ' + D.methods.length + " ta interfaol va an’anaviy usul</li>" +
      '<li><a href="#sinf-8">8-sinf moduli</a> — ' + D.grade8.lessons.length + " ta dars ishlanmasi</li>" +
      '<li><a href="#diagnostika">Diagnostika</a> — dastlabki va yakuniy test hamda so‘rovnoma</li>' +
      '<li><a href="#oyinlar">O‘yinlar</a> — ' + B.crosswords.length + " ta krossvord, " + B.cases.length + " ta keys-stadi va 3 ta o‘yin</li>" +
      '<li><a href="#kirish">Kabinet</a> — o‘qituvchi kodi orqali o‘quvchilar natijalari va javoblarini ko‘rish</li>' +
      '<li><a href="#natijalar">Natijalar</a> — guruhlar statistikasi va eksport</li></ul></div></section>';
  }

  function viewGrades() {
    return '<section class="page-head"><p class="eyebrow">Umumiy o‘rta ta’lim</p><h1>5–11-sinflar</h1>' +
      '<p class="lede">Tarbiya fanining sinflar kesimidagi bo‘limlari. Kompetensiya darajalari: A2 — tayanch, A2+ — 9-sinf bitiruvchisi, B1 — 11-sinf bitiruvchisi.</p></section>' +
      '<div class="grade-grid">' + [5, 6, 7, 8, 9, 10, 11].map(gradeCard).join("") + "</div>";
  }

  function requirementsHtml(list, n) {
    return '<div class="req"><h3>' + n + "-sinf bitiruvchisiga qo‘yiladigan malaka talablari</h3><ul>" +
      list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      '</ul><p class="source">Manba: “Tarbiya fanini o‘qitish metodikasi” darsligi, 5.1-bo‘lim.</p></div>';
  }

  function gradeNav(current) {
    return '<nav class="grade-tabs" aria-label="Sinflar">' + [5, 6, 7, 8, 9, 10, 11].map(function (n) {
      return '<a href="#sinf-' + n + '"' + (n === current ? ' aria-current="page"' : "") + (n === 8 ? ' class="is-main"' : "") + ">" + n + "-sinf</a>";
    }).join("") + "</nav>";
  }

  function viewGrade(n) {
    if (n === 8) return viewGrade8();
    var g = D.grades[n];
    if (!g) return viewNotFound();
    var topics = g.topics.map(function (t, i) {
      var s = scholar(t.scholar), m = method(t.method);
      return '<article class="topic"><p class="topic-n">' + (i + 1) + "-mavzu</p><h3>" + esc(t.title) + "</h3>" +
        '<p class="topic-src">' + portrait(s, "xs") + '<a href="#alloma-' + s.id + '">' + esc(s.name) + "</a></p>" +
        "<p>" + esc(t.idea) + "</p>" +
        '<dl class="kv"><dt>Metod</dt><dd><a href="#metodlar">' + esc(m.name) + "</a></dd><dt>Topshiriq</dt><dd>" + esc(t.task) + "</dd></dl></article>";
    }).join("");
    return gradeNav(n) +
      '<section class="page-head"><p class="eyebrow">' + esc(g.age) + " · " + esc(D.levels[g.level].name) + "</p><h1>" + n + "-sinf</h1>" +
      '<p class="lede">' + esc(g.focus) + "</p></section>" +
      '<section class="block two-col">' + requirementsHtml(g.requirements, n) +
      '<div class="note"><h3>Ushbu sinfda allomalar merosi</h3><p>Mavzular malaka talablariga mos ravishda tanlangan. Har bir mavzu bitta alloma g‘oyasiga tayanadi va interfaol metod orqali o‘tiladi.</p>' +
      '<p class="muted">8-sinf bo‘limida to‘liq dars ishlanmalari namunasi berilgan; ushbu sinf uchun ham shu tuzilmadan foydalanish mumkin.</p><a class="link" href="#sinf-8">8-sinf moduliga o‘tish →</a></div></section>' +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Mavzular</h2></div><div class=\"topic-grid\">" + topics + "</div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Nazorat testi</h2></div>" + quizHtml("sinf-" + n) + "</section>" +
      activitiesHtml(n);
  }

  function viewGrade8() {
    var g = D.grade8;
    var prog = load(PROGRESS_KEY, {});
    var lessons = g.lessons.map(function (l, i) {
      var s = scholar(l.scholar);
      var p = prog["dars-" + l.id];
      return '<li><a class="lesson-row" href="#dars-' + l.id + '"><span class="lesson-n">' + (i + 1) + "</span>" + portrait(s, "sm") +
        '<span class="lesson-body"><span class="lesson-title">' + esc(l.title) + '</span><span class="lesson-meta">' + esc(s.name) + " · " + esc(l.work) + "</span></span>" +
        '<span class="lesson-score">' + (p != null ? p + "%" : "") + "</span></a></li>";
    }).join("");
    var principles = g.principles.map(function (p) {
      return "<div><h3>" + esc(p.name) + "</h3><p>" + esc(p.text) + "</p></div>";
    }).join("");
    return gradeNav(8) +
      '<section class="page-head main"><p class="eyebrow">Tajriba moduli · ' + esc(g.age) + " · " + esc(g.level) + "</p><h1>8-sinf</h1>" +
      '<p class="lede">' + esc(g.focus) + "</p>" +
      '<div class="hero-actions"><a class="btn" href="#dars-d1">Birinchi darsni ochish</a><a class="btn ghost" href="#diagnostika">Diagnostika</a></div></section>' +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Metodika tamoyillari</h2></div><div class=\"principles\">" + principles + "</div></section>" +
      '<section class="block two-col">' + requirementsHtml(g.requirements, 8) +
      '<div class="note"><h3>Modul qanday o‘tiladi</h3><ol class="steps">' +
      "<li>Modul boshida tajriba va nazorat guruhlari <a href=\"#diagnostika\">dastlabki diagnostika</a>dan o‘tadi.</li>" +
      "<li>Tajriba guruhida " + g.lessons.length + " ta dars quyidagi ishlanmalar asosida o‘tiladi.</li>" +
      "<li>Har dars oxirida o‘quvchilar platformada qisqa testni bajaradi.</li>" +
      "<li>Modul yakunida ikkala guruh yakuniy diagnostikadan o‘tadi; natijalar <a href=\"#natijalar\">Natijalar</a> bo‘limida taqqoslanadi.</li></ol></div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Dars ishlanmalari</h2></div><ol class=\"lessons\">" + lessons + "</ol></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>8-sinf yakuniy testi</h2></div>" + quizHtml("sinf-8") + "</section>" +
      activitiesHtml(8);
  }

  function viewLesson(id) {
    var found = lesson(id);
    if (!found) return viewNotFound();
    var l = found.lesson, i = found.index, all = D.grade8.lessons;
    var s = scholar(l.scholar);
    var total = l.flow.reduce(function (a, f) { return a + f.t; }, 0);
    var flow = l.flow.map(function (f) {
      return '<li><span class="flow-t">' + f.t + " daq.</span><div><h4>" + esc(f.name) + "</h4><p>" + esc(f.text) + "</p></div></li>";
    }).join("");
    var prev = i > 0 ? '<a class="btn ghost" href="#dars-' + all[i - 1].id + '">← ' + (i) + "-dars</a>" : "<span></span>";
    var next = i < all.length - 1 ? '<a class="btn ghost" href="#dars-' + all[i + 1].id + '">' + (i + 2) + "-dars →</a>" : '<a class="btn" href="#diagnostika">Yakuniy diagnostika →</a>';
    return gradeNav(8) +
      '<p class="crumbs"><a href="#sinf-8">8-sinf moduli</a> / ' + (i + 1) + "-dars</p>" +
      '<section class="page-head with-portrait">' + portrait(s, "md") + '<div class="page-head"><p class="eyebrow">' + (i + 1) + "-dars · " + total + " daqiqa</p><h1>" + esc(l.title) + "</h1>" +
      '<p class="lede"><a href="#alloma-' + s.id + '">' + esc(s.name) + "</a> · “" + esc(l.work) + "”</p></div></section>" +
      (l.quote ? '<blockquote class="quote"><p>“' + esc(l.quote) + '”</p><cite>' + esc(s.name) + "</cite></blockquote>" : "") +
      '<section class="block"><dl class="goals">' +
      "<div><dt>Ta’limiy maqsad</dt><dd>" + esc(l.goals.talimiy) + "</dd></div>" +
      "<div><dt>Tarbiyaviy maqsad</dt><dd>" + esc(l.goals.tarbiyaviy) + "</dd></div>" +
      "<div><dt>Rivojlantiruvchi maqsad</dt><dd>" + esc(l.goals.rivojlantiruvchi) + "</dd></div>" +
      "<div><dt>Shakllanadigan kompetensiya</dt><dd>" + esc(l.competency) + "</dd></div></dl></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Darsning borishi</h2></div><ol class=\"flow\">" + flow + "</ol></section>" +
      '<section class="block two-col"><div><h3>Muhokama savollari</h3><ul>' + l.questions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h3>Uyga vazifa</h3><p>" + esc(l.homework) + "</p></div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Dars bo‘yicha test</h2></div>" + quizHtml("dars-" + l.id) + "</section>" +
      casesHtml(B.cases.filter(function (c) { return c.lesson === l.id; }), "Keys-stadi") +
      '<nav class="pager">' + prev + next + "</nav>";
  }

  function viewScholars() {
    var cards = D.scholars.map(function (s) {
      return '<a class="scholar-card" href="#alloma-' + s.id + '">' + portrait(s, "card") + '<span class="years">' + esc(s.years) + "</span>" +
        "<h3>" + esc(s.name) + '</h3><span class="muted">' + esc(s.works[0]) + "</span>" +
        '<span class="grades">' + s.grades.map(function (g) { return '<span class="chip' + (g === 8 ? " gold" : "") + '">' + g + "</span>"; }).join("") + "</span></a>";
    }).join("");
    return '<section class="page-head"><p class="eyebrow">IX–XX asrlar</p><h1>O‘rta Osiyo allomalari</h1>' +
      '<p class="lede">Darslikda tarbiya fanining metodologik asosi sifatida keltirilgan mutafakkirlar. Raqamlar — mavzulari platformada qo‘llangan sinflar.</p></section>' +
      '<div class="scholar-grid">' + cards + "</div>";
  }

  function viewScholar(id) {
    var s = scholar(id);
    if (!s) return viewNotFound();
    var used = [];
    s.grades.forEach(function (n) {
      if (n === 8) {
        D.grade8.lessons.forEach(function (l, i) {
          if (l.scholar === s.id) used.push('<li><a href="#dars-' + l.id + '">8-sinf, ' + (i + 1) + "-dars: " + esc(l.title) + "</a></li>");
        });
      } else if (D.grades[n]) {
        D.grades[n].topics.forEach(function (t) {
          if (t.scholar === s.id) used.push('<li><a href="#sinf-' + n + '">' + n + "-sinf: " + esc(t.title) + "</a></li>");
        });
      }
    });
    return '<p class="crumbs"><a href="#allomalar">Allomalar</a> / ' + esc(s.name) + "</p>" +
      '<section class="page-head with-portrait">' + portrait(s, "lg") + '<div class="page-head"><p class="eyebrow">' + esc(s.years) + " · " + esc(s.place) + "</p><h1>" + esc(s.name) + "</h1>" +
      '<p class="lede">' + esc(s.title) + "</p></div></section>" +
      (s.quote ? '<blockquote class="quote"><p>“' + esc(s.quote) + '”</p><cite>' + esc(s.name) + "</cite></blockquote>" : "") +
      '<section class="block two-col"><div><h3>Tarbiyaviy g‘oyalari</h3><ul>' + s.ideas.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h3>Asarlari</h3><ul>" + s.works.map(function (w) { return "<li>“" + esc(w) + "”</li>"; }).join("") + "</ul>" +
      "<h3>Platformada qo‘llanishi</h3><ul>" + (used.join("") || "<li>—</li>") + "</ul></div></section>";
  }

  function viewMethods() {
    var groups = ["An’anaviy", "Interfaol", "Innovatsion"];
    var html = '<section class="page-head"><p class="eyebrow">Darslik, 2.1–2.3-bo‘limlar</p><h1>Ta’lim metodlari</h1>' +
      '<p class="lede">Tarbiya darslarida qo‘llanadigan an’anaviy, interfaol va innovatsion shakllar. Har bir usulda allomalar merosiga oid namuna mavzu berilgan.</p></section>';
    groups.forEach(function (g) {
      var items = D.methods.filter(function (m) { return m.type === g; });
      html += '<section class="block"><div class="sec-head">' + star() + "<h2>" + g + " shakllar</h2></div><div class=\"method-grid\">" +
        items.map(function (m) {
          return '<article class="method" id="m-' + m.id + '"><h3>' + esc(m.name) + "</h3><p>" + esc(m.text) + "</p><ol>" +
            m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ol><p class="example"><span>Namuna:</span> ' + esc(m.example) + "</p></article>";
        }).join("") + "</div></section>";
    });
    return html;
  }

  function viewResearch() {
    var r = D.research;
    return '<section class="page-head"><p class="eyebrow">Aprobatsiya</p><h1>Tajriba-sinov tartibi</h1><p class="lede">' + esc(r.goal) + "</p></section>" +
      '<section class="block"><ol class="stage-list">' + r.stages.map(function (s) {
        return "<li><h3>" + esc(s.name) + "</h3><p>" + esc(s.text) + "</p></li>";
      }).join("") + "</ol></section>" +
      '<section class="block two-col"><div><h3>Baholash mezonlari</h3><ul>' +
      "<li><b>Bilim komponenti</b> — 15 savollik test (allomalar merosi va hayotiy vaziyatlar), foizda.</li>" +
      "<li><b>Munosabat komponenti</b> — 8 bandli so‘rovnoma (1–5 ball), foizga aylantiriladi.</li>" +
      "<li><b>Umumiy ko‘rsatkich</b> — ikki komponentning o‘rtachasi.</li></ul>" +
      '<h3>Darajalar</h3><ul><li><span class="lvl yuqori">Yuqori</span> 80% va undan yuqori</li><li><span class="lvl orta">O‘rta</span> 55–79%</li><li><span class="lvl past">Past</span> 55% dan past</li></ul></div>' +
      "<div><h3>Statistik tahlil</h3><ul>" +
      "<li>Samaradorlik koeffitsienti: η = X̄<sub>T</sub> / X̄<sub>N</sub> (yakuniy bosqich). η &gt; 1 bo‘lsa, tajriba guruhi ustun.</li>" +
      "<li>O‘sish: yakuniy va dastlabki o‘rtachalar farqi har bir guruh uchun.</li>" +
      "<li>Styudent t-mezoni (Welch varianti): t = (X̄<sub>T</sub> − X̄<sub>N</sub>) / √(S²<sub>T</sub>/n<sub>T</sub> + S²<sub>N</sub>/n<sub>N</sub>). p &lt; 0,05 bo‘lsa, farq statistik ahamiyatli.</li></ul>" +
      '<a class="link" href="#natijalar">Natijalarni ko‘rish →</a></div></section>';
  }

  /* ---------- diagnostika ---------- */

  function viewDiagnostic() {
    var d = D.diagnostic;
    var items = variant("diag", 15);
    QUIZZES.diag = { id: "diag", title: "Diagnostika", items: items };
    var u = window.API && API.user();
    var st = u && u.role === "student";
    var test = items.map(function (it, qi) {
      return '<fieldset class="q"><legend><span class="qn">' + (qi + 1) + ".</span> " + esc(it.q) + "</legend>" +
        it.a.map(function (ans, ai) {
          var id = "dt-" + qi + "-" + ai;
          return '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="dt-' + qi + '" value="' + ai + '" required> <span>' + esc(ans) + "</span></label>";
        }).join("") + "</fieldset>";
    }).join("");
    var survey = '<div class="likert-wrap"><table class="likert"><thead><tr><th scope="col">Fikr</th>' +
      d.likert.map(function (l, i) { return '<th scope="col">' + (i + 1) + '<span class="lk-label">' + esc(l) + "</span></th>"; }).join("") + "</tr></thead><tbody>" +
      d.survey.map(function (s, si) {
        return '<tr><th scope="row">' + esc(s) + "</th>" + d.likert.map(function (l, li) {
          return '<td><input type="radio" id="sv-' + si + "-" + li + '" name="sv-' + si + '" value="' + (li + 1) + '" required aria-label="' + esc(l) + '"></td>';
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    return '<section class="page-head"><p class="eyebrow">8-sinf · dastlabki va yakuniy bosqich</p><h1>Diagnostika</h1>' +
      '<p class="lede">Test o‘quvchining allomalar merosi bo‘yicha bilimini, so‘rovnoma esa ma’naviy-axloqiy munosabatini aniqlaydi. Natija o‘qituvchining “Natijalar” bo‘limida saqlanadi.</p></section>' +
      '<form id="diag" class="diag" novalidate>' +
      '<section class="block"><div class="sec-head">' + star() + "<h2>O‘quvchi ma’lumotlari</h2></div>" +
      (st ? '<p class="muted">Siz ' + esc(u.full_name) + " sifatida kirgansiz. Natija o‘qituvchingiz " + esc(u.teacher_name || "") + "ga yuboriladi." +
        (u.grp ? " Guruhingiz: " + u.grp + " (o‘qituvchi belgilagan)." : " Tajriba yoki nazorat guruhini o‘qituvchingiz belgilaydi.") + "</p>"
        : '<p class="muted">Natija o‘qituvchiga avtomatik borishi uchun <a href="#kirish">o‘quvchi profili bilan kiring</a>. Kirmasangiz, natija shu qurilmada saqlanadi.</p>') +
      '<div class="fields">' +
      '<label for="f-name">F.I.Sh.<input id="f-name" name="name" required autocomplete="name" placeholder="Masalan: Karimova Malika"' + (st ? ' value="' + esc(u.full_name) + '" readonly' : "") + "></label>" +
      '<label for="f-school">Maktab<input id="f-school" name="school" required placeholder="Masalan: 12-maktab, Guliston"' + (st ? ' value="' + esc(u.school || "—") + '" readonly' : "") + "></label>" +
      '<label for="f-cls">Sinf<input id="f-cls" name="cls" required placeholder="8-A"' + (st ? ' value="' + esc(u.cls || "—") + '" readonly' : "") + "></label>" +
      (st ? '<input type="hidden" name="group" value="' + esc(u.grp || "—") + '">' :
        '<label for="f-group">Guruh<select id="f-group" name="group" required><option value="">Tanlang</option><option value="tajriba">Tajriba guruhi</option><option value="nazorat">Nazorat guruhi</option></select></label>') +
      '<label for="f-stage">Bosqich<select id="f-stage" name="stage" required><option value="">Tanlang</option><option value="dastlabki">Dastlabki</option><option value="yakuniy">Yakuniy</option></select></label>' +
      "</div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>1-qism. Test (" + items.length + " savol)</h2></div><p class=\"muted\">Savollar " + poolFor("diag").length + " ta savollik bankdan tasodifiy tanlangan, har bir o‘quvchida turlicha.</p><div class=\"quiz\">" + test + "</div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>2-qism. So‘rovnoma</h2></div><p class=\"muted\">Har bir fikrga o‘zingizga mos javobni belgilang: 1 — hech qachon, 5 — doimo.</p>" + survey + "</section>" +
      '<div class="diag-foot"><button type="submit" class="btn">Natijani yuborish</button><p id="diag-msg" class="form-msg" role="alert"></p></div>' +
      '</form><section id="diag-result" class="block" hidden></section>';
  }

  function bindDiagnostic() {
    var form = document.getElementById("diag");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("diag-msg");
      var fd = new FormData(form);
      var d = D.diagnostic;
      var items = QUIZZES.diag.items;
      var missing = [];
      ["name", "school", "cls", "group", "stage"].forEach(function (k) { if (!String(fd.get(k) || "").trim()) missing.push(k); });
      var answers = { test: [], survey: [] };
      var right = 0, unanswered = 0;
      var details = [];
      items.forEach(function (it, qi) {
        var v = fd.get("dt-" + qi);
        if (v == null) unanswered++;
        answers.test.push(v == null ? null : Number(v));
        if (v != null && Number(v) === it.c) right++;
        details.push({ q: it.q, chosen: v == null ? "—" : it.a[Number(v)], correct: it.a[it.c], ok: v != null && Number(v) === it.c });
      });
      var sum = 0;
      d.survey.forEach(function (s, si) {
        var v = fd.get("sv-" + si);
        if (v == null) unanswered++;
        answers.survey.push(v == null ? null : Number(v));
        sum += v == null ? 0 : Number(v);
      });
      if (missing.length) { msg.textContent = "O‘quvchi ma’lumotlarini to‘liq kiriting: F.I.Sh., maktab, sinf, guruh va bosqich."; return; }
      if (unanswered) { msg.textContent = unanswered + " ta savol javobsiz qoldi. Barcha savollarga javob bering."; return; }
      msg.textContent = "";
      var testPct = Math.round(right / items.length * 100);
      var surveyPct = Math.round((sum - d.survey.length) / (d.survey.length * 4) * 100);
      var total = Math.round((testPct + surveyPct) / 2);
      var rec = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: new Date().toISOString(),
        name: String(fd.get("name")).trim(), school: String(fd.get("school")).trim(), cls: String(fd.get("cls")).trim(),
        group: fd.get("group"), stage: fd.get("stage"),
        test: testPct, survey: surveyPct, total: total, level: levelOf(total).name, answers: answers
      };
      if (isStudent()) {
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        msg.textContent = "Natija yuborilmoqda…";
        record("diag", "diag", "Diagnostika (" + rec.stage + ")", details, null, { survey_pct: surveyPct, stage: rec.stage }).then(function () {
          showDiagResult(rec, true, "Natija o‘qituvchingizga yuborildi.");
        }, function (err) {
          btn.disabled = false;
          msg.textContent = "Natija yuborilmadi: " + err.message + " Qayta urinib ko‘ring.";
        });
        return;
      }
      var list = load(RESULTS_KEY, []);
      list.push(rec);
      var stored = save(RESULTS_KEY, list);
      sendToSheets(rec);
      showDiagResult(rec, stored, "");
    });
  }

  function showDiagResult(rec, stored, note) {
    var form = document.getElementById("diag");
    var testPct = rec.test, surveyPct = rec.survey, total = rec.total;
    var out = document.getElementById("diag-result");
    var lv = levelOf(total);
    out.innerHTML = '<div class="result-card"><p class="eyebrow">Natija qabul qilindi</p><h2>' + esc(rec.name) + "</h2>" +
      '<div class="stats"><div><span class="big">' + testPct + '%</span><span>Test</span></div><div><span class="big">' + surveyPct + '%</span><span>So‘rovnoma</span></div>' +
      '<div><span class="big">' + total + '%</span><span>Umumiy</span></div><div><span class="lvl ' + lv.key + '">' + lv.name + "</span><span>Daraja</span></div></div>" +
      (note ? '<p class="send-msg ok">' + esc(note) + "</p>" : "") +
      (stored ? "" : '<p class="form-msg">Brauzer xotirasi yopiq, natija shu qurilmada saqlanmadi.</p>') +
      '<button type="button" class="btn ghost" id="diag-again">Keyingi o‘quvchi</button></div>';
    out.hidden = false;
    form.hidden = true;
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("diag-again").addEventListener("click", function () { render(); window.scrollTo(0, 0); });
  }

  function sendToSheets(rec) {
    if (!CFG.sheetsUrl) return;
    try {
      fetch(CFG.sheetsUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(rec) })
        .catch(function () {});
    } catch (e) { /* tarmoq yo‘q bo‘lsa, natija mahalliy saqlanadi */ }
  }

  /* ---------- natijalar va statistika ---------- */

  function mean(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : NaN; }
  function sd(a) {
    if (a.length < 2) return NaN;
    var m = mean(a);
    return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1));
  }

  /* Regulyarlashgan to‘liqmas beta funksiya (Numerical Recipes), t-taqsimot p-qiymati uchun */
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= 200; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      var del = d * c; h *= del;
      if (Math.abs(del - 1) < 3e-7) break;
    }
    return h;
  }
  function gammaln(x) {
    var cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < 6; j++) ser += cof[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function ibeta(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function welch(a, b) {
    if (a.length < 2 || b.length < 2) return null;
    var va = Math.pow(sd(a), 2) / a.length, vb = Math.pow(sd(b), 2) / b.length;
    var se = Math.sqrt(va + vb);
    if (!se) return null;
    var t = (mean(a) - mean(b)) / se;
    var df = Math.pow(va + vb, 2) / (va * va / (a.length - 1) + vb * vb / (b.length - 1));
    var p = ibeta(df / 2, 0.5, df / (df + t * t));
    return { t: t, df: df, p: p };
  }

  function fmt(x, digits) {
    if (x == null || isNaN(x)) return "—";
    return x.toFixed(digits == null ? 1 : digits).replace(".", ",");
  }

  function fmtP(p) {
    return p < 0.001 ? "< 0,001" : "= " + fmt(p, 3);
  }

  function sampleData() {
    var names = ["Aliyev Sardor", "Karimova Malika", "Rahimov Jasur", "To‘xtayeva Nilufar", "Usmonov Bekzod", "Qodirova Dilnoza", "Ergashev Javohir", "Sobirova Madina", "Nazarov Otabek", "Yusupova Zarina", "Hamidov Islom", "Mirzayeva Shahnoza"];
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var out = [];
    [["tajriba", "8-A", [58, 84]], ["nazorat", "8-B", [57, 66]]].forEach(function (g) {
      names.forEach(function (n, i) {
        ["dastlabki", "yakuniy"].forEach(function (stage, si) {
          var base = g[2][si] + (rnd() - 0.5) * 22;
          var test = Math.max(20, Math.min(100, Math.round(base + (rnd() - 0.5) * 10)));
          var survey = Math.max(20, Math.min(100, Math.round(base + (rnd() - 0.5) * 10)));
          var total = Math.round((test + survey) / 2);
          out.push({ id: "namuna-" + g[0] + i + stage, date: new Date(2026, si ? 3 : 0, 10 + i).toISOString(), name: n + " (namuna)", school: "Namuna maktab", cls: g[1], group: g[0], stage: stage, test: test, survey: survey, total: total, level: levelOf(total).name, sample: true });
        });
      });
    });
    return out;
  }

  function toCsv(list) {
    var head = ["Sana", "F.I.Sh.", "Maktab", "Sinf", "Guruh", "Bosqich", "Test (%)", "So‘rovnoma (%)", "Umumiy (%)", "Daraja"];
    var rows = list.map(function (r) {
      return [r.date.slice(0, 10), r.name, r.school, r.cls, r.group, r.stage, r.test, r.survey, r.total, r.level]
        .map(function (v) { v = String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";");
    });
    return "﻿" + [head.join(";")].concat(rows).join("\n");
  }

  /* Tajriba va nazorat guruhlari statistikasi. list: [{group, stage, total}] */
  function statsHtml(list) {
    var groups = [["tajriba", "Tajriba guruhi"], ["nazorat", "Nazorat guruhi"]];
    var stages = [["dastlabki", "Dastlabki"], ["yakuniy", "Yakuniy"]];
    var pick = function (g, s) { return list.filter(function (r) { return r.group === g && r.stage === s; }).map(function (r) { return r.total; }); };
    var rows = groups.map(function (g) {
      return stages.map(function (s) {
        var a = pick(g[0], s[0]);
        var lv = { yuqori: 0, orta: 0, past: 0 };
        a.forEach(function (x) { lv[levelOf(x).key]++; });
        var bar = a.length ? '<div class="lvbar" role="img" aria-label="Yuqori ' + lv.yuqori + ", o‘rta " + lv.orta + ", past " + lv.past + '">' +
          ["yuqori", "orta", "past"].map(function (k) { return lv[k] ? '<span class="' + k + '" style="flex:' + lv[k] + '">' + lv[k] + "</span>" : ""; }).join("") + "</div>" : "—";
        return "<tr><th scope=\"row\">" + g[1] + "</th><td>" + s[1] + '</td><td class="num">' + a.length + '</td><td class="num">' + fmt(mean(a)) + '</td><td class="num">' + fmt(sd(a)) + "</td><td>" + bar + "</td></tr>";
      }).join("");
    }).join("");

    var tY = pick("tajriba", "yakuniy"), nY = pick("nazorat", "yakuniy");
    var tD = pick("tajriba", "dastlabki"), nD = pick("nazorat", "dastlabki");
    var eta = mean(tY) / mean(nY);
    var w = welch(tY, nY);
    var w0 = welch(tD, nD);
    var sig = w ? (w.p < 0.05 ? "Farq statistik ahamiyatli (p < 0,05)." : "Farq statistik ahamiyatli emas (p ≥ 0,05).") : "Hisoblash uchun har guruhda kamida 2 ta yakuniy natija kerak.";

    return '<section class="block"><div class="sec-head">' + star() + "<h2>Umumiy ko‘rsatkichlar</h2></div>" +
      '<div class="kpis"><div><span class="big">' + fmt(mean(tY)) + '%</span><span>Tajriba guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(mean(nY)) + '%</span><span>Nazorat guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(eta, 2) + '</span><span>Samaradorlik koeffitsienti η</span></div>' +
      '<div><span class="big">' + (w ? fmt(w.t, 2) : "—") + '</span><span>Styudent t' + (w ? " (df ≈ " + Math.round(w.df) + ", p " + fmtP(w.p) + ")" : "") + "</span></div></div>" +
      '<p class="muted">' + sig + (w0 ? " Dastlabki bosqichda guruhlar farqi: t = " + fmt(w0.t, 2) + ", p " + fmtP(w0.p) + (w0.p >= 0.05 ? " — guruhlar boshlang‘ich darajasi bir xil." : " — guruhlar boshlang‘ich darajasida farq bor.") : "") +
      " O‘sish: tajriba guruhida " + fmt(mean(tY) - mean(tD)) + " punkt, nazorat guruhida " + fmt(mean(nY) - mean(nD)) + " punkt.</p></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Guruh va bosqichlar</h2></div>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Guruh</th><th>Bosqich</th><th class="num">n</th><th class="num">X̄, %</th><th class="num">S</th><th>Darajalar (yuqori / o‘rta / past)</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>";
  }

  function viewResults() {
    var list = load(RESULTS_KEY, []);
    var html = '<section class="page-head"><p class="eyebrow">O‘qituvchi paneli</p><h1>Natijalar</h1>' +
      '<p class="lede">Shu qurilmada profilsiz topshirilgan diagnostika natijalari. O‘quvchilar profil bilan kirgan bo‘lsa, ularning natijalari o‘qituvchi <a href="#kabinet">kabinetida</a> jamlanadi.</p></section>';

    if (!list.length) {
      return html + '<section class="block empty"><h2>Hozircha natija yo‘q</h2><p>O‘quvchilar <a href="#diagnostika">Diagnostika</a> sahifasida test va so‘rovnomani topshirgach, natijalar shu yerda guruh va bosqichlar bo‘yicha jamlanadi.</p>' +
        '<div class="hero-actions"><a class="btn" href="#diagnostika">Diagnostikani ochish</a><button type="button" class="btn ghost" id="r-sample">Namuna ma’lumotlarni ko‘rish</button></div></section>' + importBlock();
    }

    var hasSample = list.some(function (r) { return r.sample; });
    html += (hasSample ? '<p class="banner">Jadvalda namuna ma’lumotlar bor. Haqiqiy tajriba boshlanishidan oldin ularni “Namunalarni o‘chirish” tugmasi bilan olib tashlang.</p>' : "") +
      statsHtml(list) +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Barcha natijalar (" + list.length + ")</h2></div>" +
      '<div class="toolbar"><button type="button" class="btn" id="r-csv">CSV yuklab olish</button><button type="button" class="btn ghost" id="r-copy">CSV nusxalash</button>' +
      '<button type="button" class="btn ghost" id="r-json">JSON eksport</button>' + (hasSample ? '<button type="button" class="btn ghost" id="r-unsample">Namunalarni o‘chirish</button>' : "") +
      '<button type="button" class="btn danger" id="r-clear">Hammasini o‘chirish</button></div><p id="r-msg" class="form-msg" role="status"></p>' +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Sana</th><th>F.I.Sh.</th><th>Sinf</th><th>Guruh</th><th>Bosqich</th><th class="num">Test</th><th class="num">So‘rov.</th><th class="num">Umumiy</th><th>Daraja</th></tr></thead><tbody>' +
      list.slice().reverse().map(function (r) {
        var lv = levelOf(r.total);
        return "<tr><td>" + esc(r.date.slice(0, 10)) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.cls) + "</td><td>" + esc(r.group) + "</td><td>" + esc(r.stage) + '</td><td class="num">' + r.test + '</td><td class="num">' + r.survey + '</td><td class="num">' + r.total + '</td><td><span class="lvl ' + lv.key + '">' + lv.name + "</span></td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<textarea id="r-out" class="out" rows="6" readonly hidden aria-label="Eksport matni"></textarea></section>' + importBlock();
    return html;
  }

  function importBlock() {
    return '<section class="block"><div class="sec-head">' + star() + "<h2>Boshqa qurilmadan import</h2></div>" +
      '<p class="muted">Boshqa kompyuterdagi “JSON eksport” matnini shu yerga joylang. Takroriy yozuvlar qo‘shilmaydi.</p>' +
      '<textarea id="r-in" class="out" rows="4" placeholder="[{&quot;name&quot;: ...}]" aria-label="Import matni"></textarea>' +
      '<div class="toolbar"><button type="button" class="btn ghost" id="r-import">Import qilish</button></div><p id="r-imsg" class="form-msg" role="status"></p></section>';
  }

  function bindResults() {
    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("click", fn); }
    var msg = function (t) { var m = document.getElementById("r-msg"); if (m) m.textContent = t; };
    var out = document.getElementById("r-out");

    on("r-sample", function () { save(RESULTS_KEY, load(RESULTS_KEY, []).concat(sampleData())); render(); });
    on("r-unsample", function () { save(RESULTS_KEY, load(RESULTS_KEY, []).filter(function (r) { return !r.sample; })); render(); });
    on("r-csv", function () {
      var blob = new Blob([toCsv(load(RESULTS_KEY, []))], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tarbiya-natijalar.csv";
      document.body.appendChild(a); a.click(); a.remove();
      msg("CSV fayl yuklab olindi. Agar fayl tushmagan bo‘lsa, “CSV nusxalash”dan foydalaning.");
    });
    function copyText(text, label) {
      out.value = text; out.hidden = false;
      var done = function () { msg(label + " nusxalandi. Excel yoki Google Sheets'ga joylashtiring."); };
      var fail = function () { out.focus(); out.select(); msg("Matn pastda belgilandi. Ctrl+C bilan nusxalang."); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
    }
    on("r-copy", function () { copyText(toCsv(load(RESULTS_KEY, [])).replace(/^﻿/, ""), "CSV"); });
    on("r-json", function () { copyText(JSON.stringify(load(RESULTS_KEY, [])), "JSON"); });
    on("r-clear", function () {
      var btn = document.getElementById("r-clear");
      if (btn.getAttribute("data-armed")) { save(RESULTS_KEY, []); render(); return; }
      btn.setAttribute("data-armed", "1");
      btn.textContent = "Tasdiqlash: barchasini o‘chirish";
      msg("Barcha natijalar qaytarib bo‘lmaydigan tarzda o‘chiriladi. Tasdiqlash uchun tugmani yana bosing.");
    });
    on("r-import", function () {
      var m = document.getElementById("r-imsg");
      try {
        var incoming = JSON.parse(document.getElementById("r-in").value);
        if (!Array.isArray(incoming)) throw new Error();
        var cur = load(RESULTS_KEY, []);
        var ids = {};
        cur.forEach(function (r) { ids[r.id] = 1; });
        var added = 0;
        incoming.forEach(function (r) {
          if (r && r.id && !ids[r.id] && typeof r.total === "number") { cur.push(r); ids[r.id] = 1; added++; }
        });
        save(RESULTS_KEY, cur);
        render();
        var m2 = document.getElementById("r-imsg");
        if (m2) m2.textContent = added + " ta yangi natija qo‘shildi.";
      } catch (e) {
        m.textContent = "Matn JSON formatida emas. “JSON eksport” tugmasi bergan matnni to‘liq joylang.";
      }
    });
  }

  /* ---------- keys-stadi ---------- */

  var CASES = {};

  function casesHtml(list, heading) {
    if (!list.length) return "";
    return '<section class="block"><div class="sec-head">' + star() + "<h2>" + esc(heading) + "</h2></div>" +
      '<p class="muted">Vaziyatni o‘qing va eng to‘g‘ri yo‘lni tanlang. Har bir javobga alloma g‘oyasi asosida izoh beriladi.</p>' +
      '<div class="case-grid">' + list.map(caseCard).join("") + "</div></section>";
  }

  function caseCard(c) {
    var s = scholar(c.scholar);
    var key = "cs" + (++seq);
    var opts = shuffle(c.opts);
    CASES[key] = { c: c, opts: opts };
    return '<article class="case" data-key="' + key + '"><p class="eyebrow">Keys-stadi</p><h3>' + esc(c.title) + "</h3>" +
      "<p>" + esc(c.text) + '</p><p class="case-q">' + esc(c.q) + '</p><div class="case-opts">' +
      opts.map(function (o, i) { return '<button type="button" class="case-opt" data-i="' + i + '">' + esc(o.t) + "</button>"; }).join("") +
      '</div><p class="case-fb" role="status"></p><p class="send-msg" role="status"></p>' +
      (s ? '<p class="topic-src">' + portrait(s, "xs") + '<a href="#alloma-' + s.id + '">' + esc(s.name) + "</a></p>" : "") + "</article>";
  }

  function bindCases() {
    app.querySelectorAll("article.case[data-key]").forEach(function (el) {
      var data = CASES[el.getAttribute("data-key")];
      var done = false;
      el.querySelectorAll(".case-opt").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (done) return;
          done = true;
          var o = data.opts[Number(btn.getAttribute("data-i"))];
          var best = data.opts.filter(function (x) { return x.ok; })[0];
          el.querySelectorAll(".case-opt").forEach(function (b, i) {
            b.disabled = true;
            if (data.opts[i].ok) b.classList.add("is-correct");
          });
          btn.classList.add(o.ok ? "ok" : "bad");
          var fb = el.querySelector(".case-fb");
          fb.className = "case-fb " + (o.ok ? "ok" : "bad");
          fb.textContent = o.fb + (o.ok ? "" : " Eng maqbul yo‘l: " + best.t + " " + best.fb.replace(/^To‘g‘ri\.\s*/, ""));
          record("keys", "keys-" + data.c.id, "Keys: " + data.c.title, [{ q: data.c.q, chosen: o.t, correct: best.t, ok: !!o.ok }], el.querySelector(".send-msg")).catch(function () {});
        });
      });
    });
  }

  /* ---------- krossvord ---------- */

  var CROSS = {};

  /* So‘zlarni kesishish orqali to‘rga joylaydi (ochko‘z algoritm). */
  function layoutCrossword(words) {
    var list = words.map(function (w, i) { return { ans: w[0].toUpperCase(), clue: w[1], i: i }; })
      .sort(function (a, b) { return b.ans.length - a.ans.length; });
    var cells = {};
    var placed = [];
    function get(r, c) { return cells[r + "," + c]; }
    function fits(w, r, c, dir) {
      var dr = dir === "d" ? 1 : 0, dc = dir === "a" ? 1 : 0, cross = 0;
      if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
      for (var k = 0; k < w.length; k++) {
        var rr = r + dr * k, cc = c + dc * k, cell = get(rr, cc);
        if (cell) {
          if (cell.ch !== w[k] || cell[dir]) return -1;
          cross++;
        } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
      }
      return cross;
    }
    function put(w, r, c, dir) {
      var dr = dir === "d" ? 1 : 0, dc = dir === "a" ? 1 : 0;
      for (var k = 0; k < w.ans.length; k++) {
        var key = (r + dr * k) + "," + (c + dc * k);
        cells[key] = cells[key] || { ch: w.ans[k] };
        cells[key][dir] = true;
      }
      placed.push({ ans: w.ans, clue: w.clue, r: r, c: c, dir: dir });
    }
    function bounds(extra) {
      var rs = [], cs = [];
      Object.keys(cells).forEach(function (k) { var p = k.split(","); rs.push(+p[0]); cs.push(+p[1]); });
      (extra || []).forEach(function (p) { rs.push(p[0]); cs.push(p[1]); });
      return (Math.max.apply(null, rs) - Math.min.apply(null, rs) + 1) * (Math.max.apply(null, cs) - Math.min.apply(null, cs) + 1);
    }
    put(list[0], 0, 0, "a");
    var rest = list.slice(1);
    for (var pass = 0; pass < 3 && rest.length; pass++) {
      rest = rest.filter(function (w) {
        var best = null;
        Object.keys(cells).forEach(function (key) {
          var p = key.split(","), r0 = +p[0], c0 = +p[1], ch = cells[key].ch;
          for (var k = 0; k < w.ans.length; k++) {
            if (w.ans[k] !== ch) continue;
            ["a", "d"].forEach(function (dir) {
              var r = dir === "d" ? r0 - k : r0, c = dir === "a" ? c0 - k : c0;
              var x = fits(w.ans, r, c, dir);
              if (x < 1) return;
              var end = dir === "a" ? [r, c + w.ans.length - 1] : [r + w.ans.length - 1, c];
              var score = x * 1000 - bounds([[r, c], end]);
              if (!best || score > best.score) best = { r: r, c: c, dir: dir, score: score };
            });
          }
        });
        if (best) { put(w, best.r, best.c, best.dir); return false; }
        return true;
      });
    }
    var minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
    Object.keys(cells).forEach(function (k) {
      var p = k.split(",");
      minR = Math.min(minR, +p[0]); maxR = Math.max(maxR, +p[0]);
      minC = Math.min(minC, +p[1]); maxC = Math.max(maxC, +p[1]);
    });
    placed.forEach(function (w) { w.r -= minR; w.c -= minC; });
    placed.sort(function (a, b) { return a.r - b.r || a.c - b.c; });
    var num = 0, numAt = {};
    placed.forEach(function (w) {
      var k = w.r + "," + w.c;
      if (!numAt[k]) numAt[k] = ++num;
      w.n = numAt[k];
    });
    return { rows: maxR - minR + 1, cols: maxC - minC + 1, words: placed, numAt: numAt, skipped: rest.length };
  }

  function crosswordHtml(cw) {
    var L = layoutCrossword(cw.words);
    var key = "cw" + (++seq);
    CROSS[key] = { cw: cw, L: L };
    var grid = [];
    for (var r = 0; r < L.rows; r++) { grid.push([]); for (var c = 0; c < L.cols; c++) grid[r].push(null); }
    L.words.forEach(function (w, wi) {
      for (var k = 0; k < w.ans.length; k++) {
        var r2 = w.r + (w.dir === "d" ? k : 0), c2 = w.c + (w.dir === "a" ? k : 0);
        grid[r2][c2] = grid[r2][c2] || { words: [] };
        grid[r2][c2].words.push(wi);
      }
    });
    var cellsHtml = "";
    grid.forEach(function (row, r) {
      row.forEach(function (cell, c) {
        if (!cell) { cellsHtml += '<span class="cw-x"></span>'; return; }
        var n = L.numAt[r + "," + c];
        cellsHtml += '<span class="cw-cell">' + (n ? '<small>' + n + "</small>" : "") +
          '<input maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="' + r + "-qator, " + c + '-ustun" data-r="' + r + '" data-c="' + c + '" data-w="' + cell.words.join(",") + '"></span>';
      });
    });
    function clues(dir) {
      return L.words.map(function (w, wi) { return { w: w, wi: wi }; }).filter(function (x) { return x.w.dir === dir; })
        .map(function (x) { return '<li><button type="button" class="cw-clue" data-wi="' + x.wi + '"><b>' + x.w.n + ".</b> " + esc(x.w.clue) + " <span class=\"muted\">(" + x.w.ans.length + ")</span></button></li>"; }).join("");
    }
    return '<div class="cw" data-key="' + key + '"><div class="cw-board"><div class="cw-grid" style="--cols:' + L.cols + '">' + cellsHtml + "</div></div>" +
      '<div class="cw-clues"><div><h4>Eniga</h4><ol>' + clues("a") + "</ol></div><div><h4>Bo‘yiga</h4><ol>" + clues("d") + "</ol></div></div>" +
      '<div class="quiz-foot"><button type="button" class="btn" data-act="check">Tekshirish</button><button type="button" class="btn ghost" data-act="show">Javoblarni ko‘rsatish</button>' +
      '<output class="quiz-out" aria-live="polite"></output></div><p class="send-msg" role="status"></p></div>';
  }

  function bindCrosswords() {
    app.querySelectorAll(".cw[data-key]").forEach(function (el) {
      var data = CROSS[el.getAttribute("data-key")], L = data.L;
      var dir = "a", sent = false;
      var inputs = {};
      el.querySelectorAll("input").forEach(function (inp) { inputs[inp.getAttribute("data-r") + "," + inp.getAttribute("data-c")] = inp; });
      function at(r, c) { return inputs[r + "," + c]; }
      function wordsOf(inp) { return inp.getAttribute("data-w").split(",").map(Number); }
      function step(inp, d, back) {
        var r = +inp.getAttribute("data-r"), c = +inp.getAttribute("data-c"), s2 = back ? -1 : 1;
        return d === "a" ? at(r, c + s2) : at(r + s2, c);
      }
      function highlight(inp) {
        el.querySelectorAll(".cw-cell.on").forEach(function (x) { x.classList.remove("on"); });
        var ws = wordsOf(inp), wi = ws.filter(function (i) { return L.words[i].dir === dir; })[0];
        if (wi == null) { wi = ws[0]; dir = L.words[wi].dir; }
        var w = L.words[wi];
        for (var k = 0; k < w.ans.length; k++) {
          var x = at(w.r + (w.dir === "d" ? k : 0), w.c + (w.dir === "a" ? k : 0));
          if (x) x.parentNode.classList.add("on");
        }
      }
      Object.keys(inputs).forEach(function (k) {
        var inp = inputs[k];
        inp.addEventListener("focus", function () { highlight(inp); });
        inp.addEventListener("click", function () {
          var ws = wordsOf(inp);
          if (ws.length > 1 && document.activeElement === inp && inp.getAttribute("data-clicked")) dir = dir === "a" ? "d" : "a";
          inp.setAttribute("data-clicked", "1");
          highlight(inp);
        });
        inp.addEventListener("blur", function () { inp.removeAttribute("data-clicked"); });
        inp.addEventListener("input", function () {
          var v = inp.value.toUpperCase().replace(/[^A-Z]/g, "");
          inp.value = v.slice(-1);
          inp.parentNode.classList.remove("ok", "bad");
          if (inp.value) { var nx = step(inp, dir); if (nx) nx.focus(); }
        });
        inp.addEventListener("keydown", function (e) {
          var nx = null;
          if (e.key === "Backspace" && !inp.value) nx = step(inp, dir, true);
          else if (e.key === "ArrowRight") { dir = "a"; nx = step(inp, "a"); }
          else if (e.key === "ArrowLeft") { dir = "a"; nx = step(inp, "a", true); }
          else if (e.key === "ArrowDown") { dir = "d"; nx = step(inp, "d"); }
          else if (e.key === "ArrowUp") { dir = "d"; nx = step(inp, "d", true); }
          if (nx) { e.preventDefault(); nx.focus(); }
        });
      });
      el.querySelectorAll(".cw-clue").forEach(function (b) {
        b.addEventListener("click", function () {
          var w = L.words[+b.getAttribute("data-wi")];
          dir = w.dir;
          var first = at(w.r, w.c);
          if (first) first.focus();
        });
      });
      function check(reveal) {
        var good = 0, details = [];
        L.words.forEach(function (w) {
          var typed = "";
          for (var k = 0; k < w.ans.length; k++) {
            var x = at(w.r + (w.dir === "d" ? k : 0), w.c + (w.dir === "a" ? k : 0));
            if (reveal) x.value = w.ans[k];
            typed += x.value || "·";
          }
          if (typed === w.ans) good++;
          details.push({ q: w.n + ". " + w.clue, chosen: typed, correct: w.ans, ok: typed === w.ans });
        });
        Object.keys(inputs).forEach(function (k) {
          var x = inputs[k], ws = wordsOf(x), r = +x.getAttribute("data-r"), c = +x.getAttribute("data-c");
          var w = L.words[ws[0]], idx = w.dir === "a" ? c - w.c : r - w.r;
          x.parentNode.classList.remove("ok", "bad");
          if (x.value) x.parentNode.classList.add(x.value === w.ans[idx] ? "ok" : "bad");
        });
        return { good: good, details: details };
      }
      el.querySelector('[data-act="check"]').addEventListener("click", function () {
        var res = check(false);
        el.querySelector(".quiz-out").textContent = res.good + " / " + L.words.length + " so‘z to‘g‘ri.";
        if (!sent) { sent = true; record("krossvord", data.cw.id, "Krossvord: " + data.cw.title, res.details, el.querySelector(".send-msg")).catch(function () {}); }
      });
      el.querySelector('[data-act="show"]').addEventListener("click", function () {
        if (!sent && isStudent()) {
          var res0 = check(false);
          sent = true;
          record("krossvord", data.cw.id, "Krossvord: " + data.cw.title, res0.details, el.querySelector(".send-msg")).catch(function () {});
        }
        check(true);
        el.querySelector(".quiz-out").textContent = "Javoblar ko‘rsatildi.";
      });
    });
  }

  function crosswordsFor(n) { return B.crosswords.filter(function (c) { return c.grades.indexOf(n) >= 0; }); }

  /* Sinf sahifasidagi interaktiv mashg‘ulotlar: keyslar va krossvord. */
  function activitiesHtml(n) {
    var cw = crosswordsFor(n);
    return casesHtml(B.cases.filter(function (c) { return c.grades.indexOf(n) >= 0 && !c.lesson; }).concat(n === 8 ? B.cases.filter(function (c) { return c.grades.indexOf(8) >= 0; }).slice(0, 2) : []), "Keys-stadi: hayotiy vaziyatlar") +
      cw.map(function (c) {
        return '<section class="block"><div class="sec-head">' + star() + "<h2>Krossvord: " + esc(c.title) + "</h2></div>" + crosswordHtml(c) + "</section>";
      }).join("") +
      '<p><a class="link" href="#oyinlar">Barcha o‘yinlar, krossvordlar va keyslar →</a></p>';
  }

  /* ---------- o‘yinlar ---------- */

  var CHRONO = { forobiy: 873, beruniy: 973, ibnsino: 980, marginoniy: 1123, navoiy: 1441, donish: 1827, avloniy: 1878, fitrat: 1886 };

  function quotePool() {
    var out = [], seen = {};
    D.scholars.forEach(function (s) { if (s.quote && !seen[s.quote]) { seen[s.quote] = 1; out.push({ q: s.quote, s: s.id }); } });
    D.grade8.lessons.forEach(function (l) { if (l.quote && !seen[l.quote]) { seen[l.quote] = 1; out.push({ q: l.quote, s: l.scholar }); } });
    return out;
  }

  function gameMatchHtml() {
    var picks = shuffle(D.scholars).slice(0, 6);
    var works = shuffle(picks.map(function (s) { return { id: s.id, w: s.works[0] }; }));
    return '<div class="game" data-game="match"><p class="muted">Avval allomani, keyin uning asarini bosing. Har bir xato hisoblanadi.</p>' +
      '<div class="match"><div class="match-col">' + picks.map(function (s) {
        return '<button type="button" class="match-item" data-side="s" data-id="' + s.id + '">' + portrait(s, "xs") + "<span>" + esc(s.name) + "</span></button>";
      }).join("") + '</div><div class="match-col">' + works.map(function (x) {
        return '<button type="button" class="match-item" data-side="w" data-id="' + x.id + '">“' + esc(x.w) + "”</button>";
      }).join("") + '</div></div><div class="quiz-foot"><button type="button" class="btn ghost" data-act="again">Yangi o‘yin</button><output class="quiz-out" aria-live="polite"></output></div><p class="send-msg" role="status"></p></div>';
  }

  function gameQuoteHtml() {
    var rounds = shuffle(quotePool()).slice(0, 6).map(function (x) {
      var others = shuffle(D.scholars.filter(function (s) { return s.id !== x.s; })).slice(0, 3).map(function (s) { return s.id; });
      return { q: x.q, s: x.s, opts: shuffle([x.s].concat(others)) };
    });
    var key = "gq" + (++seq);
    CROSS[key] = rounds;
    return '<div class="game" data-game="quote" data-key="' + key + '"><p class="game-step muted"></p><blockquote class="quote"><p></p></blockquote><div class="case-opts"></div>' +
      '<div class="quiz-foot"><button type="button" class="btn ghost" data-act="again">Yangi o‘yin</button><output class="quiz-out" aria-live="polite"></output></div><p class="send-msg" role="status"></p></div>';
  }

  function gameTimeHtml() {
    var ids = shuffle(Object.keys(CHRONO)).slice(0, 5);
    return '<div class="game" data-game="time"><p class="muted">Allomalarni yashagan davriga ko‘ra eng qadimgisidan boshlab tartiblang (strelkalar bilan suring).</p><ol class="timeline">' +
      ids.map(function (id) {
        var s = scholar(id);
        return '<li data-id="' + id + '">' + portrait(s, "sm") + '<span class="tl-name">' + esc(s.name) + '<small class="tl-years" hidden>' + esc(s.years) + "</small></span>" +
          '<span class="tl-btns"><button type="button" class="btn ghost sm" data-mv="-1" aria-label="Yuqoriga">↑</button><button type="button" class="btn ghost sm" data-mv="1" aria-label="Pastga">↓</button></span></li>';
      }).join("") + '</ol><div class="quiz-foot"><button type="button" class="btn" data-act="check">Tekshirish</button><button type="button" class="btn ghost" data-act="again">Yangi o‘yin</button><output class="quiz-out" aria-live="polite"></output></div><p class="send-msg" role="status"></p></div>';
  }

  var GAMES = { match: gameMatchHtml, quote: gameQuoteHtml, time: gameTimeHtml };
  var GAME_TITLES = { match: "Alloma va asar", quote: "Hikmat kimniki?", time: "Vaqt chizig‘i" };

  function bindGames() {
    app.querySelectorAll(".game[data-game]").forEach(function (el) { bindGame(el); });
  }

  function bindGame(el) {
    var type = el.getAttribute("data-game");
    var msg = el.querySelector(".send-msg"), out = el.querySelector(".quiz-out");
    el.querySelector('[data-act="again"]').addEventListener("click", function () {
      var holder = document.createElement("div");
      holder.innerHTML = GAMES[type]();
      var fresh = holder.firstChild;
      el.parentNode.replaceChild(fresh, el);
      bindGame(fresh);
    });
    if (type === "match") {
      var sel = null, first = {}, done = 0, total = el.querySelectorAll('[data-side="s"]').length;
      el.querySelectorAll(".match-item").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          if (b.getAttribute("data-side") === "s") {
            if (sel) sel.classList.remove("on");
            sel = b; b.classList.add("on");
            return;
          }
          if (!sel) { out.textContent = "Avval allomani tanlang."; return; }
          var sid = sel.getAttribute("data-id"), ok = b.getAttribute("data-id") === sid;
          if (first[sid] == null) first[sid] = { chosen: b.textContent, ok: ok };
          if (ok) {
            sel.disabled = b.disabled = true;
            sel.classList.remove("on"); sel.classList.add("ok"); b.classList.add("ok");
            sel = null; done++;
            if (done === total) {
              var right = Object.keys(first).filter(function (k) { return first[k].ok; }).length;
              out.textContent = "Tayyor! Birinchi urinishda to‘g‘ri: " + right + " / " + total + ".";
              record("oyin", "oyin-match", "O‘yin: " + GAME_TITLES.match, Object.keys(first).map(function (k) {
                return { q: scholar(k).name, chosen: first[k].chosen, correct: "“" + scholar(k).works[0] + "”", ok: first[k].ok };
              }), msg).catch(function () {});
            }
          } else {
            b.classList.add("bad");
            setTimeout(function () { b.classList.remove("bad"); }, 600);
          }
        });
      });
    } else if (type === "quote") {
      var rounds = CROSS[el.getAttribute("data-key")], i = 0, details = [];
      var showRound = function () {
        var r = rounds[i];
        el.querySelector(".game-step").textContent = (i + 1) + " / " + rounds.length + " — bu fikr qaysi allomaga tegishli?";
        el.querySelector(".quote p").textContent = "“" + r.q + "”";
        var box = el.querySelector(".case-opts");
        box.innerHTML = r.opts.map(function (id) { return '<button type="button" class="case-opt" data-id="' + id + '">' + esc(scholar(id).name) + "</button>"; }).join("");
        box.querySelectorAll(".case-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            var ok = b.getAttribute("data-id") === r.s;
            box.querySelectorAll(".case-opt").forEach(function (x) { x.disabled = true; if (x.getAttribute("data-id") === r.s) x.classList.add("is-correct"); });
            b.classList.add(ok ? "ok" : "bad");
            details.push({ q: r.q, chosen: scholar(b.getAttribute("data-id")).name, correct: scholar(r.s).name, ok: ok });
            setTimeout(function () {
              i++;
              if (i < rounds.length) { showRound(); return; }
              var right = details.filter(function (d) { return d.ok; }).length;
              el.querySelector(".game-step").textContent = "O‘yin tugadi.";
              out.textContent = right + " / " + rounds.length + " to‘g‘ri.";
              record("oyin", "oyin-quote", "O‘yin: " + GAME_TITLES.quote, details, msg).catch(function () {});
            }, 900);
          });
        });
      };
      showRound();
    } else if (type === "time") {
      var list = el.querySelector(".timeline");
      list.addEventListener("click", function (e) {
        var b = e.target.closest("[data-mv]");
        if (!b || el.getAttribute("data-done")) return;
        var li = b.closest("li"), mv = +b.getAttribute("data-mv");
        if (mv < 0 && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
        if (mv > 0 && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
        b.focus();
      });
      el.querySelector('[data-act="check"]').addEventListener("click", function () {
        if (el.getAttribute("data-done")) return;
        el.setAttribute("data-done", "1");
        var items = [].slice.call(list.children), ids = items.map(function (li) { return li.getAttribute("data-id"); });
        var sorted = ids.slice().sort(function (a, b) { return CHRONO[a] - CHRONO[b]; });
        var details = ids.map(function (id, k) {
          var ok = id === sorted[k];
          items[k].classList.add(ok ? "ok" : "bad");
          items[k].querySelector(".tl-years").hidden = false;
          return { q: (k + 1) + "-o‘rin", chosen: scholar(id).name, correct: scholar(sorted[k]).name, ok: ok };
        });
        el.querySelectorAll("[data-mv]").forEach(function (x) { x.disabled = true; });
        out.textContent = details.filter(function (d) { return d.ok; }).length + " / " + ids.length + " o‘rin to‘g‘ri. To‘g‘ri tartib: " + sorted.map(function (id) { return scholar(id).name; }).join(" → ") + ".";
        record("oyin", "oyin-time", "O‘yin: " + GAME_TITLES.time, details, msg).catch(function () {});
      });
    }
  }

  function viewGames() {
    return '<section class="page-head"><p class="eyebrow">Interaktiv mashg‘ulotlar</p><h1>O‘yinlar, krossvordlar va keyslar</h1>' +
      '<p class="lede">Allomalar merosini o‘yin orqali mustahkamlash. O‘quvchi profili bilan kirgan bo‘lsangiz, natijalar o‘qituvchingizga boradi.</p>' + sendNote() + "</section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>O‘yinlar</h2></div><div class=\"game-grid\">" +
      ["match", "quote", "time"].map(function (g) { return '<article class="game-card"><h3>' + GAME_TITLES[g] + "</h3>" + GAMES[g]() + "</article>"; }).join("") + "</div></section>" +
      B.crosswords.map(function (c) {
        return '<section class="block"><div class="sec-head">' + star() + "<h2>Krossvord: " + esc(c.title) + ' <span class="chip">' + c.grades.join(", ") + "-sinf</span></h2></div>" + crosswordHtml(c) + "</section>";
      }).join("") +
      [5, 6, 7, 8, 9, 10, 11].map(function (n) {
        return casesHtml(B.cases.filter(function (c) { return c.grades.indexOf(n) >= 0; }), n + "-sinf uchun keyslar");
      }).join("");
  }

  /* ---------- kirish va ro‘yxatdan o‘tish ---------- */

  function demoBanner() {
    return API.mode === "demo" ? '<p class="banner">Sinov rejimi: profillar va natijalar faqat shu brauzerda saqlanadi. O‘quvchilar turli qurilmalardan kirib, natijalari bitta o‘qituvchiga borishi uchun platformani Supabase bilan ulang (README.md, “O‘qituvchi va o‘quvchi kabinetlari” bo‘limi).</p>' : "";
  }

  function viewAuth() {
    var u = API.user();
    if (u) { location.replace("#kabinet"); return ""; }
    return '<section class="page-head"><p class="eyebrow">Kabinet</p><h1>Kirish</h1>' +
      '<p class="lede">O‘qituvchi ro‘yxatdan o‘tgach maxsus kod oladi. O‘quvchilar shu kod bilan ro‘yxatdan o‘tadi va ularning test natijalari hamda javoblari o‘qituvchi kabinetida ko‘rinadi.</p></section>' +
      demoBanner() +
      '<div class="auth-grid">' +
      '<form class="auth-card" id="f-login"><h2>Profilga kirish</h2>' +
      '<label>Login<input name="login" required autocomplete="username" autocapitalize="none"></label>' +
      '<label>Parol<input name="password" type="password" required autocomplete="current-password"></label>' +
      '<button class="btn" type="submit">Kirish</button><p class="form-msg" role="alert"></p></form>' +
      '<div class="auth-card"><h2>Ro‘yxatdan o‘tish</h2><div class="tabs" role="tablist">' +
      '<button type="button" role="tab" class="tab" aria-selected="true" data-role="student">O‘quvchi</button>' +
      '<button type="button" role="tab" class="tab" aria-selected="false" data-role="teacher">O‘qituvchi</button></div>' +
      '<form id="f-reg"><input type="hidden" name="role" value="student">' +
      '<label class="only-student">O‘qituvchi kodi<input name="teacher_code" autocomplete="off" autocapitalize="characters" maxlength="6" placeholder="Masalan: K7M2QX"></label>' +
      '<p class="code-info muted only-student" role="status"></p>' +
      '<label>Familiya va ism<input name="full_name" required autocomplete="name" placeholder="Masalan: Karimova Malika"></label>' +
      '<label>Maktab<input name="school" autocomplete="organization" placeholder="Masalan: 12-maktab, Guliston"></label>' +
      '<label class="only-student">Sinf<input name="cls" placeholder="Masalan: 8-A"></label>' +
      '<label>Login<input name="login" required autocomplete="username" autocapitalize="none" placeholder="lotin harflari va raqamlar"></label>' +
      '<label>Parol<input name="password" type="password" required minlength="6" autocomplete="new-password" placeholder="kamida 6 belgi"></label>' +
      '<button class="btn" type="submit">Ro‘yxatdan o‘tish</button><p class="form-msg" role="alert"></p></form></div></div>';
  }

  function bindAuth() {
    var fl = document.getElementById("f-login"), fr = document.getElementById("f-reg");
    if (!fl) return;
    function busy(form, on) { form.querySelector('button[type="submit"]').disabled = on; }
    fl.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = fl.querySelector(".form-msg");
      busy(fl, true); m.textContent = "";
      API.login(fl.login.value, fl.password.value).then(function () { refreshAccount(); location.hash = "#kabinet"; }, function (err) {
        busy(fl, false); m.textContent = err.message;
      });
    });
    fr.parentNode.querySelectorAll(".tab").forEach(function (t) {
      t.addEventListener("click", function () {
        var role = t.getAttribute("data-role");
        fr.role.value = role;
        fr.parentNode.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        fr.classList.toggle("is-teacher", role === "teacher");
      });
    });
    var info = fr.querySelector(".code-info"), timer = null;
    fr.teacher_code.addEventListener("input", function () {
      var code = fr.teacher_code.value.trim().toUpperCase();
      clearTimeout(timer);
      info.textContent = "";
      if (code.length !== 6) return;
      timer = setTimeout(function () {
        API.checkCode(code).then(function (t) {
          info.textContent = t ? "O‘qituvchi: " + t.full_name + (t.school ? ", " + t.school : "") : "Bunday kod topilmadi.";
        }, function (err) { info.textContent = err.message; });
      }, 250);
    });
    fr.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = fr.querySelector(".form-msg"), role = fr.role.value;
      if (role === "student" && fr.teacher_code.value.trim().length !== 6) { m.textContent = "O‘qituvchi bergan 6 belgili kodni kiriting."; return; }
      busy(fr, true); m.textContent = "";
      API.register({
        role: role, login: fr.login.value, password: fr.password.value, full_name: fr.full_name.value,
        school: fr.school.value, cls: role === "student" ? fr.cls.value : "", teacher_code: role === "student" ? fr.teacher_code.value : ""
      }).then(function () { refreshAccount(); location.hash = "#kabinet"; }, function (err) {
        busy(fr, false); m.textContent = err.message;
      });
    });
  }

  /* ---------- kabinet ---------- */

  var view = 0;
  function later(fill) {
    var my = ++view;
    return function (html) { if (my === view) { app.innerHTML = html; fill && fill(); } };
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function gradeOf(cls) { var m = String(cls || "").match(/\d+/); return m ? Number(m[0]) : null; }

  var KIND = { test: "Test", diag: "Diagnostika", keys: "Keys", krossvord: "Krossvord", oyin: "O‘yin" };

  function testLink(id) {
    var info = testInfo(id);
    return '<li><a class="lesson-row" href="#test-' + id + '"><span class="lesson-body"><span class="lesson-title">' + esc(info.title) + '</span><span class="lesson-meta">' + info.n + " savol · bank: " + info.pool + " ta</span></span></a></li>";
  }

  function allTests() {
    var ids = [];
    [5, 6, 7].forEach(function (n) { ids.push("sinf-" + n); });
    D.grade8.lessons.forEach(function (l) { ids.push("dars-" + l.id); });
    ids.push("sinf-8");
    [9, 10, 11].forEach(function (n) { ids.push("sinf-" + n); });
    return ids;
  }

  function viewTest(id) {
    if (id === "diag") { location.replace("#diagnostika"); return ""; }
    var info = testInfo(id);
    if (!info) return viewNotFound();
    return '<p class="crumbs"><a href="#kabinet">Kabinet</a> / Test</p><section class="page-head"><p class="eyebrow">Test</p><h1>' + esc(info.title) + "</h1></section>" +
      '<section class="block">' + quizHtml(id) + "</section>";
  }

  function viewCabinet() {
    if (!API.user()) {
      return '<section class="page-head"><h1>Kabinet</h1><p class="lede">Kabinetga kirish uchun <a href="#kirish">profilingizga kiring yoki ro‘yxatdan o‘ting</a>.</p></section>';
    }
    return '<section class="page-head"><h1>Kabinet</h1><p class="lede">Yuklanmoqda…</p></section>';
  }

  function bindCabinet() {
    var u = API.user();
    if (!u) return;
    var done = later(u.role === "teacher" ? bindTeacher : bindStudent);
    var fail = function (err) {
      if (!API.user()) { refreshAccount(); location.hash = "#kirish"; return; }
      done('<section class="page-head"><h1>Kabinet</h1><p class="form-msg">' + esc(err.message) + '</p><button type="button" class="btn ghost" onclick="location.reload()">Qayta yuklash</button></section>');
    };
    if (u.role === "teacher") API.teacherData().then(function (d) { TEACHER = d; done(teacherHtml(u, d)); }, fail);
    else API.myAttempts().then(function (list) { done(studentHtml(u, list)); }, fail);
  }

  function logoutBtn() { return '<button type="button" class="btn ghost" id="logout">Chiqish</button>'; }
  function bindLogout() {
    var b = document.getElementById("logout");
    if (b) b.addEventListener("click", function () { API.logout().then(function () { refreshAccount(); location.hash = "#kirish"; }); });
  }

  function attemptsTable(list, withStudent, names) {
    if (!list.length) return '<p class="muted">Hozircha natija yo‘q.</p>';
    return '<div class="table-wrap"><table class="data"><thead><tr><th>Sana</th>' + (withStudent ? "<th>O‘quvchi</th>" : "") +
      '<th>Topshiriq</th><th>Turi</th><th class="num">Ball</th><th class="num">%</th><th></th></tr></thead><tbody>' +
      list.map(function (a) {
        var pct = a.kind === "diag" && a.survey_pct != null ? a.pct + "% / " + a.survey_pct + "%" : a.pct + "%";
        return "<tr><td>" + esc(fmtDate(a.created_at)) + "</td>" + (withStudent ? "<td>" + esc(names[a.student_id] || "—") + "</td>" : "") +
          "<td>" + esc(a.title) + "</td><td>" + esc(KIND[a.kind] || a.kind) + '</td><td class="num">' + a.correct + " / " + a.total + '</td><td class="num">' + pct +
          '</td><td><a class="link" href="#natija-' + a.id + '">Javoblar</a></td></tr>';
      }).join("") + "</tbody></table></div>";
  }

  function studentHtml(u, list) {
    var g = gradeOf(u.cls), mine = [];
    if (g === 8) mine = D.grade8.lessons.map(function (l) { return "dars-" + l.id; }).concat(["sinf-8"]);
    else if (g && D.grades[g]) mine = ["sinf-" + g];
    var others = allTests().filter(function (id) { return mine.indexOf(id) < 0; });
    var avg = list.length ? Math.round(mean(list.map(function (a) { return a.pct; }))) : null;
    return '<section class="page-head"><p class="eyebrow">O‘quvchi kabineti</p><h1>' + esc(u.full_name) + "</h1>" +
      '<p class="lede">' + esc([u.cls ? u.cls + "-sinf" : "", u.school].filter(Boolean).join(", ")) + ". O‘qituvchi: " + esc(u.teacher_name || "—") +
      (u.grp ? ". Guruh: " + esc(u.grp) : "") + '.</p><div class="hero-actions">' + logoutBtn() + "</div></section>" + demoBanner() +
      '<div class="kpis"><div><span class="big">' + list.length + '</span><span>Topshirilgan ishlar</span></div><div><span class="big">' + (avg == null ? "—" : avg + "%") + "</span><span>O‘rtacha natija</span></div></div>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Mening testlarim</h2></div>" +
      (mine.length ? '<ol class="lessons">' + mine.map(testLink).join("") + "</ol>" : '<p class="muted">Profilingizda sinf ko‘rsatilmagan, barcha testlar pastda.</p>') +
      '<div class="hero-actions"><a class="btn" href="#diagnostika">Diagnostika</a><a class="btn ghost" href="#oyinlar">O‘yinlar va krossvordlar</a>' +
      (g && (D.grades[g] || g === 8) ? '<a class="btn ghost" href="#sinf-' + g + '">' + g + "-sinf bo‘limi</a>" : "") + "</div>" +
      '<details class="more"><summary>Boshqa sinflar testlari</summary><ol class="lessons">' + others.map(testLink).join("") + "</ol></details></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Natijalarim</h2></div>" + attemptsTable(list, false) + "</section>";
  }

  function bindStudent() { bindLogout(); }

  var TEACHER = null;

  function diagRecords(d) {
    var grpOf = {};
    d.students.forEach(function (s) { grpOf[s.id] = s.grp; });
    return d.attempts.filter(function (a) { return a.kind === "diag" && a.survey_pct != null; }).map(function (a) {
      return { group: grpOf[a.student_id] || a.grp || "", stage: a.stage, total: Math.round((a.pct + a.survey_pct) / 2) };
    });
  }

  function teacherHtml(u, d) {
    var names = {}, stat = {};
    d.students.forEach(function (s) { names[s.id] = s.full_name; stat[s.id] = { n: 0, sum: 0, last: null }; });
    d.attempts.forEach(function (a) {
      var st = stat[a.student_id];
      if (!st) return;
      st.n++; st.sum += a.pct;
      if (!st.last || a.created_at > st.last) st.last = a.created_at;
    });
    var tests = {};
    d.attempts.forEach(function (a) { tests[a.test_id] = a.title.replace(/ \((dastlabki|yakuniy)\)$/, ""); });
    return '<section class="page-head"><p class="eyebrow">O‘qituvchi kabineti</p><h1>' + esc(u.full_name) + "</h1>" +
      (u.school ? '<p class="lede">' + esc(u.school) + "</p>" : "") + '<div class="hero-actions">' + logoutBtn() + "</div></section>" + demoBanner() +
      '<section class="code-box"><div><p class="eyebrow">O‘quvchilar uchun kod</p><p class="code" id="t-code">' + esc(u.teacher_code) + "</p></div>" +
      "<div><p>Ushbu kodni o‘quvchilaringizga bering. Ular “Kirish → Ro‘yxatdan o‘tish → O‘quvchi” bo‘limida shu kodni kiritadi, so‘ng ularning barcha test, keys, krossvord va o‘yin natijalari shu yerda ko‘rinadi.</p>" +
      '<button type="button" class="btn ghost" id="copy-code">Kodni nusxalash</button> <span class="muted" id="copy-msg" role="status"></span></div></section>' +
      '<div class="kpis"><div><span class="big">' + d.students.length + '</span><span>O‘quvchilar</span></div><div><span class="big">' + d.attempts.length + '</span><span>Topshirilgan ishlar</span></div>' +
      '<div><span class="big">' + (d.attempts.length ? Math.round(mean(d.attempts.map(function (a) { return a.pct; }))) + "%" : "—") + "</span><span>O‘rtacha natija</span></div></div>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>O‘quvchilar</h2></div>" +
      (d.students.length ? '<p class="muted">Diagnostika statistikasi uchun har bir o‘quvchining guruhini belgilang.</p><div class="table-wrap"><table class="data"><thead><tr><th>F.I.Sh.</th><th>Login</th><th>Sinf</th><th>Guruh</th><th class="num">Ishlar</th><th class="num">O‘rtacha</th><th>Oxirgi faollik</th></tr></thead><tbody>' +
        d.students.map(function (s) {
          var st = stat[s.id];
          return '<tr><td><button type="button" class="link-btn" data-filter-student="' + s.id + '">' + esc(s.full_name) + "</button></td><td>" + esc(s.login) + "</td><td>" + esc(s.cls) + "</td>" +
            '<td><select class="grp" data-id="' + s.id + '" aria-label="Guruh"><option value=""' + (s.grp ? "" : " selected") + '>—</option><option value="tajriba"' + (s.grp === "tajriba" ? " selected" : "") + '>Tajriba</option><option value="nazorat"' + (s.grp === "nazorat" ? " selected" : "") + ">Nazorat</option></select></td>" +
            '<td class="num">' + st.n + '</td><td class="num">' + (st.n ? Math.round(st.sum / st.n) + "%" : "—") + "</td><td>" + (st.last ? esc(fmtDate(st.last)) : "—") + "</td></tr>";
        }).join("") + '</tbody></table></div><p class="send-msg" id="grp-msg" role="status"></p>'
        : '<p class="muted">Hozircha o‘quvchi yo‘q. Yuqoridagi kodni o‘quvchilaringizga bering.</p>') + "</section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Natijalar</h2></div>" +
      '<div class="toolbar"><label>O‘quvchi <select id="flt-student"><option value="">Hammasi</option>' + d.students.map(function (s) { return '<option value="' + s.id + '">' + esc(s.full_name) + "</option>"; }).join("") + "</select></label>" +
      '<label>Topshiriq <select id="flt-test"><option value="">Hammasi</option>' + Object.keys(tests).sort().map(function (id) { return '<option value="' + esc(id) + '">' + esc(tests[id]) + "</option>"; }).join("") + "</select></label>" +
      '<button type="button" class="btn ghost" id="t-csv">CSV yuklab olish</button></div>' +
      '<div id="t-attempts">' + attemptsTable(d.attempts, true, names) + "</div></section>" +
      '<div id="t-stats" class="t-stats">' + statsBlock(d) + "</div>";
  }

  function statsBlock(d) {
    var diag = diagRecords(d);
    return diag.length ? '<h2 class="h-stats">Diagnostika statistikasi (tajriba va nazorat guruhlari)</h2>' + statsHtml(diag) : "";
  }

  function bindTeacher() {
    var d = TEACHER, names = {};
    d.students.forEach(function (s) { names[s.id] = s.full_name; });
    bindLogout();
    var cb = document.getElementById("copy-code");
    cb.addEventListener("click", function () {
      var code = document.getElementById("t-code").textContent, m = document.getElementById("copy-msg");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { m.textContent = "Nusxalandi."; }, function () { m.textContent = "Kodni qo‘lda belgilab nusxalang."; });
      else m.textContent = "Kodni qo‘lda belgilab nusxalang.";
    });
    var fs = document.getElementById("flt-student"), ft = document.getElementById("flt-test");
    function filtered() {
      return d.attempts.filter(function (a) { return (!fs.value || a.student_id === fs.value) && (!ft.value || a.test_id === ft.value); });
    }
    function redraw() { document.getElementById("t-attempts").innerHTML = attemptsTable(filtered(), true, names); }
    fs.addEventListener("change", redraw);
    ft.addEventListener("change", redraw);
    app.querySelectorAll("[data-filter-student]").forEach(function (b) {
      b.addEventListener("click", function () { fs.value = b.getAttribute("data-filter-student"); redraw(); fs.scrollIntoView({ behavior: "smooth", block: "center" }); });
    });
    app.querySelectorAll("select.grp").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var m = document.getElementById("grp-msg");
        sel.disabled = true;
        API.setGroup(sel.getAttribute("data-id"), sel.value).then(function () {
          sel.disabled = false;
          d.students.forEach(function (s) { if (s.id === sel.getAttribute("data-id")) s.grp = sel.value; });
          m.className = "send-msg ok";
          m.textContent = "Guruh saqlandi.";
          var st = document.getElementById("t-stats");
          if (st) st.innerHTML = statsBlock(d);
        }, function (err) { sel.disabled = false; m.className = "send-msg bad"; m.textContent = err.message; });
      });
    });
    document.getElementById("t-csv").addEventListener("click", function () {
      var head = ["Sana", "O‘quvchi", "Sinf", "Guruh", "Topshiriq", "Turi", "Bosqich", "To‘g‘ri", "Jami", "%", "So‘rovnoma %"];
      var cls = {}, grp = {};
      d.students.forEach(function (s) { cls[s.id] = s.cls; grp[s.id] = s.grp; });
      var rows = filtered().map(function (a) {
        return [fmtDate(a.created_at), names[a.student_id] || "", cls[a.student_id] || "", a.grp || grp[a.student_id] || "", a.title, KIND[a.kind] || a.kind, a.stage, a.correct, a.total, a.pct, a.survey_pct == null ? "" : a.survey_pct]
          .map(function (v) { v = String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";");
      });
      var blob = new Blob(["﻿" + [head.join(";")].concat(rows).join("\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "oquvchilar-natijalari.csv";
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  function viewAttempt() {
    return '<p class="crumbs"><a href="#kabinet">Kabinet</a> / Javoblar</p><section class="page-head"><h1>Javoblar</h1><p class="lede">Yuklanmoqda…</p></section>';
  }

  function bindAttempt(id) {
    var done = later();
    API.attempt(Number(id)).then(function (a) {
      var u = API.user();
      done('<p class="crumbs"><a href="#kabinet">Kabinet</a> / Javoblar</p><section class="page-head"><p class="eyebrow">' + esc(KIND[a.kind] || a.kind) + " · " + esc(fmtDate(a.created_at)) + "</p><h1>" + esc(a.title) + "</h1>" +
        '<p class="lede">' + (u && u.role === "teacher" ? esc(a.student_name) + " · " : "") + a.correct + " / " + a.total + " to‘g‘ri (" + a.pct + "%)" +
        (a.survey_pct != null ? ", so‘rovnoma: " + a.survey_pct + "%" : "") + (a.stage ? ", bosqich: " + esc(a.stage) : "") + "</p></section>" +
        '<ol class="answers">' + a.details.map(function (x) {
          return '<li class="' + (x.ok ? "ok" : "bad") + '"><p class="ans-q">' + esc(x.q) + "</p>" +
            '<p><span class="ans-mark">' + (x.ok ? "✓" : "✗") + "</span> Javob: <b>" + esc(x.chosen) + "</b></p>" +
            (x.ok ? "" : '<p class="muted">To‘g‘ri javob: ' + esc(x.correct) + "</p>") + "</li>";
        }).join("") + "</ol>");
    }, function (err) {
      done('<p class="crumbs"><a href="#kabinet">Kabinet</a></p><section class="page-head"><h1>Javoblar</h1><p class="form-msg">' + esc(err.message) + "</p></section>");
    });
  }

  function refreshAccount() {
    var a = document.getElementById("acct-btn");
    if (!a) return;
    var u = API.user();
    a.textContent = u ? u.full_name.split(" ").slice(0, 2).join(" ") : "Kirish";
    a.setAttribute("href", u ? "#kabinet" : "#kirish");
    a.classList.toggle("is-in", !!u);
  }

  function viewNotFound() {
    return '<section class="page-head"><h1>Sahifa topilmadi</h1><p class="lede"><a href="#home">Bosh sahifaga qaytish</a></p></section>';
  }

  /* ---------- marshrutlash ---------- */

  var NAV = [["home", "Bosh sahifa"], ["sinflar", "Sinflar"], ["sinf-8", "8-sinf moduli"], ["allomalar", "Allomalar"], ["oyinlar", "O‘yinlar"], ["metodlar", "Metodlar"], ["diagnostika", "Diagnostika"], ["natijalar", "Natijalar"], ["tadqiqot", "Tadqiqot"]];

  function render() {
    var h = (location.hash || "#home").slice(1) || "home";
    var html, after = null, section = h;
    view++;
    var m;
    if (h === "home") html = viewHome();
    else if ((m = h.match(/^sinf-(\d+)$/))) { html = viewGrade(Number(m[1])); section = m[1] === "8" ? "sinf-8" : "sinflar"; }
    else if ((m = h.match(/^dars-(\w+)$/))) { html = viewLesson(m[1]); section = "sinf-8"; }
    else if (h === "sinflar") html = viewGrades();
    else if (h === "allomalar") html = viewScholars();
    else if ((m = h.match(/^alloma-(\w+)$/))) { html = viewScholar(m[1]); section = "allomalar"; }
    else if (h === "metodlar") html = viewMethods();
    else if (h === "diagnostika") { html = viewDiagnostic(); after = bindDiagnostic; }
    else if (h === "natijalar") { html = viewResults(); after = bindResults; }
    else if (h === "tadqiqot") html = viewResearch();
    else if (h === "oyinlar") html = viewGames();
    else if (h === "kirish") { html = viewAuth(); after = bindAuth; }
    else if (h === "kabinet") { html = viewCabinet(); after = bindCabinet; }
    else if ((m = h.match(/^test-([\w-]+)$/))) { html = viewTest(m[1]); section = "kabinet"; }
    else if ((m = h.match(/^natija-(\d+)$/))) { html = viewAttempt(); section = "kabinet"; var aid = m[1]; after = function () { bindAttempt(aid); }; }
    else html = viewNotFound();

    app.innerHTML = html;
    bindQuizzes();
    bindCases();
    bindCrosswords();
    bindGames();
    if (after) after();
    document.querySelectorAll(".topnav a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + section) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  document.getElementById("topnav").innerHTML = NAV.map(function (n) {
    return '<a href="#' + n[0] + '">' + n[1] + "</a>";
  }).join("");

  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  render();
  API.restore().then(function (u) {
    refreshAccount();
    if (u) render();
  }, function () { refreshAccount(); });
})();
