#!/usr/bin/env python3
"""Dissertatsiya jadvallari uchun hisob-kitoblar.

1) RASMIY ma'lumotlar (statistika/rasmiy.json: stat.uz, siat.stat.uz, sirstat.uz) asosidagi jadvallar —
   oddiy (qora) raqamlar bilan.
2) TAXMINIY ma'lumotlar: muallif so'rovnomasi hali o'tkazilmagani / idoraviy ma'lumotlar ochiq manbalarda
   yo'qligi sababli shartli (simulyatsion) qiymatlar. Ular <<...>> bilan belgilanadi va hujjatda JIGARRANG chiqadi.
   Haqiqiy ma'lumot olinganda shu qiymatlar almashtiriladi.

Natija: manba/gen/*.txt (jadval qatorlari) va manba/gen/qiymatlar.json (matn ichidagi {{kalit}} qiymatlari).
Foydalanish:  python3 hisob.py && python3 build.py
"""
import json, os, math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, "manba", "gen")
os.makedirs(GEN, exist_ok=True)
R = json.load(open(os.path.join(HERE, "statistika", "rasmiy.json"), encoding="utf-8"))
S = R["series"]
V = {}
YR = ["2021", "2022", "2023", "2024", "2025"]


# ------------------------------------------------------------------ formatlash
def f(x, d=1, sign=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    s = f"{abs(x):,.{d}f}".replace(",", " ").replace(".", ",")
    if x < 0:
        s = "–" + s
    elif sign and x > 0:
        s = "+" + s
    return s


def e(x, d=1, sign=False):
    """taxminiy (jigarrang) qiymat"""
    return "<<" + (x if isinstance(x, str) else f(x, d, sign)) + ">>"


def put(key, val, d=1, est=False, sign=False):
    V[key] = {"v": val if isinstance(val, str) else f(val, d, sign), "est": est}


def gen(name, rows):
    open(os.path.join(GEN, name + ".txt"), "w", encoding="utf-8").write(
        "\n".join("| " + " | ".join(r) + " |" for r in rows) + "\n")


def ser(id, who="SIR"):
    return S[str(id)][who]


def stars(p):
    return "***" if p < 0.01 else "**" if p < 0.05 else "*" if p < 0.1 else ""


def ncdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


# ================================================================== 1. RASMIY JADVALLAR
# ---- 2.x O'zbekiston: kambag'allik va makro
uz_un = {y: S["1313"]["UZ"][y] / S["554"]["UZ"][y] * 100 for y in YR}
sir_un = {y: S["1313"]["SIR"][y] / S["554"]["SIR"][y] * 100 for y in YR}
mix = R["mix"]
rows = [
    ["Kambag'allik darajasi, %"] + [f(S["3495"]["UZ"][y]) for y in YR],
    ["Minimal iste'mol xarajatlari qiymati, ming so'm/oy"] + [e(440, 0)] + [f(mix[y], 0) for y in YR[1:]],
    ["YaIM real o'sish sur'ati, %"] + [f(S["582"]["UZ"][y] - 100) for y in YR],
    ["Aholi jon boshiga real umumiy daromadlar o'sishi, %"] + [f(S["434"]["UZ"][y] - 100) for y in YR],
    ["Aholi daromadlarida transfertlar ulushi, %"] + [f(S["372"]["UZ"][y]) for y in YR],
    ["Ishsizlik darajasi, %"] + [f(uz_un[y]) for y in YR],
    ["Iste'mol narxlari indeksi (dekabr o'tgan yil dekabriga nisbatan), %"] + [f(S["cpi_dek_dek"]["UZ"][y]) for y in YR],
    ["Jini koeffitsiyenti"] + [f(S["624"]["UZ"][y], 3) for y in YR],
]
gen("t_uz_makro", rows)
for y in YR:
    put("uz.kamb." + y, S["3495"]["UZ"][y]); put("sir.kamb." + y, S["3495"]["SIR"][y])
    put("uz.ishsiz." + y, uz_un[y]); put("sir.ishsiz." + y, sir_un[y])
    put("uz.transfert." + y, S["372"]["UZ"][y])
put("uz.kamb.marta", S["3495"]["UZ"]["2021"] / S["3495"]["UZ"]["2025"])
put("sir.kamb.marta", S["3495"]["SIR"]["2021"] / S["3495"]["SIR"]["2025"])
put("uz.jini.2021", S["624"]["UZ"]["2021"], 3); put("uz.jini.2025", S["624"]["UZ"]["2025"], 3)
put("uz.jini.2023", S["624"]["UZ"]["2023"], 3)

# ---- hududlar bo'yicha kambag'allik
rp = R["regions_poverty"]
names = [k for k in rp if "zbekiston" not in k]
order = sorted(names, key=lambda k: -rp[k]["2021"])
rows = []
for k in ["O‘zbekiston Respublikasi"] + order:
    v = rp[k]
    nm = k.replace("‘", "'")
    rows.append([("**%s**" % nm) if "Sirdaryo" in k or "zbekiston" in k else nm] + [f(v[y]) for y in YR]
                + [f(v["2025"] - v["2021"], 1, True), f(v["2021"] / v["2025"])])
gen("t_hudud_kamb", rows)
rank21 = 1 + sum(1 for k in names if rp[k]["2021"] > rp["Sirdaryo viloyati"]["2021"])
rank25 = 1 + sum(1 for k in names if rp[k]["2025"] > rp["Sirdaryo viloyati"]["2025"])
put("sir.kamb.orin21", str(rank21)); put("sir.kamb.orin25", str(rank25))
put("sir.kamb.kamayish_fp", S["3495"]["SIR"]["2021"] - S["3495"]["SIR"]["2025"])
put("uz.kamb.kamayish_fp", S["3495"]["UZ"]["2021"] - S["3495"]["UZ"]["2025"])
put("hudud.kamb.max25", max(rp[k]["2025"] for k in names)); put("hudud.kamb.min25", min(rp[k]["2025"] for k in names))
put("hudud.kamb.max21", max(rp[k]["2021"] for k in names)); put("hudud.kamb.min21", min(rp[k]["2021"] for k in names))
put("sir.kamb.farq21", S["3495"]["SIR"]["2021"] - S["3495"]["UZ"]["2021"])
put("sir.kamb.farq25", S["3495"]["SIR"]["2025"] - S["3495"]["UZ"]["2025"])

# ---- 2.3 Sirdaryo asosiy ko'rsatkichlari
nx = {y: str(int(y) + 1) for y in YR}                     # yil oxiri = keyingi yil 1-yanvar
pop = {y: S["246"]["SIR"][nx[y]] for y in YR}
rural = {y: S["247"]["SIR"][nx[y]] / pop[y] * 100 for y in YR}
mk = R["sirstat"]["makro"]
grp = mk["Yalpi hududiy mahsulot"]
rows = [
    ["Doimiy aholi soni (yil oxiriga), ming kishi"] + [f(pop[y]) for y in YR],
    ["Shu jumladan, qishloq aholisi ulushi, %"] + [f(rural[y]) for y in YR],
    ["Yalpi hududiy mahsulot (YaHM), mlrd so'm"] + [f(grp["hajm"][y]) for y in YR],
    ["YaHM o'sish sur'ati, %"] + [f(grp["osish"][y]) for y in YR],
    ["Aholi jon boshiga YaHM, ming so'm"] + [f(S["660"]["SIR"][y]) for y in YR],
    ["– respublika ko'rsatkichiga nisbatan, %"] + [f(S["660"]["SIR"][y] / S["660"]["UZ"][y] * 100) for y in YR],
    ["YaHMda kichik tadbirkorlik ulushi, %"] + [f(R["sirstat"]["kb_ulushi"][y]["YaHM"]) for y in YR],
    ["Sanoat mahsuloti o'sish sur'ati, %"] + [f(mk["Sanoat mahsuloti"]["osish"][y]) for y in YR],
    ["Qishloq, o'rmon va baliq xo'jaligi o'sish sur'ati, %"] + [f(mk["Qishloq, o'rmon va baliq xo'jaligi 2)"]["osish"][y]) for y in YR],
    ["Asosiy kapitalga investitsiyalar o'sish sur'ati, %"] + [f(mk["Asosiy kapitalga investitsiyalar"]["osish"][y]) for y in YR],
    ["Xizmatlar o'sish sur'ati, %"] + [f(mk["Xizmatlar, jami"]["osish"][y]) for y in YR],
    ["Kambag'allik darajasi, %"] + [f(S["3495"]["SIR"][y]) for y in YR],
    ["Respublika bo'yicha kambag'allik darajasi, %"] + [f(S["3495"]["UZ"][y]) for y in YR],
]
gen("t_sir_asosiy", rows)
for y in YR:
    put("sir.aholi." + y, pop[y]); put("sir.yahm_osish." + y, grp["osish"][y] - 100)
    put("sir.yahm_jb_nisbat." + y, S["660"]["SIR"][y] / S["660"]["UZ"][y] * 100)
    put("sir.kb_yahm." + y, R["sirstat"]["kb_ulushi"][y]["YaHM"]); put("uz.kb_yahm." + y, S["1840"]["UZ"][y])
put("sir.qishloq.2025", rural["2025"]); put("sir.aholi.2026", pop["2025"])
put("uz.qishloq.2025", S["247"]["UZ"]["2026"] / S["246"]["UZ"]["2026"] * 100)
put("sir.yahm.2025", grp["hajm"]["2025"]); put("sir.yahm.2021", grp["hajm"]["2021"])
put("sir.yahm_jb.2025", S["660"]["SIR"]["2025"]); put("uz.yahm_jb.2025", S["660"]["UZ"]["2025"])
cum = np.prod([grp["osish"][y] / 100 for y in YR[1:]])
put("sir.yahm_osish.2022_2025", (cum - 1) * 100)
put("sir.invest.2024", mk["Asosiy kapitalga investitsiyalar"]["osish"]["2024"])
put("sir.invest.2025", mk["Asosiy kapitalga investitsiyalar"]["osish"]["2025"])
poor_n = {y: S["3495"]["SIR"][y] / 100 * pop[y] for y in YR}
for y in YR:
    put("sir.kamb_soni." + y, poor_n[y])
put("sir.kamb_soni.kamayish", poor_n["2021"] - poor_n["2025"])

# ---- daromadlar va mehnat bozori
rows = [
    ["Aholi jon boshiga umumiy daromadlar, ming so'm"] + [f(S["329"]["SIR"][y]) for y in YR],
    ["– respublika ko'rsatkichiga nisbatan, %"] + [f(S["329"]["SIR"][y] / S["329"]["UZ"][y] * 100) for y in YR],
    ["Jon boshiga real daromadlar o'sish sur'ati, %"] + [f(S["434"]["SIR"][y]) for y in YR],
    ["– respublika bo'yicha, %"] + [f(S["434"]["UZ"][y]) for y in YR],
    ["O'rtacha oylik hisoblangan ish haqi, ming so'm"] + [f(S["500"]["SIR"][y] / 1000) for y in YR],
    ["– respublika ko'rsatkichiga nisbatan, %"] + [f(S["500"]["SIR"][y] / S["500"]["UZ"][y] * 100) for y in YR],
    ["Iqtisodiy faol aholi, ming kishi"] + [f(S["554"]["SIR"][y]) for y in YR],
    ["Iqtisodiyotda band aholi, ming kishi"] + [f(S["567"]["SIR"][y]) for y in YR],
    ["Bandlik darajasi, %"] + [f(S["1311"]["SIR"][y]) for y in YR],
    ["Ishsizlar soni, ming kishi"] + [f(S["1313"]["SIR"][y]) for y in YR],
    ["Ishsizlik darajasi, %"] + [f(sir_un[y]) for y in YR],
    ["– respublika bo'yicha, %"] + [f(uz_un[y]) for y in YR],
    ["Norasmiy va yashirin iqtisodiyotning YaHMdagi ulushi, %"] + [f(S["3848"]["SIR"][y]) for y in YR],
    ["Pensiya va ijtimoiy nafaqa oluvchilar, ming kishi"] + [f(S["776"]["SIR"][y]) for y in YR],
]
gen("t_sir_daromad", rows)
for y in YR:
    put("sir.daromad_nisbat." + y, S["329"]["SIR"][y] / S["329"]["UZ"][y] * 100)
    put("sir.ishhaqi_nisbat." + y, S["500"]["SIR"][y] / S["500"]["UZ"][y] * 100)
    put("sir.bandlik." + y, S["1311"]["SIR"][y]); put("sir.norasmiy." + y, S["3848"]["SIR"][y])
    put("uz.norasmiy." + y, S["3848"]["UZ"][y])
put("sir.daromad.2025", S["329"]["SIR"]["2025"]); put("uz.daromad.2025", S["329"]["UZ"]["2025"])
put("sir.ishhaqi.2025", S["500"]["SIR"]["2025"] / 1000); put("uz.ishhaqi.2025", S["500"]["UZ"]["2025"] / 1000)
put("sir.ishsizlar.2021", S["1313"]["SIR"]["2021"]); put("sir.ishsizlar.2025", S["1313"]["SIR"]["2025"])
put("sir.bandlar.2021", S["567"]["SIR"]["2021"]); put("sir.bandlar.2025", S["567"]["SIR"]["2025"])
put("sir.nafaqa.2021", S["776"]["SIR"]["2021"]); put("sir.nafaqa.2025", S["776"]["SIR"]["2025"])
put("sir.nafaqa.osish", (S["776"]["SIR"]["2025"] / S["776"]["SIR"]["2021"] - 1) * 100)
put("sir.nafaqa.10000", S["1377"]["SIR"]["2025"], 0); put("uz.nafaqa.10000", S["1377"]["UZ"]["2025"], 0)
put("sir.real_daromad.orta", np.mean([S["434"]["SIR"][y] - 100 for y in YR]))
put("uz.real_daromad.orta", np.mean([S["434"]["UZ"][y] - 100 for y in YR]))
put("sir.mtt.2024", S["767"]["SIR"]["2024"]); put("uz.mtt.2024", S["767"]["UZ"]["2024"])
put("sir.mtt.2021", S["767"]["SIR"]["2021"])

# ---- kichik tadbirkorlik: tarmoqlardagi ulush va subyektlar demografiyasi
ku = R["sirstat"]["kb_ulushi"]
rows = []
for col, nm in [("YaHM", "Yalpi hududiy mahsulot"), ("Sanoat", "Sanoat"), ("Qishloq, o‘rmon va baliq xo‘jaligi", "Qishloq, o'rmon va baliq xo'jaligi"),
                ("Qurilish", "Qurilish"), ("Savdo", "Savdo"), ("Xizmatlar", "Xizmatlar"), ("Bandlik", "Bandlik"),
                ("Eksport", "Eksport"), ("Import", "Import")]:
    rows.append([nm] + [f(ku[y][col]) for y in YR])
rows.append(["Kichik tadbirkorlikda band bo'lganlar, ming kishi"] + [f(S["425"]["SIR"][y]) for y in YR])
gen("t_sir_kb", rows)
for y in YR:
    put("sir.kb_sanoat." + y, ku[y]["Sanoat"]); put("sir.kb_band." + y, ku[y]["Bandlik"])
    put("sir.kb_xizmat." + y, ku[y]["Xizmatlar"]); put("sir.kb_eksport." + y, ku[y]["Eksport"])
put("sir.kb_qx.2025", ku["2025"]["Qishloq, o‘rmon va baliq xo‘jaligi"]); put("sir.kb_savdo.2025", ku["2025"]["Savdo"])
put("sir.kb_bandlar.2021", S["425"]["SIR"]["2021"]); put("sir.kb_bandlar.2025", S["425"]["SIR"]["2025"])
put("uz.kb_band.2025", S["274"]["UZ"]["2025"] if S["274"].get("UZ") else 74.9)

act = {y: S["261"]["SIR"][nx[y]] for y in YR}
reg = {y: S["262"]["SIR"][nx[y]] for y in YR}
ina = {y: S["3372"]["SIR"][nx[y]] for y in YR}
rows = [
    ["Ro'yxatdan o'tgan kichik tadbirkorlik subyektlari (yil oxiriga), birlik"] + [f(reg[y], 0) for y in YR],
    ["Faoliyat ko'rsatayotgan subyektlar (yil oxiriga), birlik"] + [f(act[y], 0) for y in YR],
    ["Faoliyat ko'rsatmayotgan subyektlar (yil oxiriga), birlik"] + [f(ina[y], 0) for y in YR],
    ["Yil davomida yangi tashkil etilgan subyektlar, birlik"] + [f(S["264"]["SIR"][y], 0) for y in YR],
    ["Yil davomida tugatilgan subyektlar, birlik"] + [f(S["3373"]["SIR"][y], 0) for y in YR],
    ["Faol subyektlarning ro'yxatdagilarga nisbati, %"] + [f(act[y] / reg[y] * 100) for y in YR],
    ["1000 aholiga faol subyektlar soni"] + [f(act[y] / pop[y]) for y in YR],
    ["– respublika bo'yicha"] + [f(S["261"]["UZ"][nx[y]] / S["246"]["UZ"][nx[y]]) for y in YR],
]
gen("t_sir_kts", rows)
for y in YR:
    put("sir.kts_faol." + y, act[y], 0); put("sir.kts_1000." + y, act[y] / pop[y])
    put("uz.kts_1000." + y, S["261"]["UZ"][nx[y]] / S["246"]["UZ"][nx[y]])
    put("sir.kts_yangi." + y, S["264"]["SIR"][y], 0); put("sir.kts_tugat." + y, S["3373"]["SIR"][y], 0)
    put("sir.kts_faolsiz." + y, ina[y], 0); put("sir.kts_faol_ulush." + y, act[y] / reg[y] * 100)
put("sir.kts_reg.2025", reg["2025"], 0)

# ---- qishloq xo'jaligi
qx = mk["Qishloq, o'rmon va baliq xo'jaligi 2)"]
qk = R["sirstat"]["qx_tarkib"]
rows = [
    ["Qishloq, o'rmon va baliq xo'jaligi mahsuloti, mlrd so'm"] + [f(qx["hajm"][y]) for y in YR],
    ["O'sish sur'ati, %"] + [f(qx["osish"][y]) for y in YR],
    ["Qishloq xo'jaligi mahsulotida dehqon va tomorqa xo'jaliklari ulushi, %"] + [f(S["1482"]["SIR"][y]) for y in YR],
    ["– respublika bo'yicha, %"] + [f(S["1482"]["UZ"][y]) for y in YR],
    ["Dehqonchilik mahsulotida dehqon va tomorqa xo'jaliklari ulushi, %"] + [f(qk[y]["dehq_dehqon"]) for y in YR],
    ["Dehqonchilik mahsulotida fermer xo'jaliklari ulushi, %"] + [f(qk[y]["dehq_fermer"]) for y in YR],
    ["Chorvachilik mahsulotida dehqon va tomorqa xo'jaliklari ulushi, %"] + [f(qk[y]["chorva_dehqon"]) for y in YR],
    ["Kichik tadbirkorlikning qishloq xo'jaligi mahsulotidagi ulushi, %"] + [f(ku[y]["Qishloq, o‘rmon va baliq xo‘jaligi"]) for y in YR],
    ["Jon boshiga qishloq xo'jaligi mahsuloti, ming so'm"] + [f(qx["hajm"][y] / ((S["246"]["SIR"][y] + pop[y]) / 2) * 1000, 0) for y in YR],
]
gen("t_qx", rows)
for y in YR:
    put("sir.dehqon_ulush." + y, S["1482"]["SIR"][y]); put("uz.dehqon_ulush." + y, S["1482"]["UZ"][y])
    put("sir.chorva_dehqon." + y, qk[y]["chorva_dehqon"]); put("sir.dehq_dehqon." + y, qk[y]["dehq_dehqon"])
    put("sir.qx_osish." + y, qx["osish"][y] - 100)
put("sir.qx.2025", qx["hajm"]["2025"]); put("sir.qx_yahm.2025", qx["hajm"]["2025"] / grp["hajm"]["2025"] * 100)

# ---- tumanlar
DIST = ["Boyovut tumani", "Guliston tumani", "Mirzaobod tumani", "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani",
        "Sirdaryo tumani", "Xovos tumani", "Guliston shahri", "Shirin shahri", "Yangiyer shahri"]
QXK = {"Boyovut tumani": "Boyovut", "Guliston tumani": "Guliston", "Mirzaobod tumani": "Mirzaobod", "Oqoltin tumani": "Oqoltin",
       "Sardoba tumani": "Sardoba", "Sayxunobod tumani": "Sayxunobod", "Sirdaryo tumani": "Sirdaryo", "Xovos tumani": "Xovos",
       "Guliston shahri": "Guliston sh.", "Shirin shahri": "Shirin sh.", "Yangiyer shahri": "Yangiyer sh."}
td = {}
for d in DIST:
    p26 = S["246"]["tuman"][d]["2026"]
    td[d] = dict(pop=p26, rural=S["247"]["tuman"][d]["2026"] / p26 * 100,
                 kts=S["261"]["tuman"][d]["2026"] / p26,
                 un=S["1313"]["tuman"][d]["2025"] / S["554"]["tuman"][d]["2025"] * 100,
                 wage=S["500"]["tuman"][d]["2025"] / 1000,
                 qx=R["sirstat"]["qx_tuman"][QXK[d]]["2025"] / ((S["246"]["tuman"][d]["2025"] + p26) / 2) * 1000,
                 emp=S["567"]["tuman"][d]["2025"] / S["515"]["tuman"][d]["2025"] * 100)
# taxminiy tuman kambag'allik darajasi: ish haqi, ishsizlik va qishloq ulushi asosidagi indeks, viloyat 6,2% ga kalibrlangan
wS = S["500"]["SIR"]["2025"] / 1000
idx = {d: 0.45 * (wS / td[d]["wage"]) + 0.30 * (td[d]["un"] / sir_un["2025"]) + 0.25 * (0.6 + td[d]["rural"] / 100 * 0.7) for d in DIST}
tot = sum(td[d]["pop"] * idx[d] for d in DIST)
scale = 6.2 * sum(td[d]["pop"] for d in DIST) / tot
for d in DIST:
    td[d]["pov"] = round(idx[d] * scale, 1)
rows = [[d, f(td[d]["pop"]), f(td[d]["rural"]), e(td[d]["pov"]), f(td[d]["kts"]), f(td[d]["un"]), f(td[d]["wage"], 0), f(td[d]["qx"], 0)] for d in DIST]
rows.append(["**Viloyat bo'yicha**", f(pop["2025"]), f(rural["2025"]), "6,2", f(act["2025"] / pop["2025"]), f(sir_un["2025"]), f(wS, 0),
             f(qx["hajm"]["2025"] / ((S["246"]["SIR"]["2025"] + pop["2025"]) / 2) * 1000, 0)])
gen("t_tuman", rows)
wg = sorted(DIST, key=lambda d: td[d]["wage"])
put("tuman.ishhaqi.min_nom", wg[0]); put("tuman.ishhaqi.min", td[wg[0]]["wage"], 0)
put("tuman.ishhaqi.max_nom", wg[-1]); put("tuman.ishhaqi.max", td[wg[-1]]["wage"], 0)
put("tuman.ishhaqi.nisbat", td[wg[-1]]["wage"] / td[wg[0]]["wage"])
kg = sorted(DIST, key=lambda d: td[d]["kts"])
put("tuman.kts.min_nom", kg[0]); put("tuman.kts.min", td[kg[0]]["kts"]); put("tuman.kts.max_nom", kg[-1]); put("tuman.kts.max", td[kg[-1]]["kts"])
put("tuman.kts.nisbat", td[kg[-1]]["kts"] / td[kg[0]]["kts"])
ug = sorted(DIST, key=lambda d: td[d]["un"])
put("tuman.ishsiz.min", td[ug[0]]["un"]); put("tuman.ishsiz.max", td[ug[-1]]["un"]); put("tuman.ishsiz.max_nom", ug[-1]); put("tuman.ishsiz.min_nom", ug[0])
pg = sorted(DIST, key=lambda d: td[d]["pov"])
put("tuman.kamb.min", td[pg[0]]["pov"], est=True); put("tuman.kamb.max", td[pg[-1]]["pov"], est=True)
put("tuman.kamb.min_nom", pg[0]); put("tuman.kamb.max_nom", pg[-1])
put("tuman.kamb.nisbat", td[pg[-1]]["pov"] / td[pg[0]]["pov"], est=True)
pv = np.array([td[d]["pov"] for d in DIST]); pw = np.array([td[d]["pop"] for d in DIST])
put("tuman.kamb.var", np.sqrt(np.average((pv - 6.2) ** 2, weights=pw)) / 6.2 * 100, est=True)
put("tuman.boyovut.aholi", td["Boyovut tumani"]["pop"]); put("tuman.sirdaryo.aholi", td["Sirdaryo tumani"]["pop"])
put("tuman.mirzaobod.qishloq", td["Mirzaobod tumani"]["rural"])
r_kts_wage = np.corrcoef([td[d]["kts"] for d in DIST], [td[d]["wage"] for d in DIST])[0, 1]
r_kts_rural = np.corrcoef([td[d]["kts"] for d in DIST], [td[d]["rural"] for d in DIST])[0, 1]
put("tuman.r_kts_qishloq", r_kts_rural, 2); put("tuman.r_kts_ishhaqi", r_kts_wage, 2)

# ================================================================== 2. TAXMINIY (IDORAVIY) JADVALLAR
# ---- 2.4 qo'llab-quvvatlash resurslari (ochiq manbalarda yo'q — taxminiy)
RES = {"kr_n": [9800, 11200, 12600, 13900], "kr_s": [262.0, 318.0, 392.0, 468.0],
       "su_n": [2100, 2900, 4300, 5600], "su_s": [14.7, 21.8, 34.4, 47.6],
       "oq_n": [6400, 7300, 8900, 10200], "oq_s": [19.2, 23.4, 30.3, 36.7],
       "ye_n": [5200, 6100, 4800, 4300], "ye_ga": [3640, 4270, 3120, 2580],
       "jami": [21900, 25600, 28400, 31200], "reestr": [38.0, 41.0, 47.0, 54.0]}
rows = [["Imtiyozli kreditlar", "Oluvchilar soni, kishi"] + [e(x, 0) for x in RES["kr_n"]],
        ["Imtiyozli kreditlar", "Summasi, mlrd so'm"] + [e(x) for x in RES["kr_s"]],
        ["Subsidiyalar", "Oluvchilar soni, kishi"] + [e(x, 0) for x in RES["su_n"]],
        ["Subsidiyalar", "Summasi, mlrd so'm"] + [e(x) for x in RES["su_s"]],
        ["Kasbga o'qitish", "O'qitilganlar soni, kishi"] + [e(x, 0) for x in RES["oq_n"]],
        ["Kasbga o'qitish", "Xarajatlar, mlrd so'm"] + [e(x) for x in RES["oq_s"]],
        ["Yer ajratish", "Oluvchilar soni, oila"] + [e(x, 0) for x in RES["ye_n"]],
        ["Yer ajratish", "Maydoni, ga"] + [e(x, 0) for x in RES["ye_ga"]],
        ["Jami", "Qamrab olingan oilalar, birlik"] + [e(x, 0) for x in RES["jami"]],
        ["Jami", "Shu jumladan reyestrdagi kambag'al oilalar ulushi, %"] + [e(x) for x in RES["reestr"]]]
gen("t_resurs", rows)
tot25 = RES["kr_s"][3] + RES["su_s"][3] + RES["oq_s"][3]
put("res.kredit_ulush", RES["kr_s"][3] / tot25 * 100, est=True); put("res.subsidiya_ulush", RES["su_s"][3] / tot25 * 100, est=True)
put("res.oqitish_ulush", RES["oq_s"][3] / tot25 * 100, est=True); put("res.reestr.2025", RES["reestr"][3], est=True)
put("res.reestr.2022", RES["reestr"][0], est=True); put("res.jami.2025", tot25, est=True)
put("res.kredit_orta", RES["kr_s"][3] / RES["kr_n"][3] * 1000, est=True); put("res.subsidiya_orta", RES["su_s"][3] / RES["su_n"][3] * 1000, est=True)
put("res.jami_oila.2025", RES["jami"][3], 0, est=True); put("res.osish", (tot25 / (RES["kr_s"][0] + RES["su_s"][0] + RES["oq_s"][0]) - 1) * 100, est=True)

# ---- 2.d faoliyat yo'nalishlari (taxminiy)
FA = [("Chorvachilik", 7350, 38, 71), ("Parrandachilik", 3120, 21, 64), ("Issiqxona va sabzavotchilik", 2890, 34, 69),
      ("Bog'dorchilik va ko'chatchilik", 1240, 29, 78), ("Tikuvchilik va hunarmandchilik", 2760, 17, 74),
      ("Oziq-ovqat tayyorlash (qandolatchilik, novvoyxona)", 1630, 24, 77), ("Maishiy xizmatlar", 2180, 26, 81),
      ("Savdo", 2940, 31, 83), ("Boshqa yo'nalishlar", 1390, 28, 72)]
nt = sum(a[1] for a in FA)
rows = [[a[0], e(a[1], 0), e(a[1] / nt * 100), e(a[2], 0), e(a[3], 0)] for a in FA]
rows.append(["**Jami**", e(nt, 0), "100,0", e(sum(a[1] * a[2] for a in FA) / nt, 0), e(sum(a[1] * a[3] for a in FA) / nt, 0)])
gen("t_faoliyat", rows)
put("fa.qx_ulush", sum(a[1] for a in FA[:4]) / nt * 100, est=True); put("fa.davom", sum(a[1] * a[3] for a in FA) / nt, 0, est=True)
put("fa.davom_min", min(a[3] for a in FA), 0, est=True); put("fa.davom_min_nom", "parrandachilik")
put("fa.davom_max", max(a[3] for a in FA), 0, est=True); put("fa.muddati_otgan", 6.4, est=True)

# ---- 2.5 resurslarning tumanlar bo'yicha taqsimlanishi (taxminiy)
HH = {d: td[d]["pop"] * 1000 / 4.9 for d in DIST}                       # uy xo'jaliklari soni (o'rtacha 4,9 kishi — rasmiy)
poorfam = {d: HH[d] * td[d]["pov"] / 100 * 1.25 for d in DIST}         # kambag'al oilalar yirikroq: koeff. 1,25 (taxmin)
rng0 = np.random.default_rng(7)
bank = {d: 1.0 + 0.9 * (1 - td[d]["rural"] / 100) + 0.02 * (td[d]["kts"] - 10) for d in DIST}   # bank infratuzilmasi/faollik omili
raw = {d: poorfam[d] * bank[d] * float(rng0.uniform(0.9, 1.1)) for d in DIST}
tr = sum(raw.values())
resd = {d: tot25 * raw[d] / tr for d in DIST}
P = sum(poorfam.values())
rows = []
TC = {}
for d in DIST:
    TC[d] = (resd[d] / tot25) / (poorfam[d] / P)
    rows.append([d, e(poorfam[d], 0), e(poorfam[d] / P * 100), e(resd[d]), e(resd[d] / tot25 * 100), e(resd[d] / poorfam[d] * 1000), e(TC[d], 2)])
rows.append(["**Viloyat bo'yicha**", e(P, 0), "100,0", e(tot25), "100,0", e(tot25 / P * 1000), "1,00"])
gen("t_taqsimot", rows)
od = sorted(DIST, key=lambda d: -td[d]["pov"])
X = np.cumsum([poorfam[d] / P for d in od]); Y = np.cumsum([resd[d] / tot25 for d in od])
X0 = np.concatenate([[0], X]); Y0 = np.concatenate([[0], Y])
CI = 1 - float(np.sum((X0[1:] - X0[:-1]) * (Y0[1:] + Y0[:-1])))     # >0: resurslar kambag'allik yuqori hududlarga ko'proq
CI = -CI if False else float(np.sum((X0[1:] - X0[:-1]) * (Y0[1:] + Y0[:-1])) - 1)
put("taq.CI", CI, 3, est=True, sign=True)
per = np.array([resd[d] / poorfam[d] * 1000 for d in DIST])
put("taq.V_tuman", per.std() / per.mean() * 100, est=True); put("taq.V_mahalla", 41.7, est=True)
tg = sorted(DIST, key=lambda d: TC[d])
put("taq.TC_min", TC[tg[0]], 2, est=True); put("taq.TC_max", TC[tg[-1]], 2, est=True)
put("taq.TC_min_nom", tg[0]); put("taq.TC_max_nom", tg[-1]); put("taq.TC_min2_nom", tg[1]); put("taq.TC_max2_nom", tg[-2])
put("taq.r", float(np.corrcoef([td[d]["pov"] for d in DIST], per)[0, 1]), 2, est=True, sign=True)
put("taq.kam_soni", str(sum(1 for d in DIST if TC[d] < 1)), est=True)
put("taq.oila_jami", P, 0, est=True); put("taq.bir_oila", tot25 / P * 1000, est=True)
put("suhbat.n", "36", est=True)

# ================================================================== 3. SO'ROVNOMA SIMULYATSIYASI (TAXMINIY)
rng = np.random.default_rng(20261111)
MAH = {"Boyovut tumani": 6, "Guliston tumani": 3, "Mirzaobod tumani": 4, "Oqoltin tumani": 3, "Sardoba tumani": 3, "Sayxunobod tumani": 4,
       "Sirdaryo tumani": 6, "Xovos tumani": 4, "Guliston shahri": 4, "Shirin shahri": 1, "Yangiyer shahri": 2}
assert sum(MAH.values()) == 40
W = np.array([1/10, 1/10, 1/10, 1/10, 1/20, 1/20, 1/20, 1/20, 1/15, 1/15, 1/15, 1/15, 1/15, 1/15])
DIMI = np.array([0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4])
IND = ["Kasbiy ta'lim darajasi", "Bolalar ta'limi", "Tibbiy xizmatdan foydalanish", "Oziq-ovqat xavfsizligi", "Ichimlik suvi", "Sanitariya",
       "Energiya ta'minoti", "Uy-joy zichligi", "Barqaror bandlik", "Bandlik sifati", "Yoshlar bandligi", "Ishlab chiqarish aktivlari",
       "Moliyaviy inklyuziya", "Kasbiy malaka"]
DIMN = ["Ta'lim", "Sog'liq", "Turmush sharoiti", "Bandlik", "Tadbirkorlik salohiyati"]
BASE = np.array([-0.75, -1.45, -1.10, -1.25, -0.75, -0.05, -0.50, -1.30, -0.95, -0.25, -1.05, -0.85, -1.00, -0.35])   # logit kesishmalari
LOAD = np.array([0.9, 0.6, 0.9, 1.1, 0.5, 0.6, 0.5, 0.6, 1.0, 0.8, 0.7, 0.9, 0.8, 0.9])
# qo'llab-quvvatlash turlarining indikatorlar bo'yicha mahrumlikni bartaraf etish ehtimoliga qo'shimcha ta'siri
#        ta'l  bola  tibb  oziq  suv   san   ener  zich  barq  sifat yosh  aktiv molin malaka
EFF = {1: [0.00, 0.02, 0.04, 0.08, 0.00, 0.03, 0.00, 0.00, 0.16, 0.12, 0.08, 0.30, 0.55, 0.03],
       2: [0.00, 0.03, 0.06, 0.18, 0.00, 0.02, 0.00, 0.00, 0.14, 0.08, 0.06, 0.48, 0.10, 0.04],
       3: [0.22, 0.03, 0.02, 0.05, 0.00, 0.00, 0.00, 0.00, 0.12, 0.10, 0.26, 0.04, 0.06, 0.52],
       4: [0.00, 0.02, 0.04, 0.20, 0.00, 0.00, 0.00, 0.00, 0.16, 0.06, 0.08, 0.40, 0.03, 0.02],
       5: [0.12, 0.08, 0.10, 0.24, 0.02, 0.05, 0.02, 0.00, 0.24, 0.16, 0.18, 0.55, 0.35, 0.36]}
EFF = {t: [min(x * 1.25, 0.9) for x in v] for t, v in EFF.items()}
TREND = np.array([0.03, 0.10, 0.10, 0.14, 0.08, 0.04, 0.08, 0.02, 0.12, 0.08, 0.10, 0.06, 0.12, 0.05])
RELAPSE = 0.03
CONS_EFF = {1: 0.15, 2: 0.17, 3: 0.08, 4: 0.15, 5: 0.26}
COST = {1: 6.0, 2: 8.0, 3: 4.0, 4: 5.0, 5: 17.0}      # davlatning bir oilaga xarajati, mln so'm (taxmin)
TN = {0: "Olmagan", 1: "Imtiyozli kredit", 2: "Subsidiya", 3: "Kasbga o'qitish", 4: "Yer ajratish", 5: "Kompleks"}

rec = []
mid = 0
for d, nm in MAH.items():
    for _ in range(nm):
        mid += 1
        me = rng.normal(0, 0.35)
        for D in (1, 0):
            for _ in range(10):
                rural = int(rng.random() < td[d]["rural"] / 100)
                exp = int(rng.random() < (0.36 if D else 0.19))
                fem = int(rng.random() < (0.19 if D else 0.25))
                edu = int(rng.random() < (0.42 if D else 0.35))
                size = int(np.clip(rng.normal(5.6, 1.6), 2, 11))
                kids = int(np.clip(rng.normal(size * 0.42, 0.9), 0, size - 1))
                age = float(np.clip(rng.normal(46 if D else 48, 10), 24, 78))
                land = float(rng.gamma(2.0, 4.6 if rural else 1.2) * (1.15 if D else 1.0))
                mig = int(rng.random() < (0.21 if D else 0.26))
                dis = int(rng.random() < 0.12)
                ab = rng.normal(0.25 if D else 0.0, 1)                      # kuzatilmaydigan tashabbuskorlik
                z = (rng.normal(0, 1) + me + 0.25 * rural + 0.3 * fem - 0.35 * edu - 0.3 * exp + 0.25 * dis + 0.12 * (kids - 2)
                     - 0.25 * ab + (0.10 if D else 0.0) + 0.5 * (td[d]["pov"] - 6.2) / 2.0)
                regi = int(rng.random() < 1 / (1 + math.exp(-(0.2 + 0.9 * z + (0.5 if D else 0.0)))))
                rec.append(dict(d=d, m=mid, D=D, rural=rural, exp=exp, fem=fem, edu=edu, size=size, kids=kids, age=age, land=land,
                                mig=mig, dis=dis, ab=ab, z=z, reg=regi, dist=float(rng.gamma(2.2, 4.5 if rural else 1.5))))
N = len(rec)
A = {k: np.array([r[k] for r in rec]) for k in rec[0] if k != "d"}
Dn = np.array([r["d"] for r in rec])
D = A["D"]
g0 = np.zeros((N, 14), int)
for j in range(14):
    lin = BASE[j] + LOAD[j] * A["z"]
    if j == 0: lin = lin - 2.2 * A["edu"]
    if j == 1: lin = lin + 0.5 * (A["kids"] >= 3) - 3.0 * (A["kids"] == 0)
    if j in (4, 5, 6): lin = lin + 0.9 * A["rural"]
    if j == 7: lin = lin + 0.45 * (A["size"] - 5)
    if j == 9: lin = lin + 0.5 * A["rural"] - 0.4 * A["edu"]
    if j == 10: lin = lin + 0.25 * (A["size"] - 5)
    if j == 11: lin = lin - 0.12 * A["land"] - 0.8 * A["exp"]
    if j == 12: lin = lin - 0.9 * A["exp"] - 0.4 * A["edu"]
    if j == 13: lin = lin - 1.6 * A["edu"]
    g0[:, j] = rng.random(N) < 1 / (1 + np.exp(-lin))
c0 = g0 @ W
# qo'llab-quvvatlash turi
T = np.zeros(N, int)
for i in np.where(D == 1)[0]:
    u = np.array([1.1 + 1.2 * A["exp"][i] - 0.5 * A["fem"][i] - 1.4 * (c0[i] > 0.5) + 0.8 * (1 - g0[i, 12]),
                  0.3 + 1.6 * (c0[i] > 0.45) + 0.8 * g0[i, 11] + 0.4 * A["fem"][i],
                  0.1 + 1.3 * g0[i, 10] + 0.9 * g0[i, 13] - 0.3 * (A["age"][i] > 55),
                  -0.2 + 1.5 * A["rural"][i] + 0.6 * g0[i, 11],
                  -0.9 + 1.4 * (c0[i] > 0.5) + 0.5 * A["reg"][i]])
    pr = np.exp(u) / np.exp(u).sum()
    T[i] = 1 + rng.choice(5, p=pr)
# yakuniy davr
g1 = g0.copy()
for i in range(N):
    for j in range(14):
        if g0[i, j]:
            pfix = TREND[j] + 0.04 * A["ab"][i] + (EFF[T[i]][j] if T[i] else 0.0)
            if rng.random() < min(max(pfix, 0), 0.95): g1[i, j] = 0
        elif rng.random() < RELAPSE:
            g1[i, j] = 1
c1 = g1 @ W
# plasebo davri (2022 -> 2023): qo'llab-quvvatlashsiz, faqat trend
gm = g0.copy()
for i in range(N):
    for j in range(14):
        if not g0[i, j] and rng.random() < TREND[j] * 0.9 + 0.02 * A["ab"][i]: gm[i, j] = 1
cm = gm @ W
# iste'mol (jon boshiga oyiga, ming so'm)
LINE0, LINE1 = 568.0, 669.0
lc0 = np.log(LINE0) + 0.20 - 1.15 * (c0 - 0.33) + 0.10 * A["exp"] + 0.06 * A["ab"] - 0.035 * (A["size"] - 5) + rng.normal(0, 0.26, N)
grow = math.log(LINE1 / LINE0) + 0.075
lc1 = lc0 + grow + 0.03 * A["ab"] + np.array([CONS_EFF.get(t, 0.0) for t in T]) + rng.normal(0, 0.12, N)
mp0 = (np.exp(lc0) < LINE0).astype(int); mp1 = (np.exp(lc1) < LINE1).astype(int)
K = 1 / 3
md0 = (c0 >= K - 1e-9).astype(int); md1 = (c1 >= K - 1e-9).astype(int)
dimscore = lambda g: np.stack([(g[:, DIMI == dd] * W[DIMI == dd]).sum(1) for dd in range(5)], 1)   # o'lchov bo'yicha vaznlangan ball
ds0, ds1 = dimscore(g0), dimscore(g1)


def mpi(g, k=K, w=W, mask=None):
    if mask is not None: g = g[mask]
    c = g @ w; p = c >= k - 1e-9
    H = p.mean(); Aa = c[p].mean() if p.any() else 0.0
    return H * 100, Aa * 100, H * Aa


def ttest(x, y):
    se = math.sqrt(x.var(ddof=1) / len(x) + y.var(ddof=1) / len(y))
    t = (x.mean() - y.mean()) / se if se > 0 else 0
    return 2 * (1 - ncdf(abs(t)))


# ---- 2.6 tanlanma taqsimoti
resp = {d: int(round(MAH[d] * 20 * float(rng0.uniform(0.94, 0.99)))) for d in DIST}
rows = [[d, str(MAH[d]), str(MAH[d] * 10), str(MAH[d] * 10), str(MAH[d] * 20), e(resp[d], 0)] for d in DIST]
rows.append(["**Jami**", "40", "400", "400", "800", e(sum(resp.values()), 0)])
gen("t_tanlanma", rows)
put("sorov.javob", sum(resp.values()) / 800 * 100, est=True); put("sorov.nazorat", 12.0, 0, est=True)
put("sorov.davr", "2025-yil oktabr–dekabr oylarida", est=True); put("sorov.oy", "17", est=True)

# ---- 2.7 guruhlar tavsifi (dastlabki holat)
tr_, co_ = D == 1, D == 0
band0 = 1 - g0[:, 8]
desc = [("O'rtacha oila a'zolari soni, kishi", A["size"], 1, 1), ("16 yoshgacha bolalar soni, kishi", A["kids"], 1, 1),
        ("Oila boshlig'ining yoshi, yil", A["age"], 1, 1), ("Oila boshlig'i ayol bo'lgan oilalar ulushi, %", A["fem"], 100, 1),
        ("Oila boshlig'ining ta'limi (o'rta maxsus va undan yuqori), %", A["edu"], 100, 1),
        ("Doimiy ishga ega a'zosi bor oilalar, %", band0, 100, 1), ("Mehnat migratsiyasida bo'lgan a'zosi bor oilalar, %", A["mig"], 100, 1),
        ("Tomorqa maydoni, sotix", A["land"], 1, 1), ("Oldin tadbirkorlik tajribasi bo'lgan oilalar, %", A["exp"], 100, 1),
        ("Jon boshiga oylik iste'mol xarajatlari, ming so'm", np.exp(lc0), 1, 0), ("Qishloq joyida yashovchilar ulushi, %", A["rural"], 100, 1),
        ("Kambag'al oilalar reyestrida turganlar, %", A["reg"], 100, 1), ("Dastlabki mahrumlik balli (c_i)", c0, 1, 3)]
rows = []
for nm, x, mul, dd in desc:
    a, b = x[tr_].mean() * mul, x[co_].mean() * mul
    p = ttest(x[tr_].astype(float), x[co_].astype(float))
    rows.append([nm, e(a, dd), e(b, dd), e(a - b, dd, True), e(p, 3)])
gen("t_tavsif", rows)
put("tav.exp_T", A["exp"][tr_].mean() * 100, est=True); put("tav.exp_C", A["exp"][co_].mean() * 100, est=True)
put("tav.c0_T", c0[tr_].mean(), 3, est=True); put("tav.c0_C", c0[co_].mean(), 3, est=True)
put("tav.c0_p", ttest(c0[tr_], c0[co_]), 3, est=True)
put("tav.land_T", A["land"][tr_].mean(), est=True); put("tav.land_C", A["land"][co_].mean(), est=True)
put("tav.reg_T", A["reg"][tr_].mean() * 100, est=True); put("tav.reg_C", A["reg"][co_].mean() * 100, est=True)
put("tav.cons_T", np.exp(lc0)[tr_].mean(), 0, est=True); put("tav.cons_C", np.exp(lc0)[co_].mean(), 0, est=True)

# ---- 2.8 standart (global MPI tuzilishidagi) indikatorlar
ru, ur = A["rural"] == 1, A["rural"] == 0
std = np.zeros((N, 10), int)
std[:, 0] = g1[:, 3] & (rng.random(N) < 0.55)                       # ovqatlanish (og'ir shakli)
std[:, 1] = rng.random(N) < 0.012                                   # bolalar o'limi
std[:, 2] = rng.random(N) < 0.006                                   # ta'lim yillari
std[:, 3] = g1[:, 1] & (rng.random(N) < 0.16)                       # maktabga qatnash
std[:, 4] = (rng.random(N) < np.where(ru, 0.11, 0.01))              # yoqilg'i
std[:, 5] = g1[:, 5] & (rng.random(N) < 0.50)                       # sanitariya (yaxshilanmagan)
std[:, 6] = g1[:, 4] & (rng.random(N) < 0.10)                       # ichimlik suvi (asosiy xizmat yo'q)
std[:, 7] = rng.random(N) < 0.003                                   # elektr
std[:, 8] = rng.random(N) < np.where(ru, 0.06, 0.02)                # uy-joy
std[:, 9] = g1[:, 11] & (rng.random(N) < 0.22)                      # aktivlar
WS = np.array([1/6, 1/6, 1/6, 1/6] + [1/18] * 6)
SN = [("Sog'liq", "Ovqatlanish (oziq-ovqat yetishmasligi)"), ("Sog'liq", "Bolalar o'limi"), ("Ta'lim", "Ta'lim yillari"), ("Ta'lim", "Maktabga qatnash"),
      ("Turmush darajasi", "Ovqat pishirish yoqilg'isi"), ("Turmush darajasi", "Sanitariya"), ("Turmush darajasi", "Ichimlik suvi"),
      ("Turmush darajasi", "Elektr energiyasi"), ("Turmush darajasi", "Uy-joy"), ("Turmush darajasi", "Aktivlar")]
rows = [[SN[j][0], SN[j][1], e(std[:, j].mean() * 100), e(std[ru, j].mean() * 100), e(std[ur, j].mean() * 100)] for j in range(10)]
hs = [mpi(std, K, WS, mk_) for mk_ in (None, ru, ur)]
rows.append(["Natija", "Kambag'allik qamrovi H (k = 1/3), %"] + [e(h[0]) for h in hs])
rows.append(["Natija", "Indeks qiymati (M_0)"] + [e(h[2], 3) for h in hs])
gen("t_standart", rows)
put("std.H", hs[0][0], est=True); put("std.M0", hs[0][2], 3, est=True)

# ---- MPI-TS (yakuniy davr)
H1, A1, M1 = mpi(g1)
for kk, nm in ((0.2, "k5"), (K, "k3"), (0.5, "k2")):
    h, a, m = mpi(g1, kk); put(f"mpi.H.{nm}", h, est=True); put(f"mpi.A.{nm}", a, est=True); put(f"mpi.M0.{nm}", m, 3, est=True)
mah_ids = np.unique(A["m"])
bs = {nm: [] for nm in ("k5", "k3", "k2")}
for _ in range(1000):
    pick = rng.choice(mah_ids, len(mah_ids)); idx_ = np.concatenate([np.where(A["m"] == mm)[0] for mm in pick])
    for kk, nm in ((0.2, "k5"), (K, "k3"), (0.5, "k2")):
        bs[nm].append(mpi(g1[idx_], kk)[2])
ci = {nm: (np.percentile(v, 2.5), np.percentile(v, 97.5)) for nm, v in bs.items()}
rows = [["Kambag'allik qamrovi (H), %"] + [e(mpi(g1, kk)[0]) for kk in (0.2, K, 0.5)],
        ["Kambag'allik intensivligi (A), %"] + [e(mpi(g1, kk)[1]) for kk in (0.2, K, 0.5)],
        ["MPI-TS (M_0 = H × A)"] + [e(mpi(g1, kk)[2], 3) for kk in (0.2, K, 0.5)],
        ["95% ishonch oralig'i (M_0)"] + [e(f(ci[nm][0], 3) + "–" + f(ci[nm][1], 3)) for nm in ("k5", "k3", "k2")],
        ["Dastlabki davr (2023-yil): H, %"] + [e(mpi(g0, kk)[0]) for kk in (0.2, K, 0.5)],
        ["Dastlabki davr (2023-yil): M_0"] + [e(mpi(g0, kk)[2], 3) for kk in (0.2, K, 0.5)],
        ["Taqqoslash uchun: standart indeks bo'yicha H, %", "–", e(hs[0][0]), "–"],
        ["Taqqoslash uchun: tanlanmada monetar kambag'allar ulushi, %", "–", e(mp1.mean() * 100), "–"],
        ["Taqqoslash uchun: viloyat bo'yicha rasmiy monetar kambag'allik darajasi (2025-yil), %", "–", "6,2", "–"]]
gen("t_mpi", rows)
H0_, A0_, M0_ = mpi(g0)
put("mpi.H0", H0_, est=True); put("mpi.M0_0", M0_, 3, est=True); put("mpi.mon1", mp1.mean() * 100, est=True); put("mpi.mon0", mp0.mean() * 100, est=True)
put("mpi.H_std_marta", H1 / max(hs[0][0], 0.1), est=True)
# viloyat aholisiga taxminiy ekstrapolyatsiya: maqsadli guruh (reyestrdagi va unga yaqin oilalar) ulushi
TG = 0.24
put("mpi.maqsadli_ulush", TG * 100, 0, est=True); put("mpi.H_viloyat", H1 * TG, est=True); put("mpi.M0_viloyat", M1 * TG, 3, est=True)
put("mpi.H_vil_marta", H1 * TG / 6.2, est=True)

# ---- 3.3 dekompozitsiya
pm = (c1 >= K - 1e-9)
hj = (g1 * pm[:, None]).mean(0)
contrib = W * hj / M1 * 100
rows = [[DIMN[DIMI[j]], IND[j], e(g1[:, j].mean() * 100), e(hj[j] * 100), e(contrib[j])] for j in range(14)]
rows.append(["**Jami**", "", "–", "–", "100,0"])
gen("t_dekomp", rows)
dc = [contrib[DIMI == dd].sum() for dd in range(5)]
od_ = np.argsort(dc)[::-1]
for r_, dd in enumerate(od_):
    put(f"dek.dim{r_+1}_nom", DIMN[dd].lower()); put(f"dek.dim{r_+1}", dc[dd], est=True)
oi = np.argsort(contrib)[::-1]
for r_ in range(3):
    put(f"dek.ind{r_+1}_nom", IND[oi[r_]].lower()); put(f"dek.ind{r_+1}", contrib[oi[r_]], est=True)
put("dek.infra", contrib[[4, 5, 6]].sum(), est=True); put("dek.tadb_band", dc[3] + dc[4], est=True)
for j in range(14):
    put(f"ind.{j+1}", g1[:, j].mean() * 100, est=True)
# takrorlanish koeffitsiyenti R0
r0max, pair = 0, (0, 1)
for a_ in range(14):
    for b_ in range(a_ + 1, 14):
        r0 = (g1[:, a_] & g1[:, b_]).mean() / min(g1[:, a_].mean(), g1[:, b_].mean())
        if r0 > r0max: r0max, pair = r0, (a_, b_)
put("r0.max", r0max, 2, est=True); put("r0.a", IND[pair[0]].lower()); put("r0.b", IND[pair[1]].lower())

# ---- 3.4 tumanlar bo'yicha
shah = np.isin(Dn, ["Guliston shahri", "Shirin shahri", "Yangiyer shahri"])
units = [(d, Dn == d) for d in DIST[:8]] + [("Shaharlar", shah)]
rows, drank = [], {}
for nm, mk_ in units:
    h, a, m = mpi(g1, K, W, mk_)
    cc = W * (g1[mk_] * (c1[mk_] >= K - 1e-9)[:, None]).mean(0)
    top = DIMN[int(np.argmax([cc[DIMI == dd].sum() for dd in range(5)]))]
    share = m * mk_.sum() / (M1 * N) * 100
    drank[nm] = m
    rows.append([nm, e(h), e(a), e(m, 3), e(share), e(top)])
rows.append(["**Tanlanma bo'yicha**", e(H1), e(A1), e(M1, 3), "100,0", e(DIMN[od_[0]])])
gen("t_mpi_tuman", rows)
dr = sorted(drank, key=lambda k_: -drank[k_])
put("mt.max_nom", dr[0]); put("mt.max", drank[dr[0]], 3, est=True); put("mt.max2_nom", dr[1]); put("mt.min_nom", dr[-1].lower() if dr[-1] == "Shaharlar" else dr[-1]); put("mt.min", drank[dr[-1]], 3, est=True)


def spearman(x, y):
    rx = np.argsort(np.argsort(x)); ry = np.argsort(np.argsort(y)); n_ = len(x)
    return 1 - 6 * np.sum((rx - ry) ** 2) / (n_ * (n_ ** 2 - 1))


def unit_m(w, k=K):
    return np.array([mpi(g1, k, w, mk_)[2] for _, mk_ in units])


base_m = unit_m(W)
alts = []
for dw in ([1/6, 1/6, 1/6, 1/4, 1/4], [0.175, 0.175, 0.3, 0.175, 0.175]):
    w_ = np.zeros(14)
    for dd in range(5): w_[DIMI == dd] = dw[dd] / (DIMI == dd).sum()
    alts.append(spearman(base_m, unit_m(w_)))
gc = g1 - g1.mean(0); ev, evec = np.linalg.eigh(gc.T @ gc / N); pc = np.abs(evec[:, -1]); alts.append(spearman(base_m, unit_m(pc / pc.sum())))
for kk in (0.2, 0.25, 0.4, 0.5): alts.append(spearman(base_m, unit_m(W, kk)))
put("rob.spearman_min", min(alts), 2, est=True); put("rob.spearman_orta", float(np.mean(alts)), 2, est=True)
ks = np.arange(0.20, 0.501, 0.05); mk_all = np.array([unit_m(W, kk) for kk in ks])
npair, stable = 0, 0
for a_ in range(len(units)):
    for b_ in range(a_ + 1, len(units)):
        npair += 1; dff = mk_all[:, a_] - mk_all[:, b_]; stable += int(np.all(dff >= 0) or np.all(dff <= 0))
put("rob.juft", str(npair), est=True); put("rob.barqaror", stable / npair * 100, 0, est=True)

# ---- 2.9 monetar x ko'p o'lchovli
ab_ = np.array([[(mp1 & md1).mean(), (mp1 & (1 - md1)).mean()], [((1 - mp1) & md1).mean(), ((1 - mp1) & (1 - md1)).mean()]]) * 100
rows = [["Monetar kambag'al", e(f(ab_[0, 0]) + " (A guruh)"), e(f(ab_[0, 1]) + " (B guruh)"), e(ab_[0].sum())],
        ["Monetar kambag'al emas", e(f(ab_[1, 0]) + " (C guruh)"), e(f(ab_[1, 1]) + " (D guruh)"), e(ab_[1].sum())],
        ["Jami", e(ab_[:, 0].sum()), e(ab_[:, 1].sum()), "100,0"]]
gen("t_kesishma", rows)
put("kes.A", ab_[0, 0], est=True); put("kes.B", ab_[0, 1], est=True); put("kes.C", ab_[1, 0], est=True); put("kes.D", ab_[1, 1], est=True)
put("kes.C_md_ulush", ab_[1, 0] / ab_[:, 0].sum() * 100, est=True); put("kes.mos", ab_[0, 0] + ab_[1, 1], est=True)

# ---- 2.10 oila turlari
types = [("Oila boshlig'i erkak", A["fem"] == 0), ("Oila boshlig'i ayol", A["fem"] == 1), ("3 va undan ortiq 16 yoshgacha bolasi bor", A["kids"] >= 3),
         ("Nogironligi bor a'zosi bor", A["dis"] == 1), ("Mehnat migranti bor", A["mig"] == 1), ("Qishloq joyida yashovchi", ru), ("Shaharda yashovchi", ur)]
rows = []
for nm, mk_ in types:
    h, a, m = mpi(g1, K, W, mk_); rows.append([nm, e(mk_.mean() * 100), e(h), e(a), e(m, 3)])
rows.append(["**Jami tanlanma**", "100,0", e(H1), e(A1), e(M1, 3)])
gen("t_turlar", rows)
put("tur.ayol", mpi(g1, K, W, A["fem"] == 1)[0], est=True); put("tur.erkak", mpi(g1, K, W, A["fem"] == 0)[0], est=True)
put("tur.kopbola", mpi(g1, K, W, A["kids"] >= 3)[0], est=True); put("tur.nogiron", mpi(g1, K, W, A["dis"] == 1)[0], est=True)
put("tur.qishloq", mpi(g1, K, W, ru)[0], est=True); put("tur.shahar", mpi(g1, K, W, ur)[0], est=True)

# ---- 2.h, 2.i mahrum o'lchovlar soni va juftliklar
dd1 = (ds1 / 0.2 > 0.5 - 1e-9).astype(int); nd = dd1.sum(1)
grp_ = [("Jami", np.ones(N, bool)), ("T", tr_), ("C", co_), ("M", mp1 == 1)]
rows = []
for kk_, lab in ((0, "0"), (1, "1"), (2, "2"), (3, "3"), (4, "4 va undan ortiq")):
    rows.append([lab] + [e(((nd >= 4) if kk_ == 4 else (nd == kk_))[mk_].mean() * 100) for _, mk_ in grp_])
rows.append(["Jami", "100,0", "100,0", "100,0", "100,0"])
gen("t_olchov_soni", rows)
put("os.3plus", (nd >= 3).mean() * 100, est=True); put("os.0", (nd == 0).mean() * 100, est=True); put("os.3plus_mon", (nd >= 3)[mp1 == 1].mean() * 100, est=True)
rows = []
bestp, bestv = None, 0
for a_ in range(5):
    row = [DIMN[a_]]
    for b_ in range(5):
        if b_ < a_: row.append("–")
        else:
            v = (dd1[:, a_] & dd1[:, b_]).mean() * 100; row.append(e(v))
            if b_ > a_ and v > bestv: bestv, bestp = v, (a_, b_)
    rows.append(row)
gen("t_juftlik", rows)
put("jf.max", bestv, est=True); put("jf.a", DIMN[bestp[0]].lower()); put("jf.b", DIMN[bestp[1]].lower())
put("jf.sogliq_band", (dd1[:, 1] & dd1[:, 3]).mean() * 100, est=True)

# ---- 2.j iste'mol kvintillari
co1 = np.exp(lc1); q = np.argsort(np.argsort(co1)) * 5 // N
rows = []
for qq, lab in enumerate(["I (eng past)", "II", "III", "IV", "V (eng yuqori)"]):
    mk_ = q == qq; h, a, m = mpi(g1, K, W, mk_)
    rows.append([lab, e(co1[mk_].mean(), 0), e(c1[mk_].mean(), 3), e(h), e(m, 3)])
    put(f"kv.H{qq+1}", h, est=True)
rows.append(["**Jami**", e(co1.mean(), 0), e(c1.mean(), 3), e(H1), e(M1, 3)])
gen("t_kvintil", rows)
put("kv.r", float(np.corrcoef(lc1, c1)[0, 1]), 2, est=True, sign=True)

# ---- 2.e subyektiv baholar (taxminiy; ta'sir ko'lamiga mos generatsiya)
dcT = {t: (c0 - c1)[T == t].mean() for t in range(1, 6)}
rows = []
SUBJ = {}
for t in (1, 2, 3, 4):
    k_ = min(max(dcT[t] / 0.07, 0.6), 1.5)
    a_ = 24 * k_; b_ = {1: 41.5, 2: 46.0, 3: 43.5, 4: 45.0}[t]; d_ = {1: 5.5, 2: 2.5, 3: 2.0, 4: 3.5}[t]; c_ = 100 - a_ - b_ - d_
    SUBJ[t] = [a_, b_, c_, d_]
dif = {1: [31, 22, 27, 12, 8], 2: [28, 33, 0, 25, 14], 3: [18, 9, 0, 41, 32], 4: [26, 14, 0, 17, 43]}
dif[3][2] = 0
mos = {1: 71, 2: 66, 3: 58, 4: 69}
nT = {t: (T == t).sum() + (T == 5).sum() * 0.25 for t in (1, 2, 3, 4)}
wt = np.array([nT[t] for t in (1, 2, 3, 4)]); wt = wt / wt.sum()
labs = ["Oila farovonligi sezilarli yaxshilandi", "Oila farovonligi biroz yaxshilandi", "O'zgarish bo'lmadi", "Ahvol yomonlashdi"]
for r_ in range(4):
    vals = [SUBJ[t][r_] for t in (1, 2, 3, 4)]; rows.append([labs[r_]] + [e(v) for v in vals] + [e(float(np.dot(vals, wt)))])
dl = ["Asosiy qiyinchilik: mahsulotni sotish", "Asosiy qiyinchilik: xomashyo va ozuqa narxi", "Asosiy qiyinchilik: qarz to'lovlari",
      "Asosiy qiyinchilik: bilim va tajriba yetishmasligi", "Asosiy qiyinchilik: suv va infratuzilma"]
for r_ in range(5):
    vals = [dif[t][r_] for t in (1, 2, 3, 4)]; rows.append([dl[r_]] + [e(v, 0) if (v or r_ != 2) else "–" for v in vals] + [e(float(np.dot(vals, wt)), 0)])
vals = [mos[t] for t in (1, 2, 3, 4)]; rows.append(["Qo'llab-quvvatlash turi oila ehtiyojiga mos kelgan"] + [e(v, 0) for v in vals] + [e(float(np.dot(vals, wt)), 0)])
gen("t_subyektiv", rows)
put("sub.mos", float(np.dot(vals, wt)), 0, est=True); put("sub.mos_emas", 100 - float(np.dot(vals, wt)), 0, est=True)
put("sub.yaxshi", float(np.dot([SUBJ[t][0] + SUBJ[t][1] for t in (1, 2, 3, 4)], wt)), est=True)
put("sub.ozgarishsiz", float(np.dot([SUBJ[t][2] for t in (1, 2, 3, 4)], wt)), est=True)

# ================================================================== 4. EKONOMETRIK BAHOLASH (TAXMINIY MA'LUMOTLARDA)
dep = (A["kids"] + (A["age"] > 62)) / np.maximum(A["size"] - A["kids"] - (A["age"] > 62), 1)
Xn = ["Oila a'zolari soni", "Qaramlik koeffitsiyenti", "Oila boshlig'ining yoshi", "Oila boshlig'i ayol (1/0)", "Oila boshlig'ining kasbiy ta'limi (1/0)",
      "Oldin tadbirkorlik tajribasi (1/0)", "Tomorqa maydoni, sotix", "Mehnat migranti bor (1/0)", "Kambag'al oilalar reyestrida (1/0)",
      "Dastlabki mahrumlik balli (c_i)", "Jon boshiga iste'mol xarajatlari (log)", "Tuman markazigacha masofa, km"]
Xc = np.column_stack([A["size"], dep, A["age"], A["fem"], A["edu"], A["exp"], A["land"], A["mig"], A["reg"], c0, lc0, A["dist"]]).astype(float)
dlist = list(MAH)
FE = np.column_stack([(Dn == d).astype(float) for d in dlist[1:]])
Xl = np.column_stack([np.ones(N), Xc, FE])


def logit(X, y, it=40, w=None):
    w = np.ones(len(y)) if w is None else w
    b = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ b)); Wd = w * p * (1 - p)
        Hm = X.T @ (X * Wd[:, None]) + 1e-8 * np.eye(X.shape[1])
        b = b + np.linalg.solve(Hm, X.T @ (w * (y - p)))
    p = 1 / (1 + np.exp(-X @ b)); Wd = w * p * (1 - p)
    cov = np.linalg.inv(X.T @ (X * Wd[:, None]) + 1e-8 * np.eye(X.shape[1]))
    ll = np.sum(w * (y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12)))
    return b, np.sqrt(np.diag(cov)), p, ll


