#!/usr/bin/env python3
"""Maqolalar uchun shartli (illyustrativ) hisob-kitoblar va diagrammalar.
Barcha natijalar shartli/simulyatsion ma'lumotlarga asoslangan (matnda ko'k rangda)."""
import os, json, math
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")
B1, B2 = "#2a78d6", "#eb6834"
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
plt.rcParams.update({"font.family": "Liberation Serif", "font.size": 11, "axes.edgecolor": INK2,
                     "axes.labelcolor": INK, "xtick.color": INK2, "ytick.color": INK2,
                     "axes.spines.top": False, "axes.spines.right": False})
OUT = {}


def save(fig, name):
    fig.tight_layout()
    fig.savefig(os.path.join(IMG, name), dpi=200)
    plt.close(fig)


def bars(ax, x, y, color=B1, width=0.6, labels=True, fmt="{:.2f}"):
    b = ax.bar(x, y, width=width, color=color, edgecolor="white", linewidth=1.5)
    ax.yaxis.grid(True, color=GRID, linewidth=0.8); ax.set_axisbelow(True)
    if labels:
        for r, v in zip(b, y):
            ax.text(r.get_x() + r.get_width() / 2, v + (max(y) * 0.02 if v >= 0 else -max(y) * 0.06),
                    fmt.format(v).replace(".", ","), ha="center", va="bottom", fontsize=9, color=INK)
    return b

# ------------------------------------------------------------- B1: MPI-TS
W = [1/10, 1/10, 1/10, 1/10, 1/20, 1/20, 1/20, 1/20, 1/15, 1/15, 1/15, 1/15, 1/15, 1/15]
DIM = [0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4]
G = [  # 10 shartli uy xo'jaligi x 14 indikator
    [0,0,0,1,0,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,0,1,1,1],
    [0,0,0,0,0,0,1,0,0,1,0,0,0,1],
    [1,1,0,1,0,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,1,1,0,1,0,0,1,1,1,0,1],
    [0,0,1,0,0,0,0,1,0,0,0,1,0,0],
    [1,0,1,1,0,1,1,1,1,1,0,1,1,1],
    [0,0,0,1,1,0,0,0,0,1,0,1,1,0],
    [0,1,0,0,0,0,1,1,0,1,1,1,0,1],
]
G = np.array(G); Wv = np.array(W); DIM = np.array(DIM)
c = G @ Wv
k = 1/3
poor = c >= k - 1e-9
H = poor.mean(); A = c[poor].mean(); M0 = H * A
cens = G * poor[:, None]
contrib = [(Wv[DIM == d] * cens[:, DIM == d].mean(axis=0)).sum() / M0 for d in range(5)]
# standart (global MPI tipidagi) indikatorlar: faqat 2,4,5,6 (bolalar ta'limi, ovqatlanish, suv, sanitariya) – shartli
std_idx = [1, 3, 4, 5]
std_w = np.array([1/4, 1/4, 1/4, 1/4]) * 1.0
std_c = G[:, std_idx] @ (np.array([1/6, 1/6, 1/18, 1/18]) / (1/6 + 1/6 + 1/18 + 1/18) * (4/9))
OUT["B1"] = {"c": [round(x, 3) for x in c], "poor": poor.tolist(), "H": round(H*100, 1), "A": round(A*100, 1),
             "M0": round(M0, 3), "contrib": [round(x*100, 1) for x in contrib],
             "nd": [int((G[i] * 1).sum()) for i in range(10)]}
for kk in (0.2, 0.5):
    p = c >= kk - 1e-9; OUT["B1"]["H_%s" % kk] = round(p.mean()*100, 1)
    OUT["B1"]["M0_%s" % kk] = round((c*p).mean(), 3)
fig, ax = plt.subplots(figsize=(7, 3.6))
cols = [B2 if p else B1 for p in poor]
bars(ax, [f"H{i+1}" for i in range(10)], c, color=cols)
ax.axhline(k, color=INK, linestyle="--", linewidth=1)
ax.text(9.45, k + 0.012, "k = 1/3", ha="right", fontsize=9, color=INK)
ax.set_ylabel("Mahrumlik balli, c_i"); ax.set_ylim(0, max(c) * 1.18)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color=B2, label="Ko'p o'lchovli kambag'al"), Patch(color=B1, label="Kambag'al emas")],
          frameon=False, fontsize=9, loc="upper left")
