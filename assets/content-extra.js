/* Qo‘shimcha kontent: test banklarini kengaytirish, krossvordlar, case study va o‘yinlar.
   data.js dagi asosiy ma’lumotlarga yuklanish paytida qo‘shiladi.
   Muhim: savollar banki oxiriga qo‘shib boriladi; mavjud savollar tartibini o‘zgartirmang,
   chunki o‘quvchilar javoblari savol tartib raqami bo‘yicha saqlanadi. */

(function (D) {
  "use strict";

  var extraQuiz = {
    5: [
      { q: "“Tib qonunlari” asarining muallifi kim?", a: ["Ibn Sino", "Navoiy", "Beruniy", "Avloniy"], c: 0 },
      { q: "Alisher Navoiy qaysi shaharda yashab ijod qilgan?", a: ["Hirot", "Toshkent", "Xiva", "Termiz"], c: 0 },
      { q: "Xalqimizda “Kattaga hurmat, kichikka ...” deyiladi. Nuqtalar o‘rniga nima keladi?", a: ["izzat", "buyruq", "tanbeh", "e’tiborsizlik"], c: 0 },
      { q: "Kaykovus farzandga nimani o‘rgatishni eng yaxshi meros deydi?", a: ["Adab va hunar", "Savdo", "Ov", "O‘yin"], c: 0 },
      { q: "Orasta kiyinish nimani bildiradi?", a: ["Qimmat kiyim kiyish", "Toza, tartibli va o‘rinli kiyinish", "Har kuni yangi kiyim", "Faqat sport kiyimi"], c: 1 },
      { q: "Ibn Sino ta’lim-tarbiyani necha yoshdan boshlashni tavsiya qilgan?", a: ["3", "6", "10", "15"], c: 1 },
      { q: "“Devonu lug‘otit turk”da nimalar to‘plangan?", a: ["Turkiy so‘zlar, maqol va she’rlar", "Tibbiy retseptlar", "Astronomik jadvallar", "Qonunlar"], c: 0 },
      { q: "Favqulodda vaziyatda (masalan, zilzila) birinchi navbatda nima qilish kerak?", a: ["Vahimaga tushish", "Xotirjam bo‘lib, kattalar ko‘rsatmasiga amal qilish", "Lift bilan tushish", "Video olish"], c: 1 },
      { q: "Yolg‘onning eng katta zarari nima?", a: ["Ishonchni yo‘qotish", "Vaqt yutish", "Mashhur bo‘lish", "Hech qanday zarari yo‘q"], c: 0 },
      { q: "Navoiy ota-onaga xizmat haqida nima deydi?", a: ["Qancha ko‘p bo‘lsa ham, kam deb bil", "Faqat bayramda xizmat qil", "Xizmat shart emas", "Ukangga topshir"], c: 0 },
      { q: "Sog‘lom turmush tarziga qaysi biri kiradi?", a: ["Kechasi kech yotish", "Kun tartibiga rioya qilish", "Ko‘p shirinlik yeyish", "Harakatsiz o‘tirish"], c: 1 },
      { q: "Mas’uliyatli o‘quvchi qanday bo‘ladi?", a: ["Vazifasini vaqtida bajaradi", "Boshqalarga yuklaydi", "Har doim kechikadi", "Va’dasini unutadi"], c: 0 },
      { q: "Ahmad Yassaviyning hikmatlari jamlangan asar qaysi?", a: ["Devoni hikmat", "Qobusnoma", "Hidoya", "Donishnoma"], c: 0 },
      { q: "Ibn Sino qayerda tug‘ilgan?", a: ["Afshona (Buxoro)", "Hirot", "Kat (Xorazm)", "Toshkent"], c: 0 },
      { q: "Qaysi biri yaxshi odat hisoblanadi?", a: ["Salomlashish", "Gapni bo‘lish", "Baqirish", "Masxara qilish"], c: 0 },
      { q: "Mas’uliyat va burch haqidagi nasihatlar ko‘p bo‘lgan, 44 bobli asar qaysi?", a: ["Qobusnoma", "Hayrat ul-abror", "Hindiston", "Saydana"], c: 0 }
    ],
    6: [
      { q: "Forobiy fikricha, ta’lim nima orqali amalga oshadi?", a: ["So‘z va o‘rgatish orqali", "Faqat jazo orqali", "O‘yin orqali", "Tasodifan"], c: 0 },
      { q: "Forobiy fikricha, tarbiya nima orqali amalga oshadi?", a: ["Amaliy ish va mashq orqali", "Faqat kitob o‘qish orqali", "Faqat tinglash orqali", "Hech narsa orqali"], c: 0 },
      { q: "“Qobusnoma”da nima haqida ko‘p nasihat qilinadi?", a: ["Muomala odobi va ota-ona burchi", "Yulduzlar harakati", "Dorivor o‘simliklar", "Matematika"], c: 0 },
      { q: "Muloqot madaniyatiga qaysi biri mos keladi?", a: ["Suhbatdoshni oxirigacha tinglash", "Gapini bo‘lish", "Telefonga qarab o‘tirish", "Ovozni ko‘tarish"], c: 0 },
      { q: "O‘z-o‘ziga xizmat ko‘rsatish nimani bildiradi?", a: ["O‘z ishlarini o‘zi bajarish", "Hamma ishni ota-onaga qoldirish", "Faqat o‘ynash", "Do‘stidan so‘rash"], c: 0 },
      { q: "Abdulla Avloniy xulqlarni qanday guruhlarga ajratgan?", a: ["Yaxshi va yomon xulqlar", "Shahar va qishloq xulqlari", "Yozgi va qishki xulqlar", "Katta va kichik xulqlar"], c: 0 },
      { q: "Avloniy yaxshi xulqlar qatoriga qaysi birini qo‘yadi?", a: ["Sabr", "Hasad", "G‘iybat", "Dangasalik"], c: 0 },
      { q: "Ibn Sino 18 yoshida qaysi sohada mashhur bo‘lgan?", a: ["Tabobat", "Savdo", "Harbiy ish", "Dehqonchilik"], c: 0 },
      { q: "Maqsad qo‘yishda qaysi qadam muhim?", a: ["Aniq reja tuzish", "Faqat orzu qilish", "Boshqalardan yashirish", "Darhol voz kechish"], c: 0 },
      { q: "Beruniy qaysi hududda tug‘ilgan?", a: ["Xorazm", "Farg‘ona", "Surxondaryo", "Toshkent"], c: 0 },
      { q: "O‘z faoliyatini tahlil qilish nima uchun kerak?", a: ["Xatolarni ko‘rib, yaxshilanish uchun", "Boshqalarni ayblash uchun", "Maqtanish uchun", "Kerak emas"], c: 0 },
      { q: "“Turkiy guliston yoxud axloq” qachon yozilgan?", a: ["1913-yilda", "1069-yilda", "1501-yilda", "2001-yilda"], c: 0 },
      { q: "Onlayn muloqotda qaysi biri odobga zid?", a: ["Boshqalarni haqorat qilish", "Salomlashish", "Rahmat aytish", "Aniq yozish"], c: 0 },
      { q: "Forobiy qayerda tug‘ilgan?", a: ["Forob (O‘tror)", "Buxoro", "Samarqand", "Hirot"], c: 0 },
      { q: "Mehnatsevar inson qanday bo‘ladi?", a: ["Ishini oxiriga yetkazadi", "Ishni boshlab tashlab ketadi", "Ishni boshqalarga yuklaydi", "Faqat maqtovni kutadi"], c: 0 },
      { q: "Ma’naviy-axloqiy me’yorlarga rioya qilgan o‘quvchi qanday yo‘l tutadi?", a: ["Maktab mulkini asraydi", "Partaga yozadi", "Kitobni yirtadi", "Navbatni buzadi"], c: 0 }
    ],
    7: [
      { q: "Beruniy turli manbalarni qanday o‘rgangan?", a: ["Solishtirib, xolis xulosa chiqargan", "Birinchi eshitganiga ishongan", "Faqat bitta kitob o‘qigan", "Manbalarni yashirgan"], c: 0 },
      { q: "Beruniyning Hindiston xalqlari haqidagi asari qanday nomlanadi?", a: ["Hindiston", "Qobusnoma", "Saydana", "Hidoya"], c: 0 },
      { q: "“Saydana” asari nimaga bag‘ishlangan?", a: ["Dorivor moddalar", "She’riyat", "Huquq", "Musiqa"], c: 0 },
      { q: "Navoiy xalq uchun qanday binolar qurdirgan?", a: ["Madrasa, shifoxona, ko‘priklar", "Faqat saroy", "Qal’a", "Hech narsa"], c: 0 },
      { q: "Husayn Voiz Koshifiy qaysi shaharda faoliyat yuritgan?", a: ["Hirot", "Xiva", "Qo‘qon", "Toshkent"], c: 0 },
      { q: "“Axloqi Muhsiniy” necha bobdan iborat?", a: ["40", "44", "12", "7"], c: 0 },
      { q: "Axborot madaniyatiga qaysi biri kiradi?", a: ["Manbasini tekshirib ulashish", "Har bir xabarni tarqatish", "Shaxsiy ma’lumotni ochiq yozish", "Parolni do‘stga aytish"], c: 0 },
      { q: "Dahldorlik nimani anglatadi?", a: ["Atrofdagi voqealarga befarq bo‘lmaslik", "Faqat o‘zini o‘ylash", "Hamma narsadan uzoq turish", "Boshqalarni tanqid qilish"], c: 0 },
      { q: "Ibn Sino fikricha, insonni tarbiyalash nimaning birligi?", a: ["Aqliy va jismoniy rivojlanish", "Boylik va shuhrat", "Uy va ko‘cha", "O‘yin va dam"], c: 0 },
      { q: "Jamoada ijodkorlik qachon yuqori bo‘ladi?", a: ["Har kim fikrini erkin aytganda", "Bir kishi hammaga buyurganda", "Hech kim gapirmaganda", "Tanqid ko‘p bo‘lganda"], c: 0 },
      { q: "Beruniy fikricha, ilm va odob qanday bog‘liq?", a: ["Ajralmas", "Bir-biriga zid", "Bog‘liq emas", "Faqat ilm muhim"], c: 0 },
      { q: "Shaxsiy ma’lumotlarni internetda himoya qilishning to‘g‘ri yo‘li qaysi?", a: ["Parolni hech kimga aytmaslik", "Manzilni ochiq yozish", "Notanishlarga rasm yuborish", "Hamma havolani ochish"], c: 0 },
      { q: "Navoiyning “Mahbub ul-qulub” asari qanday asar?", a: ["Axloqiy-ta’limiy asar", "Tibbiyot kitobi", "Tarix jadvali", "Lug‘at"], c: 0 },
      { q: "Bilimli bo‘lish nima uchun zarur?", a: ["To‘g‘ri qaror qabul qilish va jamiyatga foyda keltirish uchun", "Faqat baho olish uchun", "Maqtanish uchun", "Zarur emas"], c: 0 },
      { q: "Koshifiy axloqni nima orqali o‘rgatgan?", a: ["Hikoyatlar va hayotiy misollar", "Faqat qoidalar ro‘yxati", "Jadvallar", "Raqamlar"], c: 0 },
      { q: "Yon-atrofdagi muammoga (masalan, buzilgan o‘rindiq) qanday munosabat to‘g‘ri?", a: ["Kattalarga xabar berib, tuzatishga yordam berish", "E’tibor bermaslik", "Yanada buzish", "Rasmga olib kulish"], c: 0 }
    ],
    9: [
      { q: "“Qutadg‘u bilig”da aql timsoli kim?", a: ["O‘gdulmish", "Kuntug‘di", "Oyto‘ldi", "O‘zg‘urmish"], c: 0 },
      { q: "“Qutadg‘u bilig”da qanoat va oxirat timsoli kim?", a: ["O‘zg‘urmish", "Oyto‘ldi", "Kuntug‘di", "O‘gdulmish"], c: 0 },
      { q: "Oyto‘ldi qaysi tushuncha timsoli?", a: ["Davlat va baxt", "Adolat", "Aql", "Qanoat"], c: 0 },
      { q: "Yusuf Xos Hojib qaysi shaharda tug‘ilgan?", a: ["Bolasog‘un", "Buxoro", "Hirot", "Marg‘ilon"], c: 0 },
      { q: "Yetakchi (lider)ning eng muhim sifati qaysi?", a: ["Adolatli va mas’uliyatli bo‘lish", "Baqirish", "Hammadan ustun ko‘rinish", "Faqat buyurish"], c: 0 },
      { q: "Hissiyotni boshqarishning to‘g‘ri usuli qaysi?", a: ["To‘xtab, chuqur nafas olib, keyin gapirish", "Darhol javob qaytarish", "Narsalarni otish", "Yig‘lab ketish"], c: 0 },
      { q: "Halol tadbirkorlikning asosiy sharti nima?", a: ["Rostgo‘ylik va va’daga vafo", "Aldov", "Soliqdan qochish", "Raqobatchini qoralash"], c: 0 },
      { q: "Bag‘rikenglik nimani anglatadi?", a: ["Boshqa fikr va madaniyatga hurmat", "Hamma bilan bahslashish", "Faqat o‘z fikrini to‘g‘ri deyish", "Befarqlik"], c: 0 },
      { q: "Darslikka ko‘ra, ekstremistik oqimlar asosan qaysi yoshdagilarni yollashga urinadi?", a: ["17–35 yosh", "5–10 yosh", "60 yoshdan katta", "Faqat 40 yosh"], c: 0 },
      { q: "Shubhali xabarning belgisi qaysi?", a: ["Manbasi yo‘q va hissiyotga chaqiradi", "Rasmiy sayt manzili bor", "Bir necha manbada tasdiqlangan", "Muallifi ko‘rsatilgan"], c: 0 },
      { q: "Yassaviy fikricha, sabr va irodani nima tarbiyalaydi?", a: ["Zahmat va mehnat", "Dangasalik", "O‘yin", "Boylik"], c: 0 },
      { q: "Sog‘lom turmush tarzini targ‘ib qilish nima?", a: ["Boshqalarni ham sportga, to‘g‘ri ovqatlanishga undash", "Faqat o‘zi uchun qilish", "Gapirmaslik", "Zararli odatni maqtash"], c: 0 },
      { q: "Faol fuqarolik pozitsiyasi qaysi?", a: ["Mahalla va maktab ishlarida qatnashish", "Hech narsaga aralashmaslik", "Faqat tanqid qilish", "Saylov haqida bilmaslik"], c: 0 },
      { q: "Navoiy komil inson sifatlari qatoriga qaysi birini kiritmagan?", a: ["Qo‘pollik", "Kamtarlik", "Saxovat", "Sabr"], c: 0 },
      { q: "Ma’naviy immunitet qanday shakllanadi?", a: ["Bilim, tanqidiy fikr va qadriyatlar orqali", "Internetni butunlay o‘chirish orqali", "Hammaga ishonish orqali", "Hech narsa o‘qimaslik orqali"], c: 0 },
      { q: "To‘g‘ri qaror qabul qilishda nima muhim?", a: ["Oqibatlarini oldindan o‘ylash", "Ko‘pchilikka ergashish", "Shoshilish", "Tavakkal qilish"], c: 0 }
    ],
    10: [
      { q: "Burhoniddin Marg‘inoniy qachon yashagan?", a: ["1123–1197", "1441–1501", "973–1048", "1878–1934"], c: 0 },
      { q: "Marg‘inoniy qarashlarida qaysi sifatlar asosiy o‘rin egallaydi?", a: ["Vijdon, burch, odillik", "Kibr, hasad", "Isrof, dangasalik", "Befarqlik"], c: 0 },
      { q: "Ahmad Donish qaysi shaharda yashagan?", a: ["Buxoro", "Hirot", "Toshkent", "Xiva"], c: 0 },
      { q: "Ahmad Donish jamiyat taraqqiyotini nimada ko‘radi?", a: ["Ilm-fan va ma’rifatda", "Urushda", "Boylikda", "Tasodifda"], c: 0 },
      { q: "Fitrat qachon yashagan?", a: ["1886–1938", "1827–1897", "1123–1197", "1019–1085"], c: 0 },
      { q: "“Ommaviy madaniyat”ning salbiy ko‘rinishi qaysi?", a: ["Axloqsizlik va zo‘ravonlikni targ‘ib qilish", "Milliy qo‘shiqlar", "Kitob o‘qish", "Sport musobaqasi"], c: 0 },
      { q: "Ma’naviy tahdidni anglash nimadan boshlanadi?", a: ["Axborotni tanqidiy baholashdan", "Hamma narsaga ishonishdan", "Befarqlikdan", "Faqat taqiqlashdan"], c: 0 },
      { q: "Fuqaroning burchi qaysi?", a: ["Qonunlarga rioya qilish", "Qonunni buzish", "Soliqdan qochish", "Tabiatni ifloslash"], c: 0 },
      { q: "Zamonaviy kasblarga qaysi biri kiradi?", a: ["Dasturchi", "Tuyakash", "Mirob", "Qorovul-karvonsaroy"], c: 0 },
      { q: "Volontyorlik nima?", a: ["Jamiyat uchun beg‘araz yordam", "Pullik xizmat", "Majburiy mehnat", "Dam olish"], c: 0 },
      { q: "Darslikka ko‘ra, yoshlar dunyoqarashida milliy qadriyatlarga tayanmasa nima bo‘ladi?", a: ["Begona qadriyatlar joy oladi", "Hech narsa o‘zgarmaydi", "Bilim oshadi", "Hamma rozi bo‘ladi"], c: 0 },
      { q: "O‘zini-o‘zi nazorat qilish nimani anglatadi?", a: ["Xatti-harakatini o‘zi baholab, tuzatish", "Boshqalarni nazorat qilish", "Hech narsa qilmaslik", "Faqat ota-onaga tayanish"], c: 0 },
      { q: "Kaykovus “Qobusnoma”ni kimga atab yozgan?", a: ["O‘g‘li Gilonshohga", "Podshohga", "Shogirdlariga", "Xalqqa"], c: 0 },
      { q: "Huquq va burch o‘rtasidagi bog‘liqlik qanday?", a: ["Har bir huquq mas’uliyat bilan birga keladi", "Bog‘liq emas", "Faqat huquq muhim", "Faqat burch muhim"], c: 0 },
      { q: "Ma’naviy kamolotga intilish qaysi?", a: ["Muntazam kitob o‘qish va o‘z ustida ishlash", "Faqat o‘yin o‘ynash", "Vaqtni behuda o‘tkazish", "Hech narsa o‘rganmaslik"], c: 0 },
      { q: "Daxldorlikni his etgan yosh qanday yo‘l tutadi?", a: ["Muammoni ko‘rsa, yechimga hissa qo‘shadi", "Faqat shikoyat qiladi", "Ko‘rmaganga oladi", "Boshqalarni ayblaydi"], c: 0 }
    ],
    11: [
      { q: "Fitratning “Oila” asari qachon yozilgan?", a: ["1916-yilda", "1913-yilda", "1069-yilda", "1991-yilda"], c: 0 },
      { q: "“Avesto”da oila haqida qanday fikr bor?", a: ["Oila muqaddas dargoh, er va xotin teng mas’ul", "Oila muhim emas", "Faqat ota mas’ul", "Farzand tarbiyasi shart emas"], c: 0 },
      { q: "Ibn Sino fikricha, oila boshlig‘i tajribasiz bo‘lsa nima bo‘ladi?", a: ["Oila a’zolariga yaxshi tarbiya bera olmaydi", "Hech narsa o‘zgarmaydi", "Oila boyiydi", "Farzandlar mustaqil bo‘ladi"], c: 0 },
      { q: "Kasb tanlashda nima hisobga olinishi kerak?", a: ["Qiziqish, qobiliyat va jamiyat ehtiyoji", "Faqat do‘stlar tanlovi", "Faqat maosh", "Tasodif"], c: 0 },
      { q: "B1 darajadagi bitiruvchi qanday sifatga ega bo‘ladi?", a: ["Muammolarni tinch yo‘l bilan hal etishga harakat qiladi", "Nizolardan zavqlanadi", "Faqat boshqalarga tayanadi", "Huquqlarini bilmaydi"], c: 0 },
      { q: "Avloniy vatanni sevishni qaysi xulqlar qatoriga qo‘yadi?", a: ["Yaxshi xulqlar", "Yomon xulqlar", "Ahamiyatsiz xulqlar", "Hech qaysi"], c: 0 },
      { q: "Forobiy fikricha, baxt-saodatga qanday erishiladi?", a: ["Ezgu fazilatlar va bilim orqali", "Boylik orqali", "Kuch orqali", "Tasodif orqali"], c: 0 },
      { q: "Oilaviy qadriyatlarga qaysi biri kiradi?", a: ["Ota-onani hurmat qilish", "Kattalarga qo‘pollik", "Uy ishlaridan qochish", "Qarindoshlarni unutish"], c: 0 },
      { q: "Nizoli vaziyatda o‘zini idora qilish qaysi?", a: ["Xotirjam tinglab, murosaga kelish", "Ovozni ko‘tarish", "Tahdid qilish", "Ketib qolish va gina saqlash"], c: 0 },
      { q: "Fuqarolik savodxonligiga qaysi biri kiradi?", a: ["Konstitutsiyaviy huquq va burchlarni bilish", "Qonunlarni bilmaslik", "Saylovda qatnashmaslik", "Faqat mish-mishlarga ishonish"], c: 0 },
      { q: "Ibn Sino oila boshqaruvi va tarbiyasiga oid qaysi risolani yozgan?", a: ["Tadbir al-manozil", "Hindiston", "Hidoya", "Qobusnoma"], c: 0 },
      { q: "Beruniy fikricha, insonga qanday baho beriladi?", a: ["O‘z ishini mohirona bajarishiga qarab", "Kiyimiga qarab", "Boyligiga qarab", "Nasl-nasabiga qarab"], c: 0 },
      { q: "Xalq maqoli: “Qush uyasida ko‘rganini qiladi.” Bu nima haqida?", a: ["Oila tarbiyasining ta’siri", "Qushlarni boqish", "Uy qurish", "Sayohat"], c: 0 },
      { q: "Muvaffaqiyatli ijtimoiy hayotga tayyorlik qaysi?", a: ["Mustaqil qaror qabul qilish va mas’uliyatni olish", "Hamma ishni boshqalarga qoldirish", "Qiyinchilikdan qochish", "Reja tuzmaslik"], c: 0 },
      { q: "Liderlik qobiliyatini namoyon qilish qaysi?", a: ["Jamoani umumiy maqsadga birlashtirish", "Hammaga buyruq berish", "Faqat o‘z manfaatini o‘ylash", "Mas’uliyatdan qochish"], c: 0 },
      { q: "Fitrat fikricha, xalqning izzat-hurmat topishi nimaga bog‘liq?", a: ["Bolalikdan olingan tarbiyaga", "Iqlimga", "Tasodifga", "Qo‘shni davlatlarga"], c: 0 }
    ]
  };

  var extraLesson = {
    d1: [
      { q: "Qaysi alloma eng keyin yashagan?", a: ["Abdulla Avloniy", "Forobiy", "Ibn Sino", "Navoiy"], c: 0 },
      { q: "Abdulla Avloniy qaysi harakat vakili?", a: ["Jadidchilik", "Tasavvuf", "Hech qaysi", "Saroy shoirlari"], c: 0 },
      { q: "“Nasihatnoma”, “Odobnoma” kabi asarlar tarbiya fani uchun nima vazifasini bajaradi?", a: ["Metodologik asos", "Ko‘ngilochar kitob", "Tarix jadvali", "Lug‘at"], c: 0 },
      { q: "Allomalar merosi nima uchun bugun ham dolzarb?", a: ["Undagi axloqiy g‘oyalar umuminsoniy", "Faqat tarixiy qiziqish uchun", "Dolzarb emas", "Faqat imtihon uchun"], c: 0 },
      { q: "Avloniyning “Turkiy guliston yoxud axloq” asari qayerda darslik sifatida o‘qitilgan?", a: ["Yangi usul maktablarida", "Universitetlarda", "Harbiy maktablarda", "O‘qitilmagan"], c: 0 }
    ],
    d2: [
      { q: "Forobiyning faxriy unvoni qaysi?", a: ["Ikkinchi muallim", "Shayx ur-rais", "Sulton ul-ulamo", "Burhon ul-millat"], c: 0 },
      { q: "Forobiy fikricha, inson qanday mavjudot?", a: ["Ijtimoiy", "Yolg‘iz", "O‘zgarmas", "Faqat biologik"], c: 0 },
      { q: "Fozil jamoa a’zosi qanday bo‘ladi?", a: ["Hamkorlikka tayyor va adolatli", "Faqat o‘zini o‘ylaydi", "Qoidalarni buzadi", "Befarq"], c: 0 },
      { q: "Forobiy fikricha, komil bo‘lish uchun nima yuksak darajada rivojlangan bo‘lishi kerak?", a: ["Tafakkur", "Jismoniy kuch", "Boylik", "Shon-shuhrat"], c: 0 },
      { q: "Forobiyning baxt haqidagi risolasi qaysi?", a: ["Baxt-saodatga erishish haqida", "Mahbub ul-qulub", "Qobusnoma", "Hidoya"], c: 0 }
    ],
    d3: [
      { q: "Beruniy fikricha, ongli insonning belgisi qaysi?", a: ["Kelajakni ko‘ra olib, ehtiyot choralarini ko‘rish", "Faqat bugun bilan yashash", "Boshqalarga ergashish", "Shoshilish"], c: 0 },
      { q: "Beruniy qaysi yillarda yashagan?", a: ["973–1048", "873–950", "1441–1501", "1123–1197"], c: 0 },
      { q: "Do‘stlaring darsdan qochishga undasa, to‘g‘ri yo‘l qaysi?", a: ["Oqibatini tushuntirib, rad etish", "Ergashish", "Ota-onadan yashirish", "Boshqalarni ham chaqirish"], c: 0 },
      { q: "“4 qadam” algoritmining oxirgi qadami qaysi?", a: ["Tanla", "To‘xta", "O‘yla", "Kut"], c: 0 },
      { q: "Beruniy fikricha, inson qimmatining asosiy mezoni nima?", a: ["Mehnat va ish", "Kiyim", "Nasl-nasab", "Boylik"], c: 0 }
    ],
    d4: [
      { q: "Ibn Sino qaysi yillarda yashagan?", a: ["980–1037", "973–1048", "873–950", "1441–1501"], c: 0 },
      { q: "Ibn Sinoning qomusiy asari qaysi?", a: ["Donishnoma", "Hindiston", "Qobusnoma", "Hidoya"], c: 0 },
      { q: "Ibn Sinoning faxriy unvoni qaysi?", a: ["Shayx ur-rais", "Ikkinchi muallim", "Hazrati Turkiston", "Burhon ul-millat"], c: 0 },
      { q: "Uxlashdan oldin ekran vaqtini cheklash nima uchun foydali?", a: ["Uyqu sifati yaxshilanadi", "Foydasi yo‘q", "Ko‘z kuchayadi", "Vaqt tejaladi"], c: 0 },
      { q: "Ibn Sino fikricha, axloqiy tarbiya nima bilan uzviy bog‘liq?", a: ["O‘z-o‘zini tarbiyalash", "Jazo", "Boylik", "Tasodif"], c: 0 }
    ],
    d5: [
      { q: "Kuntug‘di qaysi tushuncha timsoli?", a: ["Adolat", "Aql", "Davlat", "Qanoat"], c: 0 },
      { q: "Oyto‘ldi qaysi tushuncha timsoli?", a: ["Davlat va baxt", "Adolat", "Aql", "Qanoat"], c: 0 },
      { q: "O‘zg‘urmish qaysi tushuncha timsoli?", a: ["Qanoat va oxirat", "Adolat", "Aql", "Davlat"], c: 0 },
      { q: "Yusuf Xos Hojib qaysi asrda yashagan?", a: ["XI asr", "IX asr", "XV asr", "XX asr"], c: 0 },
      { q: "Yusuf Xos Hojib fikricha, rahbar qanday bo‘lishi kerak?", a: ["Bilimli va adolatli", "Qattiqqo‘l va qo‘pol", "Faqat boy", "Befarq"], c: 0 }
    ],
    d6: [
      { q: "Kaykovus “Qobusnoma”ni kimga atab yozgan?", a: ["O‘g‘li Gilonshohga", "Podshohga", "Shogirdlariga", "Xalqqa"], c: 0 },
      { q: "“Qobusnoma” qachon yozilgan?", a: ["1082–1083-yillarda", "1913-yilda", "1069-yilda", "1501-yilda"], c: 0 },
      { q: "Faol tinglash nimani anglatadi?", a: ["Suhbatdoshni diqqat bilan tinglab, savol berish", "Telefonga qarab o‘tirish", "Gapini bo‘lish", "Mavzuni o‘zgartirish"], c: 0 },
      { q: "Onlayn chatda tortishuv boshlansa, qaysi yo‘l to‘g‘ri?", a: ["Xotirjam yozish yoki suhbatni to‘xtatish", "Haqorat qilish", "Skrinshotni tarqatish", "Guruhga hammani chaqirish"], c: 0 },
      { q: "“Qobusnoma” necha bobdan iborat?", a: ["44", "40", "12", "100"], c: 0 }
    ],
    d7: [
      { q: "Ahmad Yassaviy qachon vafot etgan?", a: ["1166-yilda", "1501-yilda", "1048-yilda", "1934-yilda"], c: 0 },
      { q: "Yassaviy rostgo‘ylik bilan birga nimani targ‘ib qiladi?", a: ["O‘z-o‘ziga talabchanlik", "Ayyorlik", "Dangasalik", "Kibr"], c: 0 },
      { q: "Nazorat ishida ko‘chirishning oqibati qaysi?", a: ["Bilim shakllanmaydi, ishonch yo‘qoladi", "Bilim oshadi", "Hech narsa bo‘lmaydi", "Hurmat ortadi"], c: 0 },
      { q: "Do‘st xatosini yashirishni so‘rasa, to‘g‘ri yo‘l qaysi?", a: ["Xatosini tan olib, tuzatishga undash", "Yolg‘on gapirish", "Uni masxara qilish", "Hammaga aytib yurish"], c: 0 },
      { q: "Yassaviy hikmatlari o‘quvchini nimadan saqlaydi?", a: ["Fitna va fisqu fasoddan", "Ilmdan", "Mehnatdan", "Do‘stlikdan"], c: 0 }
    ],
    d8: [
      { q: "Marg‘inoniy qaysi yillarda yashagan?", a: ["1123–1197", "980–1037", "1441–1501", "1886–1938"], c: 0 },
      { q: "Vijdon nima?", a: ["Insonning o‘z xatti-harakatini ichki baholash tuyg‘usi", "Qonun moddasi", "Kiyim turi", "Maktab fani"], c: 0 },
      { q: "O‘quvchining burchi qaysi?", a: ["Maktab mulkini asrash", "Darsga kechikish", "Boshqalarni kamsitish", "Qoidalarni buzish"], c: 0 },
      { q: "O‘quvchining huquqi qaysi?", a: ["Bilim olish", "Boshqani urish", "Mulkni buzish", "Darsni buzish"], c: 0 },
      { q: "Marg‘inoniy qarashlarida qaysi sifat bor?", a: ["Mustaqil fikr", "Hasad", "Xiyonat", "Isrof"], c: 0 }
    ],
    d9: [
      { q: "Navoiy qaysi yillarda yashagan?", a: ["1441–1501", "1123–1197", "980–1037", "1878–1934"], c: 0 },
      { q: "“Nasoyim ul-muhabbat”da qaysi sifat komil inson belgisi sifatida keltirilgan?", a: ["Shirinsuxanlik", "Qo‘pollik", "Isrofgarchilik", "Kibr"], c: 0 },
      { q: "Navoiy fikricha, yaxshi farzand nima?", a: ["Oilaning davlati va baxti", "Oila yuki", "Ahamiyatsiz", "Faqat yordamchi"], c: 0 },
      { q: "“Hayrat ul-abror” qaysi asar tarkibiga kiradi?", a: ["Xamsa", "Qutadg‘u bilig", "Devonu lug‘otit turk", "Qobusnoma"], c: 0 },
      { q: "Saxovat nimani anglatadi?", a: ["Beg‘araz yordam berish, qo‘li ochiqlik", "Ziqnalik", "Isrof", "Hasad"], c: 0 }
    ],
    d10: [
      { q: "Mafkuraviy immunitetni oshirish uchun nima qilish kerak?", a: ["Bilim va tanqidiy fikrni rivojlantirish", "Hamma xabarga ishonish", "Faqat ko‘ngilochar kontent ko‘rish", "Notanishlar bilan sir bo‘lishish"], c: 0 },
      { q: "Maktab hovlisida chiqindi ko‘rdingiz. To‘g‘ri yo‘l qaysi?", a: ["Yig‘ib, axlat qutisiga tashlash", "O‘tib ketish", "Boshqaga ko‘rsatish", "Rasmga olib kulish"], c: 0 },
      { q: "“Mening allomam” loyihasining maqsadi nima?", a: ["Alloma g‘oyasini bugungi muammoga tatbiq etish", "Faqat rasm chizish", "Tarjimai holni ko‘chirish", "Bahoga erishish"], c: 0 },
      { q: "Ijtimoiy tarmoqda notanish odam shaxsiy ma’lumot so‘rasa nima qilish kerak?", a: ["Bermaslik va kattalarga aytish", "Darhol yuborish", "Do‘stlarini ham qo‘shish", "Parolini aytish"], c: 0 },
      { q: "Ekologik madaniyatga qaysi biri kiradi?", a: ["Suv va elektrni tejash", "Daraxtlarni sindirish", "Chiqindini ko‘chaga tashlash", "Plastikni yoqish"], c: 0 }
    ]
  };

  var extraDiagnostic = [
    { q: "Ibn Sinoning oila boshqaruvi va tarbiyasiga bag‘ishlangan risolasi qaysi?", a: ["Hindiston", "Tadbir al-manozil", "Saydana", "Hidoya"], c: 1 },
    { q: "“Qutadg‘u bilig”da aql timsoli kim?", a: ["Kuntug‘di", "Oyto‘ldi", "O‘gdulmish", "O‘zg‘urmish"], c: 2 },
    { q: "Sinfingizga boshqa millatga mansub yangi o‘quvchi keldi. Qaysi yo‘l bag‘rikenglikka mos?", a: ["Uni chetlab o‘tish", "Do‘stona qabul qilib, tanishtirish", "Ustidan kulish", "Faqat o‘qituvchiga qoldirish"], c: 1 },
    { q: "Ertaga nazorat ishi, kechqurun telefonda o‘yin o‘ynamoqchisiz. Ibn Sino tamoyillariga mos qaror qaysi?", a: ["Tun bo‘yi o‘ynash", "Tayyorlanib, vaqtida uxlash", "Darsga bormaslik", "Ertalab o‘ynash"], c: 1 },
    { q: "Maktab hovlisida chiqindi sochilib yotibdi. Ekomadaniyatli o‘quvchi nima qiladi?", a: ["O‘tib ketadi", "Yig‘ib, boshqalarni ham undaydi", "Rasmga olib kuladi", "Faqat shikoyat qiladi"], c: 1 }
  ];

  Object.keys(extraQuiz).forEach(function (g) {
    D.grades[g].quiz = D.grades[g].quiz.concat(extraQuiz[g]);
  });
  D.grade8.lessons.forEach(function (l) {
    if (extraLesson[l.id]) l.quiz = l.quiz.concat(extraLesson[l.id]);
  });
  D.diagnostic.test = D.diagnostic.test.concat(extraDiagnostic);

  /* Har bir testdan o‘quvchiga nechta savol chiqadi (bankdan tasodifiy tanlanadi) */
  D.draw = { grade: 10, lesson: 5 };

  /* ---------- Krossvordlar (so‘zlarda faqat lotin harflari, tutuq belgisisiz) ---------- */
  D.crosswords = {
    5: { title: "Odob va allomalar", words: [
      { w: "ODOB", clue: "Kattaga hurmat, kichikka izzat — bu ..." },
      { w: "NAVOIY", clue: "“Mahbub ul-qulub” muallifi" },
      { w: "AFSHONA", clue: "Ibn Sino tug‘ilgan qishloq" },
      { w: "QOBUSNOMA", clue: "Kaykovusning 44 bobli asari" },
      { w: "SABR", clue: "Avloniy “buyuk bir fazilat” degan xulq" },
      { w: "MAQOL", clue: "Xalq hikmatining qisqa shakli" },
      { w: "HIROT", clue: "Navoiy yashagan shahar" },
      { w: "BURCH", clue: "Bajarilishi shart bo‘lgan vazifa" }
    ] },
    6: { title: "Xulq va mehnat", words: [
      { w: "FOROBIY", clue: "“Ikkinchi muallim”" },
      { w: "MEHNAT", clue: "Beruniy fikricha, inson qimmatining mezoni" },
      { w: "AVLONIY", clue: "“Turkiy guliston yoxud axloq” muallifi" },
      { w: "MASHQ", clue: "Forobiy fikricha, xislat shu bilan kuchayadi" },
      { w: "MAQSAD", clue: "Reja tuzishdan oldin qo‘yiladi" },
      { w: "KAYKOVUS", clue: "“Qobusnoma” muallifi" },
      { w: "XULQ", clue: "Avloniy yaxshi va yomonga ajratgan tushuncha" },
      { w: "TABIB", clue: "Ibn Sino yoshligidanoq bo‘lib yetishgan kasb" }
    ] },
    7: { title: "Ilm va axborot", words: [
      { w: "BERUNIY", clue: "“Hindiston” asari muallifi" },
      { w: "SAYDANA", clue: "Beruniyning dorivor moddalar haqidagi asari" },
      { w: "KOSHIFIY", clue: "“Axloqi Muhsiniy” muallifi" },
      { w: "MANBA", clue: "Xabar olingan joy; uni tekshirish kerak" },
      { w: "ILM", clue: "Beruniy fikricha, odobdan ajralmas narsa" },
      { w: "MADRASA", clue: "Navoiy qurdirgan o‘quv dargohi" },
      { w: "XORAZM", clue: "Beruniyning vatani" },
      { w: "JAMOA", clue: "Forobiy fikricha, inson shunda kamol topadi" }
    ] },
    8: { title: "Allomalar merosi", words: [
      { w: "KUNTUGDI", clue: "“Qutadg‘u bilig”da adolat timsoli" },
      { w: "HIDOYA", clue: "Marg‘inoniyning huquqqa oid asari" },
      { w: "YASSAVIY", clue: "“Devoni hikmat” muallifi" },
      { w: "VIJDON", clue: "Ichki axloqiy hakam" },
      { w: "FOZIL", clue: "Forobiy orzu qilgan shahar aholisi qanday edi?" },
      { w: "ADOLAT", clue: "Kuntug‘di timsoli ifodalagan fazilat" },
      { w: "IBNSINO", clue: "“Tib qonunlari” muallifi (qo‘shib yoziladi)" },
      { w: "SAXOVAT", clue: "Qo‘li ochiqlik, beg‘araz yordam" },
      { w: "IMMUNITET", clue: "Yot g‘oyalarga qarshi ma’naviy ..." },
      { w: "MUHIT", clue: "Beruniy fikricha, tarbiya bilan birga insonni shakllantiradi" }
    ] },
    9: { title: "Yetakchilik va bag‘rikenglik", words: [
      { w: "BOLASOGUN", clue: "Yusuf Xos Hojib tug‘ilgan shahar" },
      { w: "OYTOLDI", clue: "“Qutadg‘u bilig”da davlat va baxt timsoli" },
      { w: "LIDER", clue: "Jamoani maqsad sari yetaklovchi" },
      { w: "HALOL", clue: "Navoiy ulug‘lagan rizq qanday bo‘ladi?" },
      { w: "IRODA", clue: "Zahmat va sabr tarbiyalaydigan sifat" },
      { w: "AXBOROT", clue: "Uning xavfsizligi 9-sinf talablaridan biri" },
      { w: "SABR", clue: "G‘azabni yengish uchun kerak bo‘lgan fazilat" },
      { w: "ADOLAT", clue: "Yetakchining eng muhim sifati" }
    ] },
    10: { title: "Huquq va ma’rifat", words: [
      { w: "MARGINONIY", clue: "“Al-Hidoya” muallifi" },
      { w: "DONISH", clue: "“Navodir ul-vaqoe” muallifi Ahmad ..." },
      { w: "FITRAT", clue: "Jadid adibi, “Oila” asari muallifi" },
      { w: "HUNAR", clue: "Kaykovus fikricha, farzandga beriladigan meros" },
      { w: "VOLONTYOR", clue: "Beg‘araz yordam beruvchi" },
      { w: "HUQUQ", clue: "Burch bilan birga keladigan narsa" },
      { w: "BUXORO", clue: "Ahmad Donish va Fitrat vatani" },
      { w: "KASB", clue: "10-sinfda tanlash haqida o‘ylanadigan narsa" }
    ] },
    11: { title: "Oila va fuqarolik", words: [
      { w: "OILA", clue: "Fitrat asari nomidagi birinchi so‘z" },
      { w: "AVESTO", clue: "Oila muqaddas dargoh deb yozilgan qadimiy kitob" },
      { w: "VATAN", clue: "Avloniy sevishni yaxshi xulq degan narsa" },
      { w: "FUQARO", clue: "Huquq va burchga ega davlat a’zosi" },
      { w: "SAODAT", clue: "Forobiy risolasi: “Baxt-... erishish haqida”" },
      { w: "MUROSA", clue: "Nizoni tinch hal qilish yo‘li" },
      { w: "KONSTITUTSIYA", clue: "Davlatning asosiy qonuni" },
      { w: "TARBIYA", clue: "Avloniy “hayot-mamot masalasi” degan narsa" }
    ] }
  };

  /* ---------- Case study (vaziyatli masalalar) ---------- */
  D.cases = {
    5: [
      { id: "k5a", title: "Buzilgan vaza", scholar: "yassaviy",
        situation: "Anvar uyda to‘p o‘ynab, onasining sevimli vazasini sindirib qo‘ydi. Ukasi buni ko‘rmadi, onasi esa ishdan qaytmoqda.",
        question: "Anvar nima qilishi kerak?",
        options: [
          { t: "Vazani yashirib, hech narsa demaslik", fb: "Yashirish yolg‘onga olib keladi. Yassaviy gunohni yashirishni xiyonat deydi." },
          { t: "Ukasini ayblash", fb: "Boshqani ayblash ikki barobar adolatsizlik: yolg‘on va tuhmat." },
          { t: "Onasiga rostini aytib, kechirim so‘rash", fb: "To‘g‘ri. Rostgo‘ylik ishonchni saqlaydi, xatoni tan olish esa mardlikdir.", best: true }
        ],
        reflect: "Siz ham shunday vaziyatga tushganmisiz? Qanday yo‘l tutgansiz?" },
      { id: "k5b", title: "Avtobusdagi joy", scholar: "koshgariy",
        situation: "Malika avtobusda o‘tiribdi. Bekatda qo‘lida og‘ir sumkasi bor keksa ayol chiqdi. Bo‘sh joy yo‘q.",
        question: "Malika qanday yo‘l tutadi?",
        options: [
          { t: "Joyini bo‘shatib, keksa ayolga taklif qiladi", fb: "To‘g‘ri. “Kattaga hurmat, kichikka izzat” — xalqimizning azaliy odobi.", best: true },
          { t: "Telefonga qarab, ko‘rmaganga oladi", fb: "Befarqlik odob qoidalariga zid." },
          { t: "Boshqa birov joy berishini kutadi", fb: "Yaxshilik qilish uchun boshqalarni kutish shart emas." }
        ],
        reflect: "Kattalarga hurmat ko‘rsatgan bir voqeangizni yozing." }
    ],
    6: [
      { id: "k6a", title: "Guruh loyihasi", scholar: "beruniy",
        situation: "Guruh loyihasida Jasur hech narsa qilmadi, lekin taqdimotda “biz qildik” deb gapirmoqchi.",
        question: "Guruh a’zolari qanday yo‘l tutishi kerak?",
        options: [
          { t: "Uni guruhdan haydab chiqarish", fb: "Keskin chora muammoni hal qilmaydi va nizo keltiradi." },
          { t: "Jasur bilan gaplashib, unga aniq vazifa berish", fb: "To‘g‘ri. Beruniy insonni mehnatiga qarab baholaydi: Jasurga ham hissa qo‘shish imkonini berish kerak.", best: true },
          { t: "Hech narsa demaslik", fb: "Jim turish adolatsizlikni davom ettiradi." }
        ],
        reflect: "Jamoada ishlaganda o‘zingiz qanday hissa qo‘shasiz?" },
      { id: "k6b", title: "Guruh chatidagi so‘z", scholar: "kaykovus",
        situation: "Sinf chatida kimdir Nodiraning rasmini kulgili izoh bilan joyladi. Hamma kulgu smayliklarini qo‘ymoqda.",
        question: "Siz nima qilasiz?",
        options: [
          { t: "Siz ham smaylik qo‘yasiz", fb: "Bu masxaraga qo‘shilish demakdir. “Qobusnoma” haqorat va qo‘pollikdan saqlanishni o‘rgatadi." },
          { t: "Muallifdan rasmni o‘chirishni so‘rab, Nodirani qo‘llaysiz", fb: "To‘g‘ri. Muomala odobi onlayn muhitda ham amal qiladi.", best: true },
          { t: "Chatdan chiqib ketasiz", fb: "O‘zingizni chetga olasiz, lekin Nodira yolg‘iz qoladi." }
        ],
        reflect: "Onlayn muloqotda o‘zingiz uchun qaysi uchta qoidani belgilaysiz?" }
    ],
    7: [
      { id: "k7a", title: "Shov-shuvli xabar", scholar: "beruniy",
        situation: "Telegram kanalda “Ertadan maktablar bir oyga yopiladi!” degan xabar chiqdi. Manba ko‘rsatilmagan.",
        question: "Beruniy uslubida qanday ish tutasiz?",
        options: [
          { t: "Darhol barcha guruhlarga yuborasiz", fb: "Tekshirilmagan xabarni tarqatish yolg‘on tarqalishiga sabab bo‘ladi." },
          { t: "Rasmiy saytlar va o‘qituvchidan tekshirasiz", fb: "To‘g‘ri. Beruniy manbalarni solishtirib, xolis xulosa chiqargan.", best: true },
          { t: "Xabarga ishonib, darsga tayyorlanmaysiz", fb: "Tekshirilmagan ma’lumot asosida qaror qabul qilish xavfli." }
        ],
        reflect: "Yolg‘on chiqqan biror xabarga duch kelganmisiz? Uni qanday aniqladingiz?" },
      { id: "k7b", title: "Mahalladagi bog‘", scholar: "navoiy",
        situation: "Mahallangizdagi bolalar maydonchasi chiqindi bilan to‘lib qolgan. Hamma “bu bizning ishimiz emas” demoqda.",
        question: "Qaysi yo‘l dahldorlikka mos?",
        options: [
          { t: "Do‘stlar bilan shanbalik tashkil qilib, mahalla raisiga murojaat qilish", fb: "To‘g‘ri. Navoiy xalq uchun madrasa, shifoxona, ko‘priklar qurdirgan: jamiyat ishi har birimizning ishimiz.", best: true },
          { t: "Boshqa maydonchaga borish", fb: "Muammo hal bo‘lmaydi, boshqalar ham aziyat chekadi." },
          { t: "Ijtimoiy tarmoqda faqat shikoyat yozish", fb: "Shikoyat foydali bo‘lishi mumkin, lekin amaliy harakatsiz yetarli emas." }
        ],
        reflect: "Maktabingiz yoki mahallangiz uchun qanday foydali ish qila olasiz?" }
    ],
    8: [
      { id: "k8a", title: "Ko‘chirib berish iltimosi", scholar: "yassaviy",
        situation: "Eng yaqin do‘stingiz nazorat ishida javoblarini ko‘chirib berishingizni so‘radi. Rad etsangiz, xafa bo‘lishi mumkin.",
        question: "Qaysi yo‘l rostgo‘ylik va do‘stlikni uyg‘unlashtiradi?",
        options: [
          { t: "Ko‘chirtirib qo‘yish", fb: "Do‘stingiz bilim olmaydi, ikkingiz ham halollikni buzasiz." },
          { t: "Rad etib, darsdan keyin mavzuni birga takrorlashni taklif qilish", fb: "To‘g‘ri. Yassaviy rostgo‘ylik va o‘z-o‘ziga talabchanlikni ulug‘laydi; haqiqiy do‘st yordamni to‘g‘ri yo‘l bilan beradi.", best: true },
          { t: "O‘qituvchiga darhol shikoyat qilish", fb: "Avval do‘stingiz bilan gaplashish muhimroq." }
        ],
        reflect: "Haqiqiy do‘stlik va halollik o‘rtasida tanlov qilganmisiz?" },
      { id: "k8b", title: "Adolatsiz baho", scholar: "yusuf",
        situation: "Sinf sardori sifatida jurnalni to‘ldirishda do‘stingizga baho qo‘shib qo‘yish imkoni bor. U sizdan buni so‘radi.",
        question: "Kuntug‘di (adolat) nimani maslahat bergan bo‘lardi?",
        options: [
          { t: "Do‘st uchun bir marta qo‘shib qo‘yish", fb: "Adolat do‘st va begonaga bir xil bo‘lishi kerak." },
          { t: "Rad etib, unga bahosini oshirish yo‘lini ko‘rsatish", fb: "To‘g‘ri. “Qutadg‘u bilig”da adolat hukmdorning asosiy fazilati; yetakchi adolatni saqlaydi.", best: true },
          { t: "Sardorlikdan voz kechish", fb: "Mas’uliyatdan qochish muammoni hal qilmaydi." }
        ],
        reflect: "Adolatli yetakchi qanday bo‘lishi kerak? 3 ta sifatini yozing." },
      { id: "k8c", title: "Tungi o‘yin", scholar: "ibnsino",
        situation: "Sardor har kuni tunda soat 2 gacha telefonda o‘ynaydi. Darsda uxlaydi, sportdan qolib ketgan.",
        question: "Ibn Sino tamoyillariga ko‘ra Sardorga qanday maslahat berasiz?",
        options: [
          { t: "Kun tartibini tuzib, uxlashdan 1 soat oldin telefonni qo‘yish", fb: "To‘g‘ri. Ibn Sino aqliy va jismoniy salomatlik birligini ta’kidlagan.", best: true },
          { t: "Kunduzi ko‘proq uxlash", fb: "Tartibsiz uyqu salomatlikka zarar." },
          { t: "Darslarni tashlab, faqat o‘yinga berilish", fb: "Bu kelajak uchun xavfli qaror." }
        ],
        reflect: "O‘zingizning bir kunlik ideal kun tartibingizni yozing." },
      { id: "k8d", title: "Notanish taklif", scholar: "marginoniy",
        situation: "Ijtimoiy tarmoqda notanish odam “oson pul ishlash” uchun guruhga qo‘shilishni va shaxsiy ma’lumotlaringizni yuborishni taklif qildi.",
        question: "Huquqiy ong va vijdonli fuqaro qanday yo‘l tutadi?",
        options: [
          { t: "Ma’lumot yuborish", fb: "Bu firibgarlik va yot g‘oyalar tuzog‘i bo‘lishi mumkin." },
          { t: "Rad etish, bloklash va ota-onaga yoki o‘qituvchiga aytish", fb: "To‘g‘ri. Ogohlik va qonunga hurmat — ma’naviy immunitet asosi.", best: true },
          { t: "Do‘stlarni ham qo‘shish", fb: "Xavfni boshqalarga ham tarqatasiz." }
        ],
        reflect: "Internetda o‘zingizni xavfsiz tutish uchun qanday qoidalarga amal qilasiz?" }
    ],
    9: [
      { id: "k9a", title: "G‘azab lahzasi", scholar: "avloniy",
        situation: "Futbol o‘yinida raqib jamoa o‘yinchisi sizni ataylab yiqitdi va masxara qildi. Hamma sizga qarab turibdi.",
        question: "Avloniyning sabr haqidagi o‘gitiga mos javob qaysi?",
        options: [
          { t: "Musht bilan javob qaytarish", fb: "Zo‘ravonlik muammoni chuqurlashtiradi va jazoga olib keladi." },
          { t: "Chuqur nafas olib, hakamga murojaat qilish", fb: "To‘g‘ri. Sabr — “buyuk bir fazilat”; hissiyotni boshqarish 9-sinf malaka talablaridan biri.", best: true },
          { t: "O‘yinni tashlab ketish", fb: "Jamoangizni yolg‘iz qoldirasiz." }
        ],
        reflect: "G‘azabingizni boshqarishga yordam beradigan usullaringizni yozing." },
      { id: "k9b", title: "Biznes g‘oya", scholar: "navoiy",
        situation: "Siz va do‘stingiz maktab yarmarkasida pishiriq sotmoqchisiz. Do‘stingiz kechagi pishiriqlarni ham “yangi” deb sotishni taklif qildi.",
        question: "Halol rizq tamoyiliga mos qaror qaysi?",
        options: [
          { t: "Kechagi pishiriqni arzonroq, rostini aytib sotish", fb: "To‘g‘ri. Halollik — tadbirkorlik asosi; Navoiy halol rizq bilan qanoatni ulug‘lagan.", best: true },
          { t: "“Yangi” deb sotish", fb: "Aldov mijoz ishonchini yo‘qotadi." },
          { t: "Yarmarkadan voz kechish", fb: "Muammoni halol yo‘l bilan hal qilish mumkin." }
        ],
        reflect: "Halol biznes g‘oyangizni 3 jumlada yozing." }
    ],
    10: [
      { id: "k10a", title: "Kasb tanlash bosimi", scholar: "kaykovus",
        situation: "Dilnoza dasturchi bo‘lishni xohlaydi, lekin oilasi uni shifokor bo‘lishga undamoqda.",
        question: "Qaysi yo‘l eng to‘g‘ri?",
        options: [
          { t: "Oila bilan ochiq gaplashib, qiziqish va qobiliyatlarini asoslab berish", fb: "To‘g‘ri. Hurmat bilan muloqot va asosli qaror — mas’uliyatli tanlov.", best: true },
          { t: "Oiladan yashirin hujjat topshirish", fb: "Yashirinlik ishonchni buzadi." },
          { t: "Hech narsa demay, istamagan kasbni tanlash", fb: "Qiziqishsiz kasb muvaffaqiyat keltirmasligi mumkin." }
        ],
        reflect: "Siz qaysi kasbni tanlamoqchisiz va nima uchun?" },
      { id: "k10b", title: "Ommaviy madaniyat", scholar: "marginoniy",
        situation: "Mashhur blogger obunachilarini qimmat narsalar bilan maqtanishga va ota-onadan pul talab qilishga undamoqda.",
        question: "Bu kontentga qanday munosabatda bo‘lasiz?",
        options: [
          { t: "Tanqidiy baholab, unga ergashmaslik va do‘stlarga ham tushuntirish", fb: "To‘g‘ri. Ma’naviy tahdidni anglash va baholash 10-sinf talablaridan biri.", best: true },
          { t: "Blogger aytganini qilish", fb: "Iste’molchilik va isrof — begona qadriyatlar." },
          { t: "Bloggerni haqorat qilish", fb: "Haqorat ham to‘g‘ri yo‘l emas; bunday kontentni tanqidiy baholash kerak." }
        ],
        reflect: "Qaysi kontent yaratuvchilar sizga ijobiy ta’sir qiladi?" }
    ],
    11: [
      { id: "k11a", title: "Oiladagi kelishmovchilik", scholar: "fitrat",
        situation: "Uyda aka-uka o‘rtasida meros xona uchun janjal chiqdi. Ota-ona xafa.",
        question: "Katta farzand sifatida qanday yo‘l tutasiz?",
        options: [
          { t: "Oilaviy kengash taklif qilib, murosali yechim topish", fb: "To‘g‘ri. Fitrat oilani tarbiyaning birlamchi maskani deydi; tinchlik oiladan boshlanadi.", best: true },
          { t: "Kim kuchli bo‘lsa, o‘sha olsin", fb: "Kuch bilan hal qilish adolatsiz." },
          { t: "Aralashmaslik", fb: "Oila a’zosi sifatida befarqlik to‘g‘ri emas." }
        ],
        reflect: "Oilangizdagi eng qadrli an’ana qaysi?" },
      { id: "k11b", title: "Saylov kuni", scholar: "avloniy",
        situation: "18 yoshga to‘ldingiz. Do‘stlaringiz “saylovga borish befoyda” demoqda.",
        question: "Faol fuqarolik pozitsiyasiga mos qaror qaysi?",
        options: [
          { t: "Nomzodlar dasturini o‘rganib, ovoz berish", fb: "To‘g‘ri. Fuqarolik burchi va vatanga mas’uliyat — B1 daraja talabi.", best: true },
          { t: "Do‘stlarga ergashib bormaslik", fb: "Befarqlik fuqarolik jamiyatini zaiflashtiradi." },
          { t: "Kimga bo‘lsa ham tasodifiy ovoz berish", fb: "Ongsiz tanlov ham mas’uliyatsizlikdir." }
        ],
        reflect: "Yoshlar jamiyat hayotida qanday faol bo‘lishi mumkin?" }
    ]
  };

  /* ---------- O‘yinlar uchun ma’lumotlar ---------- */
  D.games = {
    pairs: [
      ["Forobiy", "Fozil odamlar shahri"], ["Beruniy", "Hindiston"], ["Ibn Sino", "Tib qonunlari"],
      ["Yusuf Xos Hojib", "Qutadg‘u bilig"], ["Kaykovus", "Qobusnoma"], ["Ahmad Yassaviy", "Devoni hikmat"],
      ["Marg‘inoniy", "Al-Hidoya"], ["Navoiy", "Mahbub ul-qulub"], ["Koshifiy", "Axloqi Muhsiniy"],
      ["Ahmad Donish", "Navodir ul-vaqoe"], ["Avloniy", "Turkiy guliston yoxud axloq"], ["Fitrat", "Oila"],
      ["Mahmud Koshg‘ariy", "Devonu lug‘otit turk"]
    ],
    timeline: [
      { name: "Abu Nasr Forobiy", year: 873 }, { name: "Abu Rayhon Beruniy", year: 973 }, { name: "Ibn Sino", year: 980 },
      { name: "Yusuf Xos Hojib", year: 1019 }, { name: "Burhoniddin Marg‘inoniy", year: 1123 }, { name: "Alisher Navoiy", year: 1441 },
      { name: "Ahmad Donish", year: 1827 }, { name: "Abdulla Avloniy", year: 1878 }, { name: "Abdurauf Fitrat", year: 1886 }
    ],
    sort: {
      good: ["Sabr", "Rostgo‘ylik", "Saxovat", "Kamtarlik", "Mehnatsevarlik", "Vafo", "Ilmga intilish", "Adolat"],
      bad: ["Hasad", "G‘iybat", "Yolg‘on", "Kibr", "Isrof", "Dangasalik", "Xiyonat", "Qo‘pollik"]
    }
  };
})(window.DATA);
