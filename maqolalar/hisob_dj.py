#!/usr/bin/env python3
"""Djabborov Sh.E. maqolalari (D1–D4, EN2, T3, T4) uchun diagrammalar.
Barcha qiymatlar dissertatsiyaning hisob-kitob skriptidan (../dissertatsiya_Djabborov/hisob.py) olinadi:
Markaziy bank statistikasi va “Ipoteka-bank”ning audit qilingan MHXS hisobotlari asosida.
Foydalanish: python3 hisob_dj.py  (so'ng build_maqola.py va build_en.py)"""
import os, sys, runpy, io, contextlib
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(HERE, "img")
DIS = os.path.join(HERE, "..", "dissertatsiya_Djabborov", "hisob.py")
cwd = os.getcwd(); os.chdir(os.path.dirname(DIS)); sys.argv = ["hisob.py"]
with contextlib.redirect_stdout(io.StringIO()):
    G = runpy.run_path(DIS)
os.chdir(cwd)
M, I, BB, CM, Z, EV, PR, SY, DD = G["M"], G["I"], G["BB"], G["CM"], G["Z"], G["EV"], G["PR"], G["SY"], G["DD"]
YR = G["YR"]; yrs = [int(y) for y in YR]

B1, B2 = "#2a78d6", "#eb6834"; INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
plt.rcParams.update({"font.family": "Liberation Serif", "font.size": 11, "axes.spines.top": False, "axes.spines.right": False,
                     "axes.edgecolor": INK2, "xtick.color": INK2, "ytick.color": INK2})
T8 = 2.306  # t(0,975; 8)


def save(fig, n):
    fig.tight_layout(); fig.savefig(os.path.join(IMG, n), dpi=200); plt.close(fig)


def grid(ax):
    ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)


def num(v, d, en):
    s = f"{v:.{d}f}"
    return s if en else s.replace(".", ",").replace("-", "–")


