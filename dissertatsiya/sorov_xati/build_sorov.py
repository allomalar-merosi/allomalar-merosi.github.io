#!/usr/bin/env python3
"""Sirdaryo viloyati statistika boshqarmasiga so'rov xati + ilova jadvallar (dissertatsiyadagi jigarrang/taxminiy jadvallar).
Foydalanish: python3 build_sorov.py  ->  Sirstat_sorov_xati.docx va .pdf
[[...]] — sariq rangda, muallif to'ldiradigan joylar."""
import os, re, subprocess
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "Sirstat_sorov_xati.docx")
FONT = "Times New Roman"

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin, sec.right_margin, sec.top_margin, sec.bottom_margin = Cm(2.5), Cm(1.5), Cm(1.5), Cm(1.5)
st = doc.styles["Normal"]; st.font.name = FONT; st.font.size = Pt(12)
st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)

def runs(p, text, size=12, bold=False, italic=False):
    for part in re.split(r"(\[\[.*?\]\]|\*\*.+?\*\*)", text):
        if not part: continue
        hl = part.startswith("[[")
        b = bold or part.startswith("**")
        t = part[2:-2] if (hl or part.startswith("**")) else part
        r = p.add_run(t); r.font.name = FONT; r.font.size = Pt(size); r.bold = b; r.italic = italic
        r._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
        if hl: r.font.highlight_color = WD_COLOR_INDEX.YELLOW
    return p

def para(text="", size=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True, before=0, after=0, spacing=1.0, keep=False):
    p = doc.add_paragraph(); f = p.paragraph_format
    f.alignment = align; f.space_before = Pt(before); f.space_after = Pt(after); f.line_spacing = spacing
    f.first_line_indent = Cm(1.25) if indent else Cm(0); f.keep_with_next = keep
    return runs(p, text, size, bold, italic)

def shade(cell, color="E7E6E6"):
    tcPr = cell._element.get_or_add_tcPr(); s = OxmlElement("w:shd")
    s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), color); tcPr.append(s)

def fix_widths(t, widths):
    tblPr = t._tbl.tblPr
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    tw = OxmlElement("w:tblW"); tw.set(qn("w:w"), str(int(sum(widths) * 567))); tw.set(qn("w:type"), "dxa")
    for old in tblPr.findall(qn("w:tblW")): tblPr.remove(old)
    tblPr.append(tw)
    for j, gc in enumerate(t._tbl.tblGrid.findall(qn("w:gridCol"))):
        gc.set(qn("w:w"), str(int(widths[j] * 567)))
    for j, w in enumerate(widths): t.columns[j].width = Cm(w)

def table(header, rows, widths, size=10.5, hrows=1):
    """header: ro'yxat (yoki ro'yxatlar ro'yxati — ikki qatorli sarlavha uchun); bo'sh katak — to'ldiriladi."""
    heads = header if isinstance(header[0], list) else [header]
    allrows = heads + rows
    t = doc.add_table(rows=len(allrows), cols=len(widths)); t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    fix_widths(t, widths)
    for i, row in enumerate(allrows):
        trPr = t.rows[i]._tr.get_or_add_trPr(); cs = OxmlElement("w:cantSplit"); trPr.append(cs)
        if i >= len(heads):
            hgt = OxmlElement("w:trHeight"); hgt.set(qn("w:val"), "400"); hgt.set(qn("w:hRule"), "atLeast"); trPr.append(hgt)
        if i < len(heads):
            th = OxmlElement("w:tblHeader"); trPr.append(th)
        for j, w in enumerate(widths):
            c = t.cell(i, j); c.width = Cm(w); c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            txt = row[j] if j < len(row) else ""
            p = c.paragraphs[0]; f = p.paragraph_format; f.space_before = Pt(1); f.space_after = Pt(1); f.line_spacing = 1.0
            hdr = i < len(heads)
            f.alignment = WD_ALIGN_PARAGRAPH.CENTER if (hdr or j > 0) else WD_ALIGN_PARAGRAPH.LEFT
            if txt: runs(p, txt, size, bold=hdr or txt.startswith("**"))
            if hdr: shade(c)
    # ikki qatorli sarlavhada bir xil matnli kataklarni birlashtirish
    if len(heads) == 2:
        for j in range(len(widths)):
            if heads[1][j] == "": t.cell(0, j).merge(t.cell(1, j))
        j = 0
        while j < len(widths):
            k = j
            while k + 1 < len(widths) and heads[0][k + 1] == "" and heads[1][k + 1] != "": k += 1
            if k > j: t.cell(0, j).merge(t.cell(0, k))
            j = k + 1
    return t