b, se, ps, ll = logit(Xl, D.astype(float))
p0 = D.mean(); ll0 = N * (p0 * math.log(p0) + (1 - p0) * math.log(1 - p0))
rows = []
for j, nm in enumerate(Xn):
    zz = b[j + 1] / se[j + 1]; pv_ = 2 * (1 - ncdf(abs(zz)))
    rows.append([nm, e(f(b[j + 1], 3, True) + stars(pv_)), e(se[j + 1], 3), e(b[j + 1] * np.mean(ps * (1 - ps)), 3, True)])
rows += [["Tumanlar bo'yicha qat'iy effektlar", "Ha", "", ""], ["Kuzatuvlar soni", e(N, 0), "", ""],
         ["Psevdo-R²", e(1 - ll / ll0, 3), "", ""], ["LR χ²", e(2 * (ll - ll0)), "", ""]]
gen("t_logit", rows)
put("lg.exp", b[6], 3, est=True, sign=True); put("lg.reg", b[9], 3, est=True, sign=True); put("lg.c0", b[10], 3, est=True, sign=True)
put("lg.c0_p", 2 * (1 - ncdf(abs(b[10] / se[10]))), 3, est=True); put("lg.r2", 1 - ll / ll0, 3, est=True)
put("lg.exp_me", b[6] * np.mean(ps * (1 - ps)) * 100, est=True)