save(fig, "b1_ci.png")
fig, ax = plt.subplots(figsize=(7, 3.2))
names = ["Ta'lim", "Sog'liq", "Turmush\nsharoiti", "Bandlik", "Tadbirkorlik\nsalohiyati"]
bars(ax, names, [x*100 for x in contrib], fmt="{:.1f}%")
ax.set_ylabel("MPI-TS dagi hissa, %"); ax.set_ylim(0, max(contrib)*100*1.2)
save(fig, "b1_contrib.png")

# ------------------------------------------------------------- B2: PSM-DiD simulyatsiyasi
rng = np.random.default_rng(2026)
n = 800
size = rng.integers(2, 10, n); age = rng.normal(45, 10, n); fem = rng.binomial(1, 0.25, n)
exp = rng.binomial(1, 0.3, n); land = rng.gamma(2, 3, n); c0 = np.clip(rng.normal(0.38, 0.12, n), 0, 1)
ability = rng.normal(0, 1, n)  # kuzatilmaydigan, vaqt bo'yicha o'zgarmas omil
z = -0.4 + 0.9*exp + 0.05*land - 1.2*(c0-0.38) + 0.5*ability - 0.3*fem
pD = 1/(1+np.exp(-z)); D = rng.binomial(1, pD)
TRUE = -0.060
trend = -0.025
y0 = c0 - 0.03*exp - 0.02*ability + rng.normal(0, 0.03, n)
y1 = y0 + trend - 0.01*ability + TRUE*D + rng.normal(0, 0.03, n)
X = np.column_stack([np.ones(n), size, age, fem, exp, land, c0])
b = np.zeros(X.shape[1])
for _ in range(25):
    p = 1/(1+np.exp(-X@b)); Wd = p*(1-p)
    b = b + np.linalg.solve(X.T @ (X*Wd[:, None]) + 1e-8*np.eye(X.shape[1]), X.T @ (D-p))
ps = 1/(1+np.exp(-X@b)); lg = np.log(ps/(1-ps)); cal = 0.2*lg.std()
T = np.where(D == 1)[0]; Cc = np.where(D == 0)[0]
pairs = []
for i in T:
    d = np.abs(lg[Cc]-lg[i]); j = d.argmin()
    if d[j] <= cal: pairs.append((i, Cc[j]))
ti = np.array([p[0] for p in pairs]); ci = np.array([p[1] for p in pairs])
naive = y1[D == 1].mean() - y1[D == 0].mean()
psm = (y1[ti] - y1[ci]).mean()
did = ((y1-y0)[D == 1].mean() - (y1-y0)[D == 0].mean())
psmdid = ((y1-y0)[ti] - (y1-y0)[ci]).mean()
se = ((y1-y0)[ti] - (y1-y0)[ci]).std(ddof=1)/math.sqrt(len(ti))
def sb(v, a, bb): return 100*(v[a].mean()-v[bb].mean())/math.sqrt((v[a].var()+v[bb].var())/2)
names2 = ["Oila a'zolari soni", "Boshliq yoshi", "Boshliq ayol", "Tadbirkorlik tajribasi", "Tomorqa, sotix", "Dastlabki mahrumlik balli"]
vars2 = [size, age, fem, exp, land, c0]
bal = [(nm, round(sb(v, D == 1, D == 0), 1), round(sb(v, ti, ci), 1)) for nm, v in zip(names2, vars2)]
OUT["B2"] = {"n": n, "nT": int(D.sum()), "nC": int((1-D).sum()), "matched": len(pairs), "true": TRUE,
             "naive": round(naive, 3), "psm": round(psm, 3), "did": round(did, 3), "psmdid": round(psmdid, 3),
             "se": round(se, 3), "balance": bal, "coef": [round(x, 3) for x in b]}