def ilova(n, title, dis):
    p = doc.add_paragraph(); p.add_run().add_break(WD_BREAK.PAGE)
    p.paragraph_format.space_after = Pt(0)
    para(f"{n}-ilova", 12, italic=True, align=WD_ALIGN_PARAGRAPH.RIGHT, indent=False)
    para(title, 12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, before=6, after=2, keep=True)
    para(f"(dissertatsiyaning {dis} uchun)", 10.5, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, after=6, keep=True)

def izoh(text):
    para(text, 10.5, italic=True, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=False, before=4)

DIST = ["Boyovut tumani", "Guliston tumani", "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani",
        "Sirdaryo tumani", "Xovos tumani", "Guliston shahri", "Shirin shahri", "Yangiyer shahri"]
JAMI = "**Viloyat bo‘yicha**"

# ===================================================================== 1-BET: SO'ROV XATI
L = WD_ALIGN_PARAGRAPH.LEFT; C = WD_ALIGN_PARAGRAPH.CENTER; R = WD_ALIGN_PARAGRAPH.RIGHT
para("O‘ZBEKISTON RESPUBLIKASI OLIY TA’LIM, FAN VA INNOVATSIYALAR VAZIRLIGI", 11, bold=True, align=C, indent=False)
para("GULISTON DAVLAT UNIVERSITETI", 13, bold=True, align=C, indent=False)
para("[[Manzil: Guliston sh., __________; tel.: ________; e-mail: ________]]", 10, align=C, indent=False, after=4)
p = para("", 10, align=C, indent=False, after=8)
pPr = p._p.get_or_add_pPr(); bdr = OxmlElement("w:pBdr"); bt = OxmlElement("w:bottom")
for k, v in (("w:val", "double"), ("w:sz", "6"), ("w:space", "1"), ("w:color", "000000")): bt.set(qn(k), v)
bdr.append(bt); pPr.append(bdr)
para("№ [[____]]                                                                                    «[[__]]» [[__________]] 2026-yil", 12, align=L, indent=False, after=6)
for s in ("O‘zbekiston Respublikasi Prezidenti huzuridagi", "Statistika agentligi Sirdaryo viloyati", "statistika boshqarmasi boshlig‘i", "[[F.I.Sh.]]ga"):
    para(s, 13, bold=True, align=R, indent=False)
para("**Dissertatsiya tadqiqoti uchun statistik ma’lumotlar taqdim etish to‘g‘risida**", 13, align=C, indent=False, before=8, after=6)

