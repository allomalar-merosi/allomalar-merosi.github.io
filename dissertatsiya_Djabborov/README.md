# PhD dissertatsiya: Djabborov Sh.E.

**Mavzu:** Xorijiy strategik investor ishtirokida tijorat bankining moliyaviy barqarorligini ta'minlash yo'llari (“Ipoteka-bank” ATIB misolida), 08.00.07 – “Moliya, pul muomalasi va kredit”

| Fayl | Tavsif |
|---|---|
| `Djabborov_Sh_E_PhD_dissertatsiya.docx` | Dissertatsiya matni (Word) |
| `Djabborov_Sh_E_PhD_dissertatsiya.pdf` | Xuddi shu matn, PDF ko'rinishida |
| `manba/*.txt` | Boblar matni, `manba/refs.txt` – adabiyotlar ro'yxati |
| `build.py` | Manbadan .docx/.pdf yig'uvchi skript |
| `statistika/rasmiy.json` | Rasmiy ma'lumotlar bazasi: Markaziy bankning banklar kesimidagi statistikasi (01.01.2020–01.10.2026) va “Ipoteka-bank”ning audit qilingan MHXS hisobotlari (2019–2025, 2026-yil I yarmi) |
| `statistika/yig.py` | `rasmiy.json` ni tuzuvchi skript (MHXS ko'rsatkichlari shu faylda yozilgan) |
| `hisob.py` | Barcha jadvallar va matndagi raqamlarni hisoblovchi skript: `python3 hisob.py && python3 build.py` |
| `manba/gen/` | `hisob.py` yaratadigan jadval qatorlari va `{{kalit}}` qiymatlari |

Shakli M.Xodjiyev dissertatsiyasi namunasiga mos: titul, mundarija, “1.1-§.” paragraflar, bob xulosalari, “XULOSA VA TAKLIFLAR”, havolalar sahifa ostidagi izohlar (snoskalar) ko'rinishida.

## Ranglar

- **Oddiy (qora) sonlar** – rasmiy manbalardan olingan haqiqiy ma'lumotlar yoki ulardan to'g'ridan-to'g'ri hisoblangan qiymatlar: bank tizimi ko'rsatkichlari, bozor ulushlari, konsentratsiya, “Ipoteka-bank”ning balans, foyda-zarar va kredit sifati ko'rsatkichlari, CAMELS, Z-score, BBII, farqlar farqi, voqealar tahlili, sintetik nazorat, panel regressiya, stress-test. Prognoz (2026–2030) – haqiqiy 2025-yil bazasidan muallif farazlari asosida hisoblangan.
- **Jigarrang sonlar** – ochiq manbalarda topilmagan, **taxminiy** qiymatlar. Manbada `<<...>>` bilan belgilangan. Hozir ular quyidagilar:
  - DEA va Malmquist indeksi jadvallari (3.2-paragraf) – banklar kesimida operatsion xarajatlar ma'lumoti kerak (har bir bankning yillik hisobotidan);
  - ekspert so'rovi natijalari va ekspertlar soni (2.3-paragraf);
  - 2019-yil uchun muammoli kreditlar ulushi (bank tizimi va “Ipoteka-bank”) – Markaziy bank banklar kesimidagi NPL ma'lumotini 2021-yildan e'lon qiladi;
  - strategiya ko'rsatkichlaridan ikkitasi (majburiyatlarda xususiy sektor ulushi; bank bo'lmagan kredit tashkilotlari ulushi);
  - stress-testdagi valyuta ssenariysi (riskka tortilgan aktivlarning valyutadagi ulushi farazi).
- **Sariq** `[...]` – muallif o'zi kiritadigan ma'lumotlar (UO'K, ilmiy rahbar, joriy etish ma'lumotnomalari, aprobatsiya, nashrlar).

## Taxminiy raqamni qanday almashtirish kerak

Manba faylida (`manba/*.txt`) `<<0,82>>` ko'rinishidagi qiymatni haqiqiy raqamga almashtirib, `<<` va `>>` belgilarini olib tashlang, so'ng `python3 build.py` ni ishga tushiring – raqam qora rangga o'tadi. Word faylida to'g'ridan-to'g'ri tahrirlash ham mumkin.
