# PhD dissertatsiya: Batirova L.Sh.

**Mavzu:** Kambag‘allikning ko‘p o‘lchovli mezonlari asosida tadbirkorlikni qo‘llab-quvvatlash samaradorligini baholash metodikasini takomillashtirish (08.00.15)

| Fayl | Tavsif |
|---|---|
| `Batirova_L_Sh_PhD_dissertatsiya.docx` | Dissertatsiya matni (Word) |
| `Batirova_L_Sh_PhD_dissertatsiya.pdf` | Xuddi shu matn, PDF ko‘rinishida |
| `manba/*.txt` | Boblar matni (manba), `manba/refs.txt` — adabiyotlar ro‘yxati |
| `build.py` | Manbadan .docx/.pdf yig‘uvchi skript: `python3 build.py` |
| `statistika/rasmiy.json` | stat.uz (siat.stat.uz ochiq ma’lumotlari) va sirstat.uz dan yig‘ilgan rasmiy statistika (2019–2025/2026) |
| `hisob.py` | Jadvallarni to‘ldiruvchi hisob-kitob skripti: `python3 hisob.py && python3 build.py` |
| `manba/gen/` | `hisob.py` yaratadigan jadval qatorlari va matndagi `{{kalit}}` qiymatlari (`qiymatlar.json`) |

## Ranglar

- **Qora raqamlar** — rasmiy statistika (Statistika agentligi, Sirdaryo viloyati statistika boshqarmasi) yoki undan bevosita hisoblangan ko‘rsatkichlar. Manbalar jadval ostida va adabiyotlar ro‘yxatida ko‘rsatilgan.
- **Jigarrang raqamlar** — TAXMINIY qiymatlar: ochiq manbalarda topilmagan idoraviy ma’lumotlar (qo‘llab-quvvatlash resurslari, tumanlar kesimida kambag‘allik darajasi) hamda so‘rovnoma va ekonometrik hisob-kitob natijalari. Ular `hisob.py` dagi yagona shartli (simulyatsion) ma’lumotlar to‘plamidan olingan, shuning uchun jadvallar va matn o‘zaro mos keladi. **Himoyadan oldin haqiqiy so‘rovnoma va idoraviy ma’lumotlar bilan almashtirilishi shart.**
- **Sariq `[...]` joylar** — faqat muallif kiritadigan shaxsiy ma’lumotlar: UO‘K, ilmiy rahbar, joriy etish ma’lumotnomalari, aprobatsiya, nashrlar, ayrim bibliografik ma’lumotlar.

## Taxminiy raqamlarni qanday almashtirish kerak

1. Haqiqiy so‘rovnoma bazasi tayyor bo‘lgach, `hisob.py` ning 3-bo‘limidagi simulyatsiya o‘rniga shu bazani o‘qish kifoya — barcha jadvallar va matndagi raqamlar avtomatik yangilanadi.
2. Yoki bevosita `manba/gen/*.txt` (jadvallar) va `manba/gen/qiymatlar.json` (matndagi raqamlar) ni tahrirlang: qiymat aniqlashtirilgach `<<...>>` belgisini olib tashlang (`"est": false`) — raqam qora rangga o‘tadi. (Eslatma: `hisob.py` qayta ishga tushirilsa, bu fayllar qaytadan yoziladi.)
3. Word faylida to‘g‘ridan-to‘g‘ri tahrirlash ham mumkin: jigarrang raqamni almashtirib, rangini qoraga o‘zgartiring.

Tuzilishi va rasmiylashtirilishi M.Xodjiyev dissertatsiyasi namunasiga moslashtirilgan: paragraflar “1.1-§.” shaklida, har bob oxirida bob bo‘yicha xulosalar, “XULOSA VA TAKLIFLAR” bo‘limi, adabiyotlarga havolalar sahifa ostidagi izohlar (snoskalar) ko‘rinishida, jadval va rasmlar har bob ichida avtomatik raqamlanadi.

Rasmiylashtirish: A4, Times New Roman 14, 1,5 interval, hoshiyalar: chap 30 mm, o‘ng 15 mm, yuqori/pastki 20 mm, xatboshi 1,25 sm.
