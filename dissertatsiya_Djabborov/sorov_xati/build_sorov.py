#!/usr/bin/env python3
"""“Ipoteka bank OTP Group” ATIBga so'rov xati + ilova jadvallar (Djabborov Sh.E. dissertatsiyasidagi jigarrang/taxminiy qiymatli jadvallar).
Jadvallar dissertatsiya manbasidan (../manba/*.txt, ../manba/gen/*.txt, qiymatlar.json) avtomatik olinadi:
taxminiy (<<...>>) kataklar bo'sh qoldiriladi va och sariq fon bilan belgilanadi — bank to'ldiradi.
Foydalanish: python3 build_sorov.py  ->  Ipoteka_sorov_xati.docx va .pdf
[[...]] — sariq rangda, muallif to'ldiradigan joylar."""
import os, re, json, subprocess
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "Ipoteka_sorov_xati.docx")
MAN = os.path.join(HERE, "..", "manba")
FILL = "FFF2CC"  # to'ldiriladigan kataklar foni
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

def table(header, rows, widths, size=10.5, hrows=1, left=(0,)):
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
            f.alignment = WD_ALIGN_PARAGRAPH.CENTER if (hdr or j not in left) else WD_ALIGN_PARAGRAPH.LEFT
            if txt.startswith("<<") or txt == "?":
                shade(c, FILL); txt = ""
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
    para(text, 10, italic=True, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=False, before=4)

# ------------------------------------------------------------------ dissertatsiya manbasidan jadvallarni o'qish
QV = json.load(open(os.path.join(MAN, "gen", "qiymatlar.json"), encoding="utf-8"))

def uz(t):
    t = re.sub(r"([oOgG])'", lambda m: m.group(1) + "‘", t)
    return t.replace("'", "’")

def tok(t):
    t = re.sub(r"\{\{([\w.]+)\}\}", lambda m: ("<<%s>>" % QV[m.group(1)]["v"]) if QV[m.group(1)].get("est") else QV[m.group(1)]["v"], t)
    return re.sub(r"\{[\w,]+\}", "", t)

def cells(line):
    return [uz(tok(x.strip())) for x in line.strip().strip("|").split("|")]

def src_table(fname, caption_start):
    """Manba fayldan jadval: sarlavha qatori va qatorlar (@GEN bo'lsa gen fayldan)."""
    L = open(os.path.join(MAN, fname), encoding="utf-8").read().split("\n")
    i = next(k for k, l in enumerate(L) if l.startswith("TABLE") and caption_start in l)
    head = cells(L[i + 1]); rows = []
    for l in L[i + 2:]:
        if l.startswith("@GEN"):
            rows += [cells(g) for g in open(os.path.join(MAN, "gen", l.split()[1] + ".txt"), encoding="utf-8").read().strip().split("\n") if g.strip()]
        elif l.startswith("|"):
            rows.append(cells(l))
        else:
            break
    return head, rows

def n_est(rows):
    return sum(c.startswith("<<") for r in rows for c in r)

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
for s in ("“Ipoteka bank OTP Group”", "aksiyadorlik tijorat ipoteka banki", "Boshqaruv raisi", "[[F.I.Sh.]]ga"):
    para(s, 13, bold=True, align=R, indent=False)
para("**Dissertatsiya tadqiqoti uchun ma’lumotlar taqdim etish to‘g‘risida**", 13, align=C, indent=False, before=8, after=6)

