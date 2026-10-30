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

  /* ---------- test komponenti ---------- */

  function quizHtml(quizId, items) {
    var html = '<form class="quiz" data-quiz="' + esc(quizId) + '">';
    items.forEach(function (it, qi) {
      html += '<fieldset class="q" data-c="' + it.c + '"><legend><span class="qn">' + (qi + 1) + '.</span> ' + esc(it.q) + "</legend>";
      it.a.forEach(function (ans, ai) {
        var id = quizId + "-" + qi + "-" + ai;
        html += '<label class="opt" for="' + id + '"><input type="radio" id="' + id + '" name="' + quizId + "-" + qi + '" value="' + ai + '"> <span>' + esc(ans) + "</span></label>";
      });
      html += "</fieldset>";
    });
    var best = (load(PROGRESS_KEY, {})[quizId]);
    html += '<div class="quiz-foot"><button type="submit" class="btn">Tekshirish</button>' +
      '<button type="reset" class="btn ghost">Qayta boshlash</button>' +
      '<output class="quiz-out" aria-live="polite">' + (best != null ? "Oldingi eng yaxshi natija: " + best + "%" : "") + "</output></div></form>";
    return html;
  }

  function bindQuizzes() {
    app.querySelectorAll("form.quiz").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var sets = form.querySelectorAll("fieldset.q");
        var right = 0, answered = 0;
        sets.forEach(function (fs) {
          var c = Number(fs.getAttribute("data-c"));
          var chosen = fs.querySelector("input:checked");
          fs.classList.remove("ok", "bad");
          fs.querySelectorAll(".opt").forEach(function (o, i) {
            o.classList.toggle("is-correct", i === c);
          });
          if (chosen) {
            answered++;
            if (Number(chosen.value) === c) { right++; fs.classList.add("ok"); } else fs.classList.add("bad");
          } else fs.classList.add("bad");
        });
        var pct = Math.round(right / sets.length * 100);
        var out = form.querySelector(".quiz-out");
        out.textContent = right + " / " + sets.length + " to‘g‘ri (" + pct + "%)" + (answered < sets.length ? ". Javobsiz savollar xato hisoblandi." : "");
        var prog = load(PROGRESS_KEY, {});
        var id = form.getAttribute("data-quiz");
        if (prog[id] == null || pct > prog[id]) { prog[id] = pct; save(PROGRESS_KEY, prog); }
      });
      form.addEventListener("reset", function () {
        form.querySelectorAll("fieldset.q").forEach(function (fs) {
          fs.classList.remove("ok", "bad");
          fs.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-correct"); });
        });
        form.querySelector(".quiz-out").textContent = "";
      });
    });
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
      '<div class="hero-actions"><a class="btn" href="#sinf-8">8-sinf modulini ochish</a><a class="btn ghost" href="#diagnostika">Diagnostikani boshlash</a></div>' +
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
      '<section class="block"><div class="sec-head">' + star() + "<h2>Nazorat testi</h2></div>" + quizHtml("sinf" + n, g.quiz) + "</section>";
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
      '<section class="block"><div class="sec-head">' + star() + "<h2>Dars ishlanmalari</h2></div><ol class=\"lessons\">" + lessons + "</ol></section>";
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
      '<section class="block"><div class="sec-head">' + star() + "<h2>Dars bo‘yicha test</h2></div>" + quizHtml("dars-" + l.id, l.quiz) + "</section>" +
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
    var test = d.test.map(function (it, qi) {
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
      '<section class="block"><div class="sec-head">' + star() + "<h2>O‘quvchi ma’lumotlari</h2></div><div class=\"fields\">" +
      '<label for="f-name">F.I.Sh.<input id="f-name" name="name" required autocomplete="name" placeholder="Masalan: Karimova Malika"></label>' +
      '<label for="f-school">Maktab<input id="f-school" name="school" required placeholder="Masalan: 12-maktab, Guliston"></label>' +
      '<label for="f-cls">Sinf<input id="f-cls" name="cls" required placeholder="8-A"></label>' +
      '<label for="f-group">Guruh<select id="f-group" name="group" required><option value="">Tanlang</option><option value="tajriba">Tajriba guruhi</option><option value="nazorat">Nazorat guruhi</option></select></label>' +
      '<label for="f-stage">Bosqich<select id="f-stage" name="stage" required><option value="">Tanlang</option><option value="dastlabki">Dastlabki</option><option value="yakuniy">Yakuniy</option></select></label>' +
      "</div></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>1-qism. Test (" + d.test.length + " savol)</h2></div><div class=\"quiz\">" + test + "</div></section>" +
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
      var missing = [];
      ["name", "school", "cls", "group", "stage"].forEach(function (k) { if (!String(fd.get(k) || "").trim()) missing.push(k); });
      var answers = { test: [], survey: [] };
      var right = 0, unanswered = 0;
      d.test.forEach(function (it, qi) {
        var v = fd.get("dt-" + qi);
        if (v == null) unanswered++;
        answers.test.push(v == null ? null : Number(v));
        if (v != null && Number(v) === it.c) right++;
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
      var testPct = Math.round(right / d.test.length * 100);
      var surveyPct = Math.round((sum - d.survey.length) / (d.survey.length * 4) * 100);
      var total = Math.round((testPct + surveyPct) / 2);
      var rec = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: new Date().toISOString(),
        name: String(fd.get("name")).trim(), school: String(fd.get("school")).trim(), cls: String(fd.get("cls")).trim(),
        group: fd.get("group"), stage: fd.get("stage"),
        test: testPct, survey: surveyPct, total: total, level: levelOf(total).name, answers: answers
      };
      var list = load(RESULTS_KEY, []);
      list.push(rec);
      var stored = save(RESULTS_KEY, list);
      sendToSheets(rec);
      var out = document.getElementById("diag-result");
      var lv = levelOf(total);
      out.innerHTML = '<div class="result-card"><p class="eyebrow">Natija qabul qilindi</p><h2>' + esc(rec.name) + "</h2>" +
        '<div class="stats"><div><span class="big">' + testPct + '%</span><span>Test</span></div><div><span class="big">' + surveyPct + '%</span><span>So‘rovnoma</span></div>' +
        '<div><span class="big">' + total + '%</span><span>Umumiy</span></div><div><span class="lvl ' + lv.key + '">' + lv.name + "</span><span>Daraja</span></div></div>" +
        (stored ? "" : '<p class="form-msg">Brauzer xotirasi yopiq, natija shu qurilmada saqlanmadi.</p>') +
        '<button type="button" class="btn ghost" id="diag-again">Keyingi o‘quvchi</button></div>';
      out.hidden = false;
      form.hidden = true;
      out.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("diag-again").addEventListener("click", function () { render(); window.scrollTo(0, 0); });
    });
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

  function viewResults() {
    var list = load(RESULTS_KEY, []);
    var groups = [["tajriba", "Tajriba guruhi"], ["nazorat", "Nazorat guruhi"]];
    var stages = [["dastlabki", "Dastlabki"], ["yakuniy", "Yakuniy"]];
    var pick = function (g, s) { return list.filter(function (r) { return r.group === g && r.stage === s; }).map(function (r) { return r.total; }); };

    var html = '<section class="page-head"><p class="eyebrow">O‘qituvchi paneli</p><h1>Natijalar</h1>' +
      '<p class="lede">Shu qurilmada topshirilgan diagnostika natijalari. Bir nechta qurilmadan yig‘ish uchun JSON eksport-importdan yoki Google Sheets ulanishidan foydalaning.</p></section>';

    if (!list.length) {
      return html + '<section class="block empty"><h2>Hozircha natija yo‘q</h2><p>O‘quvchilar <a href="#diagnostika">Diagnostika</a> sahifasida test va so‘rovnomani topshirgach, natijalar shu yerda guruh va bosqichlar bo‘yicha jamlanadi.</p>' +
        '<div class="hero-actions"><a class="btn" href="#diagnostika">Diagnostikani ochish</a><button type="button" class="btn ghost" id="r-sample">Namuna ma’lumotlarni ko‘rish</button></div></section>' + importBlock();
    }

    var hasSample = list.some(function (r) { return r.sample; });
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

    html += (hasSample ? '<p class="banner">Jadvalda namuna ma’lumotlar bor. Haqiqiy tajriba boshlanishidan oldin ularni “Namunalarni o‘chirish” tugmasi bilan olib tashlang.</p>' : "") +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Umumiy ko‘rsatkichlar</h2></div>" +
      '<div class="kpis"><div><span class="big">' + fmt(mean(tY)) + '%</span><span>Tajriba guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(mean(nY)) + '%</span><span>Nazorat guruhi, yakuniy o‘rtacha</span></div>' +
      '<div><span class="big">' + fmt(eta, 2) + '</span><span>Samaradorlik koeffitsienti η</span></div>' +
      '<div><span class="big">' + (w ? fmt(w.t, 2) : "—") + '</span><span>Styudent t' + (w ? " (df ≈ " + Math.round(w.df) + ", p " + fmtP(w.p) + ")" : "") + "</span></div></div>" +
      '<p class="muted">' + sig + (w0 ? " Dastlabki bosqichda guruhlar farqi: t = " + fmt(w0.t, 2) + ", p " + fmtP(w0.p) + (w0.p >= 0.05 ? " — guruhlar boshlang‘ich darajasi bir xil." : " — guruhlar boshlang‘ich darajasida farq bor.") : "") +
      " O‘sish: tajriba guruhida " + fmt(mean(tY) - mean(tD)) + " punkt, nazorat guruhida " + fmt(mean(nY) - mean(nD)) + " punkt.</p></section>" +
      '<section class="block"><div class="sec-head">' + star() + "<h2>Guruh va bosqichlar</h2></div>" +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Guruh</th><th>Bosqich</th><th class="num">n</th><th class="num">X̄, %</th><th class="num">S</th><th>Darajalar (yuqori / o‘rta / past)</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>" +
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

  function viewNotFound() {
    return '<section class="page-head"><h1>Sahifa topilmadi</h1><p class="lede"><a href="#home">Bosh sahifaga qaytish</a></p></section>';
  }

  /* ---------- marshrutlash ---------- */

  var NAV = [["home", "Bosh sahifa"], ["sinflar", "Sinflar"], ["sinf-8", "8-sinf moduli"], ["allomalar", "Allomalar"], ["metodlar", "Metodlar"], ["diagnostika", "Diagnostika"], ["natijalar", "Natijalar"], ["tadqiqot", "Tadqiqot"]];

  function render() {
    var h = (location.hash || "#home").slice(1) || "home";
    var html, after = null, section = h;
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
    else html = viewNotFound();

    app.innerHTML = html;
    bindQuizzes();
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
})();
