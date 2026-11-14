#!/usr/bin/env python3
"""Dissertatsiya jadvallari uchun hisob-kitoblar (Djabborov Sh.E.).

RASMIY ma'lumotlar (statistika/rasmiy.json):
  - O'zbekiston Respublikasi Markaziy banki: banklar kesimida asosiy ko'rsatkichlar, muammoli kreditlar,
    kreditlar va depozitlar, kapital yetarliligi, likvidlik, daromadlilik (01.01.2020–01.10.2026);
  - “Ipoteka-bank” ATIB: MHXS bo'yicha audit qilingan konsolidatsiyalangan hisobotlar (2019–2025),
    2026-yil I yarmi bo'yicha oraliq hisobot, investor taqdimotlari.
Bu ma'lumotlardan hisoblangan barcha ko'rsatkichlar hujjatda oddiy (qora) rangda chiqadi.
TAXMINIY qiymatlar (<<...>>, jigarrang) faqat ochiq manbalarda topilmagan ma'lumotlar uchun ishlatiladi.

Natija: manba/gen/*.txt (jadval qatorlari) va manba/gen/qiymatlar.json ({{kalit}} qiymatlari).
Foydalanish:  python3 hisob.py && python3 build.py
"""
import json, os, math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, "manba", "gen")
os.makedirs(GEN, exist_ok=True)
R = json.load(open(os.path.join(HERE, "statistika", "rasmiy.json"), encoding="utf-8"))
I = R["ipoteka_ifrs"]; P = R["cbu_panel"]; SY = R["cbu_system"]; KPI = R["ipoteka_kpi"]
V = {}
YR = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"]
DATE = {"2019": "2020-01", "2020": "2021-01", "2021": "2022-01", "2022": "2023-01", "2023": "2024-01", "2024": "2025-01", "2025": "2026-01", "2026-9M": "2026-10"}
PRE, POST = ["2019", "2020", "2021", "2022"], ["2023", "2024", "2025"]


