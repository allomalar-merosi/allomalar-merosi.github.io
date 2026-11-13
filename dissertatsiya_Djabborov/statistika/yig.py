#!/usr/bin/env python3
"""Rasmiy ma'lumotlarni bitta faylga jamlash (rasmiy.json).
Manbalar: cbu.uz (Bank tizimi faoliyati ko'rsatkichlari, 01.01.2020–01.10.2026),
“Ipoteka-bank” ATIB MHXS bo'yicha konsolidatsiyalangan moliyaviy hisobotlari (2019–2025, 2026-yil I yarmi),
investor taqdimotlari (2025-yil yakuni, 2026-yil I yarmi)."""
import json, sys
src = sys.argv[1] if len(sys.argv) > 1 else None
out = {"_manba": {
  "cbu": "O'zbekiston Respublikasi Markaziy banki, 'Bank tizimi faoliyati ko'rsatkichlari': https://cbu.uz/oz/statistics/bankstats/ (banklar kesimida asosiy ko'rsatkichlar, muammoli kreditlar, kreditlar va depozitlar; kapital yetarliligi, likvidlik, daromadlilik). mlrd so'm, milliy standartlar.",
  "ifrs": "“Ipoteka-bank” ATIB konsolidatsiyalangan MHXS hisobotlari: https://www.ipotekabank.uz/en/about/investors/shai_finain/ (mln so'm).",
  "ip": "“Ipoteka-bank” investor taqdimotlari (Financial Year 2025; First Half 2026), shu sahifada."}}
if src:
    out["cbu_panel"] = json.load(open(src + "/panel.json"))
    out["cbu_system"] = json.load(open(src + "/system.json"))
else:
    old = json.load(open("rasmiy.json")); out["cbu_panel"] = old["cbu_panel"]; out["cbu_system"] = old["cbu_system"]
out["cbu_system"]["2019"]["mortgage"] = 20326.0; out["cbu_system"]["2019"]["retail_loans"] = 39934.0
out["cbu_system"]["2018"] = {"net_profit": 3199.5, "roa": 2.05, "roe": 16.20}

# ---------------- Ipoteka-bank, MHXS (mln so'm) ----------------
Y = {}
def y(k, **kw): Y[k] = kw
# balans
y("2018", ta=19831350, loans=17598212, cash=1315362, banks=508224, secs=154610, cust=7090686, debt=9934, borr=11057373, sub=0, due_banks=0, tl=18219225, eq=1612125, np=177705)
y("2019", ta=23844978, loans=19839756, cash=2630173, banks=845018, secs=131149, cust=7935719, debt=14850, borr=11530321, sub=425905, due_banks=284533, tl=20296823, eq=3548155,
  int_inc=1927799+24985, int_exp=917559, nii=1035225, ecl_charge=274856, fee_inc=255425, fee_exp=47748, fx=16727, fx_tr=20070, oth_inc=181+31127, opex=619152, staff=434766, pbt=410949, tax=71682, np=339018,
  gross=20381742, ecl=541986, s1=18668575, s2=997929, s3=715238, s3_ecl=237673, mortgage=5169389, consumer=822510, corporate=7998400, sme=6391443,
  cust_state=4586437, cust_ind=1819631, b_mof=7189496, b_ifi=2363981, b_dom=981936, car=25.6, t1=19.2, lev=12.2, staff_n=4461,
  fx_pos=1145911+56608+7879)
y("2020", ta=32604079, loans=24345221, cash=5147641, banks=1810524, secs=776819, cust=9211107, debt=3148617, borr=15117378, sub=425905, due_banks=520151, tl=28563773, eq=4040306,
  int_inc=2517060+27681, int_exp=1134672, nii=1410069, ecl_charge=609720, fee_inc=312292, fee_exp=57012, fx=7259, fx_tr=56083, oth_inc=16095+1960+48141, opex=665161, staff=455398, pbt=510900, tax=105251, np=405165,
  gross=25549200, ecl=1203979, s1=19927497, s2=4116393, s3=1505310, s3_ecl=525565, mortgage=8594579, consumer=1730363, corporate=5736298, sme=9487960,
  cust_state=5068046, cust_ind=1954385, b_mof=8139511, b_ifi=4933208, b_dom=1053101, car=17.0, t1=13.2, lev=9.4, staff_n=4087, fx_pos=287217+38917+11109)
