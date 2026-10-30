# Tarbiya va allomalar merosi — onlayn platforma

**Mavzu:** Tarbiya fanini O‘rta Osiyo allomalari ilmiy merosidan foydalanib o‘qitish metodikasini takomillashtirish (umumiy o‘rta ta’lim maktablarining 8-sinfi misolida).

Platforma dissertatsiya aprobatsiyasi (tajriba-sinov) uchun ishlab chiqilgan. Kontent “Tarbiya fanini o‘qitish metodikasi” darsligi (Guliston davlat universiteti) asosida tayyorlangan.

## Bo‘limlar

| Bo‘lim | Tarkibi |
|---|---|
| Sinflar (5–11) | Har bir sinf: darslikdagi malaka talablari, kompetensiya darajasi (A2 / A2+ / B1), allomalar merosiga asoslangan 5 ta mavzu, metod va topshiriq, nazorat testi |
| **8-sinf moduli** | Metodika tamoyillari, 10 ta to‘liq dars ishlanmasi (maqsadlar, 45 daqiqalik dars borishi, iqtibos, savollar, uyga vazifa, test) |
| Allomalar | 13 ta mutafakkir (12 tasi portret bilan, `assets/img/allomalar/`): yillari, asarlari, tarbiyaviy g‘oyalari, platformadagi darslarga havolalar |
| Metodlar | Darslikdagi 12 ta an’anaviy, interfaol va innovatsion usul |
| Diagnostika | 15 savollik test + 8 bandli so‘rovnoma; guruh (tajriba/nazorat) va bosqich (dastlabki/yakuniy) tanlanadi |
| Natijalar | Guruh/bosqich bo‘yicha o‘rtacha, standart chetlanish, darajalar, samaradorlik koeffitsienti η, Styudent t-mezoni va p-qiymat; CSV/JSON eksport va import |
| Tadqiqot | Tajriba-sinov bosqichlari va baholash mezonlari |

## Internetga joylash (GitHub Pages, bepul)

1. Ushbu branchni `main` ga birlashtiring (merge).
2. GitHub’da repozitoriy → **Settings → Pages**.
3. **Source:** “Deploy from a branch”, **Branch:** `main`, papka `/ (root)` → **Save**.
4. 1–2 daqiqadan so‘ng sayt `https://<foydalanuvchi>.github.io/Adabiyot/` manzilida ochiladi.

Platforma hech qanday server yoki build talab qilmaydi. Uni Netlify yoki istalgan hostingga ham papka sifatida yuklash mumkin.

## Natijalarni markaziy yig‘ish (Google Sheets)

Sozlanmasa, har bir natija o‘quvchi topshirgan qurilmada saqlanadi. Ularni “Natijalar → JSON eksport” va boshqa qurilmada “Import” orqali birlashtirish mumkin. Barcha maktablardan natijalarni avtomatik yig‘ish uchun:

1. Yangi Google Sheets jadvali yarating.
2. **Kengaytmalar → Apps Script**, `google-apps-script/Code.gs` faylidagi kodni joylang va saqlang.
3. **Joylashtirish → Yangi joylashtirish** → turi “Veb-ilova”. “Kim kira oladi” maydonida **Hamma** ni tanlang → **Joylashtirish**.
4. Berilgan `https://script.google.com/macros/s/.../exec` manzilini `assets/config.js` dagi `sheetsUrl` ga yozing.

Shundan so‘ng har bir diagnostika natijasi “Natijalar” varag‘iga yangi qator bo‘lib tushadi.

## Fayllar

```
index.html               asosiy sahifa
assets/data.js           barcha kontent (sinflar, darslar, allomalar, testlar)
assets/app.js            sahifalar, testlar, diagnostika va statistika
assets/style.css         dizayn (kunduzgi va tungi rejim)
assets/config.js         Google Sheets manzili
google-apps-script/      natijalarni jadvalga yozuvchi skript
```

Kontentni o‘zgartirish uchun faqat `assets/data.js` ni tahrirlash kifoya.