body = [
 "Guliston davlat universiteti [[mustaqil izlanuvchisi / tayanch doktoranti]] **Djabborov Shuxrat Ergashevich** 08.00.07 – “Moliya, pul muomalasi va kredit” ixtisosligi bo‘yicha “Xorijiy strategik investor ishtirokida tijorat bankining moliyaviy barqarorligini ta’minlash yo‘llari (“Ipoteka-bank” ATIB misolida)” mavzusida iqtisodiyot fanlari bo‘yicha falsafa doktori (PhD) dissertatsiyasi ustida ilmiy tadqiqot olib bormoqda. Tadqiqotda davlat bankining xorijiy strategik investorga sotilishi va undan keyingi integratsiya jarayonining bank moliyaviy barqarorligiga ta’siri bankingiz misolida o‘rganilmoqda.",
 "Tadqiqotda bankingizning MHXS bo‘yicha audit qilingan konsolidatsiyalangan moliyaviy hisobotlari (2019–2025-yillar, 2026-yilning I yarmi), investor taqdimotlari hamda Markaziy bankning banklar kesimidagi statistik ma’lumotlaridan foydalanildi. Biroq ayrim ko‘rsatkichlar – milliy standartlar bo‘yicha 2019-yil uchun muammoli kreditlar ulushi, banklar samaradorligini DEA usulida baholash uchun zarur xarajatlar va resurslar ma’lumotlari, riskka tortilgan aktivlarning valyutalar bo‘yicha tarkibi – ochiq manbalarda e’lon qilinmagan, integratsiya ta’sirini ekspertlar tomonidan baholash uchun esa bank mutaxassislarining fikri zarur. Hozircha dissertatsiyada bu ko‘rsatkichlar o‘rnida dastlabki taxminiy baholar qo‘llanilgan bo‘lib, ularni bank ma’lumotlari bilan almashtirish zarur.",
 "Yuqoridagilarni inobatga olib, ilovada keltirilgan jadvallarning sariq fon bilan belgilangan kataklari bo‘yicha bankda mavjud ma’lumotlarni taqdim etishingizni hamda 3-ilovadagi so‘rovnomani risk-menejment, moliya va kredit bo‘linmalari mutaxassislari tomonidan to‘ldirilishiga ko‘maklashishingizni so‘raymiz. Bank tizimi bo‘yicha ko‘rsatkichlar (1, 2 va 6-ilovalar) bankda (masalan, tahliliy yoki benchmarking materiallarida) mavjud bo‘lsagina taqdim etiladi.",
 "Ma’lumotlar faqat ilmiy maqsadlarda, umumlashtirilgan holda foydalaniladi va uchinchi shaxslarga berilmaydi; mijozlarga oid ma’lumotlar va bank siri hisoblangan ma’lumotlar so‘ralmaydi. Dissertatsiyada ular “bank ma’lumotlari” deb ko‘rsatiladi; bank roziligisiz e’lon qilinmasligi kerak bo‘lgan ma’lumotlar bo‘yicha ko‘rsatma berishingizni so‘raymiz. Ma’lumotlarni elektron shaklda (MS Excel) [[e-mail manzil]] elektron pochta manziliga yuborishingiz mumkin. To‘liq bo‘lmagan ma’lumotlar (ayrim yillar yoki ko‘rsatkichlar bo‘yicha) ham tadqiqot uchun qimmatli hisoblanadi.",
]
for b in body: para(b, 13, spacing=1.05, after=3)
ILOVA_TEXT = "**Ilova:** 8 ta ilova ({nt} ta jadval va so‘rovnoma), {np} varaqda."
ilova_par = para("", 13, indent=True, before=4, after=12)

t = doc.add_table(rows=1, cols=3); t.autofit = False; fix_widths(t, [9.0, 3.5, 4.5])
for j, (txt, al) in enumerate((("**Ilmiy ishlar va innovatsiyalar bo‘yicha prorektor**", L), ("", C), ("[[F.I.Sh.]]", R))):
    c = t.cell(0, j); c.width = Cm([9.0, 3.5, 4.5][j]); runs(c.paragraphs[0], txt, 13); c.paragraphs[0].alignment = al
para("Ijrochi: Sh.E. Djabborov, tel.: [[__________]]", 10, align=L, indent=False, before=14)

NT = 0
def jadval(head, rows, widths, size=9.5, left=(0,), count=True):
    global NT; NT += count
    return table(head, rows, widths, size=size, left=left)

FILLNOTE = "Sariq fonli kataklar – dissertatsiyada taxminiy qiymat qo‘llanilgan, ma’lumot so‘ralayotgan kataklar; qolgan qiymatlar rasmiy manbalardan olingan va solishtirish uchun keltirilgan."