y("2021", ta=40164316, loans=29263226, cash=7229674, banks=2031514, secs=1095081, cust=13632275, debt=4057179, borr=16947048, sub=425905, due_banks=0, tl=35237272, eq=4927044,
  int_inc=3693881+28594, int_exp=1600739, nii=2121736, ecl_charge=591328, fee_inc=343937, fee_exp=82415, fx=10050, fx_tr=59841, oth_inc=-8336+164+161925, opex=894127, staff=573654, pbt=1090380, tax=203599, np=886781,
  gross=30990737, ecl=1727511, s1=25841621, s2=2923083, s3=2226033, s3_ecl=984160, mortgage=11101048, consumer=3023464, corporate=8027469, sme=8838756,
  cust_state=8740571, cust_ind=2358015, b_mof=10689736, b_ifi=4114542, b_dom=1245615, car=14.4, t1=11.1, lev=9.2, staff_n=4003, fx_pos=471520+76041+15252)
# 2022 — 2023-yilgi hisobotda qayta hisoblangan (restated) qiymatlar
y("2022", ta=44051197, loans=32307957, cash=5070179, banks=1952797, secs=3921719, cust=12569851, debt=4184718, borr=19145069, sub=425905, due_banks=1783791, tl=38382862, eq=5668335,
  int_inc=4783763+35590, int_exp=2100206, nii=2719147, ecl_charge=868569, fee_inc=370021, fee_exp=75501, fx=146021, fx_tr=-19576, oth_inc=-23913+2916+57181, opex=1123432, staff=791691, pbt=1133783, tax=186661, np=947122,
  gross=34739637, ecl=2431680, s1=29308488, s2=2982076, s3=2449073, s3_ecl=1004419, mortgage=12419593, consumer=3410002, corporate=10104368, sme=8805674,
  cust_state=4029188+2174102, cust_ind=1598928+1840531, b_mof=13048763, b_ifi=3598584, b_dom=1690981, car=16.4, t1=12.3, lev=9.9, fx_pos=201070+172553+59111)
y("2023", ta=44573924, loans=33636749, cash=5628503, banks=1382867, secs=2417907, cust=12212201, debt=4529459, borr=20608321, sub=632159, due_banks=1125308, tl=39599881, eq=4974043,
  int_inc=5957744+27048, int_exp=2612804, nii=3371988, ecl_charge=4275441, fee_inc=422038, fee_exp=87562, fx=165931, fx_tr=-3633, oth_inc=336+134877, opex=1433847, staff=927972, pbt=-1706693, tax=-91077, np=-1615616,
  gross=39990299, ecl=6353551, s1=25865771, s2=6646097, s3=7478431, s3_ecl=4145526, mortgage=14052474, consumer=7625883, corporate=9443481, sme=8868461,
  cust_state=1239338+2038046, cust_ind=2246267+2162269, b_mof=14372982, b_ifi=3541385, b_dom=1874783, car=17.6, t1=14.3, lev=13.5, fx_pos=426982+694884+10774)
# 2024 — 2025-yilgi hisobotdagi taqqoslama ustun (sug'urta operatsiyalari alohida ko'rsatilgan)
y("2024", ta=50511240, loans=32316421, cash=9089717, banks=2628011, secs=4688698, cust=17855389, debt=5297811, borr=19849278, sub=584684, due_banks=251379, tl=44246701, eq=6264539,
  int_inc=7056318+29872, int_exp=3389071, nii=3697119, ecl_charge=1048658, fee_inc=432495, fee_exp=116282, fx=210375, fx_tr=-610, oth_inc=3097+123604-25816+1787+6523, opex=1726807, staff=1155493, pbt=1506835, tax=219780, np=1287055,
  gross=39589250, ecl=7272829, s1=24413214, s2=7039548, s3=8136488, s3_ecl=5192384, mortgage=15899331, consumer=8594284, corporate=8354867, sme=6740768,
  cust_state=3652760, cust_ind=5999407, b_mof=15277610, b_ifi=2146829, b_dom=1721884, car=16.0, t1=14.6, lev=13.6, fx_pos=158799+347269+4226, lcr=234, nsfr=114)
