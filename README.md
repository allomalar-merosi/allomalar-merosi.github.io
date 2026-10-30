# Allomalar merosi — tarbiya fani onlayn platformasi

**Mavzu:** Tarbiya fanini O‘rta Osiyo allomalari ilmiy merosidan foydalanib o‘qitish metodikasini takomillashtirish (umumiy o‘rta ta’lim maktablarining 8-sinfi misolida).

Platforma dissertatsiya aprobatsiyasi (tajriba-sinov) uchun ishlab chiqilgan. Kontent “Tarbiya fanini o‘qitish metodikasi” darsligi (Guliston davlat universiteti) asosida tayyorlangan.

## Imkoniyatlar

| Bo‘lim | Tarkibi |
|---|---|
| Sinflar (5–11) | Malaka talablari, kompetensiya darajasi, 5 ta mavzu, case study, krossvord, o‘yin, 20 savollik test banki |
| **8-sinf moduli** | 10 ta dars ishlanmasi (har birida 8 savollik test banki), 4 ta case study, krossvord, 3 ta o‘yin |
| Allomalar | 13 ta mutafakkir (12 tasi portret bilan, `assets/img/allomalar/`): yillari, asarlari, tarbiyaviy g‘oyalari, darslarga havolalar |
| O‘yinlar | Krossvordlar (har sinf uchun), “Alloma va asar”, “Vaqt chizig‘i”, “Yaxshi va yomon xulqlar”, “Hikmat kimniki?” |
| Diagnostika | 20 savollik test + 8 bandli so‘rovnoma; dastlabki va yakuniy bosqich |
| O‘qituvchi profili | Maxsus kod, o‘quvchilar ro‘yxati, guruhlash (tajriba/nazorat), barcha ballar va javoblar, diagnostika statistikasi (η, Styudent t, p), CSV eksport, o‘quvchi parolini tiklash |
| O‘quvchi profili | O‘qituvchi kodi bilan ro‘yxatdan o‘tish, bajarilgan topshiriqlar tarixi |

**Tasodifiy testlar.** Har bir test bankdan tasodifiy savollar oladi (sinf testi: 20 tadan 10 tasi, dars testi: 8 tadan 5 tasi). Savollar va javob variantlarining tartibi ham har bir o‘quvchiga turlicha chiqadi. Diagnostikada barcha 20 savol beriladi, lekin tartibi aralashtiriladi. Shunday qilib guruhlar natijalarini solishtirish mumkin bo‘ladi.

## Qanday ishlaydi

1. O‘qituvchi **Ro‘yxatdan o‘tish → O‘qituvchi** bo‘limida hisob ochadi va 6 belgili kod oladi (masalan, `K7M2QX`).
2. O‘qituvchi o‘quvchilarga kodni yoki tayyor havolani beradi (`.../#kod-K7M2QX`).
3. O‘quvchi kod bilan ro‘yxatdan o‘tadi. Shundan so‘ng uning barcha test, krossvord, case study, o‘yin va diagnostika natijalari shu o‘qituvchiga boradi.
4. O‘qituvchi profilida o‘quvchilarni tajriba va nazorat guruhlariga ajratadi, javoblarni ko‘radi va diagnostika bosqichini (dastlabki/yakuniy) almashtiradi.

## Serverni ulash (Google Sheets, bepul)

Server ulanmagan bo‘lsa, platforma **sinov rejimida** ishlaydi: hisoblar faqat bitta brauzerda saqlanadi. Barcha maktablardagi o‘quvchilar natijalari o‘qituvchiga borishi uchun serverni bir marta ulang:

1. [Google Sheets](https://sheets.new) da yangi jadval yarating, masalan “Allomalar merosi — natijalar”.
2. **Kengaytmalar → Apps Script** ni oching. `Code.gs` dagi bor kodni o‘chiring va `google-apps-script/Code.gs` fayl matnini to‘liq joylang. **Saqlash** tugmasini bosing.
3. **Joylashtirish → Yangi joylashtirish** ni tanlang. Turi: **Veb-ilova**.
   - “Kim nomidan ishga tushadi”: **Men**
   - “Kim kira oladi”: **Hamma**
4. **Joylashtirish** ni bosing va Google ruxsat so‘raganda o‘z hisobingiz bilan tasdiqlang.
5. Berilgan `https://script.google.com/macros/s/.../exec` manzilini nusxalab, `assets/config.js` dagi `apiUrl` ga yozing:
   ```js
   window.CONFIG = { apiUrl: "https://script.google.com/macros/s/.../exec" };
   ```
6. O‘zgarishni GitHub’ga yuklang. Sayt yangilangach, sinov rejimi haqidagi sariq ogohlantirish yo‘qoladi.

Jadvalda avtomatik ravishda to‘rtta varaq yaratiladi: `teachers`, `students`, `sessions`, `attempts`. Parollar ochiq saqlanmaydi, faqat ularning tuzli SHA-256 xeshi yoziladi. Jadvalni faqat siz ko‘rasiz. Undan dissertatsiya tahlili uchun foydalanish mumkin.

> Apps Script kodini o‘zgartirsangiz, **Joylashtirish → Joylashtirishlarni boshqarish → Tahrirlash → Yangi versiya** orqali qayta joylang; manzil o‘zgarmaydi.

## Internetga joylash (GitHub Pages)

1. GitHub’da repozitoriy → **Settings → Pages**.
2. **Source:** “Deploy from a branch”, **Branch:** `main`, papka `/ (root)` → **Save**.
3. Sayt `https://<foydalanuvchi>.github.io/<repozitoriy>/` manzilida ochiladi. Repozitoriy nomini **Settings → General → Repository name** orqali o‘zgartirsangiz (masalan, `allomalar-merosi`), manzil ham o‘zgaradi.

## Fayllar

```
index.html                     asosiy sahifa
assets/data.js                 asosiy kontent: sinflar, darslar, allomalar, metodlar
assets/content-extra.js        test banklari, krossvordlar, case study, o‘yinlar
assets/app.js                  sahifalar, profillar, o‘qituvchi paneli, statistika
assets/games.js                krossvord va o‘yin komponentlari
assets/core.js                 server mantig‘i (Apps Script va sinov rejimi uchun umumiy)
assets/api.js                  server bilan aloqa
assets/config.js               server manzili
assets/style.css               dizayn (kunduzgi va tungi rejim)
google-apps-script/Code.gs     Apps Script’ga joylanadigan tayyor fayl
tools/build-gs.js              core.js o‘zgarsa Code.gs ni qayta yig‘ish: node tools/build-gs.js
```

**Kontent qo‘shish.** Savollarni `assets/content-extra.js` dagi banklar **oxiriga** qo‘shing. Mavjud savollarni o‘chirmang va tartibini o‘zgartirmang. O‘quvchi javoblari savolning bankdagi tartib raqami bo‘yicha saqlanadi, tartib o‘zgarsa eski javoblar boshqa savolga bog‘lanib qoladi.
