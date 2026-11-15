# Ilmiy maqolalar (OAK jurnallari uchun)

M.Xodjiyev maqolalari namunasi asosida (uch tilda sarlavha va annotatsiya, Kirish – Adabiyotlar sharhi – Metodologiya – Tahlil va natijalar – Xulosa va takliflar, APA uslubidagi adabiyotlar).

| Fayl | Dissertatsiya | Ilmiy yangilik |
|---|---|---|
| `B1_Batirova_MPI-TS` | Batirova L.Sh. | Tadbirkorlik salohiyatini hisobga oluvchi MPI-TS indeksi |
| `B2_Batirova_PSM-DiD` | Batirova L.Sh. | PSM-DiD sof ta'sir modeli |
| `B3_Batirova_samaradorlik_matritsasi` | Batirova L.Sh. | “Qo'llab-quvvatlash turi – mahrumlik o'lchovi” matritsasi |
| `B4_Batirova_taqsimlash_algoritmi` | Batirova L.Sh. | Mahalla darajasida taqsimlash algoritmi va 2030 ssenariylari |
| `D1_Djabborov_tasir_kanallari` | Djabborov Sh.E. | Ta'sir kanallari tasnifi |
| `D2_Djabborov_farqlar_farqi` | Djabborov Sh.E. | Farqlar farqi usulida sof ta'sir |
| `D3_Djabborov_BBII` | Djabborov Sh.E. | Bank barqarorligining integral indeksi (BBII) |
| `D4_Djabborov_integratsiya_modeli` | Djabborov Sh.E. | 7 bosqichli integratsiya modeli va 2026–2030 prognozi |

Har bir maqola `.docx` va `.pdf` ko'rinishida. Manba matnlar – `manba/`, diagrammalar – `img/` (Batirova maqolalari uchun `hisob.py`, Djabborov maqolalari uchun `hisob_dj.py` bilan yaratiladi), yig'ish – `python3 build_maqola.py`.

**Djabborov maqolalari (D1–D4, EN2, T3, T4)** dissertatsiyaning yangilangan natijalariga moslab qayta yozilgan: barcha raqamlar `../dissertatsiya_Djabborov/hisob.py` hisob-kitobidan (Markaziy bank statistikasi va “Ipoteka-bank”ning 2019–2025-yillar audit qilingan MHXS hisobotlari) olinadi; `hisob_dj.py` diagrammalarni o'sha skript natijalaridan chizadi. Ularda taxminiy qiymatlar **jigarrang** bilan ajratilgan (dissertatsiyadagidek): ekspert so'rovi baholari (D1, T3) va 2019-yil milliy standartlar bo'yicha NPL asosidagi BBII varianti (D3, EN2). D2 va D4 da taxminiy raqam qolmagan.

**Ranglar:** qora – ochiq manbalardagi haqiqiy ma'lumotlar; **ko'k** (Djabborov maqolalarida **jigarrang**) – shartli, simulyatsion yoki taxminiy qiymatlar (jurnalga yuborishdan oldin haqiqiy ma'lumot bilan almashtirilishi yoki maqolada “shartli modellashtirish” deb aniq ko'rsatilishi lozim); **sariq** `[...]` – ORCID, email va tekshirilishi kerak bo'lgan bibliografik ma'lumotlar.

## Xalqaro nashrlar (PF-98 talablari: kamida 1 ta nufuzli xorijiy jurnal maqolasi va 2 ta xalqaro konferensiya materiali)

`xalqaro/` papkasida, ingliz tilida (.docx va .pdf). Manba – `manba_en/`, yig'ish – `python3 build_en.py`, diagrammalar – `hisob_en.py` (EN1, T1, T2) va `hisob_dj.py` (EN2, T3, T4).

| Fayl | Muallif | Turi |
|---|---|---|
| `EN1_Batirova_journal_MPI-TS` | Batirova L.Sh. | Xalqaro jurnal maqolasi (Scopus/WoS formati: structured abstract, JEL, Declarations, APA) |
| `T1_Batirova_thesis_PSM-DiD` | Batirova L.Sh. | Xalqaro konferensiya tezisi |
| `T2_Batirova_thesis_allocation` | Batirova L.Sh. | Xalqaro konferensiya tezisi |
| `EN2_Djabborov_journal_BBII` | Djabborov Sh.E. | Xalqaro jurnal maqolasi |
| `T3_Djabborov_thesis_channels` | Djabborov Sh.E. | Xalqaro konferensiya tezisi |
| `T4_Djabborov_thesis_integration` | Djabborov Sh.E. | Xalqaro konferensiya tezisi |
