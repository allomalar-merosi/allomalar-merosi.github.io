#!/usr/bin/env python3
"""Dissertatsiya matnini manba/*.txt fayllaridan .docx ko'rinishida yig'ish.

Belgilash qoidalari (manba fayllarida):
  #CH Sarlavha          — bob / bo'lim sarlavhasi (yangi sahifadan, Heading 1)
  ## 1.1. Sarlavha      — paragraf sarlavhasi (Heading 2)
  - matn                — ro'yxat bandi
  $$ formula (1.1)      — markazlashtirilgan formula, o'ngda raqami
  TABLE 1.1: nomi       — jadval; keyingi qatorlar "| a | b |", bo'sh qatorgacha
  FIG 1.1: nomi         — sxema; keyingi qatorlar bloklar ("a || b" — yonma-yon), bo'sh qatorgacha
  NOTE: matn            — jadval/rasm ostidagi manba izohi
  **qalin**             — qalin matn;  //kursiv// — kursiv matn
  [[...]]               — muallif to'ldirishi kerak bo'lgan joy (sariq rang bilan)
  {kalit} / {k1,k2}     — adabiyotga havola -> [n] / [n; m]
Foydalanish:  python3 build.py
"""
import re, subprocess, sys, os, shutil, tempfile
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_BREAK, WD_TAB_ALIGNMENT, WD_TAB_LEADER, WD_COLOR_INDEX
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "manba")
OUT = os.path.join(HERE, "Batirova_L_Sh_PhD_dissertatsiya.docx")
ORDER = ["00_kirish", "11", "12", "13", "21", "22", "23", "31", "32", "33", "34",
         "40_xulosa", "50_adabiyotlar", "60_ilovalar"]
FONT = "Times New Roman"
TEXT_W = Cm(16.5)


# ---------------------------------------------------------------- jadval/rasm raqamlari
LABELS = {}


def build_label_map():
    """Jadval va rasmlarni har bob ichida ketma-ket qayta raqamlaydi
    (manbada vaqtinchalik belgilar, masalan 2.a, ishlatilishi mumkin)."""
    LABELS.clear()
    seq = {}
    for f in ORDER:
        for ln in open(os.path.join(SRC, f + ".txt"), encoding="utf-8"):
            m = re.match(r"\s*(TABLE|FIG) (\d+)\.(\w+):", ln)
            if not m:
                continue
            kind = "jadval" if m.group(1) == "TABLE" else "rasm"
            ch = m.group(2)
            seq[(ch, kind)] = seq.get((ch, kind), 0) + 1
            old = "%s.%s" % (ch, m.group(3))
            if (old, kind) in LABELS:
                sys.exit("Takroriy belgi: %s-%s" % (old, kind))
            LABELS[(old, kind)] = "%s.%d" % (ch, seq[(ch, kind)])


def relabel(text):
    def rep(m):
        return LABELS.get((m.group(1), m.group(2)), m.group(1)) + "-" + m.group(2)
    text = re.sub(r"(?<![\w.])(\d+\.\w+)-(jadval|rasm)", rep, text)
    text = re.sub(r"^(\s*)(TABLE|FIG) (\d+\.\w+):",
                  lambda m: "%s%s %s:" % (m.group(1), m.group(2),
                                         LABELS.get((m.group(3), "jadval" if m.group(2) == "TABLE" else "rasm"), m.group(3))),
                  text, flags=re.M)
    return text


# ---------------------------------------------------------------- matn
def uz(s):
    """o' g' -> o‘ g‘, qolgan apostrof -> ’ (tutuq belgisi)."""
    s = re.sub(r"([oOgG])'", "\\1\u2018", s)
    return s.replace("'", "\u2019")