body = [
 "Guliston davlat universiteti [[mustaqil izlanuvchisi / tayanch doktoranti]] **Batirova Latofat Shuxratovna** 08.00.15 – “Tadbirkorlik va kichik biznes iqtisodiyoti” ixtisosligi bo‘yicha “Kambag‘allikning ko‘p o‘lchovli mezonlari asosida tadbirkorlikni qo‘llab-quvvatlash samaradorligini baholash metodikasini takomillashtirish” mavzusida falsafa doktori (PhD) dissertatsiyasi ustida ilmiy tadqiqot olib bormoqda. Tadqiqot obyekti sifatida Sirdaryo viloyati tanlangan.",
 "Tadqiqotda boshqarmangiz va Statistika agentligining ochiq ma’lumotlaridan (sirstat.uz, stat.uz) keng foydalanildi. Biroq ayrim ko‘rsatkichlar – tumanlar (shaharlar) kesimidagi kambag‘allik darajasi, tadbirkorlikni qo‘llab-quvvatlash vositalari bo‘yicha ajratilgan resurslar va ularning tumanlar bo‘yicha taqsimoti, qo‘llab-quvvatlash hisobiga tashkil etilgan faoliyat natijalari hamda uy xo‘jaliklari tanlanma kuzatuvining viloyat bo‘yicha natijalari ochiq manbalarda e’lon qilinmagan. Hozircha dissertatsiyada bu ko‘rsatkichlar o‘rnida dastlabki taxminiy baholar qo‘llanilgan bo‘lib, ularni rasmiy ma’lumotlar bilan almashtirish zarur.",
 "Yuqoridagilarni inobatga olib, ilovada keltirilgan jadvallar bo‘yicha boshqarmangizda mavjud ma’lumotlarni taqdim etishingizni so‘raymiz. Boshqarmangizda yuritilmaydigan ko‘rsatkichlar (2–4-ilovalar) bo‘yicha esa ularni yurituvchi tashkilotlar – Sirdaryo viloyati hokimligi, viloyat kambag‘allikni qisqartirish va bandlik bosh boshqarmasi hamda tijorat banklarining viloyat filiallaridan olishda amaliy ko‘maklashishingizni iltimos qilamiz.",
 "Ma’lumotlar faqat ilmiy maqsadlarda, umumlashtirilgan holda foydalaniladi va uchinchi shaxslarga berilmaydi; shaxsga doir ma’lumotlar so‘ralmaydi. Ma’lumotlarni elektron shaklda (MS Excel) [[e-mail manzil]] elektron pochta manziliga yuborishingiz mumkin. To‘liq bo‘lmagan ma’lumotlar (ayrim yillar yoki ko‘rsatkichlar bo‘yicha) ham tadqiqot uchun qimmatli hisoblanadi.",
]
for b in body: para(b, 13, spacing=1.1, after=3)
para("**Ilova:** 5 ta ilova (7 ta jadval), 5 varaqda.", 13, indent=True, before=4, after=14)

t = doc.add_table(rows=1, cols=3); t.autofit = False; fix_widths(t, [9.0, 3.5, 4.5])
for j, (txt, al) in enumerate((("**Ilmiy ishlar va innovatsiyalar bo‘yicha prorektor**", L), ("", C), ("[[F.I.Sh.]]", R))):
    c = t.cell(0, j); c.width = Cm([9.0, 3.5, 4.5][j]); runs(c.paragraphs[0], txt, 13); c.paragraphs[0].alignment = al
para("Ijrochi: L.Sh. Batirova, tel.: [[__________]]", 10, align=L, indent=False, before=18)

# ===================================================================== ILOVALAR
yrs = ["2021", "2022", "2023", "2024", "2025"]

# 1-ilova — tumanlar kesimida kambag'allik
ilova(1, "Sirdaryo viloyati tumanlari (shaharlari) kesimida kambag‘allik ko‘rsatkichlari, 2021–2025-yillar", "2.2 va 2.10-jadvallari")
table([["Tuman (shahar)", "Kambag‘allik darajasi, %", "", "", "", "", "Uy xo‘jaliklari soni, ming (2025-yil oxiri)", "Uy xo‘jaligining o‘rtacha hajmi, kishi", "Kambag‘al oilalar reyestridagi oilalar soni (2025-yil oxiri)"],
       ["", *yrs, "", "", ""]],
      [[d] for d in DIST] + [[JAMI]], [3.6, 1.25, 1.25, 1.25, 1.25, 1.25, 2.3, 2.1, 2.6], size=10)
para("**1.2. Qo‘shimcha ko‘rsatkichlar**", 11.5, align=L, indent=False, before=6, after=4, keep=True)
table(["Ko‘rsatkich", *yrs],
      [["Minimal iste’mol xarajatlari qiymati (kambag‘allik chegarasi), ming so‘m/oy*"],
       ["Sirdaryo viloyatida kambag‘al aholi soni, ming kishi"],
       ["Kambag‘allik chuqurligi (P₁), %"],
       ["Kambag‘allik o‘tkirligi (P₂), %"]],
      [7.2, 1.9, 1.9, 1.9, 1.9, 2.1], size=10.5)