# 1-ilova — bank tizimining asosiy ko'rsatkichlari (2.4-jadval)
h, r = src_table("22.txt", "bank tizimining asosiy ko'rsatkichlari dinamikasi")
ilova(1, "O‘zbekiston bank tizimining asosiy ko‘rsatkichlari dinamikasi (yil yakuniga)", "2.4-jadvali")
jadval(h, r, [4.6] + [1.55] * 8, size=9)
izoh("Manba: Markaziy bankning “Bank tizimi faoliyati ko‘rsatkichlari” statistik ma’lumotlari asosida muallif hisob-kitoblari. " + FILLNOTE +
     " So‘ralayotgan ko‘rsatkich – 2019-yil yakunida bank tizimi bo‘yicha muammoli kreditlar (NPL) ulushi: Markaziy bank banklar kesimidagi NPL ma’lumotlarini 2021-yildan e’lon qiladi. Bankda mavjud bo‘lsa (masalan, Markaziy bank sharhlari yoki bankning tahliliy materiallarida), manbasi bilan taqdim etilishi so‘raladi.")

# 2-ilova — strategiya maqsadli ko'rsatkichlari (2.5-jadval)
h, r = src_table("22.txt", "maqsadli ko'rsatkichlarining bajarilishi")
ilova(2, "2020–2025-yillarga mo‘ljallangan bank tizimini isloh qilish strategiyasi maqsadli ko‘rsatkichlarining bajarilishi", "2.5-jadvali")
jadval(h, r, [5.6, 2.9, 2.0, 3.2, 3.3], size=10)
izoh("Manba: PF-5992-son Farmon va Markaziy bank ma’lumotlari asosida muallif tomonidan tuzilgan. * 2020-yil yakuni. " + FILLNOTE +
     " So‘ralayotgan ko‘rsatkichlar – 2025-yil yakunida bank tizimi majburiyatlarida xususiy sektor mablag‘larining ulushi va bank bo‘lmagan kredit tashkilotlarining kreditlardagi ulushi (bankda mavjud bo‘lsa).")

# 3-ilova — ekspert baholari (2.14-jadval) va so'rovnoma (I-2)
h, r = src_table("23.txt", "ekspertlar tomonidan baholash")
ilova(3, "Xorijiy strategik investor ishtirokining bank barqarorligiga ta’sirini ekspertlar tomonidan baholash (5 balli shkala)", "2.14-jadvali")
r = r + [["Ekspertlar soni, nafar", "<<25>>", "<<25>>", "–"]]
jadval(h, r, [5.6, 3.6, 3.6, 4.2], size=10.5)
izoh("Manba: muallif tomonidan o‘tkazilayotgan ekspert so‘rovi. " + FILLNOTE +
     " Jadval ekspertlar to‘ldirgan so‘rovnomalar (3.2-band) asosida muallif tomonidan hisoblanadi: baholarning o‘rtacha qiymati va ekspertlar fikrining muvofiqligi (Kendall konkordatsiya koeffitsiyenti). Bankning risk-menejment, moliya, kredit va strategiya bo‘linmalaridan 10–15 nafar mutaxassis ishtirok etishi so‘raladi.")
para("**3.2. Ekspert so‘rovnomasi**", 11.5, align=L, indent=False, before=8, after=2, keep=True)
para("Hurmatli ekspert! Ushbu so‘rovnoma xorijiy strategik investor ishtirokining tijorat banki moliyaviy barqarorligiga ta’sirini baholash maqsadida o‘tkazilmoqda. Javoblaringiz anonim, faqat umumlashtirilgan holda ilmiy maqsadlarda foydalaniladi. Baholash shkalasi: 1 – kuchli salbiy ta’sir, 2 – salbiy, 3 – ta’sir yo‘q, 4 – ijobiy, 5 – kuchli ijobiy ta’sir.", 10.5, italic=True, indent=False, after=4, keep=True)
Q = [["1", "Ish joyingiz (bo‘linma) va lavozimingiz", "", ""],
     ["2", "Bank sohasidagi ish stajingiz, yil", "", ""],
     ["3", "Kapital kanali: xorijiy investorning kapital kiritishi va kapitalni boshqarish", "?", "?"],
     ["4", "Korporativ boshqaruv kanali: kuzatuv kengashi, boshqaruv va qarorlar qabul qilishdagi o‘zgarishlar", "?", "?"],
     ["5", "Risk-menejment kanali: guruh standartlari, MHXS 9 bo‘yicha kreditlarni qayta baholash", "?", "?"],
     ["6", "Texnologiya kanali: raqamli xizmatlar, skoring, axborot tizimlarining yangilanishi", "?", "?"],
     ["7", "Bozor (resurs bazasi) kanali: davlat resurslari ulushining qisqarishi, depozit va xalqaro resurslar jalb qilish", "?", "?"],
     ["8", "Integratsiyaning eng katta xavfi nimada?", "", ""],
     ["9", "Keyingi davlat banklarini xususiylashtirish uchun eng muhim saboq nima?", "", ""]]