y("2025", ta=54927350, loans=35080855, cash=7040467, banks=935428, secs=9959165, cust=18318358, debt=6291138, borr=20920253, sub=457467, due_banks=9160, tl=46612057, eq=8315293,
  int_inc=7513075+22264, int_exp=4111037, nii=3424302, ecl_charge=-257472, fee_inc=609361, fee_exp=178160, fx=212864, fx_tr=-24607, oth_inc=8149+52991-31134+4788+14219, opex=1928992, staff=1208121, pbt=2403821, tax=357197, np=2046624,
  gross=41926846, ecl=6845991, s1=30117106, s2=3537129, s3=8272611, s3_ecl=5574173, mortgage=18337727, consumer=10486168, corporate=7779527, sme=5323424,
  cust_state=3167154, cust_ind=6195091, b_mof=16182598, b_ifi=2314761, b_dom=2084870, car=19.8, t1=17.3, lev=13.05, staff_n=4300, fx_pos=359346+184605+10206, lcr=225, nsfr=127)
y("2026H1", ta=56973819, loans=35954660, cash=5375215, banks=3478343, secs=10093369, cust=18635323, debt=6308621, borr=20835690, sub=428201, due_banks=9187, tl=47817645, eq=9156174,
  nii=2187428, ecl_charge=-71032, fee_inc=356963, fee_exp=84806, fx=108045, fx_tr=-500, opex=1154717, pbt=1531708, tax=180857, np=1350851,
  gross=42425378, ecl=6470718, s1=30938547, s2=3622458, s3=7864373, s3_ecl=5255541, mortgage=18670358, consumer=11709714, corporate=10495771, sme=1549535,
  b_dom=2457880, b_ifi=1472578, car=22.0, t1=17.6, lev=14.0)
Y["2025H1"] = dict(nii=1507498, ecl_charge=-416809, fee_inc=235996, fee_exp=59348, fx=83960, opex=920582, pbt=1280827, tax=256571, np=1024256)
out["ipoteka_ifrs"] = Y
# bankning o'zi e'lon qilgan ko'rsatkichlar (investor taqdimoti, "Local IFRS data")
out["ipoteka_kpi"] = {"nim": {"2022": 6.5, "2023": 7.6, "2024": 7.8, "2025": 6.5, "2026H1": 7.8}, "cir": {"2022": 35.9, "2023": 35.8, "2024": 40.2, "2025": 47.1, "2026H1": 44.9},
  "risk_cost": {"2022": 2.6, "2023": 11.4, "2024": 2.6, "2025": -0.6, "2026H1": -0.3}, "roe": {"2022": 18.2, "2023": -30.4, "2024": 23.0, "2025": 28.1, "2026H1": 30.9}, "roa": {"2025": 3.9, "2026H1": 4.8},
  "stage3": {"2023-06": 10.1, "2023-12": 18.7, "2024-06": 23.0, "2024-12": 20.6, "2025-06": 18.9, "2025-12": 19.7}, "npl90": {"2023-06": 8.5, "2023-12": 5.7, "2024-06": 14.0, "2024-12": 18.3, "2025-06": 17.9, "2025-12": 16.9},
  "stage3_business": {"2023-06": 17.6, "2023-12": 40.0, "2024-06": 53.7, "2024-12": 49.2, "2025-06": 45.8, "2025-12": 53.2}, "stage3_retail": {"2023-06": 1.9, "2023-12": 0.7, "2024-06": 1.8, "2024-12": 2.9, "2025-06": 3.2, "2025-12": 4.5},
  "coverage": {"s1": 2, "s2": 17, "s3": 67}, "lcr": {"2024-12": 234, "2025-12": 225, "2026-06": 212}, "nsfr": {"2024-12": 114, "2025-12": 127},
  "aksiyadorlar_2026": {"OTP Bank Plc.": 72.89, "Iqtisodiyot va moliya vazirligi": 17.49, "IFC": 8.69, "Boshqalar": 0.93},
  "reyting": {"Fitch": "BB (ijobiy prognoz, 2026-yil sentabr)", "S&P": "BB (barqaror; 2026-yil mayda BB- dan oshirilgan)"},
  "9M2026": {"np_trln": 1.8, "np_osish": 56, "ta_trln": 57.9, "op_foyda_trln": 2.2},
  "bozor_ulushi_2025": {"aktivlar": 6, "chakana_kreditlar": 16, "kreditlar": 13, "ipoteka": 23}, "shoxobchalar_2025": 352, "mijozlar_mln_2025": 3.4}
json.dump(out, open("rasmiy.json", "w"), ensure_ascii=False, indent=0)
print("rasmiy.json:", len(json.dumps(out)) // 1024, "KB")