izoh("* Dissertatsiyada 2022–2025-yillar uchun rasmiy qiymatlar (498; 568; 648; 669 ming so‘m) qo‘llanilgan; 2021-yil qiymati rasmiy manbada topilmagan. Tumanlar kesimidagi kambag‘allik darajasi mavjud bo‘lmasa, kambag‘al oilalar reyestridagi oilalar (aholi) soni yoki boshqa mavjud ko‘rsatkich so‘raladi.")

# 2-ilova — resurslar dinamikasi
ilova(2, "Sirdaryo viloyatida tadbirkorlikni qo‘llab-quvvatlash vositalari bo‘yicha ajratilgan resurslar dinamikasi", "2.11-jadvali")
R2 = [["Imtiyozli kreditlar (oilaviy tadbirkorlik va kambag‘allikni qisqartirish dasturlari)", "Oluvchilar soni, kishi"],
      ["", "Summasi, mlrd so‘m"],
      ["", "Muddati o‘tgan qarzdorlik ulushi, %"],
      ["Subsidiyalar va grantlar", "Oluvchilar soni, kishi"],
      ["", "Summasi, mlrd so‘m"],
      ["Kasbga (tadbirkorlikka) o‘qitish", "O‘qitilganlar soni, kishi"],
      ["", "Xarajatlar, mlrd so‘m"],
      ["Yer ajratish (qishloq xo‘jaligi ekinlari uchun)", "Oluvchilar soni, oila"],
      ["", "Maydoni, ga"],
      ["**Jami**", "Qamrab olingan oilalar soni"],
      ["", "Shu jumladan kambag‘al oilalar reyestridagi oilalar, %"]]
t2 = table(["Qo‘llab-quvvatlash vositasi", "Ko‘rsatkich", "2022", "2023", "2024", "2025"], R2, [4.6, 5.0, 1.85, 1.85, 1.85, 1.85], size=10.5)
for a, b in ((1, 3), (4, 5), (6, 7), (8, 9), (10, 11)):
    t2.cell(a, 0).merge(t2.cell(b, 0))
izoh("Ma’lumot manbalari: viloyat hokimligi, viloyat kambag‘allikni qisqartirish va bandlik bosh boshqarmasi, tijorat banklari viloyat filiallari.")

# 3-ilova — faoliyat yo'nalishlari
ilova(3, "Sirdaryo viloyatida qo‘llab-quvvatlash (imtiyozli kredit va subsidiya) hisobiga tashkil etilgan faoliyat yo‘nalishlari tarkibi, 2024–2025-yillar", "2.12-jadvali")
FA = ["Chorvachilik", "Parrandachilik", "Issiqxona va sabzavotchilik", "Bog‘dorchilik va ko‘chatchilik", "Tikuvchilik va hunarmandchilik",
      "Oziq-ovqat tayyorlash (qandolatchilik, novvoyxona)", "Maishiy xizmatlar", "Savdo", "Boshqa yo‘nalishlar"]
table(["Faoliyat yo‘nalishi", "Loyihalar soni", "Ajratilgan mablag‘, mlrd so‘m", "O‘rtacha loyiha qiymati, mln so‘m", "Yaratilgan ish o‘rinlari soni", "12 oydan keyin faoliyatini davom ettirayotganlar, %"],
      [[x] for x in FA] + [["**Jami**"]], [5.0, 2.0, 2.4, 2.4, 2.4, 2.8], size=10.5)
izoh("Ma’lumot manbalari: viloyat kambag‘allikni qisqartirish va bandlik bosh boshqarmasi, tijorat banklari viloyat filiallari. Faoliyatning davom etishi to‘g‘risida ma’lumot bo‘lmasa, 2024-yilda moliyalashtirilgan loyihalarning 2025-yil oxiridagi holati (faol / to‘xtagan) so‘raladi.")

