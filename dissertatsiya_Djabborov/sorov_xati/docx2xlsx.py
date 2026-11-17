#!/usr/bin/env python3
"""So'rov xati ilovalaridagi jadvallarni Excelga o'tkazish: har bir ilova – alohida list.
Foydalanish: python3 docx2xlsx.py <kirish.docx> <chiqish.xlsx>
Sariq fonli (to'ldiriladigan) kataklar Excelda ham sariq fon bilan belgilanadi."""
import sys, re
from docx import Document
from docx.oxml.ns import qn
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

src, out = sys.argv[1], sys.argv[2]
d = Document(src)
FILL = PatternFill("solid", fgColor="FFF2CC"); HEAD = PatternFill("solid", fgColor="E7E6E6")
thin = Side(style="thin", color="808080"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
F = "Times New Roman"

def ptext(el): return "".join(x.text or "" for x in el.iter(qn("w:t"))).strip()

# hujjatni ilovalarga bo'lish: [{n, title, sub, items:[('p',text)|('t',table)]}]
ilovalar, cur, ti = [], None, 0
for el in d.element.body.iterchildren():
    if el.tag == qn("w:p"):
        t = ptext(el)
        if not t: continue
        m = re.fullmatch(r"(\d+)-ilova", t)
        if m: cur = {"n": int(m.group(1)), "items": []}; ilovalar.append(cur); continue
        if cur is not None: cur["items"].append(("p", t))
    elif el.tag == qn("w:tbl"):
        tb = d.tables[ti]; ti += 1
        if cur is not None: cur["items"].append(("t", tb))

def is_filled(cell):
    shd = cell._element.tcPr.find(qn("w:shd")) if cell._element.tcPr is not None else None
    return shd is not None and (shd.get(qn("w:fill")) or "").upper() == "FFF2CC"

NUM = re.compile(r"^[–-]?\d{1,3}( \d{3})*(,\d+)?$|^[–-]?\d+(,\d+)?$")
def conv(s):
    s = s.replace("\u00a0", " ").replace("\u202f", " ")
    if NUM.match(s):
        neg = s[0] in "–-"; v = s.lstrip("–-").replace(" ", "")
        dec = len(v.split(",")[1]) if "," in v else 0
        x = float(v.replace(",", ".")); x = -x if neg else x
        return (int(x) if dec == 0 else x), ("#,##0" if dec == 0 else "#,##0." + "0" * dec)
    return s, None

wb = Workbook(); wb.remove(wb.active)
# mundarija
mc = wb.create_sheet("Mundarija")
mc["A1"] = "“Ipoteka bank OTP Group”ga so‘rov xati ilovalari (Djabborov Sh.E. dissertatsiyasi)"; mc["A1"].font = Font(name=F, bold=True, size=12)
mc["A2"] = "Sariq fonli kataklar – ma’lumot so‘ralayotgan (dissertatsiyada taxminiy qiymat qo‘llanilgan) kataklar."; mc["A2"].font = Font(name=F, italic=True, size=10)
mc["A2"].fill = FILL
mc.append([]); mc.append(["List", "Ilova nomi"])
for c in mc[4]: c.font = Font(name=F, bold=True); c.fill = HEAD; c.border = BOX
mc.column_dimensions["A"].width = 12; mc.column_dimensions["B"].width = 110

for il in ilovalar:
    name = f"{il['n']}-ilova"; ws = wb.create_sheet(name)
    paras = [x[1] for x in il["items"] if x[0] == "p"]
    title = paras[0]; mc.append([name, title])
    r = mc.max_row; mc.cell(r, 1).hyperlink = f"#'{name}'!A1"; mc.cell(r, 1).font = Font(name=F, color="0563C1", underline="single")
    mc.cell(r, 2).font = Font(name=F); mc.cell(r, 2).alignment = Alignment(wrap_text=True)
    for c in mc[r]: c.border = BOX
    widths = {}; row = 1; ncols_max = 1
    tables = [x[1] for x in il["items"] if x[0] == "t"]
    ncols_max = max(len(t.columns) for t in tables)
    def text_row(t, bold=False, italic=False, size=11, center=False, h=None):
        global row
        ws.cell(row, 1, t).font = Font(name=F, bold=bold, italic=italic, size=size)
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=ncols_max)
        ws.cell(row, 1).alignment = Alignment(wrap_text=True, vertical="top", horizontal="center" if center else "left")
        if h: ws.row_dimensions[row].height = h
        row += 1
    ws.cell(row, ncols_max, name).font = Font(name=F, italic=True); ws.cell(row, ncols_max).alignment = Alignment(horizontal="right"); row += 1
    first = True
    for kind, obj in il["items"]:
        if kind == "p":
            if first: text_row(obj, bold=True, size=12, center=True, h=32); first = False
            elif obj.startswith("(dissertatsiyaning"): text_row(obj, italic=True, size=10, center=True)
            elif re.match(r"^\d\.\d\. ", obj): row += 1; text_row(obj, bold=True)
            else:
                lines = max(1, len(obj) // 150 + 1); text_row(obj, italic=True, size=10, h=14 * lines)
        else:
            row += 0
            tb = obj; nc = len(tb.columns)
            for i, tr in enumerate(tb.rows):
                seen = set()
                for j, cell in enumerate(tr.cells):
                    if id(cell._element) in seen: continue
                    seen.add(id(cell._element))
                    txt = cell.text.strip().replace("\n", " ")
                    v, fmt = conv(txt) if i > 0 else (txt, None)
                    c = ws.cell(row, j + 1, v if v != "" else None)
                    c.font = Font(name=F, bold=(i == 0), size=10); c.border = BOX
                    c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="left" if (j == 0 or (j == 1 and "Savol" in tb.rows[0].cells[1].text)) and i > 0 else "center")
                    if fmt: c.number_format = fmt
                    if i == 0: c.fill = HEAD
                    elif is_filled(cell): c.fill = FILL
                    qcol = j == 1 and "Savol" in tb.rows[0].cells[1].text
                    widths[j] = max(widths.get(j, 0), min(len(txt), 60 if (j == 0 or qcol) else 18))
                for j in range(len(tr.cells), nc): ws.cell(row, j + 1).border = BOX
                if i == 0: ws.row_dimensions[row].height = 45
                row += 1
            row += 1
    for j, w in widths.items():
        ws.column_dimensions[get_column_letter(j + 1)].width = max(12, w + 2) if j else max(30, w + 2)
    ws.sheet_view.zoomScale = 100
    ws.page_setup.orientation = "landscape"; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
wb.save(out); print("Tayyor:", out, [s.title for s in wb.worksheets])