def load_refs():
    refs, order, sections = {}, [], []
    for line in open(os.path.join(SRC, "refs.txt"), encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("%"):
            continue
        if line.startswith("@"):
            sections.append((len(order), line[1:].strip()))
            continue
        key, text = [x.strip() for x in line.split("|", 1)]
        if key in refs:
            sys.exit("Takroriy kalit: " + key)
        refs[key] = text
        order.append(key)
    num = {k: i + 1 for i, k in enumerate(order)}
    return refs, order, sections, num


REFS, REF_ORDER, REF_SECTIONS, REF_NUM = load_refs()
USED = set()


def cite(m):
    out = []
    for k in m.group(1).split(","):
        k = k.strip()
        if k not in REF_NUM:
            sys.exit("Noma'lum havola: " + k)
        USED.add(k)
        out.append(str(REF_NUM[k]))
    return "[" + "; ".join(out) + "]"


# ---------------------------------------------------------------- docx yordamchi
def set_font(run, size=14, bold=None, italic=None):
    run.font.name = FONT
    run.font.size = Pt(size)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts"); rpr.insert(0, rfonts)
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rfonts.set(qn(a), FONT)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def fmt(p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True, spacing=1.5, before=0, after=0, keep=False):
    pf = p.paragraph_format
    pf.alignment = align
    pf.first_line_indent = Cm(1.25) if indent else Cm(0)
    pf.line_spacing = spacing
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.widow_control = True
    if keep:
        pf.keep_with_next = True


TOKEN = re.compile(r"(\*\*.+?\*\*|//.+?//|\[\[.*?\]\])")
FNMARK = re.compile(r"(\x00[^\x00]+\x00)")
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


class Footnotes:
    """Hujjatga sahifa osti izohlari (footnotes.xml) qismini qo'shadi."""

    def __init__(self, doc):
        from docx.opc.constants import RELATIONSHIP_TYPE as RT
        from docx.opc.packuri import PackURI
        from docx.opc.part import XmlPart
        xml = ('<w:footnotes xmlns:w="%s">'
               '<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
               '<w:r><w:separator/></w:r></w:p></w:footnote>'
               '<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
               '<w:r><w:continuationSeparator/></w:r></w:p></w:footnote></w:footnotes>') % W_NS
        dp = doc.part
        self.part = XmlPart.load(PackURI("/word/footnotes.xml"),
                                 "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
                                 xml.encode("utf-8"), dp.package)
        dp.relate_to(self.part, RT.FOOTNOTES)
        self.n = 0

    def add(self, paragraph, text):
        self.n += 1
        fid = str(self.n)
        fn = OxmlElement("w:footnote"); fn.set(qn("w:id"), fid)
        fp = OxmlElement("w:p")
        ppr = OxmlElement("w:pPr")
        ps = OxmlElement("w:pStyle"); ps.set(qn("w:val"), "FootnoteText"); ppr.append(ps)
        sp = OxmlElement("w:spacing"); sp.set(qn("w:after"), "0"); sp.set(qn("w:line"), "240"); sp.set(qn("w:lineRule"), "auto")
        jc = OxmlElement("w:jc"); jc.set(qn("w:val"), "both")
        ppr.append(sp); ppr.append(jc); fp.append(ppr)

        def run(children, sup=False):
            r = OxmlElement("w:r"); rpr = OxmlElement("w:rPr")
            if sup:
                rs = OxmlElement("w:rStyle"); rs.set(qn("w:val"), "FootnoteReference"); rpr.append(rs)
            rf = OxmlElement("w:rFonts")
            for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
                rf.set(qn(a), FONT)
            rpr.append(rf)
            sz = OxmlElement("w:sz"); sz.set(qn("w:val"), "20"); rpr.append(sz)
            if sup:
                va = OxmlElement("w:vertAlign"); va.set(qn("w:val"), "superscript"); rpr.append(va)
            r.append(rpr)
            for c in children:
                r.append(c)
            return r
        fp.append(run([OxmlElement("w:footnoteRef")], sup=True))
        t = OxmlElement("w:t"); t.set(qn("xml:space"), "preserve"); t.text = " " + text
        fp.append(run([t]))
        fn.append(fp)
        self.part.element.append(fn)
        # matndagi havola
        r = paragraph.add_run()
        set_font(r, 14)
        r.style = "Footnote Reference"
        r.font.superscript = True
        ref = OxmlElement("w:footnoteReference"); ref.set(qn("w:id"), fid)
        r._element.append(ref)


FOOT = None


def fn_text(keys):
    out = []
    for k in keys.split(","):
        k = k.strip()
        out.append(re.sub(r"\s*\[\[.*?\]\]", "", REFS[k]).strip())
    return uz("; ".join(out))
SUBSUP = re.compile(r"(_\{[^}]*\}|\^\{[^}]*\}|_[A-Za-z0-9]+)")


def mark_cite(m):
    cite(m)  # kalitlarni tekshirish va ishlatilgan deb belgilash
    return "\x00" + m.group(1) + "\x00"


def add_runs(p, text, size=14, bold=False, italic=False):
    if FOOT is not None:
        text = re.sub(r"\s*(?<![_^])\{([^{}]+)\}", mark_cite, text)
    else:
        text = re.sub(r"(?<![_^])\{([^{}]+)\}", cite, text)
    text = uz(text)
    chunks = []
    for part in FNMARK.split(text):
        if part.startswith("\x00"):
            chunks.append(("FN", part.strip("\x00")))
        elif part:
            chunks.extend(("T", x) for x in TOKEN.split(part))
    for kind, part in chunks:
        if kind == "FN":
            FOOT.add(p, fn_text(part))
            continue
        if not part:
            continue
        b, i, hl = bold, italic, False
        if part.startswith("**") and part.endswith("**"):
            part, b = part[2:-2], True
        elif part.startswith("//") and part.endswith("//"):
            part, i = part[2:-2], True
        elif part.startswith("[[") and part.endswith("]]"):
            part, hl = "[" + part[2:-2] + "]", True
        # ichki qalin/kursiv (masalan [[...]] ichida emas) — oddiy holat yetarli
        pieces = [part] if hl else SUBSUP.split(part)
        for piece in pieces:
            if not piece:
                continue
            sub = sup = False
            if not hl and SUBSUP.fullmatch(piece):
                if piece.startswith("^"):
                    sup, piece = True, piece[2:-1]
                elif piece.startswith("_{"):
                    sub, piece = True, piece[2:-1]
                else:
                    sub, piece = True, piece[1:]
            r = p.add_run(piece)
            set_font(r, size, b, i)
            if sub:
                r.font.subscript = True
            if sup:
                r.font.superscript = True
            if hl:
                r.font.highlight_color = WD_COLOR_INDEX.YELLOW


def page_number_field(paragraph):
    r = paragraph.add_run()
    set_font(r, 12)
    for tag, txt in (("begin", None), (None, "PAGE"), ("end", None)):
        if tag:
            el = OxmlElement("w:fldChar"); el.set(qn("w:fldCharType"), tag)
        else:
            el = OxmlElement("w:instrText"); el.set(qn("xml:space"), "preserve"); el.text = txt
        r._element.append(el)


def cell_shade(cell, color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), color)
    tcPr.append(shd)