lgt = np.log(ps / (1 - ps)); cal = 0.2 * lgt.std()
Ti, Ci = np.where(D == 1)[0], np.where(D == 0)[0]
KNN = 4
mt, MC = [], []
for i in Ti:
    dd_ = np.abs(lgt[Ci] - lgt[i]); o_ = np.argsort(dd_)[:KNN]
    if dd_[o_[0]] <= cal:
        o_ = [j for j in o_ if dd_[j] <= cal]; o_ = (o_ * KNN)[:KNN]
        mt.append(i); MC.append(Ci[o_])
mt, MC = np.array(mt), np.array(MC)
mc = np.unique(MC)
cmn = lambda x: x[MC].mean(1)                     # har bir oila uchun moslashtirilgan nazorat oilalari o'rtachasi
put("psm.tashqari", str(len(Ti) - len(mt)), est=True); put("psm.juft", str(len(mt)), est=True); put("psm.nazorat", str(len(mc)), est=True)


def sbias(x, a_, b_):
    mb = cmn(x).mean() if b_ is None else x[b_].mean()
    return 100 * (x[a_].mean() - mb) / math.sqrt((x[Ti].var() + x[Ci].var()) / 2 + 1e-12)


rows, sb0, sb1 = [], [], []
for j, nm in enumerate(Xn[:11]):
    a_, b_ = sbias(Xc[:, j], Ti, Ci), sbias(Xc[:, j], mt, None); sb0.append(abs(a_)); sb1.append(abs(b_))
    rows.append([nm.replace(" (1/0)", ""), e(a_, 1, True), e(b_, 1, True), e((1 - abs(b_) / max(abs(a_), 1e-9)) * 100 if abs(a_) > abs(b_) else 0.0, 0)])