for en in (False, True):
    p = "en_" if en else ""
    L = (lambda uz, e: e) if en else (lambda uz, e: uz)

    # ---- D3/EN2: BBII va komponentlari
    fig, ax = plt.subplots(figsize=(7, 3.4))
    ax.plot(yrs, [BB[y] for y in YR], color=B1, lw=2, marker="o", ms=5, label="BBII")
    ax.plot(yrs, [(5 - CM[y][2]) / 4 for y in YR], color=INK2, lw=1.5, ls="--", marker="o", ms=4, label=L("Normallashtirilgan CAMELS", "Normalized CAMELS"))
    ax.plot(yrs, [min(Z[y] / 15, 1) for y in YR], color=B2, lw=1.5, ls=":", marker="o", ms=4, label=L("Normallashtirilgan Z-score", "Normalized Z-score"))
    ax.axhline(0.5, color=INK, lw=0.8); ax.text(2025.25, 0.5, L("“qoniqarli”\nchegarasi", "“satisfactory”\nthreshold"), fontsize=8, va="center")
    ax.axvspan(2022.5, 2023.5, color="#f0efec", zorder=0); ax.text(2023, 0.66, L("Integratsiya\nyili", "Integration\nyear"), ha="center", fontsize=8.5, color=INK2)
    ax.set_xlim(2018.7, 2026.1); ax.set_ylim(0.1, 0.75); grid(ax); ax.legend(frameon=False, fontsize=8.5, loc="lower left")
    save(fig, p + "d3_bbii.png")

    # ---- D3/EN2: aktivlar sifati bo'yicha sezgirlik
    labs = L(["2–4%\n(2 ball)", "4–6%\n(3 ball)", "6–10%\n(4 ball)", "≥ 10% – 2025\n(5 ball)"], ["2–4%\n(score 2)", "4–6%\n(score 3)", "6–10%\n(score 4)", "≥ 10% – 2025\n(score 5)"])
    bv = [G["bb_a"]("2025", a) for a in (2, 3, 4, 5)]
    fig, ax = plt.subplots(figsize=(7, 3.2))
    b = ax.bar(labs, bv, width=0.6, color=[B1, B1, B1, B2], edgecolor="white")
    for r, v in zip(b, bv): ax.text(r.get_x() + r.get_width() / 2, v + 0.004, num(v, 3, en), ha="center", fontsize=9)
    ax.set_ylim(0.5, 0.72); ax.set_xlabel(L("3-bosqich kreditlar ulushi (aktivlar sifati bali)", "Stage 3 loan ratio (asset quality score)")); ax.set_ylabel(L("BBII (2025)", "BBII (2025)")); grid(ax)
    save(fig, p + "d3_npl.png")

    # ---- D2: voqealar tahlili (NPL va kapital/aktivlar)
    fig, axs = plt.subplots(1, 2, figsize=(7.4, 3.3))
    for ax, n, tt in ((axs[0], "npl", L("Muammoli kreditlar ulushi, f.p.", "NPL ratio, pp")), (axs[1], "ea", L("Kapital/aktivlar, f.p.", "Equity/assets, pp"))):
        ys = [int(y) for y in YR if EV[n][y] is not None]; c = [EV[n][str(y)][0] for y in ys]; e = [T8 * EV[n][str(y)][1] for y in ys]
        ax.errorbar(ys, c, yerr=e, fmt="o", color=B1, ecolor=B1, elinewidth=1.3, capsize=3, ms=5)
        ax.axhline(0, color=INK2, lw=0.8); ax.axvline(2022.5, color=INK, ls="--", lw=1)
        ax.set_title(tt, fontsize=10); grid(ax); ax.set_xticks(ys); ax.tick_params(axis="x", labelsize=8.5)
    save(fig, p + "d2_event.png")

    # ---- D2: Ipoteka-bank va nazorat guruhi (kapital/aktivlar)
    ind = G["ind"]; ST = G["STATE9"]
    ip = [ind(y, G["IPO"], "ea") for y in YR]; ctl = [float(np.mean([ind(y, b, "ea") for b in ST])) for y in YR]
    fig, ax = plt.subplots(figsize=(7, 3.2))
    ax.plot(yrs, ip, color=B2, lw=2, marker="o", ms=5, label="“Ipoteka-bank”")
    ax.plot(yrs, ctl, color=B1, lw=2, ls="--", marker="o", ms=4, label=L("Davlat banklari (9 ta, o'rtacha)", "State-owned banks (9, mean)"))
    ax.axvline(2022.5, color=INK, ls="--", lw=1); ax.set_ylabel(L("Kapital/aktivlar (milliy standartlar), %", "Equity/assets (national GAAP), %"))
    grid(ax); ax.legend(frameon=False, fontsize=9, loc="lower left")
    save(fig, p + "d2_ea.png")

    # ---- D1/T3: ta'sir kanallari indikatorlari (oldin va keyin)
    pre, post = G["PRE"], G["POST"]
    mean = lambda k, ys: float(np.mean([M[y][k] for y in ys]))
    items = [(L("Kapital/\naktivlar", "Equity/\nassets"), "ea"), (L("Davlat\nmablag'lari\nulushi", "State\nfunding\nshare"), "state_f"),
             (L("3-bosqich\nkreditlar", "Stage 3\nloans"), "s3"), (L("Xarajatlar/\ndaromadlar", "Cost-to-\nincome"), "cir"), (L("Chakana\nkreditlar\nulushi", "Retail\nloan\nshare"), "retail")]
    x = np.arange(len(items)); a = [mean(k, pre) for _, k in items]; b2 = [mean(k, post) for _, k in items]
    fig, ax = plt.subplots(figsize=(7, 3.4))
    r1 = ax.bar(x - 0.2, a, width=0.38, color=B1, edgecolor="white", label=L("2019–2022 (oldin)", "2019–2022 (before)"))
    r2 = ax.bar(x + 0.2, b2, width=0.38, color=B2, edgecolor="white", label=L("2023–2025 (keyin)", "2023–2025 (after)"))
    for rr, vv in ((r1, a), (r2, b2)):
        for r, v in zip(rr, vv): ax.text(r.get_x() + r.get_width() / 2, v + 0.8, num(v, 1, en), ha="center", fontsize=8.5)
    ax.set_xticks(x); ax.set_xticklabels([t for t, _ in items], fontsize=9); ax.set_ylabel("%"); grid(ax); ax.legend(frameon=False, fontsize=9, loc="upper left")
    save(fig, p + "d1_channels.png")

    # ---- D4/T4: ROA va ROE (J-egri chiziq)
    yy = YR + ["2026H1"]; lab = [y if y != "2026H1" else L("2026\nI yarim*", "2026\nH1*") for y in yy]
    roa = [M[y]["roa"] for y in yy]
    fig, ax = plt.subplots(figsize=(7, 3.2))
    b = ax.bar(lab, roa, width=0.6, color=[B1] * 4 + [B2] + [B1] * 3, edgecolor="white")
    for r, v in zip(b, roa): ax.text(r.get_x() + r.get_width() / 2, v + (0.12 if v >= 0 else -0.45), num(v, 1, en), ha="center", fontsize=9)
    ax.plot(range(len(YR)), [SY[y]["roa"] for y in YR], color=INK2, ls="--", marker="o", ms=3.5, lw=1.2, label=L("Bank tizimi ROA", "Banking sector ROA"))
    ax.axhline(0, color=INK2, lw=0.8); ax.set_ylabel("ROA, %"); ax.set_ylim(-4.6, 5.8); grid(ax); ax.legend(frameon=False, fontsize=8.5, loc="lower right")
    save(fig, p + "d4_jcurve.png")

    # ---- D4: ssenariylar (3-bosqich kreditlar ulushi)
    fig, ax = plt.subplots(figsize=(7, 3.3))
    y6 = list(range(2025, 2031))
    for nm, col, ls in (("Inersion", INK2, ":"), ("Bazaviy", B1, "--"), ("Optimistik", B2, "-")):
        lb = {"Inersion": "Inertial", "Bazaviy": "Baseline", "Optimistik": "Optimistic"}[nm] if en else nm
        ax.plot(y6, PR[nm]["s3"], color=col, ls=ls, lw=2, marker="o", ms=4, label=lb)
    ax.axhline(10, color=INK, lw=0.8); ax.text(2025, 10.4, L("10% – aktivlar sifati bali 5 dan 4 ga o'tadigan chegara", "10% – threshold between asset quality scores 5 and 4"), fontsize=8.5)
    ax.set_ylabel(L("3-bosqich kreditlar ulushi, %", "Stage 3 loan ratio, %")); grid(ax); ax.legend(frameon=False, fontsize=9, loc="upper right")
    save(fig, p + "d4_scen.png")

    # ---- D3/EN2/D4: kredit portfeli sifati (3-bosqich, milliy NPL)
    fig, ax = plt.subplots(figsize=(7, 3.2))
    ax.plot(yrs, [M[y]["s3"] for y in YR], color=B2, lw=2, marker="o", ms=5, label=L("3-bosqich kreditlar ulushi (MHXS)", "Stage 3 loan ratio (IFRS)"))
    ax.plot(yrs[1:], [M[y]["npl_nas"] for y in YR[1:]], color=B1, lw=2, ls="--", marker="o", ms=4, label=L("Muammoli kreditlar ulushi (milliy standartlar)", "NPL ratio (national GAAP)"))
    ax.plot(yrs[1:], [G["tot"][y]["npl_pct"] for y in YR[1:]], color=INK2, lw=1.2, ls=":", marker="o", ms=3, label=L("Bank tizimi NPL", "Banking sector NPL"))
    ax.axvspan(2022.5, 2023.5, color="#f0efec", zorder=0); ax.set_ylabel("%"); grid(ax); ax.legend(frameon=False, fontsize=8.5, loc="upper left")
    save(fig, p + "d3_quality.png")
print("ok")