fig, ax = plt.subplots(figsize=(7, 3.4))
lab = ["Oddiy taqqoslash", "PSM", "DiD", "PSM-DiD"]
vals = [naive, psm, did, psmdid]
bars(ax, lab, vals, fmt="{:.3f}")
ax.axhline(TRUE, color=B2, linestyle="--", linewidth=1.5)
ax.text(3.45, TRUE - 0.006, "Haqiqiy ta'sir = −0,060", ha="right", va="top", fontsize=9, color=INK)
ax.axhline(0, color=INK2, linewidth=0.8)
ax.set_ylabel("ATT bahosi (mahrumlik balli)")
lo = min(vals + [TRUE]); hi = max(vals + [0])
ax.set_ylim(lo*1.35, max(hi, 0) + 0.02)
save(fig, "b2_att.png")
fig, ax = plt.subplots(figsize=(7, 3.4))
yy = np.arange(len(bal))
ax.barh(yy + 0.2, [abs(x[1]) for x in bal], height=0.38, color=B1, edgecolor="white", label="Moslashtirishgacha")
ax.barh(yy - 0.2, [abs(x[2]) for x in bal], height=0.38, color=B2, edgecolor="white", label="Moslashtirishdan keyin")
ax.set_yticks(yy); ax.set_yticklabels([x[0] for x in bal]); ax.invert_yaxis()
ax.axvline(10, color=INK, linestyle="--", linewidth=1); ax.set_xlabel("|Standartlashtirilgan og'ish|, %")
ax.xaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=9, loc="lower right")
save(fig, "b2_balance.png")

# ------------------------------------------------------------- B3: samaradorlik matritsasi
types = ["Kredit", "Subsidiya", "O'qitish", "Yer", "Kompleks"]
dims = ["Ta'lim", "Sog'liq", "Turmush", "Bandlik", "Tadb. salohiyati"]
delta = np.array([  # mahrumlik ballining kamayishi (musbat = yaxshilanish), o'lchov vaznlangan birlikda
    [0.000, 0.004, 0.004, 0.016, 0.034],
    [0.000, 0.016, 0.002, 0.012, 0.030],
    [0.014, 0.000, 0.000, 0.012, 0.006],
    [0.000, 0.014, 0.001, 0.018, 0.012],
    [0.008, 0.018, 0.004, 0.026, 0.040]])
cost = np.array([6.0, 7.0, 4.0, 5.0, 16.0])   # davlatning bir oilaga xarajati, mln so'm
e = delta / cost[:, None] * 10                   # 10 mln so'mga
CE = delta.sum(axis=1) / cost * 10
Wd = np.array([0.2]*5)
prof = np.array([  # 6 shartli oila: o'lchov ichidagi mahrumlik ulushi (0..1)
    [0.0, 0.0, 0.25, 0.33, 0.67],
    [0.0, 1.0, 0.50, 0.67, 1.00],
    [1.0, 0.0, 0.25, 0.67, 0.33],
    [0.0, 0.5, 0.00, 1.00, 0.33],
    [0.5, 0.5, 0.25, 0.33, 0.67],
    [0.0, 1.0, 0.75, 0.33, 0.33]])
E = prof @ e.T
best = E.argmax(axis=1)
OUT["B3"] = {"delta": delta.round(3).tolist(), "cost": cost.tolist(), "e": e.round(4).tolist(),
             "CE": CE.round(4).tolist(), "E": E.round(4).tolist(), "best": [types[i] for i in best],
             "ci": (prof @ Wd).round(3).tolist()}
fig, ax = plt.subplots(figsize=(7, 3.4))
im = ax.imshow(e, cmap="Blues", aspect="auto")
ax.set_xticks(range(5)); ax.set_xticklabels(dims); ax.set_yticks(range(5)); ax.set_yticklabels(types)
for i in range(5):
    for j in range(5):
        v = e[i, j]; ax.text(j, i, f"{v:.3f}".replace(".", ","), ha="center", va="center", fontsize=9,
                             color="white" if v > e.max()*0.6 else INK)
