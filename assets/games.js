/* Interfaol topshiriqlar: krossvord, case study, juftlik topish, vaqt chizig‘i, xulqlarni saralash, “Hikmat kimniki?”.
   Har bir komponent { html, bind(root, onResult) } qaytaradi; onResult natijani serverga yuborish uchun chaqiriladi. */
(function () {
  "use strict";

  var uid = 0;
  function nextId(p) { uid += 1; return p + uid; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- krossvord ---------- */

  /* Bir nechta tartibda joylashtirib, eng ko‘p so‘z sig‘gan va eng ixcham variant tanlanadi (natija har safar bir xil). */
  function layout(words) {
    var seed = 12345;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var byLen = words.slice().sort(function (a, b) { return b.w.length - a.w.length; });
    var best = null;
    for (var t = 0; t < 60; t++) {
      var order = t === 0 ? byLen : byLen.slice().sort(function () { return rnd() - 0.5; });
      var L = layoutOnce(order);
      var area = L.rows * L.cols, square = Math.abs(L.rows - L.cols);
      if (!best || L.words.length > best.words.length || (L.words.length === best.words.length && area + square * 4 < best.rows * best.cols + Math.abs(best.rows - best.cols) * 4)) best = L;
    }
    return best;
  }

  function layoutOnce(list) {
    var cells = {}, placed = [];
    function key(r, c) { return r + "," + c; }
    function canPlace(w, r, c, dir) {
      var dr = dir === "down" ? 1 : 0, dc = dir === "down" ? 0 : 1, hits = 0;
      if (cells[key(r - dr, c - dc)] || cells[key(r + dr * w.length, c + dc * w.length)]) return -1;
      for (var i = 0; i < w.length; i++) {
        var rr = r + dr * i, cc = c + dc * i, ch = cells[key(rr, cc)];
        if (ch) {
          if (ch !== w[i]) return -1;
          hits++;
        } else if (cells[key(rr + dc, cc + dr)] || cells[key(rr - dc, cc - dr)]) return -1;
      }
      return hits;
    }
    function put(item, r, c, dir) {
      var dr = dir === "down" ? 1 : 0, dc = dir === "down" ? 0 : 1;
      for (var i = 0; i < item.w.length; i++) cells[key(r + dr * i, c + dc * i)] = item.w[i];
      placed.push({ w: item.w, clue: item.clue, r: r, c: c, dir: dir });
    }
    put(list[0], 0, 0, "across");
    var pending = list.slice(1);
    for (var pass = 0; pass < 3 && pending.length; pass++) {
      pending = pending.filter(function (item) {
        var best = null;
        placed.forEach(function (p) {
          var pdr = p.dir === "down" ? 1 : 0, pdc = p.dir === "down" ? 0 : 1;
          var dir = p.dir === "down" ? "across" : "down";
          for (var i = 0; i < p.w.length; i++) for (var j = 0; j < item.w.length; j++) {
            if (p.w[i] !== item.w[j]) continue;
            var r = p.r + pdr * i - (dir === "down" ? j : 0), c = p.c + pdc * i - (dir === "across" ? j : 0);
            var h = canPlace(item.w, r, c, dir);
            if (h > 0 && (!best || h > best.h)) best = { r: r, c: c, dir: dir, h: h };
          }
        });
        if (best) { put(item, best.r, best.c, best.dir); return false; }
        return true;
      });
    }
    var minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
    placed.forEach(function (p) {
      var endR = p.r + (p.dir === "down" ? p.w.length - 1 : 0), endC = p.c + (p.dir === "across" ? p.w.length - 1 : 0);
      minR = Math.min(minR, p.r); minC = Math.min(minC, p.c); maxR = Math.max(maxR, endR); maxC = Math.max(maxC, endC);
    });
    placed.forEach(function (p) { p.r -= minR; p.c -= minC; });
    placed.sort(function (a, b) { return a.r - b.r || a.c - b.c; });
    var num = 0, numbers = {};
    placed.forEach(function (p) {
      var k = key(p.r, p.c);
      if (!numbers[k]) numbers[k] = ++num;
      p.n = numbers[k];
    });
    return { rows: maxR - minR + 1, cols: maxC - minC + 1, words: placed, numbers: numbers, skipped: pending };
  }

  function crossword(cw, opts) {
    var id = nextId("cw");
    var L = layout(cw.words);
    var grid = {};
    L.words.forEach(function (p, wi) {
      for (var i = 0; i < p.w.length; i++) {
        var r = p.r + (p.dir === "down" ? i : 0), c = p.c + (p.dir === "across" ? i : 0), k = r + "," + c;
        grid[k] = grid[k] || { ch: p.w[i], words: [] };
        grid[k].words.push(wi);
      }
    });
    var html = '<div class="cw" id="' + id + '"><div class="cw-board"><div class="cw-grid" style="grid-template-columns:repeat(' + L.cols + ', var(--cell))">';
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var k = r + "," + c, g = grid[k];
      if (!g) { html += '<span class="cw-x" aria-hidden="true"></span>'; continue; }
      html += '<label class="cw-cell">' + (L.numbers[k] ? '<span class="cw-n">' + L.numbers[k] + "</span>" : "") +
        '<input maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" data-k="' + k + '" aria-label="Katak ' + (r + 1) + "-qator " + (c + 1) + '-ustun"></label>';
    }
    html += "</div></div><div class=\"cw-clues\">";
    [["across", "Gorizontal"], ["down", "Vertikal"]].forEach(function (d) {
      var ws = L.words.filter(function (p) { return p.dir === d[0]; });
      if (!ws.length) return;
      html += "<div><h4>" + d[1] + "</h4><ol>" + ws.map(function (p) {
        return '<li value="' + p.n + '" data-w="' + L.words.indexOf(p) + '">' + esc(p.clue) + ' <span class="muted">(' + p.w.length + ")</span></li>";
      }).join("") + "</ol></div>";
    });
    html += '</div><div class="quiz-foot"><button type="button" class="btn" data-act="check">Tekshirish</button>' +
      '<button type="button" class="btn ghost" data-act="finish">Yakunlash</button><output class="quiz-out" aria-live="polite"></output></div></div>';

    function bind(root, onResult) {
      var box = root.querySelector("#" + id);
      if (!box) return;
      var inputs = {};
      var dir = "across";
      box.querySelectorAll("input").forEach(function (inp) {
        inputs[inp.getAttribute("data-k")] = inp;
        inp.addEventListener("focus", function () { inp.select(); });
        inp.addEventListener("input", function () {
          inp.value = inp.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
          inp.parentNode.classList.remove("bad", "ok");
          if (!inp.value) return;
          var p = inp.getAttribute("data-k").split(",").map(Number);
          var nk = dir === "across" ? p[0] + "," + (p[1] + 1) : (p[0] + 1) + "," + p[1];
          if (!inputs[nk]) { dir = dir === "across" ? "down" : "across"; nk = dir === "across" ? p[0] + "," + (p[1] + 1) : (p[0] + 1) + "," + p[1]; }
          if (inputs[nk]) inputs[nk].focus();
        });
        inp.addEventListener("keydown", function (e) {
          var p = inp.getAttribute("data-k").split(",").map(Number), nk = null;
          if (e.key === "ArrowRight") { nk = p[0] + "," + (p[1] + 1); dir = "across"; }
          else if (e.key === "ArrowLeft") { nk = p[0] + "," + (p[1] - 1); dir = "across"; }
          else if (e.key === "ArrowDown") { nk = (p[0] + 1) + "," + p[1]; dir = "down"; }
          else if (e.key === "ArrowUp") { nk = (p[0] - 1) + "," + p[1]; dir = "down"; }
          else if (e.key === "Backspace" && !inp.value) { nk = dir === "across" ? p[0] + "," + (p[1] - 1) : (p[0] - 1) + "," + p[1]; }
          if (nk && inputs[nk]) { e.preventDefault(); inputs[nk].focus(); }
        });
      });
      box.querySelectorAll(".cw-clues li").forEach(function (li) {
        li.addEventListener("click", function () {
          var p = L.words[Number(li.getAttribute("data-w"))];
          dir = p.dir;
          inputs[p.r + "," + p.c].focus();
        });
      });
      function evaluate(mark) {
        var right = 0, filled = 0;
        L.words.forEach(function (p) {
          var ok = true;
          for (var i = 0; i < p.w.length; i++) {
            var k = (p.r + (p.dir === "down" ? i : 0)) + "," + (p.c + (p.dir === "across" ? i : 0));
            if (inputs[k].value !== p.w[i]) ok = false;
            if (inputs[k].value) filled++;
          }
          if (ok) right++;
        });
        if (mark) Object.keys(inputs).forEach(function (k) {
          var inp = inputs[k];
          inp.parentNode.classList.toggle("bad", !!inp.value && inp.value !== grid[k].ch);
          inp.parentNode.classList.toggle("ok", inp.value === grid[k].ch);
        });
        return { right: right, total: L.words.length, filled: filled };
      }
      var out = box.querySelector(".quiz-out");
      box.querySelector('[data-act="check"]').addEventListener("click", function () {
        var e = evaluate(true);
        out.textContent = e.right + " / " + e.total + " so‘z to‘g‘ri. Qizil kataklarni tuzating.";
      });
      box.querySelector('[data-act="finish"]').addEventListener("click", function () {
        var e = evaluate(true);
        out.textContent = "Natija: " + e.right + " / " + e.total + " so‘z.";
        var words = L.words.map(function (p) {
          var s = "";
          for (var i = 0; i < p.w.length; i++) s += inputs[(p.r + (p.dir === "down" ? i : 0)) + "," + (p.c + (p.dir === "across" ? i : 0))].value || "·";
          return { clue: p.clue, answer: p.w, given: s };
        });
        if (onResult) onResult({ kind: "crossword", quizId: opts.quizId, title: opts.title, score: e.right, total: e.total, answers: words }, out);
      });
    }
    return { html: html, bind: bind };
  }

  /* ---------- case study ---------- */

  function caseStudy(k, opts) {
    var id = nextId("case");
    var html = '<form class="case" id="' + id + '"><p class="case-sit">' + esc(k.situation) + "</p>" +
      '<fieldset class="q"><legend>' + esc(k.question) + "</legend>" +
      k.options.map(function (o, i) {
        return '<label class="opt" for="' + id + "-" + i + '"><input type="radio" name="' + id + '" id="' + id + "-" + i + '" value="' + i + '"> <span>' + esc(o.t) + "</span></label>";
      }).join("") + '</fieldset><div class="case-fb" aria-live="polite"></div>' +
      '<label class="reflect" for="' + id + '-r">' + esc(k.reflect) + '<textarea id="' + id + '-r" rows="3" maxlength="1500" placeholder="Fikringizni yozing..."></textarea></label>' +
      '<div class="quiz-foot"><button type="submit" class="btn">Javobni yuborish</button><output class="quiz-out" aria-live="polite"></output></div></form>';

    function bind(root, onResult) {
      var form = root.querySelector("#" + id);
      if (!form) return;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var chosen = form.querySelector("input:checked");
        var out = form.querySelector(".quiz-out");
        if (!chosen) { out.textContent = "Avval bitta variantni tanlang."; return; }
        var i = Number(chosen.value), o = k.options[i];
        form.querySelectorAll(".opt").forEach(function (lab, j) { lab.classList.toggle("is-correct", !!k.options[j].best); });
        form.querySelector(".q").classList.add(o.best ? "ok" : "bad");
        form.querySelector(".case-fb").innerHTML = '<p class="' + (o.best ? "fb-ok" : "fb-bad") + '">' + esc(o.fb) + "</p>" +
          (o.best ? "" : '<p class="fb-ok">' + esc(k.options.filter(function (x) { return x.best; })[0].fb) + "</p>");
        var text = form.querySelector("textarea").value.trim();
        if (onResult) onResult({ kind: "case", quizId: k.id, title: opts.title || k.title, score: o.best ? 1 : 0, total: 1, answers: { choice: i, choiceText: o.t, best: !!o.best, text: text } }, out);
      });
    }
    return { html: html, bind: bind };
  }

  /* ---------- juftlik topish (alloma — asar) ---------- */

  function pairs(all, opts) {
    var id = nextId("pairs");
    var chosen = shuffle(all).slice(0, opts.count || 6);
    var left = chosen.map(function (p, i) { return { i: i, t: p[0] }; });
    var right = shuffle(chosen.map(function (p, i) { return { i: i, t: p[1] }; }));
    var html = '<div class="game pairs" id="' + id + '"><p class="muted">Chapdan allomani, o‘ngdan uning asarini tanlang.</p><div class="pairs-cols"><div>' +
      left.map(function (x) { return '<button type="button" class="tile" data-side="l" data-i="' + x.i + '">' + esc(x.t) + "</button>"; }).join("") + "</div><div>" +
      right.map(function (x) { return '<button type="button" class="tile" data-side="r" data-i="' + x.i + '">“' + esc(x.t) + "”</button>"; }).join("") +
      '</div></div><div class="quiz-foot"><output class="quiz-out" aria-live="polite"></output><button type="button" class="btn ghost" data-act="again">Yangi o‘yin</button></div></div>';

    function bind(root, onResult) {
      var box = root.querySelector("#" + id);
      if (!box) return;
      var pick = { l: null, r: null }, mistakes = 0, done = 0;
      var out = box.querySelector(".quiz-out");
      box.querySelectorAll(".tile").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.classList.contains("matched")) return;
          var side = b.getAttribute("data-side");
          if (pick[side]) pick[side].classList.remove("sel");
          pick[side] = b; b.classList.add("sel");
          if (pick.l && pick.r) {
            var l = pick.l, r = pick.r;
            if (l.getAttribute("data-i") === r.getAttribute("data-i")) {
              l.classList.add("matched"); r.classList.add("matched"); done++;
            } else {
              mistakes++; l.classList.add("wrong"); r.classList.add("wrong");
              setTimeout(function () { l.classList.remove("wrong"); r.classList.remove("wrong"); }, 600);
            }
            l.classList.remove("sel"); r.classList.remove("sel"); pick = { l: null, r: null };
            out.textContent = done + " / " + chosen.length + " juftlik, xatolar: " + mistakes;
            if (done === chosen.length) {
              var score = Math.max(0, chosen.length - mistakes);
              out.textContent = "Barakalla! Barcha juftliklar topildi. Xatolar: " + mistakes + ". Ball: " + score + " / " + chosen.length;
              if (onResult) onResult({ kind: "game", quizId: "juftlik", title: "Alloma va asar", score: score, total: chosen.length, answers: { mistakes: mistakes, pairs: chosen } }, out);
            }
          }
        });
      });
      box.querySelector('[data-act="again"]').addEventListener("click", function () {
        var g = pairs(all, opts);
        box.outerHTML = g.html;
        g.bind(root, onResult);
      });
    }
    return { html: html, bind: bind };
  }

  /* ---------- vaqt chizig‘i ---------- */

  function timeline(items) {
    var id = nextId("tl");
    var order = shuffle(items);
    function listHtml() {
      return order.map(function (x, i) {
        return '<li><span class="tl-name">' + esc(x.name) + '</span><span class="tl-btns"><button type="button" class="btn ghost sm" data-up="' + i + '" aria-label="Yuqoriga"' + (i === 0 ? " disabled" : "") + '>↑</button>' +
          '<button type="button" class="btn ghost sm" data-down="' + i + '" aria-label="Pastga"' + (i === order.length - 1 ? " disabled" : "") + ">↓</button></span></li>";
      }).join("");
    }
    var html = '<div class="game tl" id="' + id + '"><p class="muted">Allomalarni yashagan davriga ko‘ra eng qadimgisidan boshlab tartiblang.</p><ol class="tl-list">' + listHtml() + "</ol>" +
      '<div class="quiz-foot"><button type="button" class="btn" data-act="check">Tekshirish</button><output class="quiz-out" aria-live="polite"></output></div></div>';

    function bind(root, onResult) {
      var box = root.querySelector("#" + id);
      if (!box) return;
      var ol = box.querySelector(".tl-list");
      ol.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        var i = b.hasAttribute("data-up") ? Number(b.getAttribute("data-up")) : Number(b.getAttribute("data-down"));
        var j = b.hasAttribute("data-up") ? i - 1 : i + 1;
        var t = order[i]; order[i] = order[j]; order[j] = t;
        ol.innerHTML = listHtml();
        var focusBtn = ol.querySelectorAll("li")[j].querySelector(b.hasAttribute("data-up") ? "[data-up]" : "[data-down]");
        if (focusBtn && !focusBtn.disabled) focusBtn.focus();
      });
      box.querySelector('[data-act="check"]').addEventListener("click", function () {
        var sorted = items.slice().sort(function (a, b) { return a.year - b.year; });
        var right = 0;
        ol.querySelectorAll("li").forEach(function (li, i) {
          var ok = order[i].name === sorted[i].name;
          if (ok) right++;
          li.classList.toggle("ok", ok);
          li.classList.toggle("bad", !ok);
        });
        var out = box.querySelector(".quiz-out");
        out.textContent = right + " / " + items.length + " to‘g‘ri joyda." + (right === items.length ? " Ajoyib!" : " Yashil bo‘lmaganlarini qayta joylang.");
        if (onResult) onResult({ kind: "game", quizId: "vaqt", title: "Vaqt chizig‘i", score: right, total: items.length, answers: order.map(function (x) { return x.name; }) }, out);
      });
    }
    return { html: html, bind: bind };
  }

  /* ---------- xulqlarni saralash ---------- */

  function sorter(data) {
    var id = nextId("sort");
    var items = shuffle(data.good.map(function (t) { return { t: t, g: 1 }; }).concat(data.bad.map(function (t) { return { t: t, g: 0 }; }))).slice(0, 10);
    var html = '<div class="game sorter" id="' + id + '"><p class="muted">Avloniy xulqlarni yaxshi va yomonga ajratgan. Har bir xulqni to‘g‘ri guruhga joylang.</p><ul class="sort-list">' +
      items.map(function (x, i) {
        return '<li data-i="' + i + '"><span>' + esc(x.t) + '</span><span class="tl-btns"><button type="button" class="btn ghost sm" data-g="1">Yaxshi</button><button type="button" class="btn ghost sm" data-g="0">Yomon</button></span></li>';
      }).join("") + '</ul><div class="quiz-foot"><button type="button" class="btn" data-act="check">Tekshirish</button><output class="quiz-out" aria-live="polite"></output></div></div>';

    function bind(root, onResult) {
      var box = root.querySelector("#" + id);
      if (!box) return;
      var answers = {};
      box.querySelectorAll(".sort-list li").forEach(function (li) {
        li.querySelectorAll("[data-g]").forEach(function (b) {
          b.addEventListener("click", function () {
            answers[li.getAttribute("data-i")] = Number(b.getAttribute("data-g"));
            li.querySelectorAll("[data-g]").forEach(function (x) { x.classList.toggle("on", x === b); });
            li.classList.remove("ok", "bad");
          });
        });
      });
      box.querySelector('[data-act="check"]').addEventListener("click", function () {
        var out = box.querySelector(".quiz-out");
        if (Object.keys(answers).length < items.length) { out.textContent = "Barcha xulqlarni joylang."; return; }
        var right = 0;
        box.querySelectorAll(".sort-list li").forEach(function (li) {
          var i = li.getAttribute("data-i"), ok = answers[i] === items[i].g;
          if (ok) right++;
          li.classList.toggle("ok", ok); li.classList.toggle("bad", !ok);
        });
        out.textContent = right + " / " + items.length + " to‘g‘ri.";
        if (onResult) onResult({ kind: "game", quizId: "xulq", title: "Yaxshi va yomon xulqlar", score: right, total: items.length, answers: items.map(function (x, i) { return { t: x.t, good: !!x.g, chosenGood: answers[i] === 1 }; }) }, out);
      });
    }
    return { html: html, bind: bind };
  }

  /* ---------- “Hikmat kimniki?” ---------- */

  function quoteGame(scholars) {
    var id = nextId("qg");
    var withQuote = scholars.filter(function (s) { return s.quote; });
    var rounds = shuffle(withQuote).slice(0, 5).map(function (s) {
      var others = shuffle(scholars.filter(function (x) { return x.id !== s.id; })).slice(0, 3);
      return { s: s, opts: shuffle([s].concat(others)) };
    });
    var html = '<form class="game quiz" id="' + id + '">' + rounds.map(function (r, i) {
      return '<fieldset class="q" data-c="' + r.opts.indexOf(r.s) + '"><legend><span class="qn">' + (i + 1) + '.</span> “' + esc(r.s.quote) + '”</legend>' +
        r.opts.map(function (o, j) {
          return '<label class="opt" for="' + id + "-" + i + "-" + j + '"><input type="radio" id="' + id + "-" + i + "-" + j + '" name="' + id + "-" + i + '" value="' + j + '"> <span>' + esc(o.name) + "</span></label>";
        }).join("") + "</fieldset>";
    }).join("") + '<div class="quiz-foot"><button type="submit" class="btn">Tekshirish</button><output class="quiz-out" aria-live="polite"></output></div></form>';

    function bind(root, onResult) {
      var form = root.querySelector("#" + id);
      if (!form) return;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var right = 0, ans = [];
        form.querySelectorAll("fieldset").forEach(function (fs, i) {
          var c = Number(fs.getAttribute("data-c")), ch = fs.querySelector("input:checked");
          var ok = ch && Number(ch.value) === c;
          if (ok) right++;
          fs.classList.remove("ok", "bad"); fs.classList.add(ok ? "ok" : "bad");
          fs.querySelectorAll(".opt").forEach(function (o, j) { o.classList.toggle("is-correct", j === c); });
          ans.push({ quote: rounds[i].s.quote, answer: rounds[i].s.name, given: ch ? rounds[i].opts[Number(ch.value)].name : null });
        });
        var out = form.querySelector(".quiz-out");
        out.textContent = right + " / " + rounds.length + " to‘g‘ri.";
        if (onResult) onResult({ kind: "game", quizId: "hikmat", title: "Hikmat kimniki?", score: right, total: rounds.length, answers: ans }, out);
      });
    }
    return { html: html, bind: bind };
  }

  window.GAMES = { crossword: crossword, caseStudy: caseStudy, pairs: pairs, timeline: timeline, sorter: sorter, quoteGame: quoteGame, layout: layout, shuffle: shuffle };
})();