# ------------------------------------------------------------------ formatlash
def f(x, d=1, sign=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    s = f"{abs(x):,.{d}f}".replace(",", " ").replace(".", ",")
    if round(abs(x), d) == 0:
        return s
    if x < 0:
        s = "–" + s
    elif sign:
        s = "+" + s
    return s


def e(x, d=1, sign=False):
    return "<<" + (x if isinstance(x, str) else f(x, d, sign)) + ">>"


def put(key, val, d=1, est=False, sign=False):
    V[key] = {"v": val if isinstance(val, str) else f(val, d, sign), "est": est}


def gen(name, rows):
    open(os.path.join(GEN, name + ".txt"), "w", encoding="utf-8").write(
        "\n".join("| " + " | ".join(r) + " |" for r in rows) + "\n")


def stars(p):
    return "***" if p < 0.01 else "**" if p < 0.05 else "*" if p < 0.1 else ""


def tcdf(t, df):
    """Styudent taqsimoti funksiyasi (sonli integrallash)."""
    if df > 200:
        return 0.5 * (1 + math.erf(t / math.sqrt(2)))
    xs = np.linspace(-60, t, 40001)
    c = math.gamma((df + 1) / 2) / (math.sqrt(df * math.pi) * math.gamma(df / 2))
    yv = c * (1 + xs ** 2 / df) ** (-(df + 1) / 2)
    return float(np.sum((yv[1:] + yv[:-1]) / 2 * np.diff(xs)))


def pval(t, df):
    return 2 * (1 - tcdf(abs(t), df))


T = 1e6  # mln so'm -> trln so'm

# ================================================================== 1. BANK TIZIMI (Markaziy bank)
CANON = {"Азия Алянс банк": "Азия Альянс банк", "Микрокредитбанк": "Микрокредит банк", "Трастбанк": "Траст банк", "Кишлок курилиш банк": "Банк развития бизнеса",
         "Равнак банк": "Октобанк", "Апельсин банк": "Узум банк", "ДБ Банка Садерат Ирана": "Садерат банк", "ДБ банка Садерат Иран": "Садерат банк", "Садерат банк Иран": "Садерат банк"}
UZ = {"Узнацбанк": "O'zmilliybank", "Узпромстройбанк": "O'zsanoatqurilishbank", "Асака банк": "Asakabank", "Агробанк": "Agrobank", "Народный банк": "Xalq banki",
      "Банк развития бизнеса": "Biznesni rivojlantirish banki", "Микрокредит банк": "Mikrokreditbank", "Алока банк": "Aloqabank", "Турон банк": "Turonbank",
      "Капитал банк": "Kapitalbank", "Хамкор банк": "Hamkorbank", "Ипак йули банк": "Ipak yo'li banki", "Ориент Финанс банк": "Orient Finans bank", "Анор банк": "Anorbank",
      "Инвест Финанс банк": "Invest Finance Bank", "Тибиси банк": "TBC Bank", "Траст банк": "Trastbank", "Давр банк": "Davr bank", "Ипотека банк": "Ipoteka-bank"}
IPO = "Ипотека банк"
STATE9 = ["Узнацбанк", "Узпромстройбанк", "Асака банк", "Агробанк", "Народный банк", "Банк развития бизнеса", "Микрокредит банк", "Алока банк", "Турон банк"]
FOREIGN = ["Тибиси банк", "УзКДБ банк", "Зираат банк", "Садерат банк", "Тенге банк", "Евразийский банк"]   # xorijiy banklarning sho'ba banklari
B = {}  # B[yil][bank] = dict
for y, d in DATE.items():
    B[y] = {}
    for k, v in P[d]["banks"].items():
        k = CANON.get(k, k)
        if v.get("assets"):
            B[y][k] = v


def ind(y, b, name):
    v = B[y].get(b)
    if not v:
        return None
    try:
        if name == "share": return v["assets"] / P[DATE[y]]["total"]["assets"] * 100
        if name == "npl": return v.get("npl_pct")
        if name == "ldr": return v["loans"] / v["deposits"] * 100 if v.get("deposits") else None
        if name == "ea": return v["capital"] / v["assets"] * 100
        if name == "retail_l": return v["loans_ind"] / v["loans"] * 100 if v.get("loans_ind") is not None and v.get("loans") else None
        if name == "retail_d": return v["dep_ind"] / v["deposits"] * 100 if v.get("dep_ind") is not None and v.get("deposits") else None
        if name == "la": return v["loans"] / v["assets"] * 100
        if name == "lnta": return math.log(v["assets"])
        if name == "growth":
            py = str(int(y) - 1)
            return (v["assets"] / B[py][b]["assets"] - 1) * 100 if py in B and b in B[py] else None
    except (KeyError, TypeError, ZeroDivisionError):
        return None


tot = {y: P[DATE[y]]["total"] for y in DATE}; st = {y: P[DATE[y]]["state"] for y in DATE}; ot = {y: P[DATE[y]]["other"] for y in DATE}
YS = YR + ["2026-9M"]
hdr9 = lambda y: "2026 (1-okt.)" if y == "2026-9M" else y
gdp_ratio = {"2019": 51.2, "2020": 54.8, "2021": 54.2, "2022": 55.9, "2023": 54.1, "2024": 52.9, "2025": 50.0}   # aktivlar/YaIM, % (bank taqdimoti, MB ma'lumotlari)
rows = [
    ["Jami aktivlar, trln so'm"] + [f(tot[y]["assets"] / 1000) for y in YS],
    ["Kreditlar, trln so'm"] + [f(tot[y]["loans"] / 1000) for y in YS],
    ["Depozitlar, trln so'm"] + [f(tot[y]["deposits"] / 1000) for y in YS],
    ["Jami kapital, trln so'm"] + [f(tot[y]["capital"] / 1000) for y in YS],
    ["Aktivlarning YaIMga nisbati, %"] + [f(gdp_ratio[y]) for y in YR] + ["–"],
    ["Kreditlar/depozitlar, %"] + [f(tot[y]["loans"] / tot[y]["deposits"] * 100, 0) for y in YS],
    ["Muammoli kreditlar (NPL) ulushi, %"] + [e(1.5)] + [f(tot[y]["npl_pct"]) for y in YS[1:]],
    ["Kapital yetarliligi koeffitsiyenti, %"] + [f(SY[y]["car"]) for y in YS],
    ["Likvidlikni qoplash me'yori (LCR), %"] + [f(SY[y]["lcr"], 0) for y in YS],
    ["Aktivlar rentabelligi (ROA), %"] + [f(SY[y]["roa"]) for y in YS],
    ["Kapital rentabelligi (ROE), %"] + [f(SY[y]["roe"]) for y in YS],
    ["Banklar soni"] + [str(SY[y]["n_banks"]) for y in YS],
    ["– shu jumladan davlat ulushi bor banklar"] + [str(SY[y]["n_state"]) for y in YS],
    ["Aktivlarda davlat ulushi bor banklar ulushi, %"] + [f(st[y]["assets"] / tot[y]["assets"] * 100) for y in YS],
]
gen("t_tizim", rows)
for y in YS:
    k = y.replace("-9M", "q3")
    put(f"tz.aktiv.{k}", tot[y]["assets"] / 1000); put(f"tz.kredit.{k}", tot[y]["loans"] / 1000); put(f"tz.depozit.{k}", tot[y]["deposits"] / 1000)
    put(f"tz.kapital.{k}", tot[y]["capital"] / 1000); put(f"tz.ldr.{k}", tot[y]["loans"] / tot[y]["deposits"] * 100, 0)
    put(f"tz.davlat.{k}", st[y]["assets"] / tot[y]["assets"] * 100); put(f"tz.xususiy.{k}", ot[y]["assets"] / tot[y]["assets"] * 100)
    put(f"tz.car.{k}", SY[y]["car"]); put(f"tz.roa.{k}", SY[y]["roa"]); put(f"tz.roe.{k}", SY[y]["roe"]); put(f"tz.lcr.{k}", SY[y]["lcr"], 0)
    put(f"tz.ldr_davlat.{k}", st[y]["loans"] / st[y]["deposits"] * 100, 0); put(f"tz.ldr_boshqa.{k}", ot[y]["loans"] / ot[y]["deposits"] * 100, 0)
    put(f"tz.davlat_dep.{k}", st[y]["deposits"] / tot[y]["deposits"] * 100); put(f"tz.davlat_kred.{k}", st[y]["loans"] / tot[y]["loans"] * 100)
    put(f"tz.n.{k}", str(SY[y]["n_banks"])); put(f"tz.n_davlat.{k}", str(SY[y]["n_state"]))
    if y != "2019":
        put(f"tz.npl.{k}", tot[y]["npl_pct"]); put(f"tz.npl_davlat.{k}", st[y]["npl_pct"]); put(f"tz.npl_boshqa.{k}", ot[y]["npl_pct"])
        put(f"tz.chakana.{k}", tot[y]["loans_ind"] / tot[y]["loans"] * 100); put(f"tz.dep_jism.{k}", tot[y]["dep_ind"] / tot[y]["deposits"] * 100)
put("tz.aktiv_marta", tot["2025"]["assets"] / tot["2019"]["assets"]); put("tz.depozit_marta", tot["2025"]["deposits"] / tot["2019"]["deposits"])
put("tz.kredit_marta", tot["2025"]["loans"] / tot["2019"]["loans"]); put("tz.kapital_marta", tot["2025"]["capital"] / tot["2019"]["capital"])
put("tz.foyda.2024", SY["2024"]["net_profit"] / 1000); put("tz.foyda.2025", SY["2025"]["net_profit"] / 1000); put("tz.foyda.2023", SY["2023"]["net_profit"] / 1000)
put("tz.zaxira.2024", SY["2024"]["loan_prov"] / 1000); put("tz.zaxira.2025", SY["2025"]["loan_prov"] / 1000)
put("tz.cir.2025", SY["2025"]["opex"] / (SY["2025"]["nii"] + SY["2025"]["nonint_inc"] - SY["2025"]["nonint_exp"] if "nonint_exp" in SY["2025"] else SY["2025"]["nii"]) * 100)
put("tz.davlat_kamayish", st["2019"]["assets"] / tot["2019"]["assets"] * 100 - st["2025"]["assets"] / tot["2025"]["assets"] * 100)

# ipoteka bozori
mort = {y: SY[y]["mortgage"] for y in YS}
gdp = {y: tot[y]["assets"] / gdp_ratio[y] * 100 for y in YR}
rows = [
    ["Ipoteka kreditlari qoldig'i, trln so'm"] + [f(mort[y] / 1000) for y in YS],
    ["Jami kreditlardagi ulushi, %"] + [f(mort[y] / tot[y]["loans"] * 100) for y in YS],
    ["Jismoniy shaxslar kreditlaridagi ulushi, %"] + [f(mort[y] / SY[y]["retail_loans"] * 100) for y in YS],
    ["Ipoteka kreditlarining YaIMga nisbati, %"] + [f(mort[y] / gdp[y] * 100) for y in YR] + ["–"],
    ["“Ipoteka-bank”ning ipoteka kreditlari (MHXS, yalpi), trln so'm"] + [f(I[y]["mortgage"] / T) for y in YR] + [f(I["2026H1"]["mortgage"] / T) + "*"],
    ["“Ipoteka-bank”ning ipoteka bozoridagi ulushi, %"] + [f(I[y]["mortgage"] / 1000 / mort[y] * 100) for y in YR] + [f(I["2026H1"]["mortgage"] / 1000 / mort["2026-9M"] * 100) + "*"],
]
gen("t_ipoteka_bozor", rows)
for y in YR:
    put(f"ib.ulush.{y}", I[y]["mortgage"] / 1000 / mort[y] * 100); put(f"ib.qoldiq.{y}", mort[y] / 1000); put(f"ib.yaim.{y}", mort[y] / gdp[y] * 100)
put("ib.marta", mort["2025"] / mort["2019"]); put("ib.kred_ulush.2025", mort["2025"] / tot["2025"]["loans"] * 100); put("ib.kred_ulush.2019", mort["2019"] / tot["2019"]["loans"] * 100)

# bozor ulushlari
top = ["Узнацбанк", "Агробанк", "Узпромстройбанк", "Асака банк", "Капитал банк", IPO, "Народный банк", "Банк развития бизнеса", "Хамкор банк", "Алока банк", "Микрокредит банк", "Ипак йули банк"]
own = {b: "Davlat" for b in STATE9}; own.update({"Капитал банк": "Xususiy", "Хамкор банк": "Xususiy", "Ипак йули банк": "Xususiy", IPO: "Xorijiy strategik investor (2023-yildan)"})
cols = ["2019", "2022", "2025", "2026-9M"]
rows = []
for b in top:
    nm = UZ[b]
    rows.append([("**%s**" % nm) if b == IPO else nm, own[b]] + [f(ind(y, b, "share")) for y in cols] + [f(ind("2025", b, "share") - ind("2019", b, "share"), 1, True)])
rest = lambda y: 100 - sum(ind(y, b, "share") for b in top)
rows.append(["Boshqa banklar", "–"] + [f(rest(y)) for y in cols] + [f(rest("2025") - rest("2019"), 1, True)])
gen("t_ulush", rows)
for y in YS:
    k = y.replace("-9M", "q3")
    put(f"ip.ulush.{k}", ind(y, IPO, "share")); put(f"ip.ulush_kred.{k}", B[y][IPO]["loans"] / tot[y]["loans"] * 100); put(f"ip.ulush_dep.{k}", B[y][IPO]["deposits"] / tot[y]["deposits"] * 100)
    rk = 1 + sum(1 for b in B[y] if B[y][b]["assets"] > B[y][IPO]["assets"]); put(f"ip.orin.{k}", str(rk))
put("ul.kapital.2019", ind("2019", "Капитал банк", "share")); put("ul.kapital.2025", ind("2025", "Капитал банк", "share"))
put("ul.nbu.2019", ind("2019", "Узнацбанк", "share")); put("ul.nbu.2025", ind("2025", "Узнацбанк", "share"))
put("ul.agro.2019", ind("2019", "Агробанк", "share")); put("ul.agro.2025", ind("2025", "Агробанк", "share"))
put("ul.boshqa.2019", rest("2019")); put("ul.boshqa.2025", rest("2025"))

# konsentratsiya
hhi = {y: sum((v["assets"] / tot[y]["assets"] * 100) ** 2 for v in B[y].values()) for y in YS}
cr = lambda y, n: sum(sorted((v["assets"] / tot[y]["assets"] * 100 for v in B[y].values()), reverse=True)[:n])
rows = [["HHI (aktivlar bo'yicha)"] + [f(hhi[y], 0) for y in YS], ["CR3 (aktivlar bo'yicha), %"] + [f(cr(y, 3)) for y in YS], ["CR5 (aktivlar bo'yicha), %"] + [f(cr(y, 5)) for y in YS],
        ["HHI (depozitlar bo'yicha)"] + [f(sum((v["deposits"] / tot[y]["deposits"] * 100) ** 2 for v in B[y].values() if v.get("deposits")), 0) for y in YS],
        ["Banklar soni"] + [str(SY[y]["n_banks"]) for y in YS]]
gen("t_konsentratsiya", rows)
for y in ("2019", "2022", "2025"):
    put(f"kn.hhi.{y}", hhi[y], 0); put(f"kn.cr5.{y}", cr(y, 5)); put(f"kn.cr3.{y}", cr(y, 3))

# davlat va boshqa banklar (2025)
def grp(y, g):
    x = (st if g == "s" else ot)[y]
    return dict(a=x["assets"] / tot[y]["assets"] * 100, l=x["loans"] / tot[y]["loans"] * 100, d=x["deposits"] / tot[y]["deposits"] * 100, k=x["capital"] / tot[y]["capital"] * 100,
                ldr=x["loans"] / x["deposits"] * 100, npl=x.get("npl_pct"), ea=x["capital"] / x["assets"] * 100,
                rl=(x["loans_ind"] / x["loans"] * 100) if "loans_ind" in x else (tot[y]["loans_ind"] - st[y]["loans_ind"]) / x["loans"] * 100,
                rd=(x["dep_ind"] / x["deposits"] * 100) if "dep_ind" in x else (tot[y]["dep_ind"] - st[y]["dep_ind"]) / x["deposits"] * 100)
rows = []
for lab, key, d in (("Aktivlardagi ulushi, %", "a", 1), ("Kreditlardagi ulushi, %", "l", 1), ("Depozitlardagi ulushi, %", "d", 1), ("Kreditlar/depozitlar, %", "ldr", 0),
                    ("Muammoli kreditlar ulushi, %", "npl", 1), ("Kapitalning aktivlarga nisbati, %", "ea", 1), ("Kreditlarda jismoniy shaxslar ulushi, %", "rl", 1),
                    ("Depozitlarda jismoniy shaxslar ulushi, %", "rd", 1)):
    r = [lab]
    for y in ("2020", "2025"):
        s_, o_ = grp(y, "s")[key], grp(y, "o")[key]
        r += [f(s_, d), f(o_, d)]
    rows.append(r)
    put(f"dx.{key}.s25", grp("2025", "s")[key], d); put(f"dx.{key}.o25", grp("2025", "o")[key], d); put(f"dx.{key}.s20", grp("2020", "s")[key], d); put(f"dx.{key}.o20", grp("2020", "o")[key], d)
gen("t_davlat_xususiy", rows)

# ================================================================== 2. “IPOTEKA-BANK” (MHXS)
M = {}
for i, y in enumerate(YR):
    a, p = I[y], I[str(int(y) - 1)]
    m = {}
    avg_ta = (a["ta"] + p["ta"]) / 2; avg_eq = (a["eq"] + p["eq"]) / 2
    m["roa"] = a["np"] / avg_ta * 100; m["roe"] = a["np"] / avg_eq * 100
    ti = a["nii"] + a["fee_inc"] - a["fee_exp"] + a["fx"] + a["fx_tr"] + a["oth_inc"]
    m["ti"] = ti; m["cir"] = a["opex"] / ti * 100; m["nim"] = a["nii"] / avg_ta * 100
    avg_g = (a["gross"] + p.get("gross", a["gross"])) / 2
    m["cor"] = a["ecl_charge"] / avg_g * 100
    m["s3"] = a["s3"] / a["gross"] * 100; m["s2"] = a["s2"] / a["gross"] * 100; m["cov3"] = a["s3_ecl"] / a["s3"] * 100; m["cov"] = a["ecl"] / a["gross"] * 100
    m["ldr"] = a["loans"] / a["cust"] * 100; m["ea"] = a["eq"] / a["ta"] * 100; m["la"] = a["loans"] / a["ta"] * 100
    m["retail"] = (a["mortgage"] + a["consumer"]) / a["gross"] * 100
    m["state_f"] = (a["b_mof"] + a["cust_state"]) / a["tl"] * 100; m["mof"] = a["b_mof"] / a["tl"] * 100
    m["fx"] = a["fx_pos"] / a["eq"] * 100
    m["npl_nas"] = B[y][IPO].get("npl_pct"); m["share"] = ind(y, IPO, "share")
    m["nfi"] = (a["fee_inc"] - a["fee_exp"] + a["fx"] + a["fx_tr"] + a["oth_inc"]) / avg_ta * 100
    m["opex_a"] = a["opex"] / avg_ta * 100; m["ecl_a"] = a["ecl_charge"] / avg_ta * 100; m["pbt_a"] = a["pbt"] / avg_ta * 100; m["tax_a"] = a["tax"] / avg_ta * 100
    m["staff_sh"] = a["staff"] / a["opex"] * 100
    M[y] = m
h = I["2026H1"]; hp = I["2025"]
M["2026H1"] = dict(roa=h["np"] * 2 / ((h["ta"] + hp["ta"]) / 2) * 100, roe=h["np"] * 2 / ((h["eq"] + hp["eq"]) / 2) * 100, s3=h["s3"] / h["gross"] * 100, cov3=h["s3_ecl"] / h["s3"] * 100,
                 ldr=h["loans"] / h["cust"] * 100, ea=h["eq"] / h["ta"] * 100, la=h["loans"] / h["ta"] * 100, retail=(h["mortgage"] + h["consumer"]) / h["gross"] * 100,
                 cir=h["opex"] / (h["nii"] + h["fee_inc"] - h["fee_exp"] + h["fx"] + h["fx_tr"] + 32529 - 19025 - 18758 + 11604) * 100, nim=h["nii"] * 2 / ((h["ta"] + hp["ta"]) / 2) * 100)

YH = YR + ["2026H1"]
hh = lambda y: "2026 (30-iyun)" if y == "2026H1" else y
rows = [
    ["Jami aktivlar"] + [f(I[y]["ta"] / T) for y in YH],
    ["Mijozlarga kreditlar (sof)"] + [f(I[y]["loans"] / T) for y in YH],
    ["Kreditlar (yalpi, zaxiralargacha)"] + [f(I[y]["gross"] / T) for y in YH],
    ["Pul mablag'lari va banklardagi mablag'lar"] + [f((I[y]["cash"] + I[y]["banks"]) / T) for y in YH],
    ["Qarz qimmatli qog'ozlari"] + [f(I[y]["secs"] / T) for y in YH],
    ["Mijozlar hisobvaraqlari (depozitlar)"] + [f(I[y]["cust"] / T) for y in YH],
    ["Hukumat, davlat va xalqaro moliya institutlaridan qarzlar"] + [f(I[y]["borr"] / T) for y in YH],
    ["Chiqarilgan qarz qimmatli qog'ozlari"] + [f(I[y]["debt"] / T) for y in YH],
    ["Jami majburiyatlar"] + [f(I[y]["tl"] / T) for y in YH],
    ["Jami kapital"] + [f(I[y]["eq"] / T) for y in YH],
    ["Kreditlarning aktivlardagi ulushi, %"] + [f(M[y]["la"]) for y in YH],
    ["Kapitalning aktivlarga nisbati, %"] + [f(M[y]["ea"]) for y in YH],
    ["Kreditlar/depozitlar, %"] + [f(M[y]["ldr"], 0) for y in YH],
    ["Bank tizimi aktivlaridagi ulushi, %^{a}"] + [f(M[y]["share"]) for y in YR] + [f(ind("2026-9M", IPO, "share")) + "^{b}"],
]
gen("t_balans", rows)
rows = [
    ["Sof foizli daromad, mlrd so'm"] + [f(I[y]["nii"] / 1000, 0) for y in YR],
    ["Jami operatsion daromad, mlrd so'm"] + [f(M[y]["ti"] / 1000, 0) for y in YR],
    ["Operatsion xarajatlar, mlrd so'm"] + [f(I[y]["opex"] / 1000, 0) for y in YR],
    ["Kredit zararlari bo'yicha zaxira xarajatlari, mlrd so'm"] + [f(I[y]["ecl_charge"] / 1000, 0) for y in YR],
    ["Sof foyda (zarar), mlrd so'm"] + [f(I[y]["np"] / 1000, 0) for y in YR],
    ["ROA, %"] + [f(M[y]["roa"]) for y in YR],
    ["ROE, %"] + [f(M[y]["roe"]) for y in YR],
    ["Sof foiz marjasi (NIM), %"] + [f(M[y]["nim"]) for y in YR],
    ["Xarajatlar/daromadlar (CIR), %"] + [f(M[y]["cir"]) for y in YR],
    ["Kredit riski narxi (CoR), %"] + [f(M[y]["cor"]) for y in YR],
    ["3-bosqich (qadrsizlangan) kreditlar ulushi, %"] + [f(M[y]["s3"]) for y in YR],
    ["Muammoli kreditlar (NPL) ulushi, milliy standartlar, %"] + [e(1.4)] + [f(M[y]["npl_nas"]) for y in YR[1:]],
    ["Regulyativ kapital yetarliligi (CAR), %"] + [f(I[y]["car"]) for y in YR],
    ["I darajali kapital yetarliligi, %"] + [f(I[y]["t1"]) for y in YR],
]
gen("t_rent", rows)
rows = [
    ["Sof foizli daromadlar"] + [f(M[y]["nim"], 2) for y in YR],
    ["Sof foizsiz daromadlar"] + [f(M[y]["nfi"], 2) for y in YR],
    ["Operatsion xarajatlar"] + [f(-M[y]["opex_a"], 2) for y in YR],
    ["Kredit zararlari bo'yicha zaxiralar"] + [f(-M[y]["ecl_a"], 2) for y in YR],
    ["Soliqdan oldingi foyda"] + [f(M[y]["pbt_a"], 2) for y in YR],
    ["Foyda solig'i"] + [f(-M[y]["tax_a"], 2) for y in YR],
    ["Sof foyda (ROA)"] + [f(M[y]["roa"], 2) for y in YR],
]
gen("t_dupont", rows)
ys3 = ["2019", "2022", "2025"]
rows = [
    ["Mijozlarga kreditlar (sof)"] + [f(I[y]["loans"] / I[y]["ta"] * 100) for y in ys3],
    ["Pul mablag'lari va ularning ekvivalentlari"] + [f(I[y]["cash"] / I[y]["ta"] * 100) for y in ys3],
    ["Boshqa banklardagi mablag'lar"] + [f(I[y]["banks"] / I[y]["ta"] * 100) for y in ys3],
    ["Qarz qimmatli qog'ozlari"] + [f(I[y]["secs"] / I[y]["ta"] * 100) for y in ys3],
    ["Asosiy vositalar va boshqa aktivlar"] + [f((I[y]["ta"] - I[y]["loans"] - I[y]["cash"] - I[y]["banks"] - I[y]["secs"]) / I[y]["ta"] * 100) for y in ys3],
    ["**Kredit portfeli tarkibi (yalpi kreditlarga nisbatan):**", "", "", ""],
    ["– ipoteka kreditlari"] + [f(I[y]["mortgage"] / I[y]["gross"] * 100) for y in ys3],
    ["– iste'mol kreditlari"] + [f(I[y]["consumer"] / I[y]["gross"] * 100) for y in ys3],
    ["– korporativ kreditlar"] + [f(I[y]["corporate"] / I[y]["gross"] * 100) for y in ys3],
    ["– kichik biznes kreditlari"] + [f(I[y]["sme"] / I[y]["gross"] * 100) for y in ys3],
]
gen("t_aktiv_tuzilma", rows)
rows = [
    ["Yalpi kreditlar, trln so'm"] + [f(I[y]["gross"] / T) for y in YH],
    ["1-bosqich, %"] + [f(I[y]["s1"] / I[y]["gross"] * 100) for y in YH],
    ["2-bosqich, %"] + [f(I[y]["s2"] / I[y]["gross"] * 100) for y in YH],
    ["3-bosqich (qadrsizlangan), %"] + [f(M[y]["s3"]) for y in YH],
    ["3-bosqich kreditlar, trln so'm"] + [f(I[y]["s3"] / T) for y in YH],
    ["Kutilayotgan kredit zararlari zaxirasi, trln so'm"] + [f(I[y]["ecl"] / T) for y in YH],
    ["Zaxiraning yalpi kreditlarga nisbati, %"] + [f(I[y]["ecl"] / I[y]["gross"] * 100) for y in YH],
    ["3-bosqich kreditlarning zaxira bilan qoplanishi, %"] + [f(M[y]["cov3"]) for y in YH],
    ["3-bosqich ulushi: korporativ kreditlar, %"] + ["2,6", "1,1", "1,8", "7,0", "41,9", "35,3", "35,6", f(5144682 / 10495771 * 100)],
    ["3-bosqich ulushi: kichik biznes kreditlari, %"] + ["6,9", "11,2", "18,3", "16,4", "37,9", "66,3", "79,0", f(970660 / 1549535 * 100)],
    ["3-bosqich ulushi: ipoteka kreditlari, %"] + ["1,0", "3,0", "2,9", "1,7", "0,7", "2,0", "2,8", f(580246 / 18670358 * 100)],
    ["3-bosqich ulushi: iste'mol kreditlari, %"] + ["1,0", "7,0", "4,6", "2,7", "0,6", "4,6", "7,4", f(1168785 / 11709714 * 100)],
    ["Muammoli kreditlar (NPL), milliy standartlar, %"] + [e(1.4)] + [f(M[y]["npl_nas"]) for y in YR[1:]] + [f(B["2026-9M"][IPO]["npl_pct"]) + "*"],
]
gen("t_kredit_sifat", rows)
mean = lambda k, ys: float(np.mean([M[y][k] for y in ys]))
meanI = lambda k, ys: float(np.mean([I[y][k] for y in ys]))
OK = [("Kapitalning aktivlarga nisbati, %", lambda ys: mean("ea", ys), "Neytral"), ("Regulyativ kapital yetarliligi, %", lambda ys: meanI("car", ys), "Neytral (2019-yildagi bir martalik kapitallashuv ta'siri)"),
      ("Kreditlar/depozitlar, %", lambda ys: mean("ldr", ys), "Ijobiy"), ("Sof foiz marjasi (NIM), %", lambda ys: mean("nim", ys), "Ijobiy"),
      ("Xarajatlar/daromadlar (CIR), %", lambda ys: mean("cir", ys), "Salbiy (integratsiya xarajatlari)"), ("ROA, %", lambda ys: mean("roa", ys), "Salbiy (2023-yil zarari); 2024–2025-yillarda ijobiy"),
      ("ROE, %", lambda ys: mean("roe", ys), "Salbiy (2023-yil zarari); 2024–2025-yillarda ijobiy"),
      ("Kredit riski narxi (CoR), %", lambda ys: mean("cor", ys), "Salbiy (2023-yildagi tozalash)"),
      ("3-bosqich kreditlar ulushi, %", lambda ys: mean("s3", ys), "Salbiy (tan olish samarasi)"),
      ("Kredit portfelida chakana kreditlar ulushi, %", lambda ys: mean("retail", ys), "Ijobiy (diversifikatsiya)"),
      ("Majburiyatlarda davlat mablag'lari ulushi, %", lambda ys: mean("state_f", ys), "Ijobiy"),
      ("Bozor ulushi (aktivlar), %", lambda ys: mean("share", ys), "Salbiy")]
rows = []
for lab, fn, eff in OK:
    a, b = fn(PRE), fn(POST)
    rows.append([lab, f(a), f(b), f(b - a, 1, True) + " f.p.", eff])
gen("t_oldin_keyin", rows)
for k in ("ea", "ldr", "nim", "cir", "roa", "roe", "cor", "s3", "retail", "state_f", "share"):
    put(f"ok.{k}.pre", mean(k, PRE)); put(f"ok.{k}.post", mean(k, POST)); put(f"ok.{k}.d", mean(k, POST) - mean(k, PRE), 1, sign=True)
put("ok.roa.sd_pre", float(np.std([M[y]["roa"] for y in PRE], ddof=1)), 2); put("ok.roa.sd_post", float(np.std([M[y]["roa"] for y in POST], ddof=1)), 2)
put("ok.roa.post2", mean("roa", ["2024", "2025"])); put("ok.roe.post2", mean("roe", ["2024", "2025"]))

rows = [
    ["2023-yil", f(I["2023"]["np"] / 1000, 0), f(M["2023"]["roe"]), f(M["2023"]["roa"]), "Zaxira xarajatlari 4 275 mlrd so'm; CoR " + f(M["2023"]["cor"]) + "%"],
    ["2024-yil", f(I["2024"]["np"] / 1000, 0), f(M["2024"]["roe"]), f(M["2024"]["roa"]), "NIM " + f(M["2024"]["nim"]) + "%; CIR " + f(M["2024"]["cir"]) + "%; kapital +" + f((I["2024"]["eq"] / I["2023"]["eq"] - 1) * 100, 0) + "%"],
    ["2025-yil I yarmi", f(I["2025H1"]["np"] / 1000, 0), "–", "–", "Zaxiralarning tiklanishi 417 mlrd so'm"],
    ["2025-yil", f(I["2025"]["np"] / 1000, 0), f(M["2025"]["roe"]), f(M["2025"]["roa"]), "Zaxiralarning tiklanishi 257 mlrd so'm; CIR " + f(M["2025"]["cir"]) + "%"],
    ["2026-yil I yarmi", f(I["2026H1"]["np"] / 1000, 0), f(M["2026H1"]["roe"]) + "*", f(M["2026H1"]["roa"]) + "*", "Sof foyda +" + f((I["2026H1"]["np"] / I["2025H1"]["np"] - 1) * 100, 0) + "%; sof foizli daromad +" + f((I["2026H1"]["nii"] / I["2025H1"]["nii"] - 1) * 100, 0) + "%"],
    ["2026-yil 9 oyi", "≈1 800", "–", "–", "Sof foyda +56%; aktivlar 57,9 trln so'm"],
]
gen("t_oraliq", rows)
b25 = B["2025"][IPO]
rows = [
    ["Kreditlar/depozitlar (milliy standartlar), %", f(b25["loans"] / b25["deposits"] * 100, 0), f(tot["2025"]["loans"] / tot["2025"]["deposits"] * 100, 0), f(grp("2025", "s")["ldr"], 0), f(grp("2025", "o")["ldr"], 0)],
    ["Muammoli kreditlar ulushi (milliy standartlar), %", f(b25["npl_pct"]), f(tot["2025"]["npl_pct"]), f(st["2025"]["npl_pct"]), f(ot["2025"]["npl_pct"])],
    ["Kapitalning aktivlarga nisbati (milliy standartlar), %", f(b25["capital"] / b25["assets"] * 100), f(tot["2025"]["capital"] / tot["2025"]["assets"] * 100), f(grp("2025", "s")["ea"]), f(grp("2025", "o")["ea"])],
    ["Kapital yetarliligi koeffitsiyenti, %", f(I["2025"]["car"]), f(SY["2025"]["car"]), "–", "–"],
    ["Kreditlarda jismoniy shaxslar ulushi, %", f(b25["loans_ind"] / b25["loans"] * 100), f(tot["2025"]["loans_ind"] / tot["2025"]["loans"] * 100), f(grp("2025", "s")["rl"]), f(grp("2025", "o")["rl"])],
    ["Depozitlarda jismoniy shaxslar ulushi, %", f(b25["dep_ind"] / b25["deposits"] * 100), f(tot["2025"]["dep_ind"] / tot["2025"]["deposits"] * 100), f(grp("2025", "s")["rd"]), f(grp("2025", "o")["rd"])],
    ["ROA, %", f(M["2025"]["roa"]) + "*", f(SY["2025"]["roa"]), "–", "–"],
    ["ROE, %", f(M["2025"]["roe"]) + "*", f(SY["2025"]["roe"]), "–", "–"],
    ["Likvidlikni qoplash me'yori (LCR), %", "225", f(SY["2025"]["lcr"], 0), "–", "–"],
    ["Sof barqaror moliyalashtirish me'yori (NSFR), %", "127", f(SY["2025"]["nsfr"], 0), "–", "–"],
]
gen("t_taqqos", rows)
put("tq.ldr_ip", b25["loans"] / b25["deposits"] * 100, 0); put("tq.npl_ip", b25["npl_pct"]); put("tq.rl_ip", b25["loans_ind"] / b25["loans"] * 100); put("tq.rd_ip", b25["dep_ind"] / b25["deposits"] * 100)
put("tq.rl_tz", tot["2025"]["loans_ind"] / tot["2025"]["loans"] * 100); put("tq.rd_tz", tot["2025"]["dep_ind"] / tot["2025"]["deposits"] * 100)
put("tq.ea_ip", b25["capital"] / b25["assets"] * 100); put("tq.ea_tz", tot["2025"]["capital"] / tot["2025"]["assets"] * 100)
for y in YS:
    k = y.replace("-9M", "q3"); bb = B[y][IPO]
    put(f"ipn.aktiv.{k}", bb["assets"] / 1000); put(f"ipn.ldr.{k}", bb["loans"] / bb["deposits"] * 100, 0)
    if bb.get("npl_pct") is not None: put(f"ipn.npl.{k}", bb["npl_pct"]); put(f"ipn.npl_sum.{k}", bb["npl"] / 1000)
    if bb.get("loans_ind") is not None: put(f"ipn.rl.{k}", bb["loans_ind"] / bb["loans"] * 100); put(f"ipn.rd.{k}", bb["dep_ind"] / bb["deposits"] * 100)
    put(f"ipn.kredit.{k}", bb["loans"] / 1000); put(f"ipn.depozit.{k}", bb["deposits"] / 1000)
ysL = ["2019", "2021", "2022", "2023", "2025"]
def liab(y):
    a = I[y]; tl = a["tl"]
    oth_cust = a["cust"] - a["cust_state"] - a["cust_ind"]
    ufrd = a["borr"] - a["b_mof"] - a["b_ifi"] - a["b_dom"]
    return [a["b_mof"] / tl * 100, a["cust_state"] / tl * 100, a["cust_ind"] / tl * 100, oth_cust / tl * 100, a["b_ifi"] / tl * 100, (a["b_dom"] + ufrd) / tl * 100, a["debt"] / tl * 100,
            (a["sub"] + a["due_banks"]) / tl * 100, (tl - a["cust"] - a["borr"] - a["debt"] - a["sub"] - a["due_banks"]) / tl * 100]
LB = ["Iqtisodiyot va moliya vazirligidan qarzlar", "Davlat va budjet tashkilotlari hisobvaraqlari", "Jismoniy shaxslar omonatlari", "Boshqa yuridik shaxslar hisobvaraqlari",
      "Xalqaro moliya institutlari va xorijiy banklar kreditlari", "Mahalliy moliya institutlari va Tiklanish va taraqqiyot jamg'armasi qarzlari", "Chiqarilgan qarz qimmatli qog'ozlari (yevroobligatsiyalar va b.)",
      "Subordinar qarz va banklar mablag'lari", "Boshqa majburiyatlar"]
LV = {y: liab(y) for y in ysL}
rows = [[LB[i]] + [f(LV[y][i]) for y in ysL] for i in range(9)]
rows.insert(2, ["**Jami davlat bilan bog'liq mablag'lar**"] + ["**" + f(LV[y][0] + LV[y][1]) + "**" for y in ysL])
rows.append(["Jami majburiyatlar, trln so'm"] + [f(I[y]["tl"] / T) for y in ysL])
gen("t_majburiyat", rows)

for y in YH:
    k = y
    put(f"ip.ta.{k}", I[y]["ta"] / T); put(f"ip.loans.{k}", I[y]["loans"] / T); put(f"ip.gross.{k}", I[y]["gross"] / T); put(f"ip.cust.{k}", I[y]["cust"] / T); put(f"ip.eq.{k}", I[y]["eq"] / T)
    put(f"ip.s3.{k}", M[y]["s3"]); put(f"ip.s3_sum.{k}", I[y]["s3"] / T); put(f"ip.ecl.{k}", I[y]["ecl"] / T); put(f"ip.cov3.{k}", M[y]["cov3"], 0)
    put(f"ip.np.{k}", I[y]["np"] / 1000, 0); put(f"ip.np_abs.{k}", abs(I[y]["np"]) / 1000, 0); put(f"ip.roa.{k}", M[y]["roa"]); put(f"ip.roe.{k}", M[y]["roe"]); put(f"ip.ldr.{k}", M[y]["ldr"], 0)
    put(f"ip.ea.{k}", M[y]["ea"]); put(f"ip.la.{k}", M[y]["la"]); put(f"ip.retail.{k}", M[y]["retail"]); put(f"ip.cir.{k}", M[y]["cir"]); put(f"ip.nim.{k}", M[y]["nim"])
    put(f"ip.car.{k}", I[y]["car"]); put(f"ip.t1.{k}", I[y]["t1"]); put(f"ip.borr.{k}", I[y]["borr"] / T); put(f"ip.tl.{k}", I[y]["tl"] / T)
    put(f"ip.mortgage.{k}", I[y]["mortgage"] / T); put(f"ip.consumer.{k}", I[y]["consumer"] / T); put(f"ip.corporate.{k}", I[y]["corporate"] / T); put(f"ip.sme.{k}", I[y]["sme"] / T)
    put(f"ip.mortgage_sh.{k}", I[y]["mortgage"] / I[y]["gross"] * 100); put(f"ip.consumer_sh.{k}", I[y]["consumer"] / I[y]["gross"] * 100)
    put(f"ip.business_sh.{k}", (I[y]["corporate"] + I[y]["sme"]) / I[y]["gross"] * 100); put(f"ip.secs.{k}", I[y]["secs"] / T); put(f"ip.secs_sh.{k}", I[y]["secs"] / I[y]["ta"] * 100)
    put(f"ip.s2.{k}", I[y]["s2"] / I[y]["gross"] * 100)
    if y in YR:
        put(f"ip.cor.{k}", M[y]["cor"]); put(f"ip.ecl_charge.{k}", abs(I[y]["ecl_charge"]) / 1000, 0); put(f"ip.nii.{k}", I[y]["nii"] / 1000, 0); put(f"ip.opex.{k}", I[y]["opex"] / 1000, 0)
        put(f"ip.ti.{k}", M[y]["ti"] / 1000, 0); put(f"ip.state_f.{k}", M[y]["state_f"]); put(f"ip.mof.{k}", M[y]["mof"]); put(f"ip.mof_sum.{k}", I[y]["b_mof"] / T)
        put(f"ip.ind_sh.{k}", I[y]["cust_ind"] / I[y]["cust"] * 100); put(f"ip.state_sh.{k}", I[y]["cust_state"] / I[y]["cust"] * 100); put(f"ip.ind.{k}", I[y]["cust_ind"] / T)
        put(f"ip.staff.{k}", I[y]["staff"] / 1000, 0); put(f"ip.staff_sh.{k}", M[y]["staff_sh"]); put(f"ip.fx.{k}", M[y]["fx"]); put(f"ip.ifi.{k}", I[y]["b_ifi"] / T)
        put(f"ip.fee.{k}", (I[y]["fee_inc"] - I[y]["fee_exp"]) / 1000, 0); put(f"ip.pbt.{k}", I[y]["pbt"] / 1000, 0); put(f"ip.debt.{k}", I[y]["debt"] / T)
put("ip.ta_marta", I["2025"]["ta"] / I["2019"]["ta"]); put("ip.ta_osish_orta", ((I["2025"]["ta"] / I["2019"]["ta"]) ** (1 / 6) - 1) * 100)
put("ip.ta_osish_pre", ((I["2022"]["ta"] / I["2019"]["ta"]) ** (1 / 3) - 1) * 100); put("ip.ta_osish_post", ((I["2025"]["ta"] / I["2022"]["ta"]) ** (1 / 3) - 1) * 100)
put("tz.osish_pre", ((tot["2022"]["assets"] / tot["2019"]["assets"]) ** (1 / 3) - 1) * 100); put("tz.osish_post", ((tot["2025"]["assets"] / tot["2022"]["assets"]) ** (1 / 3) - 1) * 100)
put("ip.eq_osish.2024", (I["2024"]["eq"] / I["2023"]["eq"] - 1) * 100, 0); put("ip.eq_osish.2025", (I["2025"]["eq"] / I["2024"]["eq"] - 1) * 100, 0)
put("ip.s3_osish.2023", I["2023"]["s3"] / I["2022"]["s3"]); put("ip.ecl_osish.2023", I["2023"]["ecl"] / I["2022"]["ecl"])
put("ip.zarar_kapital.2023", abs(I["2023"]["np"]) / I["2022"]["eq"] * 100); put("ip.np_osish.2025", (I["2025"]["np"] / I["2024"]["np"] - 1) * 100, 0)
put("ip.np_h1_osish", (I["2026H1"]["np"] / I["2025H1"]["np"] - 1) * 100, 0); put("ip.np.2025H1", I["2025H1"]["np"] / 1000, 0); put("ip.nii_h1_osish", (I["2026H1"]["nii"] / I["2025H1"]["nii"] - 1) * 100, 0)
put("ip.cust_osish.2024", (I["2024"]["cust"] / I["2023"]["cust"] - 1) * 100, 0); put("ip.ind_marta", I["2025"]["cust_ind"] / I["2022"]["cust_ind"])
put("ip.wo_farq.2025", (I["2025"]["gross"] - B["2025"][IPO]["loans"] * 1000) / T); put("ip.sof_s3.2025", (I["2025"]["s3"] - I["2025"]["s3_ecl"]) / I["2025"]["loans"] * 100)
put("ip.kredit_nas.2025", B["2025"][IPO]["loans"] / 1000); put("ip.opex_osish", (I["2025"]["opex"] / I["2022"]["opex"] - 1) * 100, 0); put("ip.ti_osish", (M["2025"]["ti"] / M["2022"]["ti"] - 1) * 100, 0)
put("ip.staff_osish", (I["2025"]["staff"] / I["2022"]["staff"] - 1) * 100, 0); put("ip.cons_marta", I["2025"]["consumer"] / I["2022"]["consumer"])
put("ip.biz_kam", (1 - (I["2025"]["corporate"] + I["2025"]["sme"]) / (I["2022"]["corporate"] + I["2022"]["sme"])) * 100, 0)
put("ip.kapital_2019_marta", I["2019"]["eq"] / I["2018"]["eq"]); put("ip.eq.2018", I["2018"]["eq"] / T)
put("ip.zaxira_tiklash.2025", abs(I["2025"]["ecl_charge"]) / 1000, 0); put("ip.pbt_zaxirasiz.2025", (I["2025"]["pbt"] + I["2025"]["ecl_charge"]) / 1000, 0)
put("ip.pbt_zaxirasiz.2024", (I["2024"]["pbt"] + I["2024"]["ecl_charge"]) / 1000, 0); put("ip.pbt_zaxirasiz.2022", (I["2022"]["pbt"] + I["2022"]["ecl_charge"]) / 1000, 0)
put("ip.pbt_zaxirasiz.2023", (I["2023"]["pbt"] + I["2023"]["ecl_charge"]) / 1000, 0)

# ================================================================== 3. CAMELS, Z-score, BBII
def score(v, cuts, rev=False):
    """cuts — 1,2,3,4 ball chegaralari (o'sish tartibida yomonlashadi); rev=True — katta qiymat yaxshi."""
    if rev:
        return 1 + sum(1 for c in cuts if v < c)
    return 1 + sum(1 for c in cuts if v >= c)

CUT = {"C": ([18, 15, 13, 10], True), "A": ([2, 4, 6, 10], False), "M": ([40, 50, 60, 70], False), "E": ([2.5, 1.5, 0.5, 0], True), "L": ([100, 130, 170, 220], False), "S": ([5, 10, 15, 20], False)}
WC = {"C": 0.25, "A": 0.25, "M": 0.10, "E": 0.15, "L": 0.15, "S": 0.10}
def camels(vals):
    sc = {k: score(vals[k], *CUT[k]) for k in CUT}
    return sc, sum(WC[k] * sc[k] for k in CUT)
sd_roa = float(np.std([M[y]["roa"] for y in YR], ddof=1))
CM, Z, BB = {}, {}, {}
def bbii(cam, z, w1=0.6, zs=15): return w1 * (5 - cam) / 4 + (1 - w1) * min(z / zs, 1)
for y in YR:
    vals = {"C": I[y]["car"], "A": M[y]["s3"], "M": M[y]["cir"], "E": M[y]["roa"], "L": M[y]["ldr"], "S": M[y]["fx"]}
    sc, comp = camels(vals); CM[y] = (vals, sc, comp)
    Z[y] = (M[y]["roa"] + M[y]["ea"]) / sd_roa; BB[y] = bbii(comp, Z[y])
lev = lambda b: "Yuqori" if b >= 0.75 else "Qoniqarli" if b >= 0.5 else "Past"
LBL = {"C": "C: regulyativ kapital yetarliligi, %", "A": "A: 3-bosqich kreditlar ulushi, %", "M": "M: xarajatlar/daromadlar (CIR), %", "E": "E: ROA, %", "L": "L: kreditlar/depozitlar, %",
       "S": "S: ochiq valyuta pozitsiyasi/kapital, %"}
rows = []
for k in "CAMELS":
    rows.append([LBL[k]] + [f(CM[y][0][k], 0 if k == "L" else 1) for y in YR]); rows.append([k + " bali"] + [str(CM[y][1][k]) for y in YR])
rows.append(["**Kompozit CAMELS bali**"] + ["**" + f(CM[y][2], 2) + "**" for y in YR])
gen("t_camels", rows)
rows = [["ROA, %"] + [f(M[y]["roa"], 2) for y in YR], ["Kapitalning aktivlarga nisbati, %"] + [f(M[y]["ea"]) for y in YR], ["Z-score"] + [f(Z[y], 2) for y in YR],
        ["Normallashtirilgan CAMELS, (5 – CAMELS)/4"] + [f((5 - CM[y][2]) / 4, 3) for y in YR], ["Normallashtirilgan Z-score, min(Z/15; 1)"] + [f(min(Z[y] / 15, 1), 3) for y in YR],
        ["**BBII**"] + ["**" + f(BB[y], 3) + "**" for y in YR], ["Barqarorlik darajasi"] + [lev(BB[y]) for y in YR]]
gen("t_bbii", rows)
# muqobil variantlar
def bb_var(w1=0.6, zs=15, a_nas=False, sd=None, l_nas=False):
    out = []
    for y in YR:
        vals = dict(CM[y][0])
        if a_nas: vals["A"] = M[y]["npl_nas"] if M[y]["npl_nas"] is not None else 1.4
        if l_nas: vals["L"] = ind(y, IPO, "ldr")
        _, comp = camels(vals); z = (M[y]["roa"] + M[y]["ea"]) / (sd or sd_roa)
        out.append(bbii(comp, z, w1, zs))
    return out
sd_pre = float(np.std([M[y]["roa"] for y in PRE], ddof=1))
VAR = [("Asosiy (w_1 = 0,6; Z* = 15; A – 3-bosqich ulushi)", bb_var()), ("w_1 = 0,5; Z* = 15", bb_var(0.5)), ("w_1 = 0,7; Z* = 15", bb_var(0.7)), ("w_1 = 0,6; Z* = 10", bb_var(0.6, 10)),
       ("w_1 = 0,6; Z* = 20", bb_var(0.6, 20)), ("A – milliy standartlar bo'yicha NPL ulushi*", bb_var(a_nas=True)),
       ("A va L – milliy standartlar bo'yicha (NPL; kreditlar/depozitlar)*", bb_var(a_nas=True, l_nas=True))]
rows = [[n] + [f(x, 3) for x in v] for n, v in VAR]
gen("t_bbii_mustahkam", rows)
for y in YR:
    put(f"bb.{y}", BB[y], 3); put(f"cm.{y}", CM[y][2], 2); put(f"z.{y}", Z[y], 2); put(f"bb.nas.{y}", VAR[5][1][YR.index(y)], 3); put(f"bb.nas2.{y}", VAR[6][1][YR.index(y)], 3)
put("z.sd", sd_roa, 2); put("z.sd_pre", sd_pre, 2); put("bb.max_y", max(YR, key=lambda y: BB[y])); put("bb.min_y", min(YR, key=lambda y: BB[y]))
put("bb.min", min(BB.values()), 3); put("bb.max", max(BB.values()), 3)
# sezgirlik: 2025-yilda A bali o'zgarsa
def bb_a(y, a_score):
    sc = dict(CM[y][1]); sc["A"] = a_score
    return bbii(sum(WC[k] * sc[k] for k in CUT), Z[y])
for a_ in (1, 2, 3, 4, 5): put(f"bb.sens.A{a_}", bb_a("2025", a_), 3)
put("bb.sens.farq", bb_a("2025", 3) - BB["2025"], 3)

# ================================================================== 4. FARQLAR FARQI (Markaziy bank paneli)
OUT = [("npl", "Muammoli kreditlar (NPL) ulushi, f.p.", ["2020", "2021", "2022"], 1), ("ldr", "Kreditlar/depozitlar, f.p.", PRE, 0), ("ea", "Kapitalning aktivlarga nisbati, f.p.", PRE, 1),
       ("retail_l", "Kreditlarda jismoniy shaxslar ulushi, f.p.", ["2020", "2021", "2022"], 1), ("retail_d", "Depozitlarda jismoniy shaxslar ulushi, f.p.", ["2020", "2021", "2022"], 1),
       ("growth", "Aktivlarning yillik o'sish sur'ati, f.p.", ["2020", "2021", "2022"], 1), ("share", "Bozor ulushi (aktivlar), f.p.", PRE, 2)]

def delta(b, name, pre, post=POST):
    a = [ind(y, b, name) for y in pre]; c = [ind(y, b, name) for y in post]
    if any(v is None for v in a + c): return None
    return float(np.mean(c) - np.mean(a))

def did(name, pre, controls, post=POST):
    dT = delta(IPO, name, pre, post); dc = {b: delta(b, name, pre, post) for b in controls}; dc = {b: v for b, v in dc.items() if v is not None}
    arr = np.array(list(dc.values())); n = len(arr)
    d = dT - arr.mean(); se = arr.std(ddof=1) * math.sqrt(1 + 1 / n); t = d / se; p = pval(t, n - 1)
    # plasebo: har bir nazorat bankini navbat bilan "ishtirokchi" deb olish
    pl = [abs(v - (arr.sum() - v) / (n - 1)) for v in arr]
    rank = 1 + sum(1 for x in pl if x >= abs(d)); pperm = rank / (n + 1)
    return dict(d=d, se=se, t=t, p=p, rank=rank, n=n, pperm=pperm, dT=dT, dC=float(arr.mean()))

DD = {}
rows = []
for name, lab, pre, dg in OUT:
    r = did(name, pre, STATE9); DD[name] = r
    rows.append([lab, f(r["dT"], dg, True), f(r["dC"], dg, True), f(r["d"], dg, True) + stars(r["p"]), "(" + f(r["se"], dg) + ")", f"{r['rank']}/{r['n'] + 1}"])
    put(f"dd.{name}", r["d"], dg, sign=True); put(f"dd.{name}.abs", abs(r["d"]), dg); put(f"dd.{name}.rank", f"{r['rank']}/{r['n'] + 1}"); put(f"dd.{name}.p", r["p"], 3)
    put(f"dd.{name}.T", r["dT"], dg, sign=True); put(f"dd.{name}.C", r["dC"], dg, sign=True)
# ROA: “Ipoteka-bank” (MHXS) va bank tizimi (MB)
roa_d = (mean("roa", POST) - mean("roa", PRE)) - (np.mean([SY[y]["roa"] for y in POST]) - np.mean([SY[y]["roa"] for y in PRE]))
roe_d = (mean("roe", POST) - mean("roe", PRE)) - (np.mean([SY[y]["roe"] for y in POST]) - np.mean([SY[y]["roe"] for y in PRE]))
rows.append(["ROA, f.p.^{a}", f(mean("roa", POST) - mean("roa", PRE), 2, True), f(float(np.mean([SY[y]["roa"] for y in POST]) - np.mean([SY[y]["roa"] for y in PRE])), 2, True), f(roa_d, 2, True), "–", "–"])
rows.append(["ROE, f.p.^{a}", f(mean("roe", POST) - mean("roe", PRE), 1, True), f(float(np.mean([SY[y]["roe"] for y in POST]) - np.mean([SY[y]["roe"] for y in PRE])), 1, True), f(roe_d, 1, True), "–", "–"])
gen("t_did", rows)
put("dd.roa", roa_d, 2, sign=True); put("dd.roe", roe_d, 1, sign=True)
roa_d2 = (mean("roa", ["2024", "2025"]) - mean("roa", PRE)) - (np.mean([SY[y]["roa"] for y in ("2024", "2025")]) - np.mean([SY[y]["roa"] for y in PRE]))
put("dd.roa_2425", roa_d2, 2, sign=True)

# voqealar tahlili: har bir yil uchun (bazaviy yil — 2022)
def event(name, controls, base="2022"):
    out = {}
    for y in YR:
        vT = ind(y, IPO, name); bT = ind(base, IPO, name)
        dif = []
        for b in controls:
            v, bv = ind(y, b, name), ind(base, b, name)
            if v is not None and bv is not None: dif.append(v - bv)
        if vT is None or not dif: out[y] = None; continue
        arr = np.array(dif); d = (vT - bT) - arr.mean(); se = arr.std(ddof=1) * math.sqrt(1 + 1 / len(arr))
        out[y] = (d, se, pval(d / se, len(arr) - 1) if se > 0 else 1.0)
    return out
EV = {n: event(n, STATE9) for n in ("npl", "ldr", "ea")}
rows = []
for y in YR:
    k = int(y) - 2022
    r = [f"{y} ({'+' if k > 0 else '–'}{abs(k)})" if y != "2022" else "2022 (0, bazaviy)"]
    for n, dg in (("npl", 1), ("ldr", 0), ("ea", 1)):
        v = EV[n][y]
        r.append("–" if v is None else ("0" if y == "2022" else f(v[0], dg, True) + stars(v[2]) + " (" + f(v[1], dg) + ")"))
    r.append("0" if y == "2022" else f((M[y]["roa"] - M["2022"]["roa"]) - (SY[y]["roa"] - SY["2022"]["roa"]), 2, True))
    rows.append(r)
    for n, dg in (("npl", 1), ("ldr", 0), ("ea", 1)):
        if EV[n][y] is not None: put(f"ev.{n}.{y}", EV[n][y][0], dg, sign=True)
    put(f"ev.roa.{y}", (M[y]["roa"] - M["2022"]["roa"]) - (SY[y]["roa"] - SY["2022"]["roa"]), 2, sign=True)
gen("t_event", rows)

# muqobil nazorat guruhlari
big = [b for b in B["2025"] if b != IPO and b in B["2019"] and B["2025"][b]["assets"] > 5000]
PRIV = [b for b in big if b not in STATE9 and b not in FOREIGN]
ALLB = [b for b in B["2025"] if b != IPO and all(b in B[y] for y in YR)]
rows = []
for name, lab, pre, dg in OUT:
    r = [lab.replace(", f.p.", "")]
    for grp_ in (STATE9, PRIV, ALLB):
        x = did(name, pre, grp_); r.append(f(x["d"], dg, True) + stars(x["p"]) + f" [{x['rank']}/{x['n'] + 1}]")
    rows.append(r)
gen("t_did_alt", rows)
put("dd.n_priv", str(len(PRIV))); put("dd.n_all", str(len(ALLB)))
for name, lab, pre, dg in OUT:
    put(f"dda.{name}.priv", did(name, pre, PRIV)["d"], dg, sign=True); put(f"dda.{name}.all", did(name, pre, ALLB)["d"], dg, sign=True)

# sintetik nazorat (kapital/aktivlar, kreditlar/depozitlar): simpleksda eng kichik kvadratlar
def simplex_ls(Xm, yv, it=20000, lr=None):
    n = Xm.shape[1]; w = np.ones(n) / n
    L = np.linalg.norm(Xm, 2) ** 2; lr = lr or 1.0 / L
    def proj(v):
        u = np.sort(v)[::-1]; css = np.cumsum(u); rho = np.nonzero(u * np.arange(1, n + 1) > (css - 1))[0][-1]
        return np.maximum(v - (css[rho] - 1) / (rho + 1), 0)
    for _ in range(it):
        w = proj(w - lr * Xm.T @ (Xm @ w - yv))
    return w
def synth(name, pre):
    Xm = np.array([[ind(y, b, name) for b in STATE9] for y in pre]); yv = np.array([ind(y, IPO, name) for y in pre])
    mu, sdv = Xm.mean(), Xm.std()
    w = simplex_ls((Xm - mu) / sdv, (yv - mu) / sdv)
    gap = {y: ind(y, IPO, name) - float(np.dot(w, [ind(y, b, name) for b in STATE9])) for y in YR if all(ind(y, b, name) is not None for b in STATE9 + [IPO])}
    rmse = math.sqrt(np.mean([gap[y] ** 2 for y in pre]))
    return w, gap, rmse
SC = {}
for name, pre in (("ldr", PRE), ("ea", PRE)):
    w, gap, rmse = synth(name, pre); SC[name] = (w, gap, rmse)
    top3 = sorted(zip(STATE9, w), key=lambda t: -t[1])[:3]
    put(f"sc.{name}.w", "; ".join(f"{UZ[b]} ({f(x, 2)})" for b, x in top3 if x > 0.005)); put(f"sc.{name}.rmse", rmse, 1 if name == "ea" else 0)
    put(f"sc.{name}.post", float(np.mean([gap[y] for y in POST])), 1 if name == "ea" else 0, sign=True)
    for y in YR: put(f"sc.{name}.{y}", gap[y], 1 if name == "ea" else 0, sign=True)

# ================================================================== 5. PANEL REGRESSIYA (barcha banklar, 2020–2025)
YP = ["2020", "2021", "2022", "2023", "2024", "2025"]
obs = []
for b in sorted({b for y in YP for b in B[y]}):
    for y in YP:
        if b not in B[y]: continue
        py = str(int(y) - 1)
        v = dict(npl=ind(y, b, "npl"), ea=ind(y, b, "ea"), ldr=ind(y, b, "ldr"), rl=ind(y, b, "retail_l"), lnta=ind(y, b, "lnta"), g=ind(y, b, "growth"),
                 ea1=ind(py, b, "ea") if py in B else None, la=ind(y, b, "la"))
        if any(v[k] is None for k in ("npl", "ea", "ldr", "rl", "lnta", "g", "ea1")): continue
        if B[y][b]["assets"] < 1000: continue                                                     # aktivlari 1 trln so'mdan kichik banklar chiqarildi
        v.update(b=b, y=y, FOR=1.0 if (b == IPO and y in POST) else 0.0, state=1.0 if B[y][b].get("state") else 0.0, forsub=1.0 if b in FOREIGN else 0.0)
        obs.append(v)
cnt = {}
for o in obs: cnt[o["b"]] = cnt.get(o["b"], 0) + 1
obs = [o for o in obs if cnt[o["b"]] >= 4]                                                              # kamida 4 yillik kuzatuvi bor banklar
banks = sorted({o["b"] for o in obs}); nb = len(banks)

def fe_reg(dep, xs, twoway=True):
    y = np.array([o[dep] for o in obs]); X = np.array([[o[k] for k in xs] for o in obs])
    Db = np.array([[1.0 if o["b"] == b else 0.0 for b in banks] for o in obs]); Dy = np.array([[1.0 if o["y"] == yy else 0.0 for yy in YP[1:]] for o in obs])
    Zm = np.column_stack([Db, Dy]) if twoway else Db
    Mz = lambda a: a - Zm @ np.linalg.lstsq(Zm, a, rcond=None)[0]
    yt, Xt = Mz(y), Mz(X)
    beta = np.linalg.lstsq(Xt, yt, rcond=None)[0]; res = yt - Xt @ beta
    XtXi = np.linalg.inv(Xt.T @ Xt); meat = np.zeros_like(XtXi)
    for b in banks:
        idx = [i for i, o in enumerate(obs) if o["b"] == b]; s_ = Xt[idx].T @ res[idx]; meat += np.outer(s_, s_)
    G = nb; cov = XtXi @ meat @ XtXi * G / (G - 1)
    se = np.sqrt(np.diag(cov)); r2 = 1 - res @ res / (yt @ yt)
    return beta, se, r2, len(y)

def ols(dep, xs):
    y = np.array([o[dep] for o in obs]); Dy = np.array([[1.0 if o["y"] == yy else 0.0 for yy in YP[1:]] for o in obs])
    X = np.column_stack([np.ones(len(obs)), np.array([[o[k] for k in xs] for o in obs]), Dy])
    beta = np.linalg.lstsq(X, y, rcond=None)[0]; res = y - X @ beta
    XtXi = np.linalg.inv(X.T @ X); meat = np.zeros_like(XtXi)
    for b in banks:
        idx = [i for i, o in enumerate(obs) if o["b"] == b]; s_ = X[idx].T @ res[idx]; meat += np.outer(s_, s_)
    cov = XtXi @ meat @ XtXi * nb / (nb - 1); se = np.sqrt(np.diag(cov)); r2 = 1 - res @ res / ((y - y.mean()) @ (y - y.mean()))
    return beta[1:1 + len(xs)], se[1:1 + len(xs)], r2, len(y)

XN = {"FOR": "FOR (xorijiy strategik investor)", "state": "Davlat ulushi bor bank (1/0)", "forsub": "Xorijiy bankning sho'ba banki (1/0)", "ea1": "Kapital/aktivlar (t–1), %", "ea": "Kapital/aktivlar, %",
      "lnta": "Aktivlar logarifmi (lnTA)", "ldr": "Kreditlar/depozitlar, %", "rl": "Kreditlarda jismoniy shaxslar ulushi, %", "g": "Aktivlarning o'sish sur'ati, %", "la": "Kreditlar/aktivlar, %"}
m1 = fe_reg("npl", ["FOR", "ea1", "lnta", "ldr", "rl", "g"]); m2 = ols("npl", ["FOR", "state", "forsub", "ea1", "lnta", "ldr", "rl", "g"])
m3 = fe_reg("ea", ["FOR", "lnta", "ldr", "rl", "g"]); m4 = ols("ea", ["FOR", "state", "forsub", "lnta", "ldr", "rl", "g"])
MODS = [(m1, ["FOR", "ea1", "lnta", "ldr", "rl", "g"]), (m2, ["FOR", "state", "forsub", "ea1", "lnta", "ldr", "rl", "g"]), (m3, ["FOR", "lnta", "ldr", "rl", "g"]), (m4, ["FOR", "state", "forsub", "lnta", "ldr", "rl", "g"])]
allx = ["FOR", "state", "forsub", "ea1", "lnta", "ldr", "rl", "g"]
def cellr(mod, xs, k):
    if k not in xs: return "–"
    i = xs.index(k); b_, s_ = mod[0][i], mod[1][i]; p = pval(b_ / s_, nb - 1)
    d = 3 if abs(b_) < 1 else 2
    return f(b_, d, True) + stars(p) + " (" + f(s_, d) + ")"
rows = [[XN[k]] + [cellr(m, xs, k) for m, xs in MODS] for k in allx]
rows += [["Bank bo'yicha qat'iy effektlar", "Ha", "Yo'q", "Ha", "Yo'q"], ["Yil bo'yicha qat'iy effektlar", "Ha", "Ha", "Ha", "Ha"],
         ["Kuzatuvlar soni (banklar soni)"] + [f"{m[3]} ({nb})" for m, _ in MODS], ["R² (FE modellarida – ichki)"] + [f(m[2], 2) for m, _ in MODS]]
gen("t_panel", rows)
put("pn.n", str(m1[3])); put("pn.banks", str(nb))
def pc(mod, xs, k, key, d=3):
    i = xs.index(k); put(key, mod[0][i], d, sign=True); put(key + ".p", pval(mod[0][i] / mod[1][i], nb - 1), 3)
put("pn.npl.for.abs", abs(m1[0][0]), 2); pc(m1, MODS[0][1], "FOR", "pn.npl.for", 2); pc(m1, MODS[0][1], "ea1", "pn.npl.ea1"); pc(m1, MODS[0][1], "lnta", "pn.npl.lnta", 2); pc(m1, MODS[0][1], "ldr", "pn.npl.ldr"); pc(m1, MODS[0][1], "rl", "pn.npl.rl"); pc(m1, MODS[0][1], "g", "pn.npl.g")
pc(m2, MODS[1][1], "state", "pn.ols.state", 2); pc(m2, MODS[1][1], "forsub", "pn.ols.forsub", 2); pc(m2, MODS[1][1], "FOR", "pn.ols.for", 2); pc(m2, MODS[1][1], "g", "pn.ols.g"); pc(m2, MODS[1][1], "rl", "pn.ols.rl")
pc(m3, MODS[2][1], "FOR", "pn.ea.for", 2); pc(m3, MODS[2][1], "lnta", "pn.ea.lnta", 2); pc(m4, MODS[3][1], "state", "pn.eaols.state", 2); pc(m4, MODS[3][1], "forsub", "pn.eaols.forsub", 2)
pc(m2, MODS[1][1], "lnta", "pn.ols.lnta", 2); pc(m2, MODS[1][1], "ea1", "pn.ols.ea1"); pc(m3, MODS[2][1], "ldr", "pn.ea.ldr"); pc(m4, MODS[3][1], "lnta", "pn.eaols.lnta", 2)
put("pn.r2.1", m1[2], 2); put("pn.r2.2", m2[2], 2); put("pn.r2.3", m3[2], 2); put("pn.r2.4", m4[2], 2)

# ================================================================== 6. PROGNOZ (2026–2030)
SCN = {"Inersion": dict(g=0.08, roa=[3.4, 3.0, 2.7, 2.5, 2.4], res=0.10, new=0.015, cir=[49, 50, 51, 52, 52], ldr=[195, 195, 195, 195, 195], pay=0.5),
       "Bazaviy": dict(g=0.13, roa=[4.0, 3.6, 3.4, 3.2, 3.1], res=0.20, new=0.010, cir=[46, 45, 44, 44, 43], ldr=[185, 178, 172, 166, 160], pay=0.5),
       "Optimistik": dict(g=0.18, roa=[4.4, 4.1, 3.9, 3.7, 3.6], res=0.30, new=0.007, cir=[45, 43, 42, 41, 40], ldr=[180, 168, 156, 146, 138], pay=0.5)}
A0 = I["2025"]["ta"] / T; G0 = I["2025"]["gross"] / T; S30 = I["2025"]["s3"] / T
K0 = 690 * 12025.33 / 1e6; W0 = 3484 * 12025.33 / 1e6          # regulyativ kapital va riskka tortilgan aktivlar (2025-yil yakuni, trln so'm; investor taqdimoti)
E0 = I["2025"]["eq"] / T
rows = []
PR = {}
for nm, s_ in SCN.items():
    A, G, S3, K, W, E = A0, G0, S30, K0, W0, E0
    path = dict(A=[A0], roa=[M["2025"]["roa"]], s3=[M["2025"]["s3"]], car=[I["2025"]["car"]], bb=[BB["2025"]], ea=[M["2025"]["ea"]], z=[Z["2025"]])
    hist = [M[y]["roa"] for y in YR]
    for i in range(5):
        An = A * (1 + s_["g"]); prof = s_["roa"][i] / 100 * (A + An) / 2
        Gn = G * (1 + s_["g"]) - S3 * s_["res"]                                           # hal etilgan muammoli kreditlar portfeldan chiqadi
        S3n = S3 * (1 - s_["res"]) + s_["new"] * (G - S3)
        K = K + prof * (1 - s_["pay"]); W = W * (1 + s_["g"]); E = E + prof * (1 - s_["pay"])
        A, G, S3 = An, Gn, S3n
        car = K / W * 100; s3sh = S3 / G * 100; ea = E / A * 100
        vals = {"C": car, "A": s3sh, "M": s_["cir"][i], "E": s_["roa"][i], "L": s_["ldr"][i], "S": M["2025"]["fx"]}
        hist.append(s_["roa"][i]); sd_roll = max(float(np.std(hist[-7:], ddof=1)), 0.75)        # ROA standart chetlanishi – so'nggi 7 yil bo'yicha (sirpanuvchi oyna)
        _, comp = camels(vals); z = (s_["roa"][i] + ea) / sd_roll; path["z"].append(z)
        path["A"].append(A); path["roa"].append(s_["roa"][i]); path["s3"].append(s3sh); path["car"].append(car); path["bb"].append(bbii(comp, z)); path["ea"].append(ea)
    PR[nm] = path
    rows.append([nm, "Aktivlar, trln so'm"] + [f(x) for x in path["A"]]); rows.append([nm, "ROA, %"] + [f(x) for x in path["roa"]])
    rows.append([nm, "3-bosqich kreditlar ulushi, %"] + [f(x) for x in path["s3"]]); rows.append([nm, "Kapital yetarliligi (CAR), %"] + [f(x) for x in path["car"]])
    rows.append([nm, "Z-score"] + [f(x, 1) for x in path["z"]])
    rows.append([nm, "BBII"] + [f(x, 3) for x in path["bb"]])
    k = nm.lower()
    put(f"pr.{k}.bb2029", path["bb"][-2], 3); put(f"pr.{k}.z2030", path["z"][-1], 1); put(f"pr.{k}.z2029", path["z"][-2], 1); put(f"pr.{k}.s32028", path["s3"][3]); put(f"pr.{k}.s32026", path["s3"][1])
    put(f"pr.{k}.bb2030", path["bb"][-1], 3); put(f"pr.{k}.s32030", path["s3"][-1]); put(f"pr.{k}.a2030", path["A"][-1]); put(f"pr.{k}.car2030", path["car"][-1]); put(f"pr.{k}.bb2026", path["bb"][1], 3)
    y75 = next((2025 + i for i, x in enumerate(path["bb"]) if x >= 0.75), None); put(f"pr.{k}.y75", str(y75) if y75 else "–")
    y60 = next((2025 + i for i, x in enumerate(path["bb"]) if i > 0 and x >= 0.6), None); put(f"pr.{k}.y60", str(y60) if y60 else "–")
    y10 = next((2025 + i for i, x in enumerate(path["s3"]) if x < 10), None); put(f"pr.{k}.y10", str(y10) if y10 else "–")
gen("t_prognoz", rows)
tt = np.arange(7); la_ = np.log([I[y]["ta"] for y in YR]); bcoef = np.polyfit(tt, la_, 1)[0]
put("pr.trend", (math.exp(bcoef) - 1) * 100)
# stress-test: so'mning 25% qadrsizlanishi va 3-bosqich ulushining 5 f.p. oshishi (2025-yil yakuni holatiga)
fx_share_rwa = 0.35                      # riskka tortilgan aktivlarda xorijiy valyutadagi qism (taxminiy faraz)
car_fx = K0 / (W0 * (1 + 0.25 * fx_share_rwa)) * 100
loss = 0.05 * G0 * (1 - 0.30)            # qo'shimcha 5 f.p. qadrsizlangan kreditlar, 70% zaxira bilan qoplash (garov undirilishi 30%)
car_npl = (K0 - loss) / W0 * 100; car_both = (K0 - loss) / (W0 * (1 + 0.25 * fx_share_rwa)) * 100
put("st.car_fx", car_fx, est=True); put("st.d_fx", I["2025"]["car"] - car_fx, est=True); put("st.car_npl", car_npl); put("st.d_npl", I["2025"]["car"] - car_npl); put("st.car_both", car_both, est=True)
put("st.loss", loss, 2); put("st.fx_share", fx_share_rwa * 100, 0, est=True)
put("st.K0", K0, 2); put("st.W0", W0)

# ================================================================== 7. TAXMINIY (ochiq manbalarda yo'q) qiymatlar
kap22 = B["2022"][IPO]["capital"]; kurs22 = 11225.46
put("bt.kap_nas", kap22 / 1000); put("bt.kap_usd", kap22 * 1e9 / kurs22 / 1e6, 0); put("bt.pbv", 440 / (kap22 * 1e9 / kurs22 / 1e6), 2)
put("bt.kap_ifrs_usd", I["2022"]["eq"] * 1e6 / kurs22 / 1e6, 0); put("bt.pbv_ifrs", 440 / (I["2022"]["eq"] * 1e6 / kurs22 / 1e6), 2)
put("x.npl_tz_2019", 1.5, est=True); put("x.npl_ip_2019", 1.4, est=True)

# ---- ilovalar
ser = lambda fn, d=1, ys=YR: "; ".join(f(fn(y), d) for y in ys)
IF, MB, IP = "MHXS (audit qilingan)", "Milliy standartlar", "Bank ma'lumoti"
rows = [
    ["Jami aktivlar, trln so'm", "2019–2025", ser(lambda y: I[y]["ta"] / T), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Mijozlarga kreditlar (sof), trln so'm", "2019–2025", ser(lambda y: I[y]["loans"] / T), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Mijozlar hisobvaraqlari, trln so'm", "2019–2025", ser(lambda y: I[y]["cust"] / T), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Jami kapital, trln so'm", "2019–2025", ser(lambda y: I[y]["eq"] / T), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Sof foyda (zarar), mlrd so'm", "2019–2025", ser(lambda y: I[y]["np"] / 1000, 0), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Sof foizli daromad, mlrd so'm", "2019–2025", ser(lambda y: I[y]["nii"] / 1000, 0), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Zaxira xarajatlari, mlrd so'm", "2019–2025", ser(lambda y: I[y]["ecl_charge"] / 1000, 0), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Operatsion xarajatlar, mlrd so'm", "2019–2025", ser(lambda y: I[y]["opex"] / 1000, 0), IF, "Bankning konsolidatsiyalangan hisobotlari"],
    ["Yalpi kreditlar, trln so'm", "2019–2025", ser(lambda y: I[y]["gross"] / T), IF, "Hisobotlarning “Mijozlarga kreditlar” izohi"],
    ["3-bosqich kreditlar, trln so'm", "2019–2025", ser(lambda y: I[y]["s3"] / T, 2), IF, "Hisobotlarning “Mijozlarga kreditlar” izohi"],
    ["Kredit zararlari zaxirasi, trln so'm", "2019–2025", ser(lambda y: I[y]["ecl"] / T, 2), IF, "Hisobotlarning “Mijozlarga kreditlar” izohi"],
    ["Moliya vazirligidan qarzlar, trln so'm", "2019–2025", ser(lambda y: I[y]["b_mof"] / T), IF, "Hisobotlarning qarz mablag'lari izohi"],
    ["Regulyativ kapital yetarliligi, %", "2019–2025", ser(lambda y: I[y]["car"]), "Markaziy bank me'yori", "Hisobotlarning “Kapitalni boshqarish” izohi"],
    ["Aktivlar, kreditlar, depozitlar, kapital (banklar kesimida)", "01.01.2020–01.10.2026", "35 ta bank bo'yicha panel", MB, "Markaziy bank statistikasi"],
    ["Bozor ulushi (aktivlar), %", "2019–2025", ser(lambda y: M[y]["share"]), MB, "Markaziy bank statistikasi asosida hisoblangan"],
    ["Muammoli kreditlar ulushi, %", "2020–2025", ser(lambda y: M[y]["npl_nas"], 1, YR[1:]), MB, "Markaziy bank statistikasi"],
    ["Moliyaviy natija", "2024", "240,2 mlrd so'm zarar", MB, "UzDaily"],
    ["LCR; NSFR, %", "2025-yil oxiri", "225; 127", "Markaziy bank me'yori", "Investor taqdimoti (2025)"],
    ["Aksiyalar paketi (OTP Bank)", "13.06.2023", "73,71%", "–", "Bank, OTP Group"],
    ["Bitim narxi", "2023", "≈324 mln dollar", "–", "bne IntelliNews (matbuot ma'lumoti)"],
    ["Qo'shimcha kapital (OTP Bank)", "2023-yil dekabr", "844,6 mlrd so'm (70 mln dollar)", IF, "Bank hisoboti, Kun.uz"],
    ["Aksiyadorlar tarkibi", "30.06.2026", "OTP Bank 72,89%; Iqtisodiyot va moliya vazirligi 17,49%; IFC 8,69%", "–", "Investor taqdimoti (2026-yil I yarmi)"],
    ["Kredit reytinglari", "2026-yil sentabr", "Fitch: BB (ijobiy); S&P: BB (barqaror)", "–", "Investor taqdimoti (2026-yil I yarmi)"],
    ["Sof foyda", "2026-yil I yarmi; 9 oy", f(I["2026H1"]["np"] / 1000, 0) + " mlrd so'm; ≈1,8 trln so'm", "MHXS", "Oraliq hisobot; bank xabari"],
    ["Davlat mablag'larining majburiyatlardagi ulushi", "2019-yil oxiri", "57% (muallif hisobi: " + f(M["2019"]["state_f"]) + "%)", "–", "Fitch; MHXS hisoboti"],
]
gen("t_ilova1", rows)
y = "2025"; sc = CM[y][1]
rows = [
    ["1. CAMELS komponentlari ballari", "; ".join(f"{k} = {sc[k]}" for k in "CAMELS"), "–"],
    ["2. Kompozit CAMELS bali", " + ".join(f(WC[k], 2) + "·" + str(sc[k]) for k in "CAMELS"), f(CM[y][2], 2)],
    ["3. Normallashtirilgan CAMELS", "(5 – " + f(CM[y][2], 2) + ") / 4", f((5 - CM[y][2]) / 4, 3)],
    ["4. Z-score", "(" + f(M[y]["roa"], 2) + " + " + f(M[y]["ea"], 2) + ") / " + f(sd_roa, 2), f(Z[y], 2)],
    ["5. Normallashtirilgan Z-score", "min(" + f(Z[y], 2) + " / 15; 1)", f(min(Z[y] / 15, 1), 3)],
    ["6. BBII", "0,6 · " + f((5 - CM[y][2]) / 4, 3) + " + 0,4 · " + f(min(Z[y] / 15, 1), 3), f(BB[y], 3)],
    ["7. Barqarorlik darajasi", "0,5 ≤ BBII < 0,75", lev(BB[y])],
]
gen("t_ilova3", rows)

json.dump(V, open(os.path.join(GEN, "qiymatlar.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("gen fayllar:", len(os.listdir(GEN)), "| qiymatlar:", len(V))
if __name__ == "__main__":
    import sys
    if "-v" in sys.argv:
        for y in YR: print(y, {k: round(v, 2) if isinstance(v, float) else v for k, v in M[y].items() if k in ("roa", "roe", "cir", "nim", "cor", "s3", "ldr", "ea", "retail", "state_f", "fx", "npl_nas", "share")})
        print("CAMELS", {y: (CM[y][1], round(CM[y][2], 2)) for y in YR}); print("Z", {y: round(Z[y], 2) for y in YR}, "sd", round(sd_roa, 2)); print("BBII", {y: round(BB[y], 3) for y in YR})
        for n in DD: print("DiD", n, {k: (round(v, 3) if isinstance(v, float) else v) for k, v in DD[n].items()})
        print("ROA did", round(roa_d, 2), "ROE", round(roe_d, 1)); print("PRIV", [UZ.get(b, b) for b in PRIV], len(ALLB))
        for n in SC: print("SC", n, [(UZ[b], round(float(x), 2)) for b, x in zip(STATE9, SC[n][0]) if x > 0.005], {y: round(g, 1) for y, g in SC[n][1].items()}, round(SC[n][2], 2))
        print("panel n", m1[3], nb); print("PR", {k: [round(x, 3) for x in v["bb"]] for k, v in PR.items()}, {k: [round(x, 1) for x in v["s3"]] for k, v in PR.items()}, {k: [round(x, 1) for x in v["car"]] for k, v in PR.items()})