ax.spines[:].set_visible(False); ax.tick_params(length=0)
cb = fig.colorbar(im, ax=ax, shrink=0.85); cb.outline.set_visible(False)
save(fig, "b3_matrix.png")
fig, ax = plt.subplots(figsize=(7, 3.2))
bars(ax, types, CE, fmt="{:.3f}")
ax.set_ylabel("CE: 10 mln so'mga mahrumlik\nballining kamayishi"); ax.set_ylim(0, CE.max()*1.25)
save(fig, "b3_ce.png")

# ------------------------------------------------------------- B4: mahalla taqsimoti va ssenariylar
M = ["M1", "M2", "M3", "M4", "M5", "M6"]
M0m = np.array([0.062, 0.118, 0.041, 0.095, 0.150, 0.073])
q = np.array([42, 58, 25, 47, 61, 35])          # ko'p o'lchovli kambag'al oilalar
poor_mon = np.array([60, 52, 40, 45, 44, 39])   # monetar mezon bo'yicha reyestrdagi oilalar
Gm = np.array([0.35, 0.62, 0.20, 0.48, 0.71, 0.40])
Em = np.array([0.80, 0.55, 0.90, 0.70, 0.50, 0.75])
a, bb, g = 0.5, 0.3, 0.2
PI = a*M0m/M0m.max() + bb*Gm + g*Em/Em.max()
R, Rmin = 6000.0, 300.0  # mln so'm
Rnew = Rmin + (R - len(M)*Rmin) * PI*q / (PI*q).sum()
Rold = R * poor_mon / poor_mon.sum()
OUT["B4"] = {"PI": PI.round(3).tolist(), "Rnew": Rnew.round(0).tolist(), "Rold": Rold.round(0).tolist(),
             "perq_new": (Rnew/q).round(1).tolist(), "perq_old": (Rold/q).round(1).tolist()}
fig, ax = plt.subplots(figsize=(7, 3.4))
x = np.arange(len(M))
ax.bar(x-0.2, Rold, width=0.38, color=B1, edgecolor="white", label="Amaldagi qoida")
ax.bar(x+0.2, Rnew, width=0.38, color=B2, edgecolor="white", label="Taklif etilayotgan qoida")
ax.set_xticks(x); ax.set_xticklabels(M); ax.set_ylabel("Ajratilgan resurs, mln so'm")
ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=9)
save(fig, "b4_alloc.png")
yrs = list(range(2025, 2031))
sc = {"Inersion (r = 8%)": 0.08, "Bazaviy (r = 12%)": 0.12, "Maqsadli (r = 16%)": 0.16}
fig, ax = plt.subplots(figsize=(7, 3.4))
for (nm, r), col, ls in zip(sc.items(), [INK2, B1, B2], [":", "--", "-"]):
    v = [6.2*(1-r)**(t-2025) for t in yrs]
    ax.plot(yrs, v, color=col, linewidth=2, linestyle=ls, marker="o", markersize=4, label=nm)
    ax.text(2030.08, v[-1], f"{v[-1]:.2f}%".replace(".", ","), va="center", fontsize=9, color=INK)
ax.set_ylabel("Kambag'allik darajasi, %"); ax.set_xlim(2024.8, 2030.6)
ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=9)
save(fig, "b4_scen.png")

