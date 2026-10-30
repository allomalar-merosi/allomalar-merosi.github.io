# Tarbiya va allomalar merosi — onlayn platforma

**Mavzu:** Tarbiya fanini O‘rta Osiyo allomalari ilmiy merosidan foydalanib o‘qitish metodikasini takomillashtirish (umumiy o‘rta ta’lim maktablarining 8-sinfi misolida).

Platforma dissertatsiya aprobatsiyasi (tajriba-sinov) uchun ishlab chiqilgan. Kontent “Tarbiya fanini o‘qitish metodikasi” darsligi (Guliston davlat universiteti) asosida tayyorlangan.

## Bo‘limlar

| Bo‘lim | Tarkibi |
|---|---|
| Sinflar (5–11) | Har bir sinf: darslikdagi malaka talablari, kompetensiya darajasi (A2 / A2+ / B1), allomalar merosiga asoslangan 5 ta mavzu, metod va topshiriq, nazorat testi (16 savollik bankdan 10 tasi), keyslar va krossvord |
| **8-sinf moduli** | Metodika tamoyillari, 10 ta to‘liq dars ishlanmasi (maqsadlar, 45 daqiqalik dars borishi, iqtibos, savollar, uyga vazifa, 8 savollik bankdan 5 savollik test, keys), 92 savollik bankdan 20 savollik yakuniy test |
| O‘yinlar | 4 ta krossvord, 18 ta keys-stadi, “Alloma va asar”, “Hikmat kimniki?”, “Vaqt chizig‘i” o‘yinlari |
| Kabinet | O‘qituvchi va o‘quvchi profillari, o‘qituvchi kodi, o‘quvchilar natijalari va javoblari, guruhlar, CSV eksport |
| Allomalar | 13 ta mutafakkir (12 tasi portret bilan, `assets/img/allomalar/`): yillari, asarlari, tarbiyaviy g‘oyalari, platformadagi darslarga havolalar |
| Metodlar | Darslikdagi 12 ta an’anaviy, interfaol va innovatsion usul |
| Diagnostika | 30 savollik bankdan 15 savollik test + 8 bandli so‘rovnoma; guruh (tajriba/nazorat) va bosqich (dastlabki/yakuniy) tanlanadi |
| Natijalar | Guruh/bosqich bo‘yicha o‘rtacha, standart chetlanish, darajalar, samaradorlik koeffitsienti η, Styudent t-mezoni va p-qiymat; CSV/JSON eksport va import |
| Tadqiqot | Tajriba-sinov bosqichlari va baholash mezonlari |

## Internetga joylash (GitHub Pages, bepul)

1. Ushbu branchni `main` ga birlashtiring (merge).
2. GitHub’da repozitoriy → **Settings → Pages**.
3. **Source:** “Deploy from a branch”, **Branch:** `main`, papka `/ (root)` → **Save**.
4. 1–2 daqiqadan so‘ng sayt `https://<foydalanuvchi>.github.io/Adabiyot/` manzilida ochiladi.

Platforma hech qanday server yoki build talab qilmaydi. Uni Netlify yoki istalgan hostingga ham papka sifatida yuklash mumkin.

## Testlar har bir o‘quvchiga turlicha

Har bir test savollar bankidan tasodifiy tanlanadi, savollar va javob variantlari tartibi ham aralashtiriladi. O‘quvchi “Yangi variant” tugmasi bilan boshqa variant oladi. O‘qituvchi kabinetida o‘quvchiga aynan qaysi savollar chiqqani va u nimani belgilagani ko‘rinadi. Qo‘shimcha savollar, keyslar va krossvordlar `assets/bank.js` faylida.

## O‘qituvchi va o‘quvchi kabinetlari

1. O‘qituvchi saytda **Kirish → Ro‘yxatdan o‘tish → O‘qituvchi** ni tanlaydi va 6 belgili kod oladi (masalan, `K7M2QX`).
2. O‘quvchi **Ro‘yxatdan o‘tish → O‘quvchi** bo‘limida shu kodni kiritadi. Kod to‘g‘ri bo‘lsa, o‘qituvchi ismi darhol ko‘rinadi.
3. O‘quvchi profilidan bajarilgan barcha testlar, diagnostika, keyslar, krossvordlar va o‘yinlar natijasi kodni bergan o‘qituvchiga boradi.
4. O‘qituvchi kabinetida: o‘quvchilar ro‘yxati, har bir ishning bali va “Javoblar” (har bir savol, o‘quvchi javobi va to‘g‘ri javob), tajriba/nazorat guruhini belgilash, diagnostika statistikasi (η, Styudent t-mezoni) va CSV eksport.

