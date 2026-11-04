#!/usr/bin/env python3
"""Inglizcha maqola va tezislar uchun diagrammalar (hisob_natijalari.json va dissertatsiya hisob-kitoblari asosida)."""
import os, json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
HERE = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(HERE, "img")
B1, B2 = "#2a78d6", "#eb6834"; INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e0"
plt.rcParams.update({"font.family": "Liberation Serif", "font.size": 11, "axes.spines.top": False,
                     "axes.spines.right": False, "axes.edgecolor": INK2, "xtick.color": INK2, "ytick.color": INK2})
D = json.load(open(os.path.join(HERE, "hisob_natijalari.json")))

def save(fig, n):
    fig.tight_layout(); fig.savefig(os.path.join(IMG, n), dpi=200); plt.close(fig)

def grid(ax, axis="y"):
    getattr(ax, axis + "axis").grid(True, color=GRID); ax.set_axisbelow(True)

# B1: deprivation scores
c = D["B1"]["c"]; poor = D["B1"]["poor"]
fig, ax = plt.subplots(figsize=(7, 3.6))
b = ax.bar([f"H{i+1}" for i in range(10)], c, width=0.6, color=[B2 if p else B1 for p in poor], edgecolor="white", linewidth=1.5)
for r, v in zip(b, c): ax.text(r.get_x()+r.get_width()/2, v+0.015, f"{v:.2f}", ha="center", fontsize=9)
ax.axhline(1/3, color=INK, ls="--", lw=1); ax.text(9.45, 1/3+0.012, "k = 1/3", ha="right", fontsize=9)
ax.set_ylabel("Deprivation score, c_i"); ax.set_ylim(0, 1.0); grid(ax)
ax.legend(handles=[Patch(color=B2, label="Multidimensionally poor"), Patch(color=B1, label="Not poor")], frameon=False, fontsize=9, loc="upper left")
save(fig, "en_b1_ci.png")
# B1: contributions
con = D["B1"]["contrib"]; names = ["Education", "Health", "Living\nstandards", "Employment", "Entrepreneurial\ncapacity"]
fig, ax = plt.subplots(figsize=(7, 3.2))
b = ax.bar(names, con, width=0.6, color=B1, edgecolor="white")
for r, v in zip(b, con): ax.text(r.get_x()+r.get_width()/2, v+0.5, f"{v:.1f}%", ha="center", fontsize=9)
ax.set_ylabel("Contribution to MPI-TS, %"); ax.set_ylim(0, max(con)*1.2); grid(ax)
save(fig, "en_b1_contrib.png")
# B2: ATT estimates
b2 = D["B2"]; vals = [b2["naive"], b2["psm"], b2["did"], b2["psmdid"]]
fig, ax = plt.subplots(figsize=(7, 3.4))
b = ax.bar(["Naive comparison", "PSM", "DiD", "PSM-DiD"], vals, width=0.6, color=B1, edgecolor="white")
for r, v in zip(b, vals): ax.text(r.get_x()+r.get_width()/2, v-0.004, f"{v:.3f}", ha="center", va="top", fontsize=9, color="white")
ax.axhline(b2["true"], color=B2, ls="--", lw=1.5); ax.text(3.45, b2["true"]+0.004, "True effect = −0.060", ha="right", fontsize=9)
ax.axhline(0, color=INK2, lw=0.8); ax.set_ylabel("ATT (deprivation score)"); ax.set_ylim(-0.13, 0.01); grid(ax)
save(fig, "en_b2_att.png")
# B4: allocation
M = ["M1", "M2", "M3", "M4", "M5", "M6"]; x = np.arange(6)
fig, ax = plt.subplots(figsize=(7, 3.4))
ax.bar(x-0.2, D["B4"]["Rold"], width=0.38, color=B1, edgecolor="white", label="Current rule")
ax.bar(x+0.2, D["B4"]["Rnew"], width=0.38, color=B2, edgecolor="white", label="Proposed rule")
ax.set_xticks(x); ax.set_xticklabels(M); ax.set_ylabel("Allocated resources, UZS million"); grid(ax); ax.legend(frameon=False, fontsize=9)
save(fig, "en_b4_alloc.png")
# D3: BBII
yrs = list(range(2019, 2026))
bbii = [0.632, 0.540, 0.628, 0.678, 0.549, 0.685, 0.741]; camn = [0.650, 0.488, 0.588, 0.650, 0.450, 0.588, 0.650]; zn = [0.607, 0.620, 0.687, 0.720, 0.700, 0.833, 0.880]
fig, ax = plt.subplots(figsize=(7, 3.4))
ax.plot(yrs, bbii, color=B1, lw=2, marker="o", ms=5, label="BBII")
ax.plot(yrs, camn, color=INK2, lw=1.5, ls="--", marker="o", ms=4, label="Normalized CAMELS")
ax.plot(yrs, zn, color=B2, lw=1.5, ls=":", marker="o", ms=4, label="Normalized Z-score")
ax.axhline(0.75, color=INK, lw=0.8); ax.text(2019, 0.757, "“High” stability threshold (0.75)", fontsize=8.5)
ax.axvspan(2022.5, 2023.5, color="#f0efec", zorder=0); ax.text(2023, 0.43, "Integration\nyear", ha="center", fontsize=8.5, color=INK2)
ax.set_ylim(0.4, 0.95); grid(ax); ax.legend(frameon=False, fontsize=8.5, loc="upper left")
save(fig, "en_d3_bbii.png")
# D3: NPL sensitivity
npl = ["≥10%", "6–10% (2025)", "4–6%", "2–4%"]; bv = [0.704, 0.741, 0.780, 0.817]
fig, ax = plt.subplots(figsize=(7, 3.2))
b = ax.bar(npl, bv, width=0.6, color=[B1, B2, B1, B1], edgecolor="white")
for r, v in zip(b, bv): ax.text(r.get_x()+r.get_width()/2, v+0.004, f"{v:.3f}", ha="center", fontsize=9)
ax.axhline(0.75, color=INK, ls="--", lw=1); ax.set_ylim(0.6, 0.85); ax.set_xlabel("NPL ratio band"); ax.set_ylabel("BBII (2025 values otherwise)"); grid(ax)
save(fig, "en_d3_npl.png")
# D1: expert
ch = ["Capital", "Corporate\ngovernance", "Risk\nmanagement", "Technology", "Market\n(funding)"]; st = [4.1, 3.9, 2.8, 3.4, 3.2]; lt = [4.4, 4.6, 4.5, 4.3, 3.9]
x = np.arange(5); fig, ax = plt.subplots(figsize=(7, 3.4))
ax.bar(x-0.2, st, width=0.38, color=B1, edgecolor="white", label="Short term (1–2 years)")
ax.bar(x+0.2, lt, width=0.38, color=B2, edgecolor="white", label="Long term (3–5 years)")
ax.axhline(3, color=INK, ls="--", lw=0.8); ax.text(4.45, 3.05, "no effect", ha="right", fontsize=8.5)
ax.set_xticks(x); ax.set_xticklabels(ch); ax.set_ylim(1, 5); ax.set_ylabel("Expert score (1–5)"); grid(ax); ax.legend(frameon=False, fontsize=9, loc="upper left")
save(fig, "en_d1_expert.png")
# D4: ROA J-curve
roa = [1.7, 1.3, 2.3, 2.7, -0.7, 4.0, 3.5]
fig, ax = plt.subplots(figsize=(7, 3.2))
b = ax.bar([str(y) for y in yrs], roa, width=0.6, color=[B1]*4+[B2]+[B1]*2, edgecolor="white")
for r, v in zip(b, roa): ax.text(r.get_x()+r.get_width()/2, v+(0.1 if v >= 0 else -0.35), f"{v:.1f}", ha="center", fontsize=9)
ax.axhline(0, color=INK2, lw=0.8); ax.set_ylabel("ROA, %"); ax.set_ylim(-1.5, 4.8); grid(ax)
save(fig, "en_d4_jcurve.png")
print("ok")