# ------------------------------------------------------------- Djabborov
yrs7 = list(range(2019, 2026))
bbii = [0.632, 0.540, 0.628, 0.678, 0.549, 0.685, 0.741]
camn = [0.650, 0.488, 0.588, 0.650, 0.450, 0.588, 0.650]
zn = [0.607, 0.620, 0.687, 0.720, 0.700, 0.833, 0.880]
fig, ax = plt.subplots(figsize=(7, 3.4))
ax.plot(yrs7, bbii, color=B1, linewidth=2, marker="o", markersize=5, label="BBII")
ax.plot(yrs7, camn, color=INK2, linewidth=1.5, linestyle="--", marker="o", markersize=4, label="Normallashtirilgan CAMELS")
ax.plot(yrs7, zn, color=B2, linewidth=1.5, linestyle=":", marker="o", markersize=4, label="Normallashtirilgan Z-score")
ax.axhline(0.75, color=INK, linewidth=0.8); ax.text(2019, 0.757, "“Yuqori” barqarorlik chegarasi (0,75)", fontsize=8.5, color=INK)
ax.axvspan(2022.5, 2023.5, color="#f0efec", zorder=0); ax.text(2023, 0.43, "Integratsiya\nyili", ha="center", fontsize=8.5, color=INK2)
ax.set_ylim(0.4, 0.95); ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=8.5, loc="upper left")
save(fig, "d3_bbii.png")
ev = [-0.18, -0.31, 0.12, 0.0, -1.95, 2.36, 1.84]; se = [0.42, 0.44, 0.41, 0.0, 0.48, 0.52, 0.55]
fig, ax = plt.subplots(figsize=(7, 3.4))
ax.errorbar(yrs7, ev, yerr=[1.96*s for s in se], fmt="o", color=B1, ecolor=B1, elinewidth=1.5, capsize=3, markersize=6)
ax.axhline(0, color=INK2, linewidth=0.8); ax.axvline(2022.5, color=INK, linestyle="--", linewidth=1)
ax.text(2022.55, 2.9, "OTP Group bitimi (2023-yil iyun)", fontsize=8.5, color=INK)
ax.set_ylabel("ROA ga ta'sir, f.p. (95% ishonch oralig'i)"); ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
save(fig, "d2_event.png")
ch = ["Kapital", "Korporativ\nboshqaruv", "Risk-\nmenejment", "Texnologiya", "Bozor (resurs\nbazasi)"]
st_ = [4.1, 3.9, 2.8, 3.4, 3.2]; lt = [4.4, 4.6, 4.5, 4.3, 3.9]
fig, ax = plt.subplots(figsize=(7, 3.4))
x = np.arange(5)
ax.bar(x-0.2, st_, width=0.38, color=B1, edgecolor="white", label="Qisqa muddat (1–2 yil)")
ax.bar(x+0.2, lt, width=0.38, color=B2, edgecolor="white", label="Uzoq muddat (3–5 yil)")
ax.axhline(3, color=INK, linestyle="--", linewidth=0.8); ax.text(4.45, 3.05, "ta'sir yo'q", ha="right", fontsize=8.5)
ax.set_xticks(x); ax.set_xticklabels(ch); ax.set_ylim(1, 5); ax.set_ylabel("Ekspert bahosi (1–5)")
ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=9, loc="upper left")
save(fig, "d1_expert.png")
fig, ax = plt.subplots(figsize=(7, 3.4))
y6 = list(range(2025, 2031))
for nm, v, col, ls in [("Inersion", [0.741, .73, .73, .74, .74, .75], INK2, ":"), ("Bazaviy", [0.741, .75, .77, .79, .80, .81], B1, "--"),
                       ("Optimistik", [0.741, .77, .80, .83, .85, .86], B2, "-")]:
    ax.plot(y6, v, color=col, linestyle=ls, linewidth=2, marker="o", markersize=4, label=nm)
ax.axhline(0.75, color=INK, linewidth=0.8)
ax.set_ylabel("BBII"); ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True); ax.legend(frameon=False, fontsize=9, loc="upper left")
save(fig, "d4_scen.png")
fig, ax = plt.subplots(figsize=(7, 3.2))
roa = [1.7, 1.3, 2.3, 2.7, -0.7, 4.0, 3.5]
cols = [B1]*4 + [B2] + [B1]*2
bars(ax, [str(y) for y in yrs7], roa, color=cols, fmt="{:.1f}")
ax.axhline(0, color=INK2, linewidth=0.8); ax.set_ylabel("ROA, %"); ax.set_ylim(-1.5, 4.8)
save(fig, "d4_jcurve.png")

json.dump(OUT, open(os.path.join(HERE, "hisob_natijalari.json"), "w"), ensure_ascii=False, indent=1)
print(json.dumps(OUT, ensure_ascii=False, indent=1)[:6000])
