(function () {
  "use strict";

  var D = window.DATA;
  var G = window.GAMES;
  var API = window.API;
  var app = document.getElementById("app");
  var PROGRESS_KEY = "tarbiya.progress.v1";
  var GRADES = [5, 6, 7, 8, 9, 10, 11];
  var binders = [];

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

  function sec(title, body, extraClass) {
    return '<section class="block' + (extraClass ? " " + extraClass : "") + '"><div class="sec-head">' + star() + "<h2>" + title + "</h2></div>" + body + "</section>";
  }

  function levelOf(p) {
    if (p >= 80) return { key: "yuqori", name: "Yuqori" };
    if (p >= 55) return { key: "orta", name: "O‘rta" };
    return { key: "past", name: "Past" };
  }

  function portrait(s, cls) {
    if (s.img) return '<img class="portrait ' + (cls || "") + '" src="' + esc(s.img) + '" alt="' + esc(s.name) + ' portreti" loading="lazy">';
    var ini = s.name.split(" ").filter(function (w) { return /^[A-ZO‘G‘]/.test(w); }).slice(-2).map(function (w) { return w.charAt(0); }).join("");
    return '<span class="portrait mono ' + (cls || "") + '" aria-hidden="true">' + esc(ini) + "</span>";
  }

  function mount(component, onResult) {
    binders.push(function (root) { component.bind(root, onResult || report); });
    return component.html;
  }

  function dateStr(ms) {
    var d = new Date(Number(ms));
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  var KIND_NAMES = { quiz: "Test", lesson: "Dars testi", diagnostic: "Diagnostika", "case": "Case study", game: "O‘yin", crossword: "Krossvord" };

  /* Natijani serverga yuborish va o‘quvchiga holatini ko‘rsatish */
  function report(res, outEl) {
    var note = document.createElement("p");
    note.className = "send-note";
    if (outEl && outEl.parentNode) {
      var old = outEl.parentNode.parentNode.querySelector(".send-note");
      if (old) old.remove();
      outEl.parentNode.insertAdjacentElement("afterend", note);
    }
    var u = API.user;
    if (!u) {
      note.innerHTML = 'Natija saqlanmadi. O‘qituvchingiz ko‘rishi uchun <a href="#kirish">profilingizga kiring</a>.';
      return;
    }
    if (u.role !== "student") {
      note.textContent = "O‘qituvchi rejimi: natija saqlanmaydi.";
      return;
    }
    note.textContent = "Natija yuborilmoqda…";
    API.call("submitAttempt", res).then(function (r) {
      note.textContent = r.ok ? "Natija o‘qituvchingizga yuborildi." : r.error;
      note.classList.toggle("err", !r.ok);
    });
  }

  /* ---------- tasodifiy test ---------- */

  function quizComponent(quizId, title, kind, bank, n) {
    var idx = G.shuffle(bank.map(function (q, i) { return i; }));
    if (n && n < idx.length) idx = idx.slice(0, n);
    var fid = "qz-" + quizId + "-" + Math.random().toString(36).slice(2, 7);
    var html = '<form class="quiz" id="' + fid + '">';
    idx.forEach(function (bi, qi) {
      var it = bank[bi];
      html += '<fieldset class="q" data-bi="' + bi + '" data-c="' + it.c + '"><legend><span class="qn">' + (qi + 1) + ".</span> " + esc(it.q) + "</legend>";
      G.shuffle(it.a.map(function (a, ai) { return ai; })).forEach(function (ai) {
        var id = fid + "-" + qi + "-" + ai;
        html += '<label class="opt" for="' + id + '" data-ai="' + ai + '"><input type="radio" id="' + id + '" name="' + fid + "-" + qi + '" value="' + ai + '"> <span>' + esc(it.a[ai]) + "</span></label>";
      });
      html += "</fieldset>";
    });
    var best = load(PROGRESS_KEY, {})[quizId];
    html += '<div class="quiz-foot"><button type="submit" class="btn">Tekshirish</button>' +
      '<button type="button" class="btn ghost" data-act="new">Yangi variant</button>' +
      '<output class="quiz-out" aria-live="polite">' + (best != null ? "Oldingi eng yaxshi natija: " + best + "%" : "") + "</output></div>" +
      '<p class="muted small">Bankda ' + bank.length + " ta savol bor; har safar " + idx.length + " tasi tasodifiy tartibda chiqadi.</p></form>";

    function bind(root, onResult) {
      var form = root.querySelector("#" + fid);
      if (!form) return;
      var sent = false;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var right = 0, answers = [];
        form.querySelectorAll("fieldset.q").forEach(function (fs) {
          var c = Number(fs.getAttribute("data-c"));
          var chosen = fs.querySelector("input:checked");
          var a = chosen ? Number(chosen.value) : null;
          fs.classList.remove("ok", "bad");
          fs.classList.add(a === c ? "ok" : "bad");
          fs.querySelectorAll(".opt").forEach(function (o) { o.classList.toggle("is-correct", Number(o.getAttribute("data-ai")) === c); });
          if (a === c) right++;
          answers.push({ q: Number(fs.getAttribute("data-bi")), a: a, c: c });
        });
        var pct = Math.round(right / idx.length * 100);
        var out = form.querySelector(".quiz-out");
        out.textContent = right + " / " + idx.length + " to‘g‘ri (" + pct + "%)";
        var prog = load(PROGRESS_KEY, {});
        if (prog[quizId] == null || pct > prog[quizId]) { prog[quizId] = pct; save(PROGRESS_KEY, prog); }
        if (sent) return;
        sent = true;
        form.querySelector('button[type="submit"]').disabled = true;
        onResult({ kind: kind, quizId: quizId, title: title, score: right, total: idx.length, answers: answers }, out);
      });
      form.querySelector('[data-act="new"]').addEventListener("click", function () {
        var c = quizComponent(quizId, title, kind, bank, n);
        form.outerHTML = c.html;
        c.bind(root, onResult);
      });
    }
    return { html: html, bind: bind };
  }

  function bankFor(quizId) {
    var m;
    if (quizId === "diag") return D.diagnostic.test;
    if ((m = /^sinf(\d+)$/.exec(quizId))) return D.grades[m[1]] ? D.grades[m[1]].quiz : null;
    if ((m = /^dars-(\w+)$/.exec(quizId))) { var l = lesson(m[1]); return l ? l.lesson.quiz : null; }
    return null;
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
    var u = API.user;
    var cta = u ? '<a class="btn ghost" href="#profil">Mening profilim</a>' : '<a class="btn ghost" href="#royxat">Ro‘yxatdan o‘tish</a>';
    return '<section class="hero">' +
      '<p class="eyebrow">Dissertatsiya aprobatsiyasi uchun onlayn platforma</p>' +
      "<h1>" + esc(r.title) + "</h1>" +
      '<p class="lede">' + esc(r.subtitle) + "</p>" +
      '<div class="hero-actions"><a class="btn" href="#sinf-8">8-sinf modulini ochish</a>' + cta + "</div>" +
      "</section>" +
      sec("Sinflar bo‘yicha bo‘limlar", '<p class="muted">Har bir sinf bo‘limida darslikdagi malaka talablari, allomalar merosiga asoslangan mavzular, case study, krossvord, o‘yin va tasodifiy testlar bor. 8-sinf — tadqiqotning tajriba sinfi.</p>' +
        '<div class="grade-grid">' + GRADES.map(gradeCard).join("") + "</div>") +
      '<section class="block two-col"><div><div class="sec-head">' + star() + "<h2>Qanday ishlaydi</h2></div><ol class=\"steps\">" +
      "<li><b>O‘qituvchi</b> ro‘yxatdan o‘tadi va maxsus kod oladi.</li>" +
      "<li><b>O‘quvchi</b> shu kod bilan ro‘yxatdan o‘tadi va o‘z profilidan kiradi.</li>" +
      "<li>O‘quvchi test, krossvord, case study va o‘yinlarni bajaradi; har biriga savollar tasodifiy chiqadi.</li>" +
      "<li>O‘qituvchi o‘z profilida o‘quvchilar ballari, javoblari va diagnostika statistikasini ko‘radi.</li></ol></div>" +
      '<div><div class="sec-head">' + star() + "<h2>Platforma tarkibi</h2></div><ul class=\"plain\">" +
      '<li><a href="#allomalar">Allomalar</a> — ' + D.scholars.length + " ta mutafakkir, asarlari va tarbiyaviy g‘oyalari</li>" +
      '<li><a href="#metodlar">Metodlar</a> — ' + D.methods.length + " ta interfaol va an’anaviy usul</li>" +
      '<li><a href="#sinf-8">8-sinf moduli</a> — ' + D.grade8.lessons.length + " ta dars ishlanmasi</li>" +
      '<li><a href="#oyinlar">O‘yinlar</a> — krossvordlar, juftlik topish, vaqt chizig‘i, “Hikmat kimniki?”</li>' +
      '<li><a href="#diagnostika">Diagnostika</a> — dastlabki va yakuniy test hamda so‘rovnoma</li></ul></div></section>';
  }

  function viewGrades() {
    return '<section class="page-head"><p class="eyebrow">Umumiy o‘rta ta’lim</p><h1>5–11-sinflar</h1>' +
      '<p class="lede">Tarbiya fanining sinflar kesimidagi bo‘limlari. Kompetensiya darajalari: A2 — tayanch, A2+ — 9-sinf bitiruvchisi, B1 — 11-sinf bitiruvchisi.</p></section>' +
      '<div class="grade-grid">' + GRADES.map(gradeCard).join("") + "</div>";
  }

  function requirementsHtml(list, n) {
    return '<div class="req"><h3>' + n + "-sinf bitiruvchisiga qo‘yiladigan malaka talablari</h3><ul>" +
      list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      '</ul><p class="source">Manba: “Tarbiya fanini o‘qitish metodikasi” darsligi, 5.1-bo‘lim.</p></div>';
  }

  function gradeNav(current) {
    return '<nav class="grade-tabs" aria-label="Sinflar">' + GRADES.map(function (n) {
      return '<a href="#sinf-' + n + '"' + (n === current ? ' aria-current="page"' : "") + (n === 8 ? ' class="is-main"' : "") + ">" + n + "-sinf</a>";
    }).join("") + "</nav>";
  }

  function casesHtml(list) {
    return '<div class="case-list">' + list.map(function (k) {
      var s = scholar(k.scholar);
      return '<article class="case-card"><div class="case-head">' + portrait(s, "sm") + '<div><h3>' + esc(k.title) + '</h3><p class="muted">' + esc(s.name) + "</p></div></div>" +
        mount(G.caseStudy(k, { title: k.title })) + "</article>";
    }).join("") + "</div>";
  }

  var GRADE_GAME = {
    5: function () { return { title: "Yaxshi va yomon xulqlar", c: G.sorter(D.games.sort) }; },
    6: function () { return { title: "Alloma va asar", c: G.pairs(D.games.pairs, { count: 5 }) }; },
    7: function () { return { title: "Vaqt chizig‘i", c: G.timeline(D.games.timeline.slice(0, 6)) }; },
    9: function () { return { title: "Hikmat kimniki?", c: G.quoteGame(D.scholars) }; },
    10: function () { return { title: "Alloma va asar", c: G.pairs(D.games.pairs, { count: 6 }) }; },
    11: function () { return { title: "Vaqt chizig‘i", c: G.timeline(D.games.timeline) }; }
  };

  function crosswordSection(n) {
    var cw = D.crosswords[n];
    return sec("Krossvord: " + esc(cw.title), '<p class="muted">Katakka bosib, harflarni yozing. Savolni bossangiz, kursor o‘sha so‘zga o‘tadi.</p>' +
      mount(G.crossword(cw, { quizId: "krossvord-" + n, title: n + "-sinf krossvordi" })));
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
    var game = GRADE_GAME[n]();
    return gradeNav(n) +
      '<section class="page-head"><p class="eyebrow">' + esc(g.age) + " · " + esc(D.levels[g.level].name) + "</p><h1>" + n + "-sinf</h1>" +
      '<p class="lede">' + esc(g.focus) + "</p>" +
      '<nav class="jump" aria-label="Bo‘lim ichida"><a href="#sinf-' + n + '" data-jump="mavzular">Mavzular</a><a href="#sinf-' + n + '" data-jump="case">Case study</a><a href="#sinf-' + n + '" data-jump="krossvord">Krossvord</a><a href="#sinf-' + n + '" data-jump="oyin">O‘yin</a><a href="#sinf-' + n + '" data-jump="test">Test</a></nav></section>' +
      '<section class="block two-col">' + requirementsHtml(g.requirements, n) +
      '<div class="note"><h3>Ushbu sinfda allomalar merosi</h3><p>Mavzular malaka talablariga mos ravishda tanlangan. Har bir mavzu bitta alloma g‘oyasiga tayanadi va interfaol metod orqali o‘tiladi.</p>' +
      '<p class="muted">8-sinf bo‘limida to‘liq dars ishlanmalari namunasi berilgan; ushbu sinf uchun ham shu tuzilmadan foydalanish mumkin.</p><a class="link" href="#sinf-8">8-sinf moduliga o‘tish →</a></div></section>' +
      '<div id="mavzular">' + sec("Mavzular", '<div class="topic-grid">' + topics + "</div>") + "</div>" +
      '<div id="case">' + sec("Case study", casesHtml(D.cases[n] || [])) + "</div>" +
      '<div id="krossvord">' + crosswordSection(n) + "</div>" +
      '<div id="oyin">' + sec("O‘yin: " + game.title, mount(game.c)) + "</div>" +
      '<div id="test">' + sec("Nazorat testi", mount(quizComponent("sinf" + n, n + "-sinf nazorat testi", "quiz", g.quiz, D.draw.grade))) + "</div>";
  }

  function viewGrade8() {
    var g = D.grade8;
    var prog = load(PROGRESS_KEY, {});
    var lessons = g.lessons.map(function (l, i) {
      var s = scholar(l.scholar);
      var p = prog["dars-" + l.id];
      return '<li><a class="lesson-row" href="#dars-' + l.id + '"><span class="lesson-n">' + (i + 1) + "</span>" + portrait(s, "xs") +
        '<span class="lesson-body"><span class="lesson-title">' + esc(l.title) + '</span><span class="lesson-meta">' + esc(s.name) + " · " + esc(l.work) + "</span></span>" +
        '<span class="lesson-score">' + (p != null ? p + "%" : "") + "</span></a></li>";
    }).join("");
    var principles = g.principles.map(function (p) {
      return "<div><h3>" + esc(p.name) + "</h3><p>" + esc(p.text) + "</p></div>";
    }).join("");
    return gradeNav(8) +
      '<section class="page-head main"><p class="eyebrow">Tajriba moduli · ' + esc(g.age) + " · " + esc(g.level) + "</p><h1>8-sinf</h1>" +
      '<p class="lede">' + esc(g.focus) + "</p>" +
      '<div class="hero-actions"><a class="btn" href="#dars-d1">Birinchi darsni ochish</a><a class="btn ghost" href="#diagnostika">Diagnostika</a></div>' +
      '<nav class="jump" aria-label="Bo‘lim ichida"><a href="#sinf-8" data-jump="darslar">Darslar</a><a href="#sinf-8" data-jump="case">Case study</a><a href="#sinf-8" data-jump="krossvord">Krossvord</a><a href="#sinf-8" data-jump="oyin">O‘yinlar</a></nav></section>' +
      sec("Metodika tamoyillari", '<div class="principles">' + principles + "</div>") +
      '<section class="block two-col">' + requirementsHtml(g.requirements, 8) +
      '<div class="note"><h3>Modul qanday o‘tiladi</h3><ol class="steps">' +
      "<li>O‘qituvchi profilida o‘quvchilarni tajriba va nazorat guruhlariga ajratadi.</li>" +
      "<li>Modul boshida ikkala guruh <a href=\"#diagnostika\">dastlabki diagnostika</a>dan o‘tadi.</li>" +
      "<li>Tajriba guruhida " + g.lessons.length + " ta dars quyidagi ishlanmalar asosida o‘tiladi; har dars oxirida test, case study va o‘yinlar bajariladi.</li>" +
      "<li>O‘qituvchi bosqichni “yakuniy”ga o‘tkazadi va ikkala guruh yakuniy diagnostikadan o‘tadi; natijalar o‘qituvchi profilida taqqoslanadi.</li></ol></div></section>" +
      '<div id="darslar">' + sec("Dars ishlanmalari", '<ol class="lessons">' + lessons + "</ol>") + "</div>" +
      '<div id="case">' + sec("Case study", casesHtml(D.cases[8])) + "</div>" +
      '<div id="krossvord">' + crosswordSection(8) + "</div>" +
      '<div id="oyin">' + sec("O‘yinlar", '<div class="game-grid"><div><h3>Alloma va asar</h3>' + mount(G.pairs(D.games.pairs, { count: 6 })) + "</div>" +
        "<div><h3>Vaqt chizig‘i</h3>" + mount(G.timeline(D.games.timeline)) + "</div></div>" +
        "<h3>Hikmat kimniki?</h3>" + mount(G.quoteGame(D.scholars))) + "</div>";
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
    var prev = i > 0 ? '<a class="btn ghost" href="#dars-' + all[i - 1].id + '">← ' + i + "-dars</a>" : "<span></span>";
    var next = i < all.length - 1 ? '<a class="btn ghost" href="#dars-' + all[i + 1].id + '">' + (i + 2) + "-dars →</a>" : '<a class="btn" href="#diagnostika">Yakuniy diagnostika →</a>';
    var cases = (D.cases[8] || []).filter(function (k) { return k.scholar === l.scholar; });
    return gradeNav(8) +
      '<p class="crumbs"><a href="#sinf-8">8-sinf moduli</a> / ' + (i + 1) + "-dars</p>" +
      '<section class="page-head with-portrait">' + portrait(s, "lg") + '<div><p class="eyebrow">' + (i + 1) + "-dars · " + total + " daqiqa</p><h1>" + esc(l.title) + "</h1>" +
      '<p class="lede"><a href="#alloma-' + s.id + '">' + esc(s.name) + "</a> · “" + esc(l.work) + "”</p></div></section>" +
      (l.quote ? '<blockquote class="quote"><p>“' + esc(l.quote) + '”</p><cite>' + esc(s.name) + "</cite></blockquote>" : "") +
      '<section class="block"><dl class="goals">' +
      "<div><dt>Ta’limiy maqsad</dt><dd>" + esc(l.goals.talimiy) + "</dd></div>" +
      "<div><dt>Tarbiyaviy maqsad</dt><dd>" + esc(l.goals.tarbiyaviy) + "</dd></div>" +
      "<div><dt>Rivojlantiruvchi maqsad</dt><dd>" + esc(l.goals.rivojlantiruvchi) + "</dd></div>" +
      "<div><dt>Shakllanadigan kompetensiya</dt><dd>" + esc(l.competency) + "</dd></div></dl></section>" +
      sec("Darsning borishi", '<ol class="flow">' + flow + "</ol>") +
      '<section class="block two-col"><div><h3>Muhokama savollari</h3><ul>' + l.questions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h3>Uyga vazifa</h3><p>" + esc(l.homework) + "</p></div></section>" +
      (cases.length ? sec("Case study", casesHtml(cases)) : "") +
      sec("Dars bo‘yicha test", mount(quizComponent("dars-" + l.id, (i + 1) + "-dars: " + l.title, "lesson", l.quiz, D.draw.lesson))) +
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
      '<section class="page-head with-portrait">' + portrait(s, "lg") + '<div><p class="eyebrow">' + esc(s.years) + " · " + esc(s.place) + "</p><h1>" + esc(s.name) + "</h1>" +
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
      html += sec(g + " shakllar", '<div class="method-grid">' +
        items.map(function (m) {
          return '<article class="method" id="m-' + m.id + '"><h3>' + esc(m.name) + "</h3><p>" + esc(m.text) + "</p><ol>" +
            m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ol><p class="example"><span>Namuna:</span> ' + esc(m.example) + "</p></article>";
        }).join("") + "</div>");
    });
    return html;
  }

  var gamesGrade = 8;
  function viewGames() {
    var tabs = GRADES.map(function (n) {
      return '<button type="button" class="pill' + (n === gamesGrade ? " on" : "") + '" data-cwg="' + n + '" aria-pressed="' + (n === gamesGrade) + '">' + n + "-sinf</button>";
    }).join("");
    binders.push(function (root) {
      root.querySelectorAll("[data-cwg]").forEach(function (b) {
        b.addEventListener("click", function () {
          gamesGrade = Number(b.getAttribute("data-cwg"));
          var y = window.scrollY;
          render();
          window.scrollTo(0, y);
        });
      });
    });
    var cw = D.crosswords[gamesGrade];
    return '<section class="page-head"><p class="eyebrow">Interfaol topshiriqlar</p><h1>O‘yinlar va krossvordlar</h1>' +
      '<p class="lede">Allomalar va ularning asarlari, fazilatlar va tarbiyaviy tushunchalarni o‘yin orqali mustahkamlang. Profilingizga kirgan bo‘lsangiz, natijalar o‘qituvchingizga boradi.</p></section>' +
      sec("Krossvord", '<div class="pill-row" role="group" aria-label="Sinfni tanlang">' + tabs + "</div><h3>" + gamesGrade + "-sinf: " + esc(cw.title) + "</h3>" +
        mount(G.crossword(cw, { quizId: "krossvord-" + gamesGrade, title: gamesGrade + "-sinf krossvordi" }))) +
      '<div class="game-grid">' + sec("Alloma va asar", mount(G.pairs(D.games.pairs, { count: 6 }))) + sec("Vaqt chizig‘i", mount(G.timeline(D.games.timeline))) + "</div>" +
      '<div class="game-grid">' + sec("Yaxshi va yomon xulqlar", mount(G.sorter(D.games.sort))) + sec("Hikmat kimniki?", mount(G.quoteGame(D.scholars))) + "</div>";
  }

  function viewResearch() {
    var r = D.research;
    return '<section class="page-head"><p class="eyebrow">Aprobatsiya</p><h1>Tajriba-sinov tartibi</h1><p class="lede">' + esc(r.goal) + "</p></section>" +
      '<section class="block"><ol class="stage-list">' + r.stages.map(function (s) {
        return "<li><h3>" + esc(s.name) + "</h3><p>" + esc(s.text) + "</p></li>";
      }).join("") + "</ol></section>" +
      '<section class="block two-col"><div><h3>Baholash mezonlari</h3><ul>' +
      "<li><b>Bilim komponenti</b> — " + D.diagnostic.test.length + " savollik test (allomalar merosi va hayotiy vaziyatlar), foizda. Savollar va javob variantlari har bir o‘quvchiga tasodifiy tartibda chiqadi.</li>" +
      "<li><b>Munosabat komponenti</b> — " + D.diagnostic.survey.length + " bandli so‘rovnoma (1–5 ball), foizga aylantiriladi.</li>" +
      "<li><b>Umumiy ko‘rsatkich</b> — ikki komponentning o‘rtachasi.</li></ul>" +
      '<h3>Darajalar</h3><ul><li><span class="lvl yuqori">Yuqori</span> 80% va undan yuqori</li><li><span class="lvl orta">O‘rta</span> 55–79%</li><li><span class="lvl past">Past</span> 55% dan past</li></ul></div>' +
      "<div><h3>Statistik tahlil</h3><ul>" +
      "<li>Samaradorlik koeffitsienti: η = X̄<sub>T</sub> / X̄<sub>N</sub> (yakuniy bosqich). η &gt; 1 bo‘lsa, tajriba guruhi ustun.</li>" +
      "<li>O‘sish: yakuniy va dastlabki o‘rtachalar farqi har bir guruh uchun.</li>" +
      "<li>Styudent t-mezoni (Welch varianti): t = (X̄<sub>T</sub> − X̄<sub>N</sub>) / √(S²<sub>T</sub>/n<sub>T</sub> + S²<sub>N</sub>/n<sub>N</sub>). p &lt; 0,05 bo‘lsa, farq statistik ahamiyatli.</li></ul>" +
      '<p class="muted">Hisob-kitoblar o‘qituvchi profilidagi “Diagnostika tahlili” bo‘limida avtomatik bajariladi.</p></div></section>';
  }

  /* ---------- diagnostika ---------- */

  function viewDiagnostic() {
    var d = D.diagnostic;
    var u = API.user;
    var head = '<section class="page-head"><p class="eyebrow">8-sinf · dastlabki va yakuniy bosqich</p><h1>Diagnostika</h1>' +
      '<p class="lede">Test o‘quvchining allomalar merosi bo‘yicha bilimini, so‘rovnoma esa ma’naviy-axloqiy munosabatini aniqlaydi. Natija o‘qituvchingiz profiliga boradi.</p></section>';
    if (!u) {
      return head + '<section class="block empty"><h2>Diagnostikadan o‘tish uchun profilingizga kiring</h2><p>Natija o‘qituvchingizga borishi uchun o‘qituvchi bergan kod bilan ro‘yxatdan o‘tgan bo‘lishingiz kerak.</p>' +
        '<div class="hero-actions"><a class="btn" href="#kirish">Kirish</a><a class="btn ghost" href="#royxat">Ro‘yxatdan o‘tish</a></div></section>';
    }
    if (u.role === "teacher") {
      return head + '<section class="block empty"><h2>Siz o‘qituvchi sifatida kirgansiz</h2><p>Diagnostikani o‘quvchilaringiz o‘z profillaridan topshiradi. Hozirgi bosqich: <b>' + esc(u.stage) + '</b>. Bosqichni va natijalarni <a href="#profil">profilingizda</a> boshqarasiz.</p></section>';
    }
    var order = G.shuffle(d.test.map(function (q, i) { return i; }));
    var test = order.map(function (bi, qi) {
      var it = d.test[bi];
      return '<fieldset class="q" data-bi="' + bi + '" data-c="' + it.c + '"><legend><span class="qn">' + (qi + 1) + ".</span> " + esc(it.q) + "</legend>" +
        G.shuffle(it.a.map(function (a, ai) { return ai; })).map(function (ai) {
          var id = "dt-" + qi + "-" + ai;
          return '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="dt-' + qi + '" value="' + ai + '"> <span>' + esc(it.a[ai]) + "</span></label>";
        }).join("") + "</fieldset>";
    }).join("");
    var survey = '<div class="likert-wrap"><table class="likert"><thead><tr><th scope="col">Fikr</th>' +
      d.likert.map(function (l, i) { return '<th scope="col">' + (i + 1) + '<span class="lk-label">' + esc(l) + "</span></th>"; }).join("") + "</tr></thead><tbody>" +
      d.survey.map(function (s, si) {
        return '<tr><th scope="row">' + esc(s) + "</th>" + d.likert.map(function (l, li) {
          return '<td><input type="radio" id="sv-' + si + "-" + li + '" name="sv-' + si + '" value="' + (li + 1) + '" aria-label="' + esc(l) + '"></td>';
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    binders.push(bindDiagnostic);
    var groupName = u.group === "tajriba" ? "Tajriba guruhi" : u.group === "nazorat" ? "Nazorat guruhi" : "Belgilanmagan";
    return head +
      '<section class="block"><dl class="facts"><div><dt>O‘quvchi</dt><dd>' + esc(u.name) + "</dd></div><div><dt>Sinf</dt><dd>" + esc(u.cls) + "</dd></div>" +
      "<div><dt>O‘qituvchi</dt><dd>" + esc(u.teacher) + "</dd></div><div><dt>Guruh</dt><dd>" + groupName + "</dd></div>" +
      '<div><dt>Bosqich</dt><dd>' + (u.stage === "yakuniy" ? "Yakuniy" : "Dastlabki") + "</dd></div></dl></section>" +
      '<form id="diag" class="diag" novalidate>' +
      sec("1-qism. Test (" + d.test.length + " savol)", '<div class="quiz">' + test + "</div>") +
      sec("2-qism. So‘rovnoma", '<p class="muted">Har bir fikrga o‘zingizga mos javobni belgilang: 1 — hech qachon, 5 — doimo.</p>' + survey) +
      '<div class="diag-foot"><button type="submit" class="btn">Natijani yuborish</button><p id="diag-msg" class="form-msg" role="alert"></p></div>' +
      '</form><section id="diag-result" class="block" hidden></section>';
  }

  function bindDiagnostic(root) {
    var form = root.querySelector("#diag");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = D.diagnostic;
      var msg = form.querySelector("#diag-msg");
      var test = [], right = 0, unanswered = 0;
      form.querySelectorAll("fieldset.q").forEach(function (fs) {
        var ch = fs.querySelector("input:checked"), c = Number(fs.getAttribute("data-c"));
        var a = ch ? Number(ch.value) : null;
        if (a == null) unanswered++;
        if (a === c) right++;
        test.push({ q: Number(fs.getAttribute("data-bi")), a: a, c: c });
      });
      var survey = [], sum = 0;
      d.survey.forEach(function (s, si) {
        var ch = form.querySelector('input[name="sv-' + si + '"]:checked');
        if (!ch) unanswered++;
        survey.push(ch ? Number(ch.value) : null);
        sum += ch ? Number(ch.value) : 0;
      });
      if (unanswered) { msg.textContent = unanswered + " ta savol javobsiz qoldi. Barcha savollarga javob bering."; return; }
      msg.textContent = "Yuborilmoqda…";
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var testPct = Math.round(right / d.test.length * 100);
      var surveyPct = Math.round((sum - d.survey.length) / (d.survey.length * 4) * 100);
      API.call("submitAttempt", { kind: "diagnostic", quizId: "diag", title: "Diagnostika", score: right, total: d.test.length, survey: surveyPct, answers: { test: test, survey: survey } }).then(function (r) {
        if (!r.ok) { msg.textContent = r.error; btn.disabled = false; return; }
        var total = Math.round((testPct + surveyPct) / 2), lv = levelOf(total);
        var out = root.querySelector("#diag-result");
        out.innerHTML = '<div class="result-card"><p class="eyebrow">Natija o‘qituvchingizga yuborildi</p><h2>' + esc(API.user.name) + "</h2>" +
          '<div class="stats"><div><span class="big">' + testPct + '%</span><span>Test</span></div><div><span class="big">' + surveyPct + '%</span><span>So‘rovnoma</span></div>' +
          '<div><span class="big">' + total + '%</span><span>Umumiy</span></div><div><span class="lvl ' + lv.key + '">' + lv.name + "</span><span>Daraja</span></div></div>" +
          '<a class="btn ghost" href="#profil">Profilimga o‘tish</a></div>';
        out.hidden = false;
        form.hidden = true;
        out.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- kirish va ro‘yxatdan o‘tish ---------- */

  function modeBanner() {
    return API.mode === "local" ? '<p class="banner">Sinov rejimi: server hali ulanmagan, hisoblar va natijalar faqat shu brauzerda saqlanadi. Server ulangach, barcha qurilmalardagi o‘quvchilar natijalari o‘qituvchiga boradi.</p>' : "";
  }

  function afterAuth(r, msgEl) {
    if (!r.ok) { msgEl.textContent = r.error; return; }
    API.setSession(r.token, r.user);
    drawAccount();
    location.hash = "#profil";
  }

  function viewLogin() {
    binders.push(function (root) {
      var f = root.querySelector("#login-form");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var m = f.querySelector(".form-msg");
        m.textContent = "";
        f.querySelector("button").disabled = true;
        API.call("login", { login: f.login.value, password: f.password.value }).then(function (r) {
          f.querySelector("button").disabled = false;
          afterAuth(r, m);
        });
      });
    });
    return '<section class="page-head"><p class="eyebrow">Profil</p><h1>Kirish</h1><p class="lede">O‘qituvchi va o‘quvchilar uchun umumiy kirish.</p></section>' + modeBanner() +
      '<form id="login-form" class="auth-card" novalidate>' +
      '<label for="l-login">Login<input id="l-login" name="login" autocomplete="username" autocapitalize="none" required></label>' +
      '<label for="l-pass">Parol<input id="l-pass" name="password" type="password" autocomplete="current-password" required></label>' +
      '<button type="submit" class="btn">Kirish</button><p class="form-msg" role="alert"></p>' +
      '<p class="muted">Hisobingiz yo‘qmi? <a href="#royxat">Ro‘yxatdan o‘ting</a>. Parolni unutgan o‘quvchi o‘qituvchisidan yangi parol so‘raydi.</p></form>';
  }

  function viewRegister(code) {
    binders.push(function (root) {
      [["#reg-teacher", "registerTeacher"], ["#reg-student", "registerStudent"]].forEach(function (p) {
        var f = root.querySelector(p[0]);
        f.addEventListener("submit", function (e) {
          e.preventDefault();
          var m = f.querySelector(".form-msg");
          if (f.password.value !== f.password2.value) { m.textContent = "Parollar bir xil emas."; return; }
          var q = {};
          Array.prototype.forEach.call(f.elements, function (el) { if (el.name) q[el.name] = el.value; });
          f.querySelector("button").disabled = true;
          API.call(p[1], q).then(function (r) {
            f.querySelector("button").disabled = false;
            afterAuth(r, m);
          });
        });
      });
    });
    var common = function (pfx) {
      return '<label for="' + pfx + '-login">Login (lotin harflari va raqamlar)<input id="' + pfx + '-login" name="login" autocomplete="username" autocapitalize="none" required placeholder="masalan: malika08"></label>' +
        '<label for="' + pfx + '-pass">Parol (kamida 4 belgi)<input id="' + pfx + '-pass" name="password" type="password" autocomplete="new-password" required></label>' +
        '<label for="' + pfx + '-pass2">Parolni takrorlang<input id="' + pfx + '-pass2" name="password2" type="password" autocomplete="new-password" required></label>';
    };
    return '<section class="page-head"><p class="eyebrow">Profil</p><h1>Ro‘yxatdan o‘tish</h1><p class="lede">O‘qituvchi ro‘yxatdan o‘tgach, maxsus kod oladi. O‘quvchilar shu kod bilan ro‘yxatdan o‘tadi va ularning natijalari o‘sha o‘qituvchiga boradi.</p></section>' + modeBanner() +
      '<div class="two-col auth-cols">' +
      '<form id="reg-student" class="auth-card' + (code ? " focus" : "") + '" novalidate><h2>O‘quvchi</h2>' +
      '<label for="rs-code">O‘qituvchi bergan kod<input id="rs-code" name="code" required autocapitalize="characters" value="' + esc(code || "") + '" placeholder="masalan: K7M2QX"></label>' +
      '<label for="rs-name">Ism-familiya<input id="rs-name" name="name" required autocomplete="name"></label>' +
      '<label for="rs-cls">Sinf<input id="rs-cls" name="cls" required placeholder="8-A"></label>' + common("rs") +
      '<button type="submit" class="btn">O‘quvchi sifatida ro‘yxatdan o‘tish</button><p class="form-msg" role="alert"></p></form>' +
      '<form id="reg-teacher" class="auth-card" novalidate><h2>O‘qituvchi</h2>' +
      '<label for="rt-name">Ism-familiya<input id="rt-name" name="name" required autocomplete="name"></label>' +
      '<label for="rt-school">Maktab<input id="rt-school" name="school" placeholder="masalan: 12-maktab, Guliston"></label>' + common("rt") +
      '<button type="submit" class="btn">O‘qituvchi sifatida ro‘yxatdan o‘tish</button><p class="form-msg" role="alert"></p></form></div>' +
      '<p class="muted">Hisobingiz bormi? <a href="#kirish">Kiring</a>.</p>';
  }

  /* ---------- profil ---------- */

  function viewProfile() {
    if (!API.user) { location.hash = "#kirish"; return ""; }
    binders.push(function (root) {
      var box = root.querySelector("#prof");
      if (API.user.role === "teacher") loadTeacher(box);
      else loadStudent(box);
    });
    return modeBanner() + '<div id="prof"><p class="muted">Yuklanmoqda…</p></div>';
  }

  function loadStudent(box) {
    var u = API.user;
    API.call("myAttempts").then(function (r) {
      if (!r.ok) { box.innerHTML = '<p class="form-msg">' + esc(r.error) + "</p>"; return; }
      var list = r.attempts.slice().sort(function (a, b) { return b.created - a.created; });
      var avg = list.length ? Math.round(list.reduce(function (s, a) { return s + a.pct; }, 0) / list.length) : null;
      var rows = list.map(function (a) {
        var lv = levelOf(a.pct);
        return "<tr><td>" + dateStr(a.created) + "</td><td>" + esc(KIND_NAMES[a.kind] || a.kind) + "</td><td>" + esc(a.title) + '</td><td class="num">' + a.score + " / " + a.total + '</td><td><span class="lvl ' + lv.key + '">' + a.pct + "%</span></td></tr>";
      }).join("");
      var groupName = u.group === "tajriba" ? "Tajriba guruhi" : u.group === "nazorat" ? "Nazorat guruhi" : "Belgilanmagan";
      box.innerHTML = '<section class="page-head"><p class="eyebrow">O‘quvchi profili · ' + esc(u.cls) + "</p><h1>" + esc(u.name) + "</h1>" +
        '<p class="lede">O‘qituvchi: ' + esc(u.teacher) + (u.school ? ", " + esc(u.school) : "") + "</p></section>" +
        '<div class="kpis"><div><span class="big">' + list.length + '</span><span>Bajarilgan topshiriqlar</span></div>' +
        '<div><span class="big">' + (avg == null ? "—" : avg + "%") + '</span><span>O‘rtacha natija</span></div>' +
        '<div><span class="big sm">' + groupName + '</span><span>Guruh</span></div>' +
        '<div><span class="big sm">' + (u.stage === "yakuniy" ? "Yakuniy" : "Dastlabki") + '</span><span>Diagnostika bosqichi</span></div></div>' +
        sec("Topshiriqlar", '<div class="hero-actions"><a class="btn" href="#diagnostika">Diagnostika</a><a class="btn ghost" href="#sinf-8">8-sinf darslari</a><a class="btn ghost" href="#oyinlar">O‘yinlar</a><a class="btn ghost" href="#sinflar">Boshqa sinflar</a></div>') +
        sec("Mening natijalarim", list.length ? '<div class="table-wrap"><table class="data"><thead><tr><th>Sana</th><th>Turi</th><th>Nomi</th><th class="num">Ball</th><th>Foiz</th></tr></thead><tbody>' + rows + "</tbody></table></div>" :
          '<div class="empty"><p>Hali topshiriq bajarilmagan. Test, krossvord yoki o‘yinni bajaring — natija shu yerda va o‘qituvchingiz profilida paydo bo‘ladi.</p></div>');
    });
  }

  /* ---------- statistika ---------- */

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
    return { t: t, df: df, p: ibeta(df / 2, 0.5, df / (df + t * t)) };
  }
  function fmt(x, digits) {
    if (x == null || isNaN(x)) return "—";
    return x.toFixed(digits == null ? 1 : digits).replace(".", ",");
  }
  function fmtP(p) { return p < 0.001 ? "< 0,001" : "= " + fmt(p, 3); }

  function csv(head, rows) {
    return "﻿" + [head].concat(rows).map(function (r) {
      return r.map(function (v) { v = String(v == null ? "" : v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(";");
    }).join("\n");
  }
  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- o‘qituvchi paneli ---------- */

  var T = { data: null, tab: "oquvchilar", student: "", kind: "", detail: null, pw: null, msg: "" };

  function loadTeacher(box) {
    API.call("teacherData").then(function (r) {
      if (!r.ok) { box.innerHTML = '<p class="form-msg">' + esc(r.error) + "</p>"; return; }
      T.data = r;
      API.user = r.user;
      drawTeacher(box);
    });
  }

  function regLink(code) {
    return location.href.split("#")[0] + "#kod-" + code;
  }

  function diagRows() {
    var byId = {};
    T.data.students.forEach(function (s) { byId[s.id] = s; });
    var latest = {};
    T.data.attempts.forEach(function (a) {
      if (a.kind !== "diagnostic") return;
      var k = a.sid + "|" + a.stage;
      if (!latest[k] || a.created > latest[k].created) latest[k] = a;
    });
    return Object.keys(latest).map(function (k) {
      var a = latest[k], s = byId[a.sid];
      return { a: a, s: s, group: s ? s.group : a.group, stage: a.stage, total: Math.round((a.pct + (a.survey || 0)) / 2) };
    });
  }

  function drawTeacher(box) {
    var u = T.data.user, st = T.data.students, at = T.data.attempts;
    var tabs = [["oquvchilar", "O‘quvchilar (" + st.length + ")"], ["natijalar", "Natijalar (" + at.length + ")"], ["tahlil", "Diagnostika tahlili"]];
    var html = '<section class="page-head"><p class="eyebrow">O‘qituvchi profili' + (u.school ? " · " + esc(u.school) : "") + "</p><h1>" + esc(u.name) + "</h1></section>" +
      '<section class="code-card"><div><p class="eyebrow">O‘quvchilar uchun kod</p><p class="code">' + esc(u.code) + '</p><p class="muted">O‘quvchilar ro‘yxatdan o‘tishda shu kodni kiritadi yoki quyidagi havola orqali kiradi.</p>' +
      '<p class="reglink"><input id="t-link" readonly value="' + esc(regLink(u.code)) + '" aria-label="Ro‘yxatdan o‘tish havolasi"></p>' +
      '<div class="toolbar"><button type="button" class="btn" data-copy="' + esc(u.code) + '">Kodni nusxalash</button><button type="button" class="btn ghost" data-copy="' + esc(regLink(u.code)) + '">Havolani nusxalash</button></div></div>' +
      '<div><p class="eyebrow">Diagnostika bosqichi</p><div class="pill-row" role="group" aria-label="Bosqich">' +
      '<button type="button" class="pill' + (u.stage !== "yakuniy" ? " on" : "") + '" data-stage="dastlabki" aria-pressed="' + (u.stage !== "yakuniy") + '">Dastlabki</button>' +
      '<button type="button" class="pill' + (u.stage === "yakuniy" ? " on" : "") + '" data-stage="yakuniy" aria-pressed="' + (u.stage === "yakuniy") + '">Yakuniy</button></div>' +
      '<p class="muted">O‘quvchilar topshirgan diagnostika shu bosqich nomi bilan saqlanadi. Tajriba yakunida “Yakuniy”ga o‘tkazing.</p>' +
      '<button type="button" class="btn ghost" data-act="refresh">Ma’lumotlarni yangilash</button></div></section>' +
      '<p class="form-msg ok-msg" role="status">' + esc(T.msg) + "</p>" +
      '<nav class="tabs" role="tablist">' + tabs.map(function (t) {
        return '<button type="button" role="tab" class="tab' + (T.tab === t[0] ? " on" : "") + '" aria-selected="' + (T.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + "</nav>";
    T.msg = "";

    if (T.tab === "oquvchilar") html += teacherStudents(st, at);
    else if (T.tab === "natijalar") html += teacherAttempts(st, at);
    else html += teacherStats();
    box.innerHTML = html;
    bindTeacher(box);
  }

  function teacherStudents(st, at) {
    if (!st.length) return '<div class="empty"><h2>Hali o‘quvchi yo‘q</h2><p>O‘quvchilaringizga yuqoridagi kodni yoki havolani bering. Ular ro‘yxatdan o‘tishi bilan shu yerda paydo bo‘ladi.</p></div>';
    var rows = st.slice().sort(function (a, b) { return (a.cls + a.name).localeCompare(b.cls + b.name); }).map(function (s) {
      var mine = at.filter(function (a) { return a.sid === s.id; });
      var avg = mine.length ? Math.round(mean(mine.map(function (a) { return a.pct; }))) : null;
      return "<tr><td>" + esc(s.name) + "</td><td>" + esc(s.cls) + "</td><td>" + esc(s.login) + "</td>" +
        '<td><select data-group="' + s.id + '" aria-label="' + esc(s.name) + ' guruhi"><option value=""' + (!s.group ? " selected" : "") + '>—</option><option value="tajriba"' + (s.group === "tajriba" ? " selected" : "") + '>Tajriba</option><option value="nazorat"' + (s.group === "nazorat" ? " selected" : "") + ">Nazorat</option></select></td>" +
        '<td class="num">' + mine.length + '</td><td class="num">' + (avg == null ? "—" : avg + "%") + "</td>" +
        '<td><button type="button" class="btn ghost sm" data-view="' + s.id + '">Natijalari</button> <button type="button" class="btn ghost sm" data-pw="' + s.id + '">Parol</button></td></tr>' +
        (T.pw === s.id ? '<tr class="pw-row"><td colspan="7"><form class="inline-form" data-pwform="' + s.id + '"><label for="pw-' + s.id + '">' + esc(s.name) + ' uchun yangi parol</label><input id="pw-' + s.id + '" name="password" minlength="4" required><button type="submit" class="btn sm">Saqlash</button><button type="button" class="btn ghost sm" data-pw="">Bekor qilish</button></form></td></tr>' : "");
    }).join("");
    return '<section class="block"><p class="muted">Har bir o‘quvchini tajriba yoki nazorat guruhiga belgilang. Diagnostika tahlili shu guruhlar bo‘yicha hisoblanadi.</p>' +
      '<div class="table-wrap"><table class="data"><thead><tr><th>F.I.Sh.</th><th>Sinf</th><th>Login</th><th>Guruh</th><th class="num">Topshiriqlar</th><th class="num">O‘rtacha</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div></section>";
  }

  function teacherAttempts(st, at) {
    var byId = {};
    st.forEach(function (s) { byId[s.id] = s; });
    var list = at.filter(function (a) { return (!T.student || a.sid === T.student) && (!T.kind || a.kind === T.kind); })
      .sort(function (a, b) { return b.created - a.created; });
    var filters = '<div class="filters"><label for="f-st">O‘quvchi<select id="f-st"><option value="">Barchasi</option>' +
      st.map(function (s) { return '<option value="' + s.id + '"' + (T.student === s.id ? " selected" : "") + ">" + esc(s.name) + " (" + esc(s.cls) + ")</option>"; }).join("") + "</select></label>" +
      '<label for="f-kind">Turi<select id="f-kind"><option value="">Barchasi</option>' +
      Object.keys(KIND_NAMES).map(function (k) { return '<option value="' + k + '"' + (T.kind === k ? " selected" : "") + ">" + KIND_NAMES[k] + "</option>"; }).join("") + "</select></label>" +
      '<div class="toolbar"><button type="button" class="btn ghost" data-act="csv-all">CSV yuklab olish</button></div></div>';
    if (!list.length) return '<section class="block">' + filters + '<div class="empty"><p>Tanlangan bo‘yicha natija yo‘q.</p></div></section>';
    var rows = list.map(function (a) {
      var s = byId[a.sid] || { name: "—", cls: "" }, lv = levelOf(a.pct);
      return "<tr" + (T.detail === a.id ? ' class="sel"' : "") + "><td>" + dateStr(a.created) + "</td><td>" + esc(s.name) + "</td><td>" + esc(s.cls) + "</td><td>" + esc(KIND_NAMES[a.kind] || a.kind) + "</td><td>" + esc(a.title) +
        (a.kind === "diagnostic" ? ' <span class="chip">' + esc(a.stage) + "</span>" : "") + '</td><td class="num">' + a.score + " / " + a.total + '</td><td><span class="lvl ' + lv.key + '">' + a.pct + "%</span></td>" +
        '<td><button type="button" class="btn ghost sm" data-detail="' + a.id + '">Javoblar</button></td></tr>' +
        (T.detail === a.id ? '<tr class="detail-row"><td colspan="8">' + answersHtml(a) + "</td></tr>" : "");
    }).join("");
    return '<section class="block">' + filters + '<div class="table-wrap"><table class="data"><thead><tr><th>Sana</th><th>O‘quvchi</th><th>Sinf</th><th>Turi</th><th>Nomi</th><th class="num">Ball</th><th>Foiz</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div></section>";
  }

  function answersHtml(a) {
    var ans = a.answers;
    if (ans == null) return '<p class="muted">Javoblar saqlanmagan.</p>';
    function testTable(list, bank) {
      return '<ol class="ans-list">' + list.map(function (x) {
        var q = bank && bank[x.q];
        if (!q) return "<li>Savol topilmadi</li>";
        var ok = x.a === x.c;
        return '<li class="' + (ok ? "ok" : "bad") + '"><p>' + esc(q.q) + "</p><p><b>" + (ok ? "✓" : "✗") + " Javobi:</b> " + (x.a == null ? "<i>javob berilmagan</i>" : esc(q.a[x.a])) +
          (ok ? "" : ' · <span class="muted">To‘g‘ri javob: ' + esc(q.a[x.c]) + "</span>") + "</p></li>";
      }).join("") + "</ol>";
    }
    if (a.kind === "quiz" || a.kind === "lesson") return testTable(ans, bankFor(a.quizId));
    if (a.kind === "diagnostic") {
      return "<h4>Test</h4>" + testTable(ans.test || [], D.diagnostic.test) + "<h4>So‘rovnoma (" + (a.survey == null ? "—" : a.survey + "%") + ")</h4><ul>" +
        D.diagnostic.survey.map(function (s, i) {
          var v = (ans.survey || [])[i];
          return "<li>" + esc(s) + " — <b>" + (v ? v + " (" + esc(D.diagnostic.likert[v - 1]) + ")" : "—") + "</b></li>";
        }).join("") + "</ul>";
    }
    if (a.kind === "case") {
      return "<p><b>" + (ans.best ? "✓ Eng maqbul yechim tanlangan" : "✗ Boshqa variant tanlangan") + ":</b> " + esc(ans.choiceText) + "</p>" +
        "<p><b>O‘quvchi fikri:</b> " + (ans.text ? esc(ans.text) : "<i>yozilmagan</i>") + "</p>";
    }
    if (a.kind === "crossword") {
      return '<ul class="ans-list">' + ans.map(function (w) {
        var ok = w.given === w.answer;
        return '<li class="' + (ok ? "ok" : "bad") + '">' + esc(w.clue) + " — <b>" + esc(w.given) + "</b>" + (ok ? "" : ' <span class="muted">(to‘g‘ri: ' + esc(w.answer) + ")</span>") + "</li>";
      }).join("") + "</ul>";
    }
    if (a.quizId === "hikmat") {
      return '<ul class="ans-list">' + ans.map(function (x) {
        var ok = x.given === x.answer;
        return '<li class="' + (ok ? "ok" : "bad") + '">“' + esc(x.quote) + "” — <b>" + esc(x.given || "javobsiz") + "</b>" + (ok ? "" : ' <span class="muted">(to‘g‘ri: ' + esc(x.answer) + ")</span>") + "</li>";
      }).join("") + "</ul>";
    }
    if (a.quizId === "xulq") {
      return '<ul class="ans-list">' + ans.map(function (x) {
        var ok = x.good === x.chosenGood;
        return '<li class="' + (ok ? "ok" : "bad") + '">' + esc(x.t) + " — " + (x.chosenGood ? "yaxshi" : "yomon") + " deb belgilagan</li>";
      }).join("") + "</ul>";
    }
    if (a.quizId === "vaqt") return "<p>O‘quvchi tartibi:</p><ol>" + ans.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ol>";
    if (a.quizId === "juftlik") return "<p>Xatolar soni: <b>" + esc(ans.mistakes) + "</b></p>";
    return "<pre>" + esc(JSON.stringify(ans, null, 2)) + "</pre>";
  }

  function teacherStats() {
    var rows = diagRows();
    if (!rows.length) {
      return '<div class="empty"><h2>Diagnostika natijalari hali yo‘q</h2><p>O‘quvchilar <a href="#diagnostika">Diagnostika</a> sahifasida test va so‘rovnomani topshirgach, natijalar guruh va bosqichlar bo‘yicha shu yerda jamlanadi. Avval “O‘quvchilar” bo‘limida guruhlarni belgilang.</p></div>';
    }
    var pick = function (g, s) { return rows.filter(function (r) { return r.group === g && r.stage === s; }).map(function (r) { return r.total; }); };
    var groups = [["tajriba", "Tajriba guruhi"], ["nazorat", "Nazorat guruhi"]], stages = [["dastlabki", "Dastlabki"], ["yakuniy", "Yakuniy"]];
    var table = groups.map(function (g) {
      return stages.map(function (s) {
        var a = pick(g[0], s[0]);
        var lv = { yuqori: 0, orta: 0, past: 0 };
        a.forEach(function (x) { lv[levelOf(x).key]++; });
        var bar = a.length ? '<div class="lvbar" role="img" aria-label="Yuqori ' + lv.yuqori + ", o‘rta " + lv.orta + ", past " + lv.past + '">' +
          ["yuqori", "orta", "past"].map(function (k) { return lv[k] ? '<span class="' + k + '" style="flex:' + lv[k] + '">' + lv[k] + "</span>" : ""; }).join("") + "</div>" : "—";
        return '<tr><th scope="row">' + g[1] + "</th><td>" + s[1] + '</td><td class="num">' + a.length + '</td><td class="num">' + fmt(mean(a)) + '</td><td class="num">' + fmt(sd(a)) + "</td><td>" + bar + "</td></tr>";
      }).join("");
    }).join("");
    var tY = pick("tajriba", "yakuniy"), nY = pick("nazorat", "yakuniy"), tD = pick("tajriba", "dastlabki"), nD = pick("nazorat", "dastlabki");
    var w = welch(tY, nY), w0 = welch(tD, nD);
    var unassigned = rows.filter(function (r) { return !r.group; }).length;
    var sig = w ? (w.p < 0.05 ? "Yakuniy bosqichda farq statistik ahamiyatli (p < 0,05)." : "Yakuniy bosqichda farq statistik ahamiyatli emas (p ≥ 0,05).") : "t-mezonni hisoblash uchun har guruhda kamida 2 ta yakuniy natija kerak.";
    return (unassigned ? '<p class="banner">' + unassigned + " ta natija guruhi belgilanmagan o‘quvchilarga tegishli va tahlilga kirmadi. “O‘quvchilar” bo‘limida guruhni belgilang.</p>" : "") +
      '<section class="block"><div class="kpis"><div><span class="big">' + fmt(mean(tY)) + '%</span><span>Tajriba guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(mean(nY)) + '%</span><span>Nazorat guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(mean(tY) / mean(nY), 2) + '</span><span>Samaradorlik koeffitsienti η</span></div>' +
      '<div><span class="big">' + (w ? fmt(w.t, 2) : "—") + "</span><span>Styudent t" + (w ? " (df ≈ " + Math.round(w.df) + ", p " + fmtP(w.p) + ")" : "") + "</span></div></div>" +
      '<p class="muted">' + sig + (w0 ? " Dastlabki bosqichda guruhlar farqi: t = " + fmt(w0.t, 2) + ", p " + fmtP(w0.p) + (w0.p >= 0.05 ? " — boshlang‘ich daraja bir xil." : " — boshlang‘ich darajada farq bor.") : "") +
      " O‘sish: tajriba guruhida " + fmt(mean(tY) - mean(tD)) + " punkt, nazorat guruhida " + fmt(mean(nY) - mean(nD)) + " punkt. Har bir o‘quvchining har bosqichdagi oxirgi urinishi hisobga olinadi.</p></section>" +
      '<section class="block"><div class="table-wrap"><table class="data"><thead><tr><th>Guruh</th><th>Bosqich</th><th class="num">n</th><th class="num">X̄, %</th><th class="num">S</th><th>Darajalar (yuqori / o‘rta / past)</th></tr></thead><tbody>' + table + "</tbody></table></div>" +
      '<div class="toolbar"><button type="button" class="btn ghost" data-act="csv-diag">Diagnostika natijalarini CSV yuklab olish</button></div></section>';
  }

  function bindTeacher(box) {
    function redraw() { drawTeacher(box); }
    box.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var text = b.getAttribute("data-copy");
        var done = function () { T.msg = "Nusxalandi: " + text; redraw(); };
        var fail = function () { var i = box.querySelector("#t-link"); i.focus(); i.select(); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
      });
    });
    box.querySelectorAll("[data-stage]").forEach(function (b) {
      b.addEventListener("click", function () {
        API.call("setStage", { stage: b.getAttribute("data-stage") }).then(function (r) {
          if (r.ok) { T.data.user.stage = r.stage; T.msg = "Bosqich o‘zgartirildi: " + (r.stage === "yakuniy" ? "yakuniy" : "dastlabki") + "."; }
          else T.msg = r.error;
          redraw();
        });
      });
    });
    box.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () { T.tab = b.getAttribute("data-tab"); T.detail = null; redraw(); });
    });
    var refresh = box.querySelector('[data-act="refresh"]');
    if (refresh) refresh.addEventListener("click", function () { loadTeacher(box); });
    box.querySelectorAll("[data-group]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var id = sel.getAttribute("data-group");
        API.call("setGroup", { studentId: id, group: sel.value }).then(function (r) {
          if (!r.ok) { T.msg = r.error; redraw(); return; }
          T.data.students.forEach(function (s) { if (s.id === id) s.group = sel.value; });
        });
      });
    });
    box.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { T.student = b.getAttribute("data-view"); T.kind = ""; T.tab = "natijalar"; redraw(); });
    });
    box.querySelectorAll("[data-pw]").forEach(function (b) {
      b.addEventListener("click", function () { T.pw = b.getAttribute("data-pw") || null; redraw(); });
    });
    box.querySelectorAll("[data-pwform]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        API.call("resetPassword", { studentId: f.getAttribute("data-pwform"), password: f.password.value }).then(function (r) {
          T.msg = r.ok ? "Yangi parol saqlandi. Uni o‘quvchiga ayting." : r.error;
          if (r.ok) T.pw = null;
          redraw();
        });
      });
    });
    var fst = box.querySelector("#f-st"), fk = box.querySelector("#f-kind");
    if (fst) fst.addEventListener("change", function () { T.student = fst.value; T.detail = null; redraw(); });
    if (fk) fk.addEventListener("change", function () { T.kind = fk.value; T.detail = null; redraw(); });
    box.querySelectorAll("[data-detail]").forEach(function (b) {
      b.addEventListener("click", function () { var id = b.getAttribute("data-detail"); T.detail = T.detail === id ? null : id; redraw(); });
    });
    var byId = {};
    T.data.students.forEach(function (s) { byId[s.id] = s; });
    var c1 = box.querySelector('[data-act="csv-all"]');
    if (c1) c1.addEventListener("click", function () {
      download("natijalar.csv", csv(["Sana", "O‘quvchi", "Sinf", "Guruh", "Turi", "Nomi", "Ball", "Jami", "Foiz", "So‘rovnoma (%)", "Bosqich"],
        T.data.attempts.map(function (a) { var s = byId[a.sid] || {}; return [dateStr(a.created), s.name, s.cls, s.group, KIND_NAMES[a.kind], a.title, a.score, a.total, a.pct, a.survey, a.stage]; })));
    });
    var c2 = box.querySelector('[data-act="csv-diag"]');
    if (c2) c2.addEventListener("click", function () {
      download("diagnostika.csv", csv(["O‘quvchi", "Sinf", "Guruh", "Bosqich", "Test (%)", "So‘rovnoma (%)", "Umumiy (%)", "Daraja", "Sana"],
        diagRows().map(function (r) { return [r.s ? r.s.name : "", r.s ? r.s.cls : "", r.group, r.stage, r.a.pct, r.a.survey, r.total, levelOf(r.total).name, dateStr(r.a.created)]; })));
    });
  }

  function viewNotFound() {
    return '<section class="page-head"><h1>Sahifa topilmadi</h1><p class="lede"><a href="#home">Bosh sahifaga qaytish</a></p></section>';
  }

  /* ---------- marshrutlash ---------- */

  var NAV = [["home", "Bosh sahifa"], ["sinflar", "Sinflar"], ["sinf-8", "8-sinf moduli"], ["allomalar", "Allomalar"], ["metodlar", "Metodlar"], ["oyinlar", "O‘yinlar"], ["diagnostika", "Diagnostika"], ["tadqiqot", "Tadqiqot"]];

  function drawAccount() {
    var el = document.getElementById("account");
    if (!el) return;
    var u = API.user;
    if (!u) {
      el.innerHTML = '<a class="btn sm" href="#kirish">Kirish</a>';
      return;
    }
    el.innerHTML = '<a class="acct" href="#profil"><span class="acct-role">' + (u.role === "teacher" ? "O‘qituvchi" : "O‘quvchi") + "</span>" + esc(u.name.split(" ")[0]) + "</a>" +
      '<button type="button" class="btn ghost sm" id="logout">Chiqish</button>';
    document.getElementById("logout").addEventListener("click", function () {
      API.call("logout").then(function () {
        API.setSession(null, null);
        T.data = null;
        drawAccount();
        location.hash = "#home";
        render();
      });
    });
  }

  function render() {
    var h = (location.hash || "#home").slice(1) || "home";
    var html, section = h, m;
    binders = [];
    if (h === "home") html = viewHome();
    else if (h === "sinflar") html = viewGrades();
    else if ((m = h.match(/^sinf-(\d+)$/))) { html = viewGrade(Number(m[1])); section = m[1] === "8" ? "sinf-8" : "sinflar"; }
    else if ((m = h.match(/^dars-(\w+)$/))) { html = viewLesson(m[1]); section = "sinf-8"; }
    else if (h === "allomalar") html = viewScholars();
    else if ((m = h.match(/^alloma-(\w+)$/))) { html = viewScholar(m[1]); section = "allomalar"; }
    else if (h === "metodlar") html = viewMethods();
    else if (h === "oyinlar") html = viewGames();
    else if (h === "diagnostika") html = viewDiagnostic();
    else if (h === "tadqiqot") html = viewResearch();
    else if (h === "kirish") html = viewLogin();
    else if (h === "royxat") html = viewRegister("");
    else if ((m = h.match(/^kod-([A-Za-z0-9]+)$/))) html = viewRegister(m[1].toUpperCase());
    else if (h === "profil" || h === "natijalar") html = viewProfile();
    else html = viewNotFound();

    app.innerHTML = html;
    binders.forEach(function (b) { b(app); });
    app.querySelectorAll("[data-jump]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var t = document.getElementById(a.getAttribute("data-jump"));
        if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    document.querySelectorAll(".topnav a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + section) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  document.getElementById("topnav").innerHTML = NAV.map(function (n) {
    return '<a href="#' + n[0] + '">' + n[1] + "</a>";
  }).join("");

  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  if (API.token) {
    app.innerHTML = '<p class="muted">Yuklanmoqda…</p>';
    API.init().then(function () { drawAccount(); render(); });
  } else {
    drawAccount();
    render();
  }
})();
