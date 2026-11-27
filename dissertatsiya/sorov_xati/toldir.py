#!/usr/bin/env python3
"""Sirstat so'rov xati jadvallarini boshqarma yuborgan ma'lumotlar bilan to'ldirish.
Kirish: Sirstat_sorov_xati_asl.docx (xatning yuborilgan nusxasi), sirstat_javob_uy_xojaliklari.xlsx (Sirdaryo viloyat statistika
boshqarmasi: uy xo'jaliklari tanlanma kuzatuvi). Chiqish: Sirstat_sorov_xati_toldirilgan.docx va .pdf
To'ldirilgan qiymatlar to'q yashil rangda; javobda yo'q kataklar bo'sh qoladi."""
import os, copy, subprocess
import openpyxl
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "Sirstat_sorov_xati_asl.docx")
XL = os.path.join(HERE, "sirstat_javob_uy_xojaliklari.xlsx")
OUT = os.path.join(HERE, "Sirstat_sorov_xati_toldirilgan.docx")
GREEN = RGBColor(0x00, 0x6B, 0x3C); FONT = "Times New Roman"; SZ = Pt(10.5)

wb = openpyxl.load_workbook(XL, data_only=True)
def rows(sheet, c0="B", cols="CDEF", r1=1, r2=200):
    ws = wb[sheet]; out = {}
    for r in range(r1, min(r2, ws.max_row) + 1):
        k = ws[f"{c0}{r}"].value
        if isinstance(k, str) and k.strip() not in out:
            out[k.strip()] = [ws[f"{c}{r}"].value for c in cols]
    return out
INC = rows("Daromad", r1=1, r2=25); INCP = rows("Daromad", r1=26, r2=50)
EXP = rows("T11", r1=1, r2=44); EXPP = rows("T11", r1=46, r2=90)
FOOD = rows("13")
DUR = rows("Uzoq muddatli", c0="B", cols="CDEFGH")

def fmt(v, d=1):
    if v is None or isinstance(v, str): return "–"
    s = f"{v:,.{d}f}".replace(",", " ").replace(".", ",")
    return s.replace("-", "–")

d = Document(SRC)

def put(cell, text, bold=False, color=GREEN, align=WD_ALIGN_PARAGRAPH.CENTER):
    p = cell.paragraphs[0]
    for r in list(p.runs): r._element.getparent().remove(r._element)
    r = p.add_run(text); r.font.name = FONT; r.font.size = SZ; r.bold = bold
    if color is not None: r.font.color.rgb = color
    p.alignment = align

# ---------------- 5.2-jadval (kvintillar): "Jami" qatori, 2025-yil
t7 = d.tables[6]
jami = next(r for r in t7.rows if r.cells[0].text.strip().startswith("Jami"))
cons25 = EXP["Жами истеъмол харажатлари"][1] / 1000
food25 = EXPP["озиқ-овқат маҳсулотларини сотиб олиш"][1]
tr25 = INCP["Qarindosh va boshqalar tomonidan berilgan moddiy yordam"][1]
put(jami.cells[1], fmt(cons25) + "¹"); put(jami.cells[2], fmt(food25) + "²"); put(jami.cells[3], fmt(tr25) + "³")

def para_after(anchor, text, size=10, italic=True, bold=False, before=2, after=2, align=WD_ALIGN_PARAGRAPH.JUSTIFY, keep=False):
    p = OxmlElement("w:p"); anchor.addnext(p)
    from docx.text.paragraph import Paragraph
    P = Paragraph(p, anchor.getparent())
    f = P.paragraph_format; f.space_before = Pt(before); f.space_after = Pt(after); f.alignment = align; f.keep_with_next = keep
    r = P.add_run(text); r.font.name = FONT; r.font.size = Pt(size); r.italic = italic; r.bold = bold
    return p

def shade(cell, color="E7E6E6"):
    tcPr = cell._element.get_or_add_tcPr(); s = OxmlElement("w:shd")
    s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), color); tcPr.append(s)

def table_after(anchor, header, body, widths, size=10):
    t = d.add_table(rows=len(body) + 1, cols=len(widths)); t.style = t7.style
    t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    tblPr = t._tbl.tblPr; lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    for j, gc in enumerate(t._tbl.tblGrid.findall(qn("w:gridCol"))): gc.set(qn("w:w"), str(int(widths[j] * 567)))
    for i, row in enumerate([header] + body):
        trPr = t.rows[i]._tr.get_or_add_trPr(); trPr.append(OxmlElement("w:cantSplit"))
        if i == 0: trPr.append(OxmlElement("w:tblHeader"))
        for j, w in enumerate(widths):
            c = t.cell(i, j); c.width = Cm(w); c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            txt = row[j]; bold = i == 0 or txt.startswith("**"); txt = txt.strip("*")
            p = c.paragraphs[0]; p.paragraph_format.space_before = Pt(1); p.paragraph_format.space_after = Pt(1)
            r = p.add_run(txt); r.font.name = FONT; r.font.size = Pt(size); r.bold = bold
            if i > 0 and j > 0: r.font.color.rgb = GREEN
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if (j == 0 and i > 0) else WD_ALIGN_PARAGRAPH.CENTER
            if i == 0: shade(c)
    el = t._tbl; anchor.addnext(el); return el