jadval(["№", "Savol (ta’sir kanali)", "Qisqa muddatli ta’sir (1–2 yil), 1–5", "Uzoq muddatli ta’sir (3–5 yil), 1–5"], Q, [0.8, 10.0, 3.1, 3.1], size=10, left=(1,), count=False)
izoh("8–9-savollarga javob erkin shaklda (alohida varaqda) yoziladi. So‘rovnoma 2.14-jadval va dissertatsiyaning I-2-ilovasiga mos.")

# 4-ilova — rentabellik ko'rsatkichlari (3.2-jadval)
h, r = src_table("31.txt", "rentabellik, samaradorlik va barqarorlik")
ilova(4, "“Ipoteka-bank”ning rentabellik, samaradorlik va barqarorlik ko‘rsatkichlari (MHXS)", "3.2-jadvali")
jadval(h, r, [5.3] + [1.67] * 7, size=9.5)
izoh("Manba: bankning MHXS bo‘yicha audit qilingan hisobotlari asosida muallif hisob-kitoblari; muammoli kreditlar ulushi (milliy standartlar) – Markaziy bank ma’lumotlari. " + FILLNOTE +
     " So‘ralayotgan ko‘rsatkich – 2019-yil yakunida bankning milliy standartlar bo‘yicha muammoli kreditlari (NPL) ulushi: muddati 90 kundan ortiq o‘tgan va qadrsizlangan kreditlar summasi, mlrd so‘m, va ularning kredit portfelidagi ulushi, %.")

# 5-ilova — kredit portfeli sifati (3.5-jadval)
h, r = src_table("31.txt", "kredit portfelining sifat ko'rsatkichlari")
ilova(5, "“Ipoteka-bank” kredit portfelining sifat ko‘rsatkichlari (MHXS)", "3.5-jadvali")
jadval(h, r, [4.6] + [1.55] * 8, size=9)
izoh("Manba: bankning MHXS bo‘yicha audit qilingan hisobotlari asosida muallif hisob-kitoblari; muammoli kreditlar (milliy standartlar) – Markaziy bank ma’lumotlari. * 2026-yil 1-oktabr holatiga. " + FILLNOTE +
     " So‘ralayotgan ko‘rsatkich 4-ilovadagi bilan bir xil (2019-yil, milliy standartlar bo‘yicha NPL ulushi).")

# 6-ilova — DEA (3.11-jadval) va bank bo'yicha DEA o'zgaruvchilari
h, r = src_table("32.txt", "samaradorligini DEA usulida")
ilova(6, "O‘zbekistonning yirik tijorat banklari samaradorligini DEA usulida baholash natijalari (2025-yil)", "3.11-jadvali")
jadval(h, r, [4.6, 3.6, 3.0, 3.0, 2.8], size=10)
izoh("Manba: banklarning moliyaviy hisobotlari asosida muallif hisob-kitoblari. " + FILLNOTE +
     " Samaradorlik ko‘rsatkichlari muallif tomonidan banklarning kirish va chiqish o‘zgaruvchilari (dissertatsiyaning 3.10-jadvali) asosida hisoblanadi. “Ipoteka-bank” bo‘yicha zarur ma’lumotlar 6.2-bandda so‘raladi; boshqa banklar bo‘yicha qiyosiy (benchmarking) ma’lumotlar bankda mavjud bo‘lsa, ular ham so‘raladi.")