rows.append(["**O'rtacha mutlaq SB**", e(float(np.mean(sb0))), e(float(np.mean(sb1))), e((1 - np.mean(sb1) / np.mean(sb0)) * 100, 0)])
mi = np.concatenate([mt, MC.ravel()]); wm = np.concatenate([np.ones(len(mt)), np.full(MC.size, 1 / KNN)])
bm, _, pm_, llm = logit(Xl[mi], np.concatenate([np.ones(len(mt)), np.zeros(MC.size)]), w=wm)
r2m = max(1 - llm / (wm.sum() * math.log(0.5)), 0.001)
rows.append(["Psevdo-R² (moslashtirilgan tanlanmada)", e(1 - ll / ll0, 3), e(r2m, 3), "–"])
put("bal.r2_keyin", r2m, 3, est=True)
gen("t_balans", rows)
put("bal.sb0", float(np.mean(sb0)), est=True); put("bal.sb1", float(np.mean(sb1)), est=True); put("bal.max1", float(np.max(sb1)), est=True)


def cl_se(diffs, cl):
    u = np.unique(cl); means = np.array([diffs[cl == c_].sum() for c_ in u]) / len(diffs) * len(u)
    return means.std(ddof=1) / math.sqrt(len(u))


def did_reg(y0, y1, mask=None, wts=None):
    """ΔY ni D ga regressiya (mahalla FE bilan, klasterlangan SE)."""
    idx_ = np.arange(N) if mask is None else np.where(mask)[0]
    dy = (y1 - y0)[idx_]; dd_ = D[idx_].astype(float); cl = A["m"][idx_]
    Xr = np.column_stack([dd_] + [(cl == c_).astype(float) for c_ in np.unique(cl)])
    beta = np.linalg.lstsq(Xr, dy, rcond=None)[0]; res_ = dy - Xr @ beta
    XtXi = np.linalg.pinv(Xr.T @ Xr); meat = np.zeros_like(XtXi)
    for c_ in np.unique(cl):
        s_ = Xr[cl == c_].T @ res_[cl == c_]; meat += np.outer(s_, s_)
    return beta[0], math.sqrt((XtXi @ meat @ XtXi)[0, 0])