# 5.2 izohidan keyin: izohlar va qo'shimcha jadvallar
note52 = next(p for p in d.paragraphs if p.text.startswith("Ushbu ma’lumotlar muallif tomonidan"))._p
a = para_after(note52, "¹ 2025-yil, uy xo‘jaliklari a’zolarining jon boshiga o‘rtacha oylik iste’mol xarajatlari (manbada – so‘mda; ming so‘mga aylantirildi). "
               f"² Oziq-ovqat mahsulotlarini sotib olish xarajatlari; uydan tashqarida ovqatlanish bilan birga – {fmt(food25 + EXPP['уйдан ташқарида овқатланиш'][1])} foiz. "
               f"³ Qarindoshlar va boshqalar tomonidan berilgan moddiy yordamning jami daromaddagi ulushi (pul o‘tkazmalari shu jumladan); pensiya, nafaqa va stipendiyalar ulushi alohida – {fmt(INCP['Pensiya nafaqalar, stipendiyalar'][1])} foiz. "
               "Kvintil guruhlari bo‘yicha ma’lumot javobda keltirilmagan. Manba: Sirdaryo viloyati statistika boshqarmasi, uy xo‘jaliklari tanlanma kuzatuvi ma’lumotlari. Yashil rangdagi qiymatlar – boshqarma javobidan olingan.", before=4)

YH = ["2024", "2025", "2026 (yanvar–may)", "2026 (manbada “2026.11”)*"]
a = para_after(a, "5.3. Uy xo‘jaliklari jami daromadlari tarkibi (tanlanma kuzatuv ma’lumotlari)", 11.5, italic=False, bold=True, before=10, after=4, align=WD_ALIGN_PARAGRAPH.LEFT, keep=True)
IR = [("**Jami daromadlar, ming so‘m (jon boshiga, oyiga)**", INC["Jami daromadlar"], 1000),
      ("Pul shaklidagi daromadlar, %", INCP["Pul shaklidagi daromadlar"], 1),
      ("  ish haqi (ta’til puli va mukofotlar bilan)", INCP["ish haqi, ta'til puli va mukofot pullarini qo'shgan holda"], 1),
      ("  tadbirkorlik faoliyatidan daromadlar", INCP["tadbirkorlik faoliyatidan olingan daromadlar"], 1),
      ("  mahsulot va xizmatlarni sotishdan daromadlar", INCP["mahsulot va xizmatlarni sotishdan olingan daromadlar"], 1),
      ("    shu jumladan chorva mollari va parrandalar sotishdan", INCP["chorva mollari va parrandalar sotishdan"], 1),
      ("  pensiya, nafaqalar, stipendiyalar", INCP["Pensiya nafaqalar, stipendiyalar"], 1),
      ("    shu jumladan nafaqalar", INCP["Nafaqalar"], 1),
      ("  qarindoshlar va boshqalar tomonidan berilgan moddiy yordam", INCP["Qarindosh va boshqalar tomonidan berilgan moddiy yordam"], 1),
      ("  bank depozitlari va qimmatli qog‘ozlardan daromadlar", INCP["Bank depozitlari aktsiyalar va boshqa qimmatli qog'ozlardan foizlar va dividentlar"], 1),
      ("Natura shaklidagi daromadlar (shaxsiy tomorqa mahsulotlari), %", INCP["natura shaklidagi daromadlar"], 1)]
a = table_after(a, ["Ko‘rsatkich, jami daromadga nisbatan %"] + YH,
                [[n] + [fmt(v / k, 1 if k == 1000 else 1) for v in vals] for n, vals, k in IR], [7.4, 2.2, 2.2, 2.6, 2.6])

a = para_after(a, "5.4. Uy xo‘jaliklari iste’mol xarajatlari tarkibi (tanlanma kuzatuv ma’lumotlari)", 11.5, italic=False, bold=True, before=10, after=4, align=WD_ALIGN_PARAGRAPH.LEFT, keep=True)
ER = [("**Jami iste’mol xarajatlari, ming so‘m (jon boshiga, oyiga)**", EXP["Жами истеъмол харажатлари"], 1000),
      ("Oziq-ovqat mahsulotlarini sotib olish, %", EXPP["озиқ-овқат маҳсулотларини сотиб олиш"], 1),
      ("Uydan tashqarida ovqatlanish, %", EXPP["уйдан ташқарида овқатланиш"], 1),
      ("Nooziq-ovqat mahsulotlari, %", EXPP["ноозиқ-овқат маҳсулотларини сотиб олиш"], 1),
      ("  ma’lumot uchun: ko‘mir va o‘tin xarajatlari, %", [a_ + b_ for a_, b_ in zip(EXPP["Кўмирга харажатлар"], EXPP["Ўтинга харажатлар"])], 1),
      ("Xizmatlar uchun to‘lovlar, %", EXPP["Хизматлар учун тўловлар"], 1),
      ("  kommunal xizmatlar", EXPP["коммунал хизматлари, улардан"], 1),
      ("  ta’lim (maktabgacha ta’lim bilan)", [a_ + b_ for a_, b_ in zip(EXPP["таълим тизими хизматлари"], EXPP["мактабгача таълим хизматлари"])], 1),
      ("  sog‘liqni saqlash xizmatlari va dori-darmonlar", [a_ + b_ for a_, b_ in zip(EXPP["соғлиқни сақлаш хизматлари"], EXPP["фармацевтика ва тиббиёт товарлари"])], 1),
      ("  aloqa xizmatlari", EXPP["алоқа хизматлар"], 1)]