def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader"); el.set(qn("w:val"), "true")
    trPr.append(el)


# ---------------------------------------------------------------- hujjat
class Builder:
    def __init__(self, toc_pages=None):
        self.doc = Document()
        self.toc_pages = toc_pages or {}
        self.headings = []  # (daraja, matn)
        self._setup()
        global FOOT
        FOOT = Footnotes(self.doc)

    def _setup(self):
        d = self.doc
        st = d.styles["Normal"]
        st.font.name = FONT; st.font.size = Pt(14)
        st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
        for name, size in (("Heading 1", 14), ("Heading 2", 14)):
            hs = d.styles[name]
            hs.font.name = FONT; hs.font.size = Pt(size); hs.font.bold = True
            hs.font.color.rgb = RGBColor(0, 0, 0); hs.font.italic = False
            rpr = hs.element.get_or_add_rPr()
            rf = rpr.find(qn("w:rFonts"))
            if rf is None:
                rf = OxmlElement("w:rFonts"); rpr.insert(0, rf)
            for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
                rf.set(qn(a), FONT)
            for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
                if rf.get(qn(a)) is not None:
                    del rf.attrib[qn(a)]
        from docx.enum.style import WD_STYLE_TYPE
        if "Footnote Reference" not in [x.name for x in d.styles]:
            fr = d.styles.add_style("Footnote Reference", WD_STYLE_TYPE.CHARACTER)
            fr.font.superscript = True
            fr.element.set(qn("w:styleId"), "FootnoteReference")
        if "Footnote Text" not in [x.name for x in d.styles]:
            ft = d.styles.add_style("Footnote Text", WD_STYLE_TYPE.PARAGRAPH)
            ft.font.size = Pt(10); ft.font.name = FONT
            ft.paragraph_format.space_after = Pt(0); ft.paragraph_format.line_spacing = 1.0
            ft.element.set(qn("w:styleId"), "FootnoteText")
        s = d.sections[0]
        s.page_width, s.page_height = Cm(21), Cm(29.7)
        s.left_margin, s.right_margin = Cm(3), Cm(1.5)
        s.top_margin, s.bottom_margin = Cm(2), Cm(2)
        s.footer_distance = Cm(1)
        s.different_first_page_header_footer = True
        fp = s.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        page_number_field(fp)

    # ----- oddiy elementlar
    def para(self, text, **kw):
        p = self.doc.add_paragraph()
        size = kw.pop("size", 14); bold = kw.pop("bold", False); italic = kw.pop("italic", False)
        fmt(p, **kw)
        add_runs(p, text, size, bold, italic)
        return p

    def page_break(self):
        p = self.doc.add_paragraph()
        fmt(p, indent=False, spacing=1.0)
        p.add_run().add_break(WD_BREAK.PAGE)

    def heading(self, text, level):
        if level == 1 and len(self.doc.paragraphs) > 0:
            self.page_break()
        p = self.doc.add_paragraph(style="Heading %d" % level)
        fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.5,
            before=0, after=12 if level == 1 else 6, keep=True)
        if level == 2:
            p.paragraph_format.space_before = Pt(12)
        add_runs(p, text, 14, True)
        self.headings.append((level, uz(re.sub(r"\{[^}]*\}", "", text))))

    def formula(self, text):
        m = re.match(r"(.*?)\s*(\(\d+\.\d+\))\s*$", text)
        body, num = (m.group(1), m.group(2)) if m else (text, "")
        p = self.doc.add_paragraph()
        fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.5, before=6, after=6)
        ts = p.paragraph_format.tab_stops
        ts.add_tab_stop(Cm(8.25), WD_TAB_ALIGNMENT.CENTER)
        ts.add_tab_stop(TEXT_W, WD_TAB_ALIGNMENT.RIGHT)
        r = p.add_run("\t"); set_font(r)
        plain = re.sub(r"[_^]\{([^}]*)\}", r"\1", body)
        add_runs(p, body, 14 if len(plain) <= 62 else (13 if len(plain) <= 72 else 12), False, True)
        if num:
            r = p.add_run("\t" + num); set_font(r)

    def bullet(self, text):
        p = self.doc.add_paragraph()
        fmt(p)
        add_runs(p, "\u2013 " + text)

    def note(self, text):
        p = self.doc.add_paragraph()
        fmt(p, indent=True, spacing=1.0, before=4, after=10)
        add_runs(p, text, 12, False, True)

    def table(self, label, caption, rows):
        p = self.doc.add_paragraph()
        fmt(p, align=WD_ALIGN_PARAGRAPH.RIGHT, indent=False, spacing=1.0, before=10, keep=True)
        add_runs(p, label + "-jadval", 14, False, True)
        p = self.doc.add_paragraph()
        fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.0, after=6, keep=True)
        add_runs(p, caption, 14, True)
        ncol = max(len(r) for r in rows)
        t = self.doc.add_table(rows=len(rows), cols=ncol)
        t.style = "Table Grid"
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        # ustun kengliklari: matn uzunligiga mutanosib (ildiz bilan yumshatilgan)
        lens = []
        for j in range(ncol):
            m = max(len(r[j]) if j < len(r) else 0 for r in rows)
            lens.append(max(4.0, min(float(m), 60.0)) ** 0.6)
        tot = sum(lens)
        widths = [TEXT_W * (l / tot) for l in lens]
        for j in range(ncol):
            t.columns[j].width = int(widths[j])
        for i in range(len(rows)):
            for j in range(ncol):
                t.cell(i, j).width = int(widths[j])
        for i, row in enumerate(rows):
            for j in range(ncol):
                val = row[j] if j < len(row) else ""
                c = t.cell(i, j)
                cp = c.paragraphs[0]
                numeric = bool(re.fullmatch(r"[\d\s.,\-–+%()×x/\[\]_]+", val.strip())) and val.strip()
                al = WD_ALIGN_PARAGRAPH.CENTER if (i == 0 or numeric or j > 0 and len(val) < 18) else WD_ALIGN_PARAGRAPH.LEFT
                fmt(cp, align=al, indent=False, spacing=1.0)
                add_runs(cp, val, 12, i == 0)
            if i == 0:
                repeat_header(t.rows[0])
                for c in t.rows[0].cells:
                    cell_shade(c, "E7E6E6")

    def figure(self, label, caption, rows):
        t = self.doc.add_table(rows=0, cols=1)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for k, row in enumerate(rows):
            boxes = [b.strip() for b in row.split("||")]
            rlabel = None
            if len(boxes) > 1 and ": " in boxes[0]:
                rlabel, boxes[0] = boxes[0].split(": ", 1)
            if k:
                ar = t.add_row().cells[0].paragraphs[0]
                fmt(ar, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.0)
                r = ar.add_run("\u25BC"); set_font(r, 12)
            if rlabel:
                lp = t.add_row().cells[0].paragraphs[0]
                fmt(lp, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.0, before=2)
                add_runs(lp, rlabel, 11, True, True)
            cell = t.add_row().cells[0]
            inner = cell.add_table(rows=1, cols=len(boxes))
            inner.style = "Table Grid"
            inner.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell.paragraphs[0].paragraph_format.space_after = Pt(0)
            for j, b in enumerate(boxes):
                c = inner.cell(0, j)
                cell_shade(c, "DEEAF6" if k == 0 else ("FFF2CC" if k == len(rows) - 1 else "FFFFFF"))
                cp = c.paragraphs[0]
                fmt(cp, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.0, before=2, after=2)
                add_runs(cp, b, 11, k == 0 or k == len(rows) - 1)
        # rasm bir sahifada qolishi uchun: barcha qatorlar bo'linmaydi va keyingisi bilan birga
        for row in t.rows:
            trPr = row._tr.get_or_add_trPr()
            cs = OxmlElement("w:cantSplit"); cs.set(qn("w:val"), "true"); trPr.append(cs)
            for para in row._tr.iter(qn("w:p")):
                ppr = para.find(qn("w:pPr"))
                if ppr is None:
                    ppr = OxmlElement("w:pPr"); para.insert(0, ppr)
                if ppr.find(qn("w:keepNext")) is None:
                    ppr.insert(0, OxmlElement("w:keepNext"))
        p = self.doc.add_paragraph()
        fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, spacing=1.0, before=6, after=10)
        add_runs(p, label + "-rasm. " + caption, 14, True)

    # ----- titul va mundarija
    def title_page(self):
        C = WD_ALIGN_PARAGRAPH.CENTER; R = WD_ALIGN_PARAGRAPH.RIGHT
        L = lambda t, al=C, **k: self.para(t, indent=False, align=al, spacing=1.15, **k)
        L("O'ZBEKISTON RESPUBLIKASI OLIY TA'LIM, FAN VA INNOVATSIYALAR VAZIRLIGI", bold=True)
        L("GULISTON DAVLAT UNIVERSITETI", bold=True, after=60)
        L("Qo'lyozma huquqida", R)
        L("UO'K: [[____________]]", R, bold=True, after=60)
        L("BATIROVA LATOFAT SHUXRATOVNA", bold=True, after=48)
        L("KAMBAG'ALLIKNING KO'P O'LCHOVLI MEZONLARI ASOSIDA TADBIRKORLIKNI QO'LLAB-QUVVATLASH "
          "SAMARADORLIGINI BAHOLASH METODIKASINI TAKOMILLASHTIRISH", bold=True, after=36)
        L("08.00.15 – “Tadbirkorlik va kichik biznes iqtisodiyoti”", after=48)
        L("iqtisodiyot fanlari bo'yicha falsafa doktori (Doctor of philosophy)")
        L("ilmiy darajasini olish uchun tayyorlangan")
        L("DISSERTATSIYA", bold=True, after=48)
        L("Ilmiy rahbar: [[F.I.Sh.]]", R, bold=True)
        L("[[ilmiy darajasi, ilmiy unvoni]]", R, bold=True, after=110)
        L("Guliston – 2026", bold=True)

    def toc(self, entries):
        self.page_break()
        p = self.doc.add_paragraph()
        fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=12)
        add_runs(p, "MUNDARIJA", 14, True)
        for i, (lvl, txt) in enumerate(entries):
            p = self.doc.add_paragraph()
            fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.15, after=4)
            pf = p.paragraph_format
            pf.left_indent = Cm(0 if lvl == 1 else 1.0)
            pf.right_indent = Cm(1.0)
            pf.tab_stops.add_tab_stop(Cm(16.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
            pg = self.toc_pages.get(i, "00")
            r = p.add_run(txt); set_font(r, 14, False)
            r = p.add_run("\t" + str(pg)); set_font(r, 14)
            # o'ng chekinish nuqtali tab'ga xalaqit bermasligi uchun manfiy chekinish
            pf.right_indent = Cm(0)

    # ----- manba fayllarini o'qish
    def render_file(self, name):
        lines = relabel(open(os.path.join(SRC, name + ".txt"), encoding="utf-8").read()).split("\n")
        i = 0
        while i < len(lines):
            ln = lines[i].rstrip()
            s = ln.strip()
            if not s or s.startswith("%"):
                i += 1; continue
            if s == "@REFS":
                self.references(); i += 1; continue
            if s == "@PAGEBREAK":
                self.page_break(); i += 1; continue
            if s.startswith("#CH "):
                self.heading(s[4:], 1)
            elif s.startswith("## "):
                self.heading(s[3:], 2)
            elif s.startswith("$$ "):
                self.formula(s[3:])
            elif s.startswith("- "):
                self.bullet(s[2:])
            elif s.startswith("NOTE:"):
                self.note(s[5:].strip())
            elif s.startswith("CENTER:"):
                self.para(s[7:].strip(), indent=False, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, keep=True)
            elif s.startswith("RIGHT:"):
                self.para(s[6:].strip(), indent=False, align=WD_ALIGN_PARAGRAPH.RIGHT, italic=True)
            elif s.startswith("TABLE ") or s.startswith("FIG "):
                kind, rest = s.split(" ", 1)
                label, cap = [x.strip() for x in rest.split(":", 1)]
                rows = []
                i += 1
                while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith("NOTE:"):
                    r = lines[i].strip()
                    if kind == "TABLE":
                        rows.append([c.strip() for c in r.strip("|").split("|")])
                    else:
                        rows.append(r)
                    i += 1
                (self.table if kind == "TABLE" else self.figure)(label, cap, rows)
                continue
            else:
                self.para(s)
            i += 1

    def references(self):
        sec_at = dict(REF_SECTIONS)
        for idx, key in enumerate(REF_ORDER):
            if idx in sec_at:
                self.para(sec_at[idx], indent=False, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, before=6, keep=True)
            p = self.doc.add_paragraph()
            fmt(p, indent=True, spacing=1.5)
            g = FOOT; globals()["FOOT"] = None
            add_runs(p, "%d. %s" % (idx + 1, REFS[key]), 14)
            globals()["FOOT"] = g

    def build(self, toc_entries):
        self.title_page()
        self.toc(toc_entries)
        for f in ORDER:
            self.render_file(f)
        return self


def collect_headings():
    out = []
    for f in ORDER:
        for ln in open(os.path.join(SRC, f + ".txt"), encoding="utf-8"):
            s = ln.strip()
            if s.startswith("#CH "):
                out.append((1, uz(s[4:])))
            elif s.startswith("## "):
                out.append((2, uz(s[3:])))
    return out


def norm(s):
    s = s.lower()
    s = re.sub(r"[\u2018\u2019'`ʻʼ]", "", s)
    return re.sub(r"[^a-zа-я0-9]", "", s)


def find_pages(pdf, entries):
    tmp = tempfile.mkdtemp()
    txt = os.path.join(tmp, "o.txt")
    subprocess.run(["pdftotext", "-layout", pdf, txt], check=True)
    pages = [norm(p) for p in open(txt, encoding="utf-8").read().split("\f")]
    res, start = {}, 2  # titul + mundarija sahifalaridan keyin qidirish
    # mundarija necha sahifa: "kirish" sarlavhasi mundarijadan keyin
    for i, (lvl, txt_) in enumerate(entries):
        key = norm(txt_)[:45]
        for pn in range(start, len(pages)):
            if key in pages[pn] and pn > 1:
                # mundarija sahifasini o'tkazib yuborish
                if "mundarija" in pages[pn][:40]:
                    continue
                res[i] = pn + 1; start = pn
                break
    shutil.rmtree(tmp)
    return res


def to_pdf(docx_path, outdir):
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", outdir, docx_path],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return os.path.join(outdir, os.path.splitext(os.path.basename(docx_path))[0] + ".pdf")


def main():
    build_label_map()
    entries = collect_headings()
    b = Builder().build(entries)
    b.doc.save(OUT)
    tmp = tempfile.mkdtemp()
    pdf = to_pdf(OUT, tmp)
    pages = find_pages(pdf, entries)
    missing = [entries[i][1] for i in range(len(entries)) if i not in pages]
    if missing:
        print("Ogohlantirish: sahifasi topilmadi:", missing)
    USED.clear()
    b = Builder(pages).build(entries)
    b.doc.save(OUT)
    pdf = to_pdf(OUT, HERE)
    unused = [k for k in REF_ORDER if k not in USED]
    n = int(subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout.split("Pages:")[1].split()[0])
    if unused:
        print("Matnda havola qilinmagan adabiyotlar:", unused)
    print("Tayyor:", OUT, "| sahifalar:", n)
    shutil.rmtree(tmp)


if __name__ == "__main__":
    main()
