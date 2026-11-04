#!/usr/bin/env python3
"""OAK jurnallari uchun maqolalarni manba/*.txt dan .docx (+.pdf) ko'rinishida yig'ish.

Manba fayl tuzilishi (namunadagi maqolalar asosida):
  TITLE_UZ: / TITLE_EN: / TITLE_RU:   — sarlavhalar
  AUTHOR: / AFFIL: / ORCID: / EMAIL:  — muallif ma'lumotlari
  ANN_UZ: / KW_UZ: / ANN_RU: / KW_RU: / ANN_EN: / KW_EN: — annotatsiyalar va kalit so'zlar
  ---                                 — asosiy matn boshlanishi
  Matnda: **qalin**, //kursiv//, [[sariq]], <<ko'k (taxminiy/shartli)>>, $$ formula (n)
  TABLE n: nomi ## manba      — jadval ("|" qatorlari)
  FIG n: nomi ## manba        — blokli sxema
  IMG fayl.png n: nomi ## manba — rasm (diagramma)
  REF: matn                   — adabiyotlar ro'yxati elementi
Foydalanish: python3 build_maqola.py [fayl ...]
"""
import os, re, sys, glob, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import _dlib as L
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

C, R, J = WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.JUSTIFY


class Article(L.Builder):
    def __init__(self):
        super().__init__()
        self.doc.sections[0].different_first_page_header_footer = False
        self.fig_n = 0

    def src_note(self, p, text):
        if text:
            L.FOOT.add(p, L.uz(text))

    def table_a(self, label, caption, rows, src):
        p = self.doc.add_paragraph()
        L.fmt(p, align=R, indent=False, spacing=1.0, before=10, keep=True)
        L.add_runs(p, label + "-jadval", 14, True)
        p = self.doc.add_paragraph()
        L.fmt(p, align=C, indent=False, spacing=1.0, after=6, keep=True)
        L.add_runs(p, caption, 14, True)
        self.src_note(p, src)
        # jadval tanasi — dissertatsiya kodidan (sarlavhasiz)
        n = len(self.doc.paragraphs)
        Builder_table_body(self, rows)

    def image(self, path, label, caption, src):
        p = self.doc.add_paragraph()
        L.fmt(p, align=C, indent=False, spacing=1.0, before=8, keep=True)
        p.add_run().add_picture(os.path.join(HERE, "img", path), width=Cm(15.5))
        p = self.doc.add_paragraph()
        L.fmt(p, align=C, indent=False, spacing=1.0, before=4, after=10)
        L.add_runs(p, label + "-rasm. " + caption, 14, True)
        self.src_note(p, src)

    def scheme(self, label, caption, rows, src):
        self.figure(label, caption, rows)
        self.src_note(self.doc.paragraphs[-1], src)

    def header(self, meta):
        for key in ("TITLE_UZ", "TITLE_EN", "TITLE_RU"):
            self.para(meta[key].upper(), indent=False, align=C, spacing=1.15, bold=True, after=10)
        self.para(meta["AUTHOR"], indent=False, align=C, spacing=1.15, bold=True, before=6)
        self.para(meta["AFFIL"], indent=False, align=C, spacing=1.15, italic=True, size=12)
        self.para("ORCID: " + meta.get("ORCID", "[[____-____-____-____]]"), indent=False, align=C, spacing=1.15, size=12)
        self.para("Email: " + meta.get("EMAIL", "[[__________]]"), indent=False, align=C, spacing=1.15, size=12, after=10)
        for ann, kw, h1, h2 in (("ANN_UZ", "KW_UZ", "Annotatsiya.", "Kalit so'zlar:"),
                                ("ANN_RU", "KW_RU", "Аннотация.", "Ключевые слова:"),
                                ("ANN_EN", "KW_EN", "Annotation.", "Keywords:")):
            p = self.para(h1, indent=False, align=J, spacing=1.0, bold=True, italic=True, size=12, before=8)
            self.para(meta[ann], indent=True, align=J, spacing=1.0, italic=True, size=12)
            self.para("**" + h2 + "** " + meta[kw], indent=True, align=J, spacing=1.0, italic=True, size=12, after=6)

    def body(self, lines):
        refs = []
        i = 0
        while i < len(lines):
            s = lines[i].strip()
            if not s or s.startswith("%"):
                i += 1; continue
            if s.startswith("REF:"):
                refs.append(s[4:].strip()); i += 1; continue
            if s.startswith("$$ "):
                self.formula(s[3:])
            elif s.startswith("- "):
                self.bullet(s[2:])
            elif s.startswith("IMG "):
                m = re.match(r"IMG (\S+) (\S+): (.*)", s)
                cap, _, src = m.group(3).partition(" ## ")
                self.image(m.group(1), m.group(2), cap.strip(), src.strip())
            elif s.startswith("TABLE ") or s.startswith("FIG "):
                kind, rest = s.split(" ", 1)
                label, cap = [x.strip() for x in rest.split(":", 1)]
                cap, _, src = cap.partition(" ## ")
                rows = []; i += 1
                while i < len(lines) and lines[i].strip():
                    r = lines[i].strip()
                    rows.append([c.strip() for c in r.strip("|").split("|")] if kind == "TABLE" else r)
                    i += 1
                if kind == "TABLE":
                    self.table_a(label, cap.strip(), rows, src.strip())
                else:
                    self.scheme(label, cap.strip(), rows, src.strip())
                continue
            else:
                self.para(s)
            i += 1
        if refs:
            self.para("FOYDALANILGAN ADABIYOTLAR RO'YXATI:", indent=False, align=C, bold=True, before=12, keep=True)
            for n, r in enumerate(refs, 1):
                p = self.doc.add_paragraph()
                L.fmt(p, indent=False, spacing=1.15, after=2)
                p.paragraph_format.left_indent = Cm(0.75); p.paragraph_format.first_line_indent = Cm(-0.75)
                L.add_runs(p, "%d. %s" % (n, r), 12)


def Builder_table_body(self, rows):
    """L.Builder.table ni sarlavha qatorlarisiz chaqirish: vaqtincha sarlavha qo'shib, so'ng o'chiramiz."""
    before = len(self.doc.paragraphs)
    self.table("X", "X", rows)
    body = self.doc.element.body
    paras = self.doc.paragraphs
    # oxirgi jadvaldan oldingi ikkita paragraf (yorliq va nom) — o'chiriladi
    tbl = body[-2] if body[-1].tag.endswith("sectPr") else body[-1]
    prev = tbl.getprevious(); prev2 = prev.getprevious()
    body.remove(prev); body.remove(prev2)


def build(path):
    text = open(path, encoding="utf-8").read()
    head, _, rest = text.partition("\n---\n")
    meta = {}
    for ln in head.split("\n"):
        if ":" in ln and not ln.startswith("%"):
            k, v = ln.split(":", 1); meta[k.strip()] = v.strip()
    a = Article()
    a.header(meta)
    a.body(rest.split("\n"))
    out = os.path.join(HERE, os.path.splitext(os.path.basename(path))[0] + ".docx")
    a.doc.save(out)
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", HERE, out],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pdf = out[:-5] + ".pdf"
    pages = subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout.split("Pages:")[1].split()[0]
    words = len(re.sub(r"[|#*/<>\[\]]", " ", rest).split())
    print("%-40s %3s bet, ~%d so'z" % (os.path.basename(out), pages, words))


if __name__ == "__main__":
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, "manba", "[BD]*.txt")))
    for f in files:
        build(f)