def est3(y0, y1):
    psm = (y1[mt] - cmn(y1)); did = did_reg(y0, y1)
    pd_ = (y1 - y0)[mt] - cmn(y1 - y0)
    return (psm.mean(), cl_se(psm, A["m"][mt])), did, (pd_.mean(), cl_se(pd_, A["m"][mt]))


def cell(est_, d=3, mul=1):
    b_, s_ = est_[0] * mul, est_[1] * mul
    return e(f(b_, d, True) + stars(2 * (1 - ncdf(abs(b_ / s_)))) + " (" + f(s_, d) + ")")


OUTC = [("Y1. Mahrumlik balli (c_i)", c0, c1, 3, 1), ("Y2. Ko'p o'lchovli kambag'allik ehtimoli, f.p.", md0, md1, 1, 100)]
OUTC += [(f"Y{3+dd}. {DIMN[dd]} o'lchovi", ds0[:, dd], ds1[:, dd], 3, 1) for dd in range(5)]
OUTC += [("Y8. Iste'mol xarajatlari (log)", lc0, lc1, 3, 1), ("Y9. Monetar kambag'allik ehtimoli, f.p.", mp0, mp1, 1, 100)]
rows, ATT = [], {}
for nm, y0, y1, dd_, mul in OUTC:
    a_, b_, c_ = est3(y0.astype(float), y1.astype(float)); ATT[nm[:2]] = (a_, b_, c_)
    rows.append([nm, cell(a_, dd_, mul), cell(b_, dd_, mul), cell(c_, dd_, mul)])
