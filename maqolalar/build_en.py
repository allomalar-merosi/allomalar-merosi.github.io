#!/usr/bin/env python3
"""Xalqaro jurnal maqolalari va konferensiya tezislarini (ingliz tilida) manba_en/*.txt dan yig'ish.

Sarlavha qismi (--- gacha): TITLE, AUTHORS, AFFIL, ORCID, EMAIL, TYPE (article|thesis), ABSTRACT, KEYWORDS, JEL
Matn: "# 1. Introduction" – bo'lim; "## 2.1. ..." – kichik bo'lim; TABLE n: nomi ## izoh; IMG fayl n: nomi ## izoh;
FIG n: nomi ## izoh; $$ formula (n); "- " ro'yxat; REF: adabiyot; **qalin**, //kursiv//, [[sariq]], <<ko'k>>.
"""
import os, re, sys, glob, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import _dlib as L
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
C, LFT, J = WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.JUSTIFY
TW = 16.0


class Paper(L.Builder):
    def __init__(self, spacing):
        super().__init__()
        s = self.doc.sections[0]
        s.left_margin = s.right_margin = s.top_margin = s.bottom_margin = Cm(2.5)
        s.different_first_page_header_footer = False
        self.sp = spacing

    def p(self, text, size=12, align=J, indent=True, bold=False, italic=False, before=0, after=0, keep=False, spacing=None):
        par = self.doc.add_paragraph()
        L.fmt(par, align=align, indent=indent, spacing=spacing or self.sp, before=before, after=after, keep=keep)
        if indent:
            par.paragraph_format.first_line_indent = Cm(1.0)
        L.add_runs(par, text, size, bold, italic)
        return par

    def header(self, m):
        self.p(m["TITLE"], 14, C, False, True, after=10, spacing=1.15)
        self.p(m["AUTHORS"], 12, C, False, True, spacing=1.15)
        self.p(m["AFFIL"], 11, C, False, False, True, spacing=1.15)
        self.p("ORCID: " + m.get("ORCID", "[[____]]") + " | E-mail: " + m.get("EMAIL", "[[____]]"), 11, C, False, spacing=1.15, after=10)
        self.p("**Abstract.** " + m["ABSTRACT"], 11, J, False, spacing=1.15, after=4)
        self.p("**Keywords:** " + m["KEYWORDS"], 11, J, False, spacing=1.15, after=4)
        if m.get("JEL"):
            self.p("**JEL classification:** " + m["JEL"], 11, J, False, spacing=1.15, after=10)

    def note(self, text):
        if text:
            self.p("//Note.// " + text, 10, J, False, spacing=1.0, before=3, after=8)

    def tbl(self, label, cap, rows, note):
        self.p("**Table " + label + "**", 12, LFT, False, before=8, keep=True, spacing=1.0)
        self.p("//" + cap + "//", 12, LFT, False, after=4, keep=True, spacing=1.0)
        self.table("X", "X", rows)
        body = self.doc.element.body
        tblel = body[-2] if body[-1].tag.endswith("sectPr") else body[-1]
        prev = tblel.getprevious(); prev2 = prev.getprevious(); body.remove(prev); body.remove(prev2)
        self.note(note)

    def img(self, path, label, cap, note):
        par = self.doc.add_paragraph(); L.fmt(par, align=C, indent=False, spacing=1.0, before=8, keep=True)
        par.add_run().add_picture(os.path.join(HERE, "img", path), width=Cm(15.0))
        self.p("**Figure " + label + ".** " + cap, 11, LFT, False, spacing=1.0, before=2)
        self.note(note)

    def scheme(self, label, cap, rows, note):
        self.figure(label, cap, rows)
        last = self.doc.paragraphs[-1]
        for r in list(last.runs):
            r._element.getparent().remove(r._element)
        L.add_runs(last, "**Figure " + label + ".** " + cap, 11)
        last.alignment = LFT
        self.note(note)

    def formula(self, text):
        m = re.match(r"(.*?)\s*(\(\d+\))\s*$", text)
        body, num = (m.group(1), m.group(2)) if m else (text, "")
        par = self.doc.add_paragraph(); L.fmt(par, align=LFT, indent=False, spacing=1.15, before=4, after=4)
        ts = par.paragraph_format.tab_stops
        ts.add_tab_stop(Cm(TW / 2), WD_TAB_ALIGNMENT.CENTER); ts.add_tab_stop(Cm(TW), WD_TAB_ALIGNMENT.RIGHT)
        r = par.add_run("\t"); L.set_font(r, 12)
        plain = re.sub(r"[_^]\{([^}]*)\}", r"\1", body)
        L.add_runs(par, body, 12 if len(plain) <= 70 else 11, False, True)
        if num:
            r = par.add_run("\t" + num); L.set_font(r, 12)

    def body(self, lines):
        refs = []; i = 0
        while i < len(lines):
            s = lines[i].strip()
            if not s or s.startswith("%"):
                i += 1; continue
            if s.startswith("REF:"):
                refs.append(s[4:].strip())
            elif s.startswith("# "):
                self.p("**" + s[2:] + "**", 12, LFT, False, before=10, after=4, keep=True)
            elif s.startswith("## "):
                self.p(s[3:], 12, LFT, False, True, True, before=6, after=2, keep=True)
            elif s.startswith("$$ "):
                self.formula(s[3:])
            elif s.startswith("- "):
                self.p("– " + s[2:], 12, J, True)
            elif s.startswith("IMG "):
                m = re.match(r"IMG (\S+) (\S+): (.*)", s); cap, _, nt = m.group(3).partition(" ## ")
                self.img(m.group(1), m.group(2), cap.strip(), nt.strip())
            elif s.startswith("TABLE ") or s.startswith("FIG "):
                kind, rest = s.split(" ", 1); label, cap = [x.strip() for x in rest.split(":", 1)]
                cap, _, nt = cap.partition(" ## "); rows = []; i += 1
                while i < len(lines) and lines[i].strip():
                    r = lines[i].strip(); rows.append([c.strip() for c in r.strip("|").split("|")] if kind == "TABLE" else r); i += 1
                (self.tbl if kind == "TABLE" else self.scheme)(label, cap.strip(), rows, nt.strip())
                continue
            else:
                self.p(s)
            i += 1
        if refs:
            self.p("**References**", 12, LFT, False, before=12, after=4, keep=True)
            for r in refs:
                par = self.doc.add_paragraph(); L.fmt(par, indent=False, spacing=1.0, after=3, align=J)
                par.paragraph_format.left_indent = Cm(0.75); par.paragraph_format.first_line_indent = Cm(-0.75)
                L.add_runs(par, r, 11)


def build(path):
    text = open(path, encoding="utf-8").read()
    head, _, rest = text.partition("\n---\n")
    m = {}
    for ln in head.split("\n"):
        if ":" in ln and not ln.startswith("%"):
            k, v = ln.split(":", 1); m[k.strip()] = v.strip()
    a = Paper(1.5 if m.get("TYPE", "article") == "article" else 1.15)
    a.header(m); a.body(rest.split("\n"))
    out = os.path.join(HERE, "xalqaro", os.path.splitext(os.path.basename(path))[0] + ".docx")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    a.doc.save(out)
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", os.path.dirname(out), out],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pages = subprocess.run(["pdfinfo", out[:-5] + ".pdf"], capture_output=True, text=True).stdout.split("Pages:")[1].split()[0]
    words = subprocess.run(["pandoc", out, "-t", "plain"], capture_output=True, text=True).stdout.split()
    print("%-48s %3s pages, %d words" % (os.path.basename(out), pages, len(words)))


if __name__ == "__main__":
    for f in sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, "manba_en", "*.txt"))):
        build(f)