# 4-ilova — tumanlar kesimida resurslar
ilova(4, "Sirdaryo viloyatida qo‘llab-quvvatlash resurslarining tumanlar (shaharlar) kesimida taqsimlanishi, 2025-yil", "2.13-jadvali")
table([["Tuman (shahar)", "Kambag‘al oilalar reyestridagi oilalar soni", "Imtiyozli kreditlar", "", "Subsidiyalar", "", "Kasbga o‘qitish, mln so‘m", "Yer ajratish, ga"],
       ["", "", "oluvchilar soni", "mlrd so‘m", "oluvchilar soni", "mlrd so‘m", "", ""]],
      [[d] for d in DIST] + [[JAMI]], [3.6, 2.3, 1.75, 1.6, 1.75, 1.6, 2.0, 1.55], size=10)
izoh("Imkoni bo‘lsa, xuddi shu ko‘rsatkichlar 2023–2024-yillar uchun ham so‘raladi. Ma’lumot manbalari: viloyat hokimligi, viloyat kambag‘allikni qisqartirish va bandlik bosh boshqarmasi, tijorat banklari viloyat filiallari.")

# 5-ilova — uy xo'jaliklari tanlanma kuzatuvi
ilova(5, "Uy xo‘jaliklari tanlanma kuzatuvi ma’lumotlari bo‘yicha Sirdaryo viloyati uy xo‘jaliklarining turmush sharoiti ko‘rsatkichlari (2025-yil yoki oxirgi mavjud yil)", "2.17 va 2.22-jadvallarini rasmiy ma’lumotlar bilan taqqoslash")
table(["Ko‘rsatkich (uy xo‘jaliklari ulushi, %)", "Jami", "Qishloq", "Shahar"],
      [["Markazlashgan ichimlik suvi tarmog‘iga ulanmagan"],
       ["Ichimlik suvini uzilishlar bilan oladigan (haftada 3 kundan kam)"],
       ["Markazlashgan kanalizatsiyaga ulanmagan (hovli hojatxonasidan foydalanadigan)"],
       ["Tabiiy gaz tarmog‘iga ulanmagan"],
       ["Ovqat pishirishda qattiq yoqilg‘idan (o‘tin, ko‘mir, tezak) foydalanadigan"],
       ["Bir kishiga to‘g‘ri keladigan turar joy maydoni 8 m² dan kam"],
       ["Biror a’zosi bank kartasi yoki hisob raqamiga ega bo‘lmagan"],
       ["Mehnatga layoqatli a’zolaridan hech biri band bo‘lmagan"],
       ["A’zosi mehnat migratsiyasida bo‘lgan"],
       ["Pul yetishmasligi sababli tibbiy yordam ololmagan"]],
      [10.2, 2.2, 2.2, 2.2], size=10.5)
para("", 6)
para("**5.2. Iste’mol xarajatlari bo‘yicha kvintil guruhlar**", 11.5, align=L, indent=False, before=6, after=4, keep=True)
table(["Kvintil guruhi", "Jon boshiga o‘rtacha oylik iste’mol xarajatlari, ming so‘m", "Oziq-ovqat xarajatlari ulushi, %", "Transfertlar va pul o‘tkazmalari ulushi daromadda, %"],
      [["I (eng past)"], ["II"], ["III"], ["IV"], ["V (eng yuqori)"], ["**Jami**"]],
      [3.6, 4.6, 3.6, 5.0], size=10.5)
izoh("Ushbu ma’lumotlar muallif tomonidan o‘tkazilgan so‘rovnoma natijalarini rasmiy tanlanma kuzatuvi bilan taqqoslash uchun so‘raladi. Ko‘rsatkichlar ta’rifi boshqarmada qo‘llaniladigan uslubiyatdan farq qilsa, mavjud eng yaqin ko‘rsatkich so‘raladi.")

doc.save(OUT)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", HERE, OUT], capture_output=True)
pages = subprocess.run(["pdfinfo", OUT.replace(".docx", ".pdf")], capture_output=True, text=True).stdout
print("Tayyor:", OUT, [l for l in pages.splitlines() if l.startswith("Pages")])