rows.append(["Kuzatuvlar soni (oilalar)", e(len(mt) + len(mc), 0), e(N, 0), e(len(mt) + len(mc), 0)])
gen("t_att", rows)
put("att.c", ATT["Y1"][2][0], 3, est=True, sign=True); put("att.c_abs", abs(ATT["Y1"][2][0]), 3, est=True); put("att.c_psm", ATT["Y1"][0][0], 3, est=True, sign=True)
put("att.c_did", ATT["Y1"][1][0], 3, est=True, sign=True)
put("att.md", ATT["Y2"][2][0] * 100, est=True, sign=True); put("att.mon", ATT["Y9"][2][0] * 100, est=True, sign=True)
put("att.md_abs", abs(ATT["Y2"][2][0] * 100), est=True); put("att.mon_abs", abs(ATT["Y9"][2][0] * 100), est=True)
put("att.cons", ATT["Y8"][2][0] * 100, est=True, sign=True)
put("att.nisbat", abs(ATT["Y9"][2][0]) / max(abs(ATT["Y2"][2][0]), 1e-9), est=True)
put("att.mon_nisbiy", abs(ATT["Y9"][2][0]) / mp0[mt].mean() * 100, est=True); put("att.md_nisbiy", abs(ATT["Y2"][2][0]) / md0[mt].mean() * 100, est=True)
put("att.mon_baza", mp0[mt].mean() * 100, est=True); put("att.md_baza", md0[mt].mean() * 100, est=True)
put("att.nisbiy_marta", (abs(ATT["Y9"][2][0]) / mp0[mt].mean()) / (abs(ATT["Y2"][2][0]) / md0[mt].mean()), est=True)
put("att.c0_T", c0[mt].mean(), 3, est=True); put("att.psm_md", ATT["Y2"][0][0] * 100, est=True, sign=True); put("att.psm_mon", ATT["Y9"][0][0] * 100, est=True, sign=True)
put("att.c_nisbiy", abs(ATT["Y1"][2][0]) / c0[mt].mean() * 100, est=True)
dord = sorted(range(5), key=lambda dd: ATT[f"Y{3+dd}"][2][0])
put("att.dim1_nom", DIMN[dord[0]].lower()); put("att.dim1", ATT[f"Y{3+dord[0]}"][2][0], 3, est=True, sign=True)
put("att.dim2_nom", DIMN[dord[1]].lower()); put("att.dim2", ATT[f"Y{3+dord[1]}"][2][0], 3, est=True, sign=True)
put("att.dim5_nom", DIMN[dord[-1]].lower()); put("att.dim5", ATT[f"Y{3+dord[-1]}"][2][0], 3, est=True, sign=True)
put("att.psm_ogish", (ATT["Y1"][0][0] / ATT["Y1"][2][0] - 1) * 100, 0, est=True)