a = table_after(a, ["Ko‘rsatkich, jami iste’mol xarajatlariga nisbatan %"] + YH,
                [[n] + [fmt(v / k) for v in vals] for n, vals, k in ER], [7.4, 2.2, 2.2, 2.6, 2.6])

a = para_after(a, "5.5. Uy xo‘jaliklarining uzoq muddat foydalaniladigan buyumlar bilan ta’minlanganligi (o‘rganilgan uy xo‘jaliklariga nisbatan %)", 11.5, italic=False, bold=True, before=10, after=4, align=WD_ALIGN_PARAGRAPH.LEFT, keep=True)
DI = [("Gaz plitasi", "Газ плитаси"), ("Sovutgich", "Совутгич"), ("Televizor", "Телевизор"), ("Avtomat kir yuvish mashinasi", "Автомат кир ювиш машинаси"),
      ("Yarim avtomat kir yuvish mashinasi", "Ярим автомат кир ювиш машинаси"), ("Changyutgich", "Чангютгич"), ("Konditsioner", "Кондиционер"),
      ("Yengil avtomobil", "Енгил автомобил"), ("Kompyuter, noutbuk", "Столга қўйиладиган (статсионар) компютер, Ноутбук, нетбук"),
      ("Smartfon", "Смартфон")]
DB = []
for n, k in DI:
    v = DUR.get(k)
    if v: DB.append([n] + [fmt(x) for x in (v[0], v[2], v[4])])
a = table_after(a, ["Buyum", "2024", "2025", "2026 (yanvar–iyun)"], DB, [8.6, 2.6, 2.6, 3.2])

a = para_after(a, "5.6. Uy xo‘jaliklari a’zolarining jon boshiga o‘rtacha oylik asosiy oziq-ovqat mahsulotlari iste’moli, kg", 11.5, italic=False, bold=True, before=10, after=4, align=WD_ALIGN_PARAGRAPH.LEFT, keep=True)
import re
uz = lambda t: re.sub(r"([oOgG])'", lambda m: m.group(1) + "‘", t)
FB = [[uz(k).replace("Spirtli ichimliklar, litrda", "Spirtli ichimliklar, litr")] + [fmt(x) for x in v] for k, v in FOOD.items() if k not in ("Sirdaryo viloyati",) and all(isinstance(x, (int, float)) for x in v)]
a = table_after(a, ["Mahsulot guruhi"] + ["2024", "2025", "2026 (yanvar–may)", "2026 (manbada “2026.11”)*"], FB, [7.4, 2.2, 2.2, 2.6, 2.6])
para_after(a, "Manba: Sirdaryo viloyati statistika boshqarmasi, uy xo‘jaliklari tanlanma kuzatuvi ma’lumotlari (javob fayli). * Manbada ustun “2026.11” deb belgilangan; davr (masalan, 2026-yil yanvar–oktabr yoki noyabr holati) boshqarmadan aniqlashtiriladi. "
           "5.3–5.6-jadvallar xatda so‘ralmagan, ammo javobda yuborilgan va 5-ilovadagi ko‘rsatkichlarga (moddiy ta’minlanganlik, daromad va xarajatlar tarkibi) yaqin ma’lumotlar sifatida keltirildi. "
           "5.1-jadvaldagi yashash sharoitlari ko‘rsatkichlari (suv, kanalizatsiya, gaz, bank kartasi va b.), 1–4-ilovalardagi tumanlar kesimidagi kambag‘allik va qo‘llab-quvvatlash ma’lumotlari javobda mavjud emas. "
           "Ilova qilingan PDF hujjat – Milliy statistika qo‘mitasining “Ko‘p o‘lchovli kambag‘allikni baholash to‘g‘risida uslubiy nizom”i: undagi N-MPI ko‘rsatkichlari va vaznlari (3 o‘lcham, 13 ko‘rsatkich) uslubiy asos sifatida foydalaniladi, hududlar kesimidagi qiymatlar esa nizomda keltirilmagan (2-ilova bo‘sh shakl).", before=4)

d.save(OUT)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", HERE, OUT], capture_output=True)
print("Tayyor:", OUT)