### Serverni ulash (Supabase, bepul)

Sozlanmagan holatda kabinetlar **sinov rejimi**da ishlaydi: hammasi faqat bitta brauzerda saqlanadi, ya’ni o‘qituvchi va o‘quvchi bitta kompyuterdan kirgandagina ishlaydi. Turli qurilmalardagi o‘quvchilar natijasi o‘qituvchiga borishi uchun bir marta quyidagini bajaring:

1. [supabase.com](https://supabase.com) da bepul ro‘yxatdan o‘ting va **New project** yarating (parolni eslab qoling, mintaqa: Frankfurt yoki yaqinroq).
2. Loyiha ochilgach, chap menyuda **SQL Editor → New query**. `supabase/schema.sql` faylining butun matnini joylang va **Run** ni bosing. “Success” chiqishi kerak.
3. **Project Settings → API** (yoki **Data API / API Keys**) bo‘limidan ikki qiymatni oling: **Project URL** (`https://xxxx.supabase.co`) va ochiq kalit (**anon public** yoki **publishable** kalit). *service_role / secret* kalitni hech qachon saytga qo‘ymang.
4. `assets/config.js` faylida ularni yozing:

   ```js
   window.CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseKey: "eyJ... yoki sb_publishable_...",
     sheetsUrl: ""
   };
   ```
5. O‘zgarishni GitHub’ga saqlang (commit). 1–2 daqiqadan so‘ng sayt server bilan ishlaydi: “Sinov rejimi” ogohlantirishi yo‘qoladi.

Xavfsizlik: jadvallarga to‘g‘ridan-to‘g‘ri kirish yopiq; sayt faqat `t_*` funksiyalarini chaqiradi, ular har safar sessiya va rolni tekshiradi. O‘quvchi faqat o‘z natijalarini, o‘qituvchi faqat o‘z kodi bilan ro‘yxatdan o‘tgan o‘quvchilarni ko‘radi. Parollar shifrlangan (bcrypt) holda saqlanadi. Ball o‘quvchi brauzerida hisoblanadi, shuning uchun dasturlashni biladigan o‘quvchi uni soxtalashtirishi nazariy jihatdan mumkin. Aprobatsiya uchun bu odatda yetarli.

Bepul Supabase loyihasi bir hafta faol bo‘lmasa “pauza”ga tushadi. Uni Supabase sahifasida **Restore** tugmasi bilan qayta yoqish mumkin, ma’lumotlar saqlanib qoladi.

## Natijalarni markaziy yig‘ish (Google Sheets)

Bu bo‘lim profilsiz (kabinetga kirmasdan) topshirilgan diagnostikaga tegishli. Sozlanmasa, har bir natija o‘quvchi topshirgan qurilmada saqlanadi. Ularni “Natijalar → JSON eksport” va boshqa qurilmada “Import” orqali birlashtirish mumkin. Barcha maktablardan natijalarni avtomatik yig‘ish uchun:

1. Yangi Google Sheets jadvali yarating.
2. **Kengaytmalar → Apps Script**, `google-apps-script/Code.gs` faylidagi kodni joylang va saqlang.
3. **Joylashtirish → Yangi joylashtirish** → turi “Veb-ilova”. “Kim kira oladi” maydonida **Hamma** ni tanlang → **Joylashtirish**.
4. Berilgan `https://script.google.com/macros/s/.../exec` manzilini `assets/config.js` dagi `sheetsUrl` ga yozing.

Shundan so‘ng har bir diagnostika natijasi “Natijalar” varag‘iga yangi qator bo‘lib tushadi.

## Fayllar

```
index.html               asosiy sahifa
assets/data.js           asosiy kontent (sinflar, darslar, allomalar, testlar)
assets/bank.js           qo‘shimcha savollar banki, keyslar va krossvordlar
assets/api.js            kabinetlar uchun server (Supabase) yoki sinov rejimi
assets/app.js            sahifalar, testlar, o‘yinlar, kabinetlar va statistika
assets/style.css         dizayn (kunduzgi va tungi rejim)
assets/config.js         Supabase va Google Sheets sozlamalari
assets/img/allomalar/    allomalar portretlari
supabase/schema.sql      kabinetlar uchun ma’lumotlar bazasi
google-apps-script/      profilsiz natijalarni jadvalga yozuvchi skript
```

Kontentni o‘zgartirish uchun faqat `assets/data.js` ni tahrirlash kifoya.