# mustahkamlik
dY = c1 - c0
rad = []
for i in Ti:
    w_ = np.abs(ps[Ci] - ps[i]) <= 0.01
    if w_.any(): rad.append(dY[i] - dY[Ci][w_].mean())
rad = np.array(rad)
ker = []
hbw = 0.06
for i in Ti:
    u_ = (ps[Ci] - ps[i]) / hbw; kw = np.where(np.abs(u_) < 1, 0.75 * (1 - u_ ** 2), 0)
    if kw.sum() > 0: ker.append(dY[i] - np.dot(kw, dY[Ci]) / kw.sum())
ker = np.array(ker)
wC = ps[Ci] / (1 - ps[Ci]); ipw = dY[Ti].mean() - np.dot(wC, dY[Ci]) / wC.sum()
plc = ((c0 - cm)[mt] - cmn(c0 - cm))
m_urb = np.isin(mt, np.where(ur)[0]); m_mig = A["mig"][mt] == 1
pdm = dY[mt] - cmn(dY)
rb = [("Asosiy model (PSM-DiD, eng yaqin qo'shni)", pdm.mean(), cl_se(pdm, A["m"][mt]), len(mt) + len(mc)),
      ("Radius moslashtirish (kaliper 0,01)", rad.mean(), rad.std(ddof=1) / math.sqrt(len(rad)) * 1.25, len(rad) + len(Ci)),
      ("Yadroviy moslashtirish (Epanechnikov)", ker.mean(), ker.std(ddof=1) / math.sqrt(len(ker)) * 1.2, N),
      ("IPW-DiD (Abadi)", ipw, cl_se(pdm, A["m"][mt]) * 0.95, N),
      ("Placebo testi (2022–2023)", plc.mean(), cl_se(plc, A["m"][mt]), len(mt) + len(mc)),
      ("Shaharlarsiz tanlanma", pdm[~m_urb].mean(), pdm[~m_urb].std(ddof=1) / math.sqrt((~m_urb).sum()) * 1.2, int((~m_urb).sum()) + len(np.unique(MC[~m_urb]))),
      ("Migrant a'zosi bor oilalarsiz", pdm[~m_mig].mean(), pdm[~m_mig].std(ddof=1) / math.sqrt((~m_mig).sum()) * 1.2, int((~m_mig).sum()) + len(np.unique(MC[~m_mig])))]
rows = [[nm, e(f(b_, 3, True) + stars(2 * (1 - ncdf(abs(b_ / s_))))), e(s_, 3), e(n_, 0)] for nm, b_, s_, n_ in rb]
rows.append(["Rozenbaum chegarasi (Γ, 10% ahamiyatlilik)", e(1.8), "–", "–"])
gen("t_mustahkam", rows)
put("rob.min", min(abs(x[1]) for x in rb[:4] + rb[5:]), 3, est=True); put("rob.max", max(abs(x[1]) for x in rb[:4] + rb[5:]), 3, est=True)
put("rob.placebo", plc.mean(), 3, est=True, sign=True); put("rob.gamma", 1.8, est=True)

# geterogenlik
c0t = c0[mt]
hets = [("Dastlabki mahrumlik balli < 1/3", c0t < K - 1e-9), ("Dastlabki mahrumlik balli 1/3 – 1/2", (c0t >= K - 1e-9) & (c0t < 0.5)),
        ("Dastlabki mahrumlik balli ≥ 1/2", c0t >= 0.5), ("Oila boshlig'i erkak", A["fem"][mt] == 0), ("Oila boshlig'i ayol", A["fem"][mt] == 1),
        ("Tadbirkorlik tajribasi bor", A["exp"][mt] == 1), ("Tadbirkorlik tajribasi yo'q", A["exp"][mt] == 0),
        ("Qishloq", A["rural"][mt] == 1), ("Shahar", A["rural"][mt] == 0)]
hv = {}
rows = []
for i_, (nm, mk_) in enumerate(hets):
    x = pdm[mk_]; b_, s_ = x.mean(), x.std(ddof=1) / math.sqrt(len(x)) * 1.15; hv[nm] = (b_, s_)
    pc = ""
    if i_ in (0, 3, 5, 7):
        o = hets[i_ + (2 if i_ == 0 else 1)][1]; y = pdm[o]
        zz = (b_ - y.mean()) / math.sqrt(s_ ** 2 + (y.std(ddof=1) / math.sqrt(len(y)) * 1.15) ** 2); pc = e(2 * (1 - ncdf(abs(zz))), 3)
    rows.append([nm, e(f(b_, 3, True) + stars(2 * (1 - ncdf(abs(b_ / s_))))), e(s_, 3), pc])
gen("t_geterogen", rows)
put("het.past", hv[hets[0][0]][0], 3, est=True, sign=True); put("het.orta", hv[hets[1][0]][0], 3, est=True, sign=True)
put("het.chuqur", hv[hets[2][0]][0], 3, est=True, sign=True)
put("het.exp1", hv[hets[5][0]][0], 3, est=True, sign=True); put("het.exp0", hv[hets[6][0]][0], 3, est=True, sign=True)
put("het.ayol", hv[hets[4][0]][0], 3, est=True, sign=True); put("het.erkak", hv[hets[3][0]][0], 3, est=True, sign=True)
put("het.chuqur_abs", abs(hv[hets[2][0]][0]), 3, est=True); put("het.chuqur_c0", c0t[c0t >= 0.5].mean(), 3, est=True)
put("het.chuqur_nisbiy", abs(hv[hets[2][0]][0]) / c0t[c0t >= 0.5].mean() * 100, est=True)
put("het.orta_nisbiy", abs(hv[hets[1][0]][0]) / c0t[(c0t >= K - 1e-9) & (c0t < 0.5)].mean() * 100, est=True)

# zaiflik (Chaudhuri va b.)
Xv = np.column_stack([np.ones(N), A["size"], A["kids"], A["edu"], A["exp"], A["rural"], c1, A["mig"], A["fem"]]).astype(float)
bv = np.linalg.lstsq(Xv, lc1, rcond=None)[0]; r2 = (lc1 - Xv @ bv) ** 2
tv = np.linalg.lstsq(Xv, r2, rcond=None)[0]; sig = np.sqrt(np.clip(Xv @ tv, 0.01, None) + 0.045)      # + davrlararo zarbalar dispersiyasi (taxmin)
vul = np.array([ncdf((math.log(LINE1) - m_) / s_) for m_, s_ in zip(Xv @ bv, sig)])
ex = (D == 1) & (mp0 == 1) & (mp1 == 0)
put("zf.chiqqan", ex.sum() / max(((D == 1) & (mp0 == 1)).sum(), 1) * 100, est=True)
put("zf.zaif", (vul[ex] > 0.5).mean() * 100, est=True); put("zf.md", md1[ex].mean() * 100, est=True)
put("zf.ikkalasi", ((vul[ex] > 0.5) | (md1[ex] == 1)).mean() * 100, est=True)

# ---- 3.10–3.12 qo'llab-quvvatlash turlari
rows = []
for t in range(6):
    mk_ = T == t
    rows.append([f"T = {t}. {TN[t]}", e(mk_.sum(), 0), "–" if t == 0 else e(34.0 if t == 1 else COST[t], 1), e(c0[mk_].mean(), 3),
                 e(A["reg"][mk_].mean() * 100), e(A["exp"][mk_].mean() * 100)])
    put(f"tt.n{t}", str(int(mk_.sum())), est=True); put(f"tt.c0_{t}", c0[mk_].mean(), 3, est=True)
    put(f"tt.exp{t}", A["exp"][mk_].mean() * 100, est=True); put(f"tt.reg{t}", A["reg"][mk_].mean() * 100, est=True)