para("**6.2. “Ipoteka-bank”ning DEA modeli uchun kirish va chiqish o‘zgaruvchilari (milliy standartlar bo‘yicha, yil yakuniga), mlrd so‘m**", 11, align=L, indent=False, before=8, after=4, keep=True)
YRS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"]
V = [["x₁ – xodimlar xarajatlari (ish haqi va ijtimoiy to‘lovlar)"],
     ["   ma’lumot uchun: xodimlar soni (yil oxiriga), kishi"],
     ["x₂ – jalb qilingan mablag‘lar (depozitlar va qarz mablag‘lari)"],
     ["x₃ – asosiy vositalar va nomoddiy aktivlar (qoldiq qiymati)"],
     ["   ma’lumot uchun: jami operatsion xarajatlar"],
     ["y₁ – kredit portfeli (sof)"],
     ["y₂ – boshqa daromadli aktivlar (qimmatli qog‘ozlar, banklararo joylashtirishlar)"],
     ["y₃ – sof foizsiz daromadlar"]]
V = [[v[0]] + ["?"] * 7 for v in V]
jadval(["Ko‘rsatkich"] + YRS, V, [6.0] + [1.57] * 7, size=9.5)
izoh("Milliy standartlar bo‘yicha ma’lumot so‘ralishiga sabab – boshqa banklar bo‘yicha taqqoslanadigan ma’lumotlar ham milliy standartlar bo‘yicha hisobotlardan olinadi. Mavjud bo‘lmasa, MHXS bo‘yicha ma’lumotlar ham qabul qilinadi (asosini ko‘rsatgan holda).")

# 7-ilova — Malmquist (3.12-jadval)
h, r = src_table("32.txt", "Malmquist mahsuldorlik indeksi dinamikasi")
ilova(7, "“Ipoteka-bank”ning DEA samaradorligi va Malmquist mahsuldorlik indeksi dinamikasi", "3.12-jadvali")
jadval(h, r, [3.6, 2.6, 2.7, 2.7, 2.7, 2.7], size=10)
izoh("Manba: muallif hisob-kitoblari. " + FILLNOTE +
     " Jadval 6.2-banddagi 2019–2025-yillar ma’lumotlari asosida muallif tomonidan qayta hisoblanadi; bank tomonidan alohida to‘ldirilishi talab etilmaydi. Bank tizimi bo‘yicha o‘rtacha indeks uchun bankda boshqa banklar bo‘yicha qiyosiy ma’lumotlar mavjud bo‘lsa, ular so‘raladi.")

# 8-ilova — stress-test (3.3-§ matnidagi taxminiy faraz)
ilova(8, "“Ipoteka-bank”ning riskka tortilgan aktivlari va valyuta pozitsiyasi tarkibi (2025-yil yakuni)", "3.3-paragrafidagi stress-test")
S = [["Riskka tortilgan aktivlar – jami, mlrd so‘m", "?"],
     ["   shu jumladan xorijiy valyutadagi aktivlar bo‘yicha, mlrd so‘m", "?"],
     ["Riskka tortilgan aktivlarda xorijiy valyutadagi qismning ulushi, %", "<<%s>>" % QV["st.fx_share"]["v"]],
     ["Regulyativ kapital – jami, mlrd so‘m", "?"],
     ["Ochiq valyuta pozitsiyasi (barcha valyutalar bo‘yicha), regulyativ kapitalga nisbatan, %", "?"],
     ["So‘mning 25 foizga qadrsizlanishida kapital yetarliligi koeffitsiyenti (bankning ichki stress-testi bo‘yicha, mavjud bo‘lsa), %", "?"]]
jadval(["Ko‘rsatkich", "Qiymati"], S, [13.0, 4.0], size=10.5)
izoh("Dissertatsiyada stress-test (milliy valyutaning 25 foizga qadrsizlanishi ssenariysi) riskka tortilgan aktivlarning xorijiy valyutadagi qismi taxminan " + QV["st.fx_share"]["v"] + " foiz degan faraz asosida hisoblangan (kapital yetarliligi " + QV["st.car_fx"]["v"] + " foizgacha pasayadi). Bank ma’lumotlari bu farazni aniqlashtirish imkonini beradi. " + FILLNOTE)

# ilovalar soni va varaqlar
doc.save(OUT)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", HERE, OUT], capture_output=True)
pdf = OUT.replace(".docx", ".pdf")
np_ = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
runs(ilova_par, ILOVA_TEXT.format(nt=NT, np=np_ - 1), 13)
doc.save(OUT)
subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", HERE, OUT], capture_output=True)
print("Tayyor:", OUT, subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout.split("Pages:")[1].split()[0], "bet;", NT, "jadval")