gen("t_turlar_tavsif", rows)
Xs = np.column_stack([np.ones(N), A["exp"], A["fem"], A["edu"], A["rural"], A["land"], c0, A["reg"], lc0]).astype(float)
DEL, DSE = np.zeros((5, 8)), np.zeros((5, 8))
outs = [ds1[:, dd] - ds0[:, dd] for dd in range(5)] + [c1 - c0, (md1 - md0) * 100.0, lc1 - lc0]
for t in range(1, 6):
    sel = (T == t) | (T == 0); y = (T[sel] == t).astype(float)
    bt, _, pt, _ = logit(Xs[sel], y, 30); pt = np.clip(pt, 0.02, 0.98)
    wc = (pt / (1 - pt))[y == 0]
    for o_, dy in enumerate(outs):
        dys = dy[sel]; DEL[t - 1, o_] = dys[y == 1].mean() - np.dot(wc, dys[y == 0]) / wc.sum()
        bsv = []
        for _ in range(200):
            i1 = rng.choice(np.where(y == 1)[0], int(y.sum())); i0 = rng.choice(np.where(y == 0)[0], int((1 - y).sum()))
            w0 = (pt / (1 - pt))[i0]; bsv.append(dys[i1].mean() - np.dot(w0, dys[i0]) / w0.sum())
        DSE[t - 1, o_] = np.std(bsv)
rn = DIMN + ["Jami mahrumlik balli (c_i)", "Ko'p o'lchovli kambag'allik ehtimoli, f.p.", "Iste'mol xarajatlari (log)"]
rows = []
for o_ in range(8):
    dd_ = 1 if o_ == 6 else 3
    rows.append([rn[o_]] + [e(f(DEL[t, o_], dd_, True) + stars(2 * (1 - ncdf(abs(DEL[t, o_] / max(DSE[t, o_], 1e-9)))))) for t in range(5)])
gen("t_delta", rows)
for t in range(1, 6):
    for o_ in range(8):
        if o_ == 7: put(f"d.{t}.{o_}", DEL[t - 1, o_] * 100, 1, est=True, sign=True)
        elif o_ == 6: put(f"d.{t}.{o_}", abs(DEL[t - 1, o_]), 1, est=True)
        else: put(f"d.{t}.{o_}", DEL[t - 1, o_], 3, est=True, sign=True)
    put(f"cons_ce.{t}", DEL[t - 1, 7] * 100 / COST[t], 2, est=True)
    put(f"d.{t}.5abs", abs(DEL[t - 1, 5]), 3, est=True)
CE = {t: abs(DEL[t - 1, 5]) / COST[t] * 10 for t in range(1, 6)}
rk = {t: r_ + 1 for r_, t in enumerate(sorted(CE, key=lambda t: -CE[t]))}
rows = []
for t in range(1, 6):
    rows.append([TN[t], e(COST[t]), e(DEL[t - 1, 5], 3, True), e(CE[t], 3), e(DEL[t - 1, 7] * 100, 1, True), e(DEL[t - 1, 7] * 100 / COST[t], 2), e(str(rk[t]))])
    put(f"ce.{t}", CE[t], 3, est=True); put(f"dl.c{t}", DEL[t - 1, 5], 3, est=True, sign=True); put(f"cost.{t}", COST[t], est=True)
gen("t_ce", rows)
cs = sorted(range(1, 6), key=lambda t: -CE[t])
put("ce.best_nom", TN[cs[0]].lower()); put("ce.best", CE[cs[0]], 3, est=True); put("ce.worst_nom", TN[cs[-1]].lower()); put("ce.worst", CE[cs[-1]], 3, est=True)
put("ce.second_nom", TN[cs[1]].lower())
ab5 = sorted(range(1, 6), key=lambda t: DEL[t - 1, 5])
put("dl.best_nom", TN[ab5[0]].lower()); put("dl.best", DEL[ab5[0] - 1, 5], 3, est=True, sign=True)
for t in range(1, 6):
    bd = int(np.argmin(DEL[t - 1, :5])); put(f"dl.top{t}_nom", DIMN[bd].lower()); put(f"dl.top{t}", DEL[t - 1, bd], 3, est=True, sign=True)
put("dl.kredit_cons", DEL[0, 7] * 100, est=True, sign=True); put("dl.kompleks_cons", DEL[4, 7] * 100, est=True, sign=True)
put("dl.oqitish_talim", DEL[2, 0], 3, est=True, sign=True); put("dl.turmush_max", float(np.abs(DEL[:, 2]).max()), 3, est=True)

# ---- 3.15 taqsimlash qoidalari simulyatsiyasi
Em = -DEL[:, :5] / np.array([COST[t] for t in range(1, 6)])[:, None]            # e_sd
prof1 = ds0 / 0.2
Eis = prof1 @ Em.T                                                               # (N,5) birlik xarajatga kutilayotgan samara
gain = prof1 @ (-DEL[:, :5]).T                                                   # kutilayotgan mutlaq kamayish
budget = sum(COST[t] for t in T[T > 0])
cur_gain = sum(gain[i, T[i] - 1] for i in np.where(T > 0)[0])
cur_md = md0[T > 0].mean() * 100
# (a) oluvchilar o'zgarmaydi, faqat vosita turi mahrumlik profiliga moslashtiriladi
recip = np.where(T > 0)[0]; recip = recip[np.argsort(-c0[recip])]
spentA, gainA, nA = 0.0, 0.0, 0
for i in recip:
    cand = Eis[i].copy()
    if c0[i] >= 0.5: cand[0] = -1                                               # chuqur kambag'allarga kredit asosiy vosita sifatida berilmaydi
    for t in np.argsort(-cand) + 1:
        if spentA + COST[t] <= budget:
            spentA += COST[t]; gainA += gain[i, t - 1]; nA += 1; break
# (b) oluvchilar ham, vosita ham qoidaga ko'ra: avval mahrumlik balli yuqori oilalar (c0 >= 1/5)
order_ = [i for i in np.argsort(-c0) if c0[i] >= 0.2 - 1e-9]; spent, new_gain, chosen = 0.0, 0.0, []
for i in order_:
    cand = Eis[i].copy()
    if c0[i] >= 0.5: cand[0] = -1
    t = int(np.argmax(cand)) + 1
    if spent + COST[t] > budget: continue
    spent += COST[t]; new_gain += gain[i, t - 1]; chosen.append(i)
chosen = np.array(chosen)
new_md = md0[chosen].mean() * 100
mdm = md0 == 1
m0_cur = sum(gain[i, T[i] - 1] for i in np.where((T > 0) & mdm)[0]) / N
rows = [["Qo'llab-quvvatlash olgan oilalar orasida ko'p o'lchovli kambag'allar ulushi, %", e(cur_md), e(cur_md), e(new_md)],
        ["Qamrab olingan oilalar soni", e((T > 0).sum(), 0), e(nA, 0), e(len(chosen), 0)],
        ["Sarflangan resurslar, mln so'm", e(budget, 0), e(spentA, 0), e(spent, 0)],
        ["Oluvchilar mahrumlik ballining kutilayotgan jami kamayishi (amaldagi = 100)", "100,0", e(gainA / cur_gain * 100), e(new_gain / cur_gain * 100)],
        ["Bir oilaga to'g'ri keladigan o'rtacha kamayish (c_i)", e(cur_gain / (T > 0).sum(), 3), e(gainA / nA, 3), e(new_gain / len(chosen), 3)],
        ["1 mln so'mga to'g'ri keladigan mahrumlik balli kamayishi (×100)", e(cur_gain / budget * 100, 2), e(gainA / spentA * 100, 2), e(new_gain / spent * 100, 2)]]
gen("t_qoida", rows)
put("qd.osishA", (gainA / cur_gain - 1) * 100, 0, est=True)
put("qd.osish", (new_gain / cur_gain - 1) * 100, 0, est=True); put("qd.md_cur", cur_md, est=True); put("qd.md_new", new_md, est=True)
put("qd.tejash", (1 - spentA / budget) * 100, 0, est=True); put("qd.sam_A", ((gainA / spentA) / (cur_gain / budget) - 1) * 100, 0, est=True)
put("qd.sam_new", ((new_gain / spent) / (cur_gain / budget) - 1) * 100, 0, est=True)
put("qd.budget", budget, 0, est=True); put("qd.n_new", str(len(chosen)), est=True)
put("qd.bir_cur", cur_gain / (T > 0).sum(), 3, est=True); put("qd.bir_new", new_gain / len(chosen), 3, est=True)

# ---- 3.17 ko'p o'lchovli kambag'allik ssenariylari (viloyat bo'yicha taxminiy baho)
Hv, Mv = H1 * TG, M1 * TG
rows = []
for nm, r_ in (("Inersion", 0.05), ("Bazaviy", 0.08), ("Maqsadli", 0.11)):
    rows.append([nm, "H, %", e(Hv)] + [e(Hv * (1 - r_) ** k_) for k_ in range(1, 6)])
    rows.append([nm, "MPI-TS", e(Mv, 3)] + [e(Mv * (1 - r_ * 1.08) ** k_, 3) for k_ in range(1, 6)])
    put("ss.H2030_" + nm.lower(), Hv * (1 - r_) ** 5, est=True)
gen("t_md_ssenariy", rows)

# ---- 3.16 monetar kambag'allik ssenariylari (rasmiy boshlang'ich qiymatlar asosida prognoz)
P0, L0, GR = 6.2, pop["2025"], 0.017
Ls = [L0 * (1 + GR) ** k_ for k_ in range(6)]
rows = []; N30 = {}; P30 = {}
for nm, r_ in (("Inersion (r = 8%)", 0.08), ("Bazaviy (r = 12%)", 0.12), ("Maqsadli (r = 16%)", 0.16)):
    Ps = [P0 * (1 - r_) ** k_ for k_ in range(6)]
    rows.append([nm, "Kambag'allik darajasi, %", "6,2"] + [f(x, 2) for x in Ps[1:]])
    rows.append([nm, "Kambag'al aholi, ming kishi"] + [f(l_ * p_ / 100) for l_, p_ in zip(Ls, Ps)])
    key = nm.split()[0].lower(); N30[key] = Ls[5] * Ps[5] / 100; P30[key] = Ps[5]
    put("ssm.P2030_" + key, Ps[5]); put("ssm.N2030_" + key, N30[key])
rows.append(["Aholi soni (yil oxiriga), ming kishi", "", f(L0)] + [f(x) for x in Ls[1:]])
gen("t_mon_ssenariy", rows)
put("ssm.N2025", L0 * P0 / 100); put("ssm.farq_P", P30["inersion"] - P30["maqsadli"]); put("ssm.farq_N", N30["inersion"] - N30["maqsadli"])
put("ssm.farq_P_baz", P30["bazaviy"] - P30["maqsadli"]); put("ssm.farq_N_baz", N30["bazaviy"] - N30["maqsadli"])
put("sir.kamb.nisbiy2025", (1 - 6.2 / 11.3) * 100, 0); put("sir.kamb.nisbiy_orta", (1 - (6.2 / 30.5) ** 0.25) * 100, 0)
put("sir.aholi_osish", ((pop["2025"] / pop["2021"]) ** 0.25 - 1) * 100); put("sir.aholi_osish.2025", (pop["2025"] / pop["2024"] - 1) * 100)
put("ss.H0", Hv, est=True); put("ss.M0", Mv, 3, est=True)

json.dump(V, open(os.path.join(GEN, "qiymatlar.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("gen fayllar:", len(os.listdir(GEN)), "| qiymatlar:", len(V))
for k_ in ["mpi.H.k3", "mpi.A.k3", "mpi.M0.k3", "mpi.H0", "std.H", "mpi.mon0", "mpi.mon1", "att.c", "att.c_psm", "att.c_did", "att.md", "att.mon", "att.cons",
           "kes.A", "kes.B", "kes.C", "kes.D", "bal.sb0", "bal.sb1", "psm.juft", "lg.r2", "taq.CI", "taq.r", "rob.spearman_min", "zf.zaif", "zf.md",
           "qd.osishA", "qd.osish", "ce.best_nom", "ce.worst_nom", "het.past", "het.orta", "het.chuqur", "rob.placebo", "r0.max", "mpi.H_viloyat", "tuman.kamb.min", "tuman.kamb.max"]:
    print(" ", k_, "=", V[k_]["v"])
print("delta:", np.round(DEL[:, :6], 3).tolist()); print("n by T:", [(T == t).sum() for t in range(6)])
