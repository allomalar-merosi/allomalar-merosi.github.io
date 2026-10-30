/* Qo‘shimcha savollar banki, keyslar va krossvordlar.
   Savol yozuvi: [savol, [to‘g‘ri javob, xato, xato, xato]]. To‘g‘ri javob har doim birinchi yoziladi;
   saytda javoblar va savollar har bir o‘quvchi uchun tasodifiy tartibda chiqadi.
   Sinf va dars testlari data.js dagi savollar bilan birlashtirilib, umumiy bankdan tanlanadi. */
window.BANK = {
  pools: {
    "sinf-5": [
      ["Mahmud Koshg‘ariy “Devonu lug‘otit turk”da qaysi tillarni to‘plagan?", ["Turkiy tillar", "Arab tili", "Fors tili", "Xitoy tili"]],
      ["“Devonu lug‘otit turk”da tarbiyaviy saboqlar asosan nima orqali beriladi?", ["Maqol va hikmatlar", "Matematik masalalar", "Xaritalar", "Tibbiy retseptlar"]],
      ["Ibn Sinoning mashhur tibbiyot asari qaysi?", ["Tib qonunlari", "Qutadg‘u bilig", "Qobusnoma", "Hayrat ul-abror"]],
      ["Ibn Sino qayerda tug‘ilgan?", ["Afshona (Buxoro)", "Hirot", "Koshg‘ar", "Gurgon"]],
      ["Kattaga salom berish, kichikka izzat ko‘rsatish qaysi tushunchaga kiradi?", ["Odob", "Sport", "Savdo", "Texnika"]],
      ["Navoiy ota-onaga xizmat haqida nima deydi?", ["Qancha ko‘p bo‘lsa ham, kam deb bil", "Faqat bayramlarda xizmat qil", "Xizmatni ukalaringga qoldir", "Xizmat shart emas"]],
      ["Xoja Ahmad Yassaviyning asari qaysi?", ["Devoni hikmat", "Al-Hidoya", "Tib qonunlari", "Navodir ul-vaqoe"]],
      ["Yassaviy targ‘ib qilgan fazilat qaysi?", ["Rostgo‘ylik va halollik", "Ayyorlik", "Maqtanchoqlik", "Dangasalik"]],
      ["Sog‘lom turmush tarziga mos odat qaysi?", ["Kun tartibiga amal qilish va badantarbiya", "Tunda kech yotish", "Faqat shirinlik yeyish", "Kun bo‘yi telefon o‘ynash"]],
      ["Mas’uliyatli o‘quvchi uy vazifasini qanday bajaradi?", ["O‘z vaqtida va mustaqil", "Do‘stidan ko‘chirib", "Umuman bajarmaydi", "Faqat baho uchun ertalab shoshib"]],
      ["“Qobusnoma” qanday mavzudagi asar?", ["Odob-axloq va hayot saboqlari", "Astronomiya", "Matematika", "Tilshunoslik"]],
      ["Rostgo‘ylikka mos xatti-harakat qaysi?", ["Xatoni tan olib, uzr so‘rash", "Aybni boshqaga ag‘darish", "Yolg‘on bahona to‘qish", "Jim turib yashirish"]]
    ],
    "sinf-6": [
      ["Abu Nasr Forobiy qayerda tug‘ilgan?", ["Forob (O‘tror)", "Buxoro", "Hirot", "Toshkent"]],
      ["Forobiy fikricha, ta’lim nima orqali amalga oshadi?", ["So‘z va o‘rgatish orqali", "Faqat jazo orqali", "Faqat o‘yin orqali", "Meros orqali"]],
      ["Avloniy xulqlarni qanday ikki guruhga ajratadi?", ["Yaxshi va yomon xulqlar", "Katta va kichik xulqlar", "Eski va yangi xulqlar", "Shahar va qishloq xulqlari"]],
      ["Avloniy yaxshi xulqlar qatoriga qaysi birini qo‘ygan?", ["Sabr", "Hasad", "Yalqovlik", "G‘iybat"]],
      ["Abdulla Avloniy qaysi harakat vakili?", ["Jadidchilik (ma’rifatparvarlik)", "Temuriylar saroy she’riyati", "Qadimgi yunon falsafasi", "Tasavvuf tariqati"]],
      ["Beruniyning dorivor o‘simliklar haqidagi asari qaysi?", ["Saydana", "Hindiston", "Mas’ud qonuni", "Devoni hikmat"]],
      ["Muomala odobiga mos xatti-harakat qaysi?", ["Suhbatdoshni oxirigacha tinglash", "Gapini bo‘lish", "Ovozni ko‘tarish", "Telefonga qarab o‘tirish"]],
      ["Mehnatsevarlik belgisi qaysi?", ["Boshlangan ishni oxiriga yetkazish", "Ishni boshqaga yuklash", "Ishni boshlab tashlab qo‘yish", "Faqat maqtov uchun ishlash"]],
      ["Ibn Sinoning faxriy unvoni qaysi?", ["Shayx ur-rais", "Ikkinchi muallim", "Sharq Aristoteli", "Malik ush-shuaro"]],
      ["O‘zini o‘zi rivojlantirishning to‘g‘ri yo‘li qaysi?", ["Maqsad qo‘yib, har kuni oz-ozdan mashq qilish", "Faqat omadga ishonish", "Qiyin ishdan qochish", "Boshqalarga ko‘r-ko‘rona taqlid qilish"]],
      ["Kaykovus qaysi hududning hukmdori va adibi bo‘lgan?", ["Gurgon", "Hirot", "Samarqand", "Koshg‘ar"]],
      ["Forobiy fikricha, inson qanday sharoitda kamol topadi?", ["Boshqalar bilan hamkorlikda", "Yolg‘izlikda", "Faqat boylikda", "Hech qanday sharoitda"]]
    ],
    "sinf-7": [
      ["Beruniyning Hindiston xalqlari haqidagi asari qaysi?", ["Hindiston", "Saydana", "Qobusnoma", "Devoni hikmat"]],
      ["Beruniy fikricha, ilm va odob qanday bog‘liq?", ["Bir-biridan ajralmas", "Bir-biriga zid", "Umuman bog‘liq emas", "Faqat ilm muhim"]],
      ["Beruniy bilimni qanday o‘rganishni tavsiya etadi?", ["Xolis va tanqidiy", "Ko‘r-ko‘rona yodlab", "Faqat eshitib", "Tekshirmasdan"]],
      ["Husayn Voiz Koshifiy qaysi shaharda yashab ijod qilgan?", ["Hirot", "Buxoro", "Xiva", "Qo‘qon"]],
      ["“Axloqi Muhsiniy” necha bobdan iborat?", ["40", "44", "12", "100"]],
      ["Koshifiy axloqni qanday o‘rgatadi?", ["Hikoyatlar va hayotiy misollar orqali", "Formulalar orqali", "Xaritalar orqali", "Faqat qonunlar orqali"]],
      ["Navoiyning “Hayrat ul-abror” dostoni qaysi turkumning birinchi asari?", ["Xamsa", "Devon", "Lug‘at", "Tarix"]],
      ["Axborot madaniyatiga zid xatti-harakat qaysi?", ["Tekshirilmagan xabarni ulashish", "Manbani ko‘rsatish", "Shaxsiy ma’lumotni himoya qilish", "Odobli izoh yozish"]],
      ["Jamoada ishlashda muvaffaqiyat sharti qaysi?", ["Vazifalarni taqsimlab, bir-birini tinglash", "Har kim o‘zicha ishlashi", "Hammasini bitta odam qilishi", "Bahslashib ishni to‘xtatish"]],
      ["Ijodkorlik belgisi qaysi?", ["Muammoga yangi yechim topish", "Faqat ko‘chirish", "Savol bermaslik", "Xato qilishdan qo‘rqib ish boshlamaslik"]],
      ["Forobiy qanday jamoani ideal deb biladi?", ["A’zolari bilimli, adolatli va hamkor jamoani", "Faqat boy jamoani", "Faqat kuchli jamoani", "Hamma bir xil o‘ylaydigan jamoani"]],
      ["Internetda shaxsiy ma’lumotga to‘g‘ri munosabat qaysi?", ["Parol va manzilni begonalarga bermaslik", "Hammasini ochiq ulashish", "Parolni do‘stlarga aytish", "Har bir saytga kiritish"]]
    ],
    "sinf-9": [
      ["“Qutadg‘u bilig”da Oyto‘ldi qaysi tushuncha timsoli?", ["Davlat va baxt", "Adolat", "Aql", "Qanoat"]],
      ["“Qutadg‘u bilig”da O‘zg‘urmish qaysi tushuncha timsoli?", ["Qanoat va oxirat", "Adolat", "Davlat", "Aql"]],
      ["Yusuf Xos Hojib fikricha, rahbar qanday bo‘lishi kerak?", ["Bilimli va adolatli", "Faqat boy", "Faqat qattiqqo‘l", "Ko‘p gapiradigan"]],
      ["Hissiyotni boshqarishning to‘g‘ri usuli qaysi?", ["To‘xtab, chuqur nafas olib, keyin gapirish", "Darhol baqirish", "Narsalarni otish", "Gina saqlab yurish"]],
      ["Haqiqiy lider qanday bo‘ladi?", ["Jamoaga namuna bo‘lib, mas’uliyatni o‘z zimmasiga oladi", "Buyruq berib, o‘zi ishlamaydi", "Xatoni boshqaga yuklaydi", "Faqat o‘z manfaatini o‘ylaydi"]],
      ["Halol tadbirkorlikka mos ish qaysi?", ["Sifatli mahsulot va xaridorga rostgo‘ylik", "Tarozidan urish", "Soxta reklama", "Soliqdan qochish"]],
      ["Bag‘rikenglik nima?", ["Boshqa fikr, millat va dinga hurmat", "Hamma narsaga befarqlik", "O‘z fikrini yashirish", "Faqat o‘z fikrini to‘g‘ri deyish"]],
      ["Firibgar (fishing) xabar belgisi qaysi?", ["Parol yoki karta raqamini so‘rovchi shubhali havola", "Maktabning rasmiy sayti", "Elektron darslik", "Kutubxona katalogi"]],
      ["Avloniy keltirgan arab maqoliga ko‘ra, sabr nimaning kalitidir?", ["Shodlik (muvaffaqiyat)", "Boylik", "Qayg‘u", "Uyqu"]],
      ["Navoiy qanday rizqni ulug‘laydi?", ["Halol mehnat bilan topilgan rizqni", "Meros qolgan boylikni", "Qarzga olingan pulni", "Omad bilan kelgan pulni"]],
      ["Ma’naviy tahdidga misol qaysi?", ["Zo‘ravonlik va yot g‘oyalarni targ‘ib qiluvchi kontent", "Ilmiy maqola", "Badiiy kitob", "Sport yangiliklari"]],
      ["Darslikka ko‘ra 9-sinf bitiruvchisi uchun belgilangan daraja qaysi?", ["A2+", "B1", "A1", "A2"]]
    ],
    "sinf-10": [
      ["Burhoniddin Marg‘inoniy qaysi yillarda yashagan?", ["1123–1197", "873–950", "1441–1501", "1878–1934"]],
      ["Ahmad Donish qaysi shaharda yashagan?", ["Buxoro", "Hirot", "Xiva", "Samarqand"]],
      ["Ahmad Donish jamiyat taraqqiyotini nimada ko‘radi?", ["Ilm-fan, ma’rifat va adolatli boshqaruvda", "Urush va bosqinda", "Dunyodan uzilib yashashda", "Faqat savdoda"]],
      ["Abdurauf Fitrat qaysi harakat vakili?", ["Jadidchilik", "Tasavvuf", "Temuriylar saroy she’riyati", "Qadimgi yunon falsafasi"]],
      ["Fitratning oila tarbiyasiga oid asari qachon nashr etilgan?", ["1916", "1069", "1913", "1501"]],
      ["Kasb tanlashda eng to‘g‘ri yondashuv qaysi?", ["Qiziqish, qobiliyat va jamiyat ehtiyojini hisobga olish", "Faqat do‘stlarga ergashish", "Faqat oson kasbni tanlash", "Tasodifiy tanlash"]],
      ["Fuqaroning burchi qaysi?", ["Qonunlarga rioya qilish", "Soliqdan qochish", "Jamoat mulkini buzish", "Atrof-muhitga zarar yetkazish"]],
      ["Huquq va burch qanday bog‘liq?", ["Har bir huquq mas’uliyat bilan birga keladi", "Huquq bor, burch yo‘q", "Burch faqat kattalarda bo‘ladi", "Ular bog‘liq emas"]],
      ["Daxldorlik nima?", ["Atrofdagi voqealarga befarq bo‘lmaslik va ishtirok etish", "Hamma narsaga aralashish", "Faqat kuzatib turish", "Faqat o‘zi uchun yashash"]],
      ["Marg‘inoniy ulug‘lagan fazilatlar qatoriga qaysi biri kiradi?", ["Odillik va mehnatsevarlik", "Zulm", "Yalqovlik", "Xasislik"]],
      ["Vijdon nima?", ["Insonning o‘z xatti-harakatini axloqan baholovchi ichki tuyg‘usi", "Qonunlar kitobi", "Davlat organi", "Tabiat hodisasi"]],
      ["Ahmad Donishning “Navodir ul-vaqoe” asari qanday asar?", ["Ijtimoiy-falsafiy, ma’rifiy asar", "Lug‘at", "Tibbiyot qo‘llanmasi", "Matematika darsligi"]]
    ],
    "sinf-11": [
      ["Ibn Sino fikricha, ota oilada nimada namuna bo‘lishi kerak?", ["Xulq, muloqot va rostgo‘ylikda", "Faqat pul topishda", "Faqat qattiqqo‘llikda", "Hech narsada"]],
      ["Fitrat oilani nima deb biladi?", ["Tarbiyaning birlamchi maskani", "Faqat iqtisodiy birlik", "Vaqtinchalik uyushma", "Davlat idorasi"]],
      ["Avloniy vatanni sevishni qaysi xulqlar qatoriga qo‘ygan?", ["Yaxshi xulqlar", "Yomon xulqlar", "Betaraf odatlar", "Tug‘ma xususiyatlar"]],
      ["Forobiy fikricha, baxt-saodatga qanday erishiladi?", ["Bilim, fazilat va ezgu amal orqali", "Faqat boylik orqali", "Faqat hokimiyat orqali", "Tasodif orqali"]],
      ["Beruniy fikricha, inson qimmati nima bilan o‘lchanadi?", ["Ishini mahorat bilan bajarishi bilan", "Kiyimi bilan", "Qarindoshlari bilan", "Yoshi bilan"]],
      ["Darslikka ko‘ra B1 darajadagi bitiruvchiga xos talab qaysi?", ["Ijtimoiy hayotga tayyorligini namoyon eta oladi", "Faqat o‘qishni biladi", "Faqat o‘yin o‘ynay oladi", "Hech qanday talab yo‘q"]],
      ["Oilaviy qadriyatlarga mos xatti-harakat qaysi?", ["Kattalarni hurmat qilish va o‘zaro mehr", "Oila a’zolariga befarqlik", "Faqat o‘z manfaatini o‘ylash", "Uy ishlaridan qochish"]],
      ["Faol fuqarolik pozitsiyasi nima?", ["Jamiyat muammolarini hal qilishda tashabbus ko‘rsatish", "Hamma narsaga befarqlik", "Faqat tanqid qilish", "Muammodan qochish"]],
      ["Darslikka ko‘ra 11-sinf bitiruvchisi nizoli vaziyatda qanday yo‘l tutadi?", ["Muammoni tinch yo‘l bilan hal etishga harakat qiladi", "Kuch ishlatadi", "Javobsiz qochib ketadi", "Gina saqlaydi"]],
      ["Ibn Sinoning “Tadbir al-manozil” risolasi nimaga bag‘ishlangan?", ["Oila va uy xo‘jaligini boshqarishga", "Yulduzlar harakatiga", "She’r qoidalariga", "Harbiy ishga"]],
      ["Abdurauf Fitrat qayerda tug‘ilgan?", ["Buxoro", "Toshkent", "Hirot", "Samarqand"]],
      ["Ko‘ngillilik (volontyorlik) nima?", ["Jamiyat foydasiga beg‘araz qilinadigan ish", "Faqat pul uchun ishlash", "Majburiy mehnat", "Dam olish turi"]]
    ],
    "sinf-8": [
      ["Darslikka ko‘ra 8-sinf bitiruvchisiga qo‘yiladigan talablardan biri qaysi?", ["To‘g‘ri qaror qabul qiladi", "Faqat yodlab oladi", "Faqat o‘yin o‘ynaydi", "Hech qanday talab yo‘q"]],
      ["“Tarbiya” fani konsepsiyasi necha asosiy yo‘nalishga tayanadi?", ["3", "2", "5", "7"]],
      ["Darslikka ko‘ra “Tarbiya” fani bo‘yicha pedagog kadrlar tayyorlash qachondan tizimli yo‘lga qo‘yildi?", ["2021–2022 o‘quv yilidan", "1991-yildan", "2010-yildan", "2030-yildan"]],
      ["Quyidagi allomalardan qaysi biri XX asrda ham yashagan?", ["Abdurauf Fitrat", "Abu Nasr Forobiy", "Alisher Navoiy", "Kaykovus"]],
      ["Qaysi juftlik to‘g‘ri?", ["Navoiy — Mahbub ul-qulub", "Navoiy — Qobusnoma", "Beruniy — Devoni hikmat", "Ibn Sino — Al-Hidoya"]],
      ["Qaysi juftlik to‘g‘ri?", ["Kaykovus — Qobusnoma", "Kaykovus — Tib qonunlari", "Yassaviy — Saydana", "Forobiy — Al-Hidoya"]],
      ["“Insert” metodida “+” belgisi nimani bildiradi?", ["Men uchun yangi ma’lumot", "Buni bilaman", "Boshqacha o‘ylardim", "Tushunarsiz"]],
      ["“Baliq skeleti” metodida “bosh” qismiga nima yoziladi?", ["Muammo", "Yechim", "Dalil", "Xulosa"]],
      ["“Klaster” metodi nima?", ["Tushunchalarni grafik ko‘rinishda bog‘lash", "Tezkor savol-javob", "Sahna ko‘rinishi", "Uzoq ma’ruza"]],
      ["“Keys-stadi” metodining mohiyati nima?", ["Aniq hayotiy vaziyatni tahlil qilib yechim topish", "Matnni yod olish", "Rasm chizish", "Jismoniy mashq"]],
      ["8-sinf moduli darslarida har bir dars nimaga tayanadi?", ["Bitta alloma va uning asaridagi aniq g‘oyaga", "Faqat darslik mashqlariga", "Faqat videolarga", "Faqat o‘qituvchi hikoyasiga"]],
      ["Tarbiya fani maqsadiga eng mos javob qaysi?", ["Barkamol, ma’naviy boy va mas’uliyatli shaxsni tarbiyalash", "Faqat imtihonga tayyorlash", "Faqat jismoniy chiniqtirish", "Faqat xorijiy til o‘rgatish"]]
    ],
    "dars-d1": [
      ["Abdulla Avloniy qayerda tug‘ilgan?", ["Toshkent", "Buxoro", "Hirot", "Samarqand"]],
      ["Abdulla Avloniy qaysi yillarda yashagan?", ["1878–1934", "1441–1501", "980–1037", "1827–1897"]],
      ["Allomalarning to‘g‘ri xronologik tartibi qaysi?", ["Forobiy → Navoiy → Avloniy", "Avloniy → Forobiy → Navoiy", "Navoiy → Avloniy → Forobiy", "Forobiy → Avloniy → Navoiy"]],
      ["Darslikka ko‘ra “tarbiya” so‘zi qaysi tildan olingan?", ["Arab tilidan (“robba” fe’lidan)", "Fors tilidan", "Yunon tilidan", "Rus tilidan"]],
      ["Ajdodlar merosini o‘rganish nimaga xizmat qiladi?", ["Milliy g‘urur va ma’naviy immunitetni mustahkamlashga", "Faqat tarixni yodlashga", "Faqat imtihondan o‘tishga", "Hech narsaga"]]
    ],
    "dars-d2": [
      ["Abu Nasr Forobiy qaysi yillarda yashagan?", ["873–950", "973–1048", "1441–1501", "1123–1197"]],
      ["“Sharq Aristoteli” deb kim ataladi?", ["Forobiy", "Navoiy", "Avloniy", "Kaykovus"]],
      ["Forobiy fikricha, fozil shahar hokimi nimani yomon ko‘radi?", ["Zulm va istibdodni", "Bilim olishni", "Adolatni", "Haqgo‘ylikni"]],
      ["Darslikka ko‘ra Forobiy nechta asar yaratgan?", ["160 dan ortiq", "10 ga yaqin", "3 ta", "1000 dan ortiq"]],
      ["Fozil jamoaning asosi nima?", ["Hamkorlik va adolat", "Raqobat va hasad", "Qo‘rquv", "Befarqlik"]]
    ],
    "dars-d3": [
      ["Abu Rayhon Beruniy qaysi yillarda yashagan?", ["973–1048", "873–950", "980–1037", "1441–1501"]],
      ["Beruniyning “Mas’ud qonuni” asari asosan qaysi sohaga oid?", ["Astronomiya", "She’riyat", "Huquq", "Tilshunoslik"]],
      ["Beruniy fikricha, ongli inson nimasi bilan ajralib turadi?", ["Kelajakni ko‘ra olib, ehtiyot choralarini ko‘rishi bilan", "Kuchi bilan", "Boyligi bilan", "Bo‘yi bilan"]],
      ["“Ilmsiz odob — bu zulmatda qolgan chiroqdir” degan fikr darslikda kimga nisbat beriladi?", ["Beruniy", "Kaykovus", "Yassaviy", "Fitrat"]],
      ["Do‘stlaringiz noto‘g‘ri ishga undasa, to‘g‘ri qaror qaysi?", ["Oqibatini o‘ylab, odob bilan rad etish", "Ko‘pchilikka ergashish", "Indamay qo‘shilish", "Ularni haqoratlash"]]
    ],
    "dars-d4": [
      ["Abu Ali ibn Sino qaysi yillarda yashagan?", ["980–1037", "873–950", "1123–1197", "1878–1934"]],
      ["Ibn Sinoning faxriy unvoni qaysi?", ["Shayx ur-rais", "Ikkinchi muallim", "Sulton ul-ulamo", "Malik ush-shuaro"]],
      ["Ibn Sino fikricha, xulq qanday shakllanadi?", ["Odamlar bilan muloqot va ijtimoiy muhitda", "Faqat tug‘ma bo‘ladi", "Faqat ovqatlanishdan", "O‘z-o‘zidan"]],
      ["Sog‘lom kun uchun eng muhim muvozanat qaysi?", ["Uyqu, ovqatlanish va harakat muvozanati", "Faqat o‘qish", "Faqat o‘yin", "Faqat dam olish"]],
      ["Ibn Sino fikricha, kichik bolaning idrok kuchi qanday?", ["Kattalarniki bilan barobar", "Yo‘q darajada", "Kattalardan ancha past", "Faqat o‘yinga yetadi"]]
    ],
    "dars-d5": [
      ["Yusuf Xos Hojib qayerda tug‘ilgan?", ["Bolasog‘un", "Hirot", "Buxoro", "Gurgon"]],
      ["“Qutadg‘u bilig”da Kuntug‘di qaysi tushuncha timsoli?", ["Adolat", "Aql", "Qanoat", "Baxt"]],
      ["“Qutadg‘u bilig”da O‘zg‘urmish qaysi tushuncha timsoli?", ["Qanoat va oxirat", "Adolat", "Davlat", "Aql"]],
      ["“Qutadg‘u bilig” qaysi tilda yozilgan?", ["Turkiy tilda", "Arab tilida", "Fors tilida", "Yunon tilida"]],
      ["Yusuf Xos Hojib fikricha, farzand nima asosida shakllanadi?", ["Ota-onadan ko‘rgan odat va axloq asosida", "Faqat maktabda", "Faqat ko‘chada", "Tug‘ma xususiyat asosida"]]
    ],
    "dars-d6": [
      ["“Qobusnoma”da asosan nimalar haqida nasihat qilinadi?", ["Muomala odobi, ota-ona burchi va hunar", "Yulduzlar harakati", "Dori tayyorlash", "Harbiy yurishlar"]],
      ["Kommunikativlik nima?", ["Fikrni aniq va hurmat bilan ifodalab, boshqalarni tinglay olish", "Ko‘p gapirish", "Hech kim bilan gaplashmaslik", "Faqat yozishmada muloqot"]],
      ["“Faol tinglash” nimani anglatadi?", ["Savol berib, tushunganini qayta aytib berish", "Gapni bo‘lib qo‘yish", "Telefonga qarab tinglash", "Javob bermaslik"]],
      ["Telefonda gaplashish odobiga mos javob qaysi?", ["Salomlashib, qisqa va aniq gapirish", "Salomsiz gap boshlash", "Baland ovozda jamoat joyida gapirish", "Kutilmaganda go‘shakni qo‘yish"]],
      ["Kaykovus farzandga ilm bilan birga nimani o‘rgatishni maslahat beradi?", ["Hunar", "Qimor", "Ayyorlik", "Maqtanchoqlik"]]
    ],
    "dars-d7": [
      ["Xoja Ahmad Yassaviy qachon vafot etgan?", ["1166-yilda", "1501-yilda", "950-yilda", "1934-yilda"]],
      ["Yassaviy hikmatlari qanday shaklda yozilgan?", ["She’riy hikmatlar", "Ilmiy jadvallar", "Huquqiy hujjatlar", "Xaritalar"]],
      ["Yassaviy fikricha, ayyorlik nima hisoblanadi?", ["O‘zgalarga xiyonat", "Aqllilik", "Tadbirkorlik", "Mahorat"]],
      ["Iroda qanday tarbiyalanadi?", ["Qiyinchilikni yengib, boshlagan ishni oxiriga yetkazish orqali", "Qiyin ishdan qochish orqali", "Faqat dam olish orqali", "Boshqalarga topshirish orqali"]],
      ["Yassaviy fikricha, hushyorlik insonni nimadan saqlaydi?", ["Fitna va fisqu fasoddan", "Bilim olishdan", "Do‘stlikdan", "Mehnatdan"]]
    ],
    "dars-d8": [
      ["Burhoniddin Marg‘inoniy qaysi yillarda yashagan?", ["1123–1197", "980–1037", "1441–1501", "1886–1938"]],
      ["Huquqiy ong nima?", ["Qonunlarni bilish va ularni hurmat qilish", "Qonundan qochish yo‘llarini bilish", "Faqat jarima to‘lash", "Faqat sudni bilish"]],
      ["Marg‘inoniy axloqiy va huquqiy tarbiyani qanday olib borishni ta’kidlaydi?", ["Bir-biri bilan bog‘liq holda", "Alohida-alohida", "Faqat huquqiy tarbiyani", "Faqat axloqiy tarbiyani"]],
      ["Huquqbuzarlikning oldini olishda eng samarali yo‘l qaysi?", ["Huquqiy bilim va tarbiya", "Faqat jazo", "Befarqlik", "Yashirish"]],
      ["Darslikda keltirilgan “Qonun — adolat mezoni” qanday ibora?", ["Xalqona hikmat", "Matematik formula", "She’riy vazn", "Tibbiy atama"]]
    ],
    "dars-d9": [
      ["Alisher Navoiy qaysi yillarda yashagan?", ["1441–1501", "873–950", "1123–1197", "1878–1934"]],
      ["Navoiyning “Mahbub ul-qulub” asari qanday asar?", ["Axloq va jamiyat haqidagi nasriy asar", "Tibbiyot qo‘llanmasi", "Lug‘at", "Astronomik jadval"]],
      ["Navoiy komil insonga xos fazilatlar qatoriga qaysi birini qo‘yadi?", ["Kamtarlik va saxovat", "Maqtanchoqlik", "Xasislik", "Qo‘pollik"]],
      ["Darslikka ko‘ra Navoiyning qaysi asarida komil insonga xos jihatlar sanab o‘tiladi?", ["Nasoyim ul-muhabbat", "Qobusnoma", "Tib qonunlari", "Al-Hidoya"]],
      ["Navoiy fikricha, yaxshi farzand oila uchun nima?", ["Oilaning davlati va baxti", "Ortiqcha tashvish", "Faqat yordamchi", "Begona"]]
    ],
    "dars-d10": [
      ["Soxta yangilik belgisi qaysi?", ["Manbasi noma’lum, haddan tashqari shov-shuvli sarlavha", "Rasmiy manbaga havola", "Muallif va sana ko‘rsatilgan", "Bir necha manbada tasdiqlangan"]],
      ["Ekomadaniyatga mos amal qaysi?", ["Chiqindini saralash va suvni tejash", "Daraxt shoxini sindirish", "Chiqindini ko‘chaga tashlash", "Suvni behuda oqizish"]],
      ["Ma’naviy immunitetning asosi nima?", ["Tanqidiy fikrlash va mustahkam bilim", "Hamma narsaga ishonish", "Internetdan butunlay voz kechish", "Faqat o‘yin o‘ynash"]],
      ["Mediasavodxonlik nima?", ["Axborotni tahlil qilib, ishonchliligini baholay olish", "Ko‘p video ko‘rish", "Tez yozish", "Faqat televizor ko‘rish"]],
      ["“Raqamli iz” nima?", ["Internetda qoldirilgan ma’lumotlar izi", "Kompyuter ekranidagi chang", "Telefon raqami", "Elektron pochta paroli"]]
    ],
    diag: [
      ["“Devoni hikmat” muallifi kim?", ["Xoja Ahmad Yassaviy", "Alisher Navoiy", "Abu Rayhon Beruniy", "Kaykovus"]],
      ["“Mahbub ul-qulub” muallifi kim?", ["Alisher Navoiy", "Abdulla Avloniy", "Ibn Sino", "Yusuf Xos Hojib"]],
      ["“Tib qonunlari” muallifi kim?", ["Abu Ali ibn Sino", "Abu Nasr Forobiy", "Ahmad Donish", "Burhoniddin Marg‘inoniy"]],
      ["“Qutadg‘u bilig” muallifi kim?", ["Yusuf Xos Hojib", "Mahmud Koshg‘ariy", "Husayn Voiz Koshifiy", "Abdurauf Fitrat"]],
      ["Beruniy fikricha, insonni qaysi yo‘nalishda shakllantiradi?", ["Tarbiya va muhit", "Faqat irsiyat", "Faqat boylik", "Tasodif"]],
      ["Forobiyning faxriy unvoni qaysi?", ["Ikkinchi muallim", "Shayx ur-rais", "Malik ush-shuaro", "Sulton ul-ulamo"]],
      ["Ibn Sino ta’lim-tarbiyani necha yoshdan boshlashni tavsiya qilgan?", ["6 yoshdan", "12 yoshdan", "3 yoshdan", "15 yoshdan"]],
      ["“Qutadg‘u bilig”da O‘gdulmish qaysi tushuncha timsoli?", ["Aql", "Adolat", "Baxt", "Qanoat"]],
      ["Burhoniddin Marg‘inoniy ulug‘lagan fazilat qaysi?", ["Vijdon va diyonat", "Hasad", "Xasislik", "Loqaydlik"]],
      ["Sinfingizga yangi o‘quvchi keldi, u bilan hech kim gaplashmayapti. To‘g‘ri yo‘l qaysi?", ["O‘zingiz tanishib, uni jamoaga qo‘shish", "Siz ham e’tibor bermaslik", "Uning ustidan kulish", "O‘qituvchi aytmaguncha kutish"]],
      ["Ko‘chada hamyon topib oldingiz. Halollikka mos harakat qaysi?", ["Egasini topishga harakat qilish yoki tegishli joyga topshirish", "Pulini olib, hamyonni tashlash", "Indamay o‘zingizga olish", "Do‘stlaringiz bilan bo‘lishish"]],
      ["Tanishingiz sigaret chekishni taklif qildi. To‘g‘ri javob qaysi?", ["Qat’iy rad etib, zararini tushuntirish", "Bir marta sinab ko‘rish", "Yashirincha chekish", "Uyalib rozi bo‘lish"]],
      ["Onlayn o‘yinda notanish odam uy manzilingizni so‘radi. Nima qilasiz?", ["Bermaysiz va ota-onangizga aytasiz", "Manzilni yozib berasiz", "Rasm yuborasiz", "Uchrashuvga rozi bo‘lasiz"]],
      ["Guruh loyihasida bir a’zo ishlamayapti. Eng to‘g‘ri yo‘l qaysi?", ["U bilan gaplashib, vazifasini aniqlashtirish", "Uni guruhdan haydash", "Hamma ishni tashlab ketish", "O‘qituvchiga shikoyat qilib, o‘zingiz hech narsa qilmaslik"]],
      ["Mahallada ko‘kalamzorlashtirish hashari bo‘lmoqda. Faol fuqarolik pozitsiyasiga mos ish qaysi?", ["Hasharda qatnashib, do‘stlarni ham taklif qilish", "Uyda o‘tirish", "Hasharni masxara qilish", "Faqat suratga tushib ketish"]]
    ]
  },

  /* Keys-stadi: har bir variantda izoh (fb) bor; ok — eng maqbul javob. */
  cases: [
    { id: "k5a", grades: [5], scholar: "yassaviy", title: "Singan vaza",
      text: "Anvar uyda to‘p o‘ynab, onasining sevimli vazasini sindirib qo‘ydi. Uyda hech kim yo‘q edi. Kechqurun onasi “Vazani kim sindirdi?” deb so‘radi. Ukasi Bobur esa o‘sha kuni uyda edi.",
      q: "Anvar qanday yo‘l tutishi kerak?",
      opts: [
        { t: "Rostini aytib, uzr so‘raydi va zararni qoplashga yordam berishini aytadi.", ok: true, fb: "To‘g‘ri. Yassaviy rostgo‘ylik va o‘z-o‘ziga talabchanlikni targ‘ib qiladi; xatoni tan olish — mas’uliyat belgisi." },
        { t: "Mushuk sindirgan deydi.", ok: false, fb: "Yolg‘on vaqtincha qutqaradi, lekin ishonchni yo‘qotadi. Yassaviy gunohni yashirishni xiyonat deb biladi." },
        { t: "Ukasi Boburni ko‘rsatadi.", ok: false, fb: "Aybni boshqaga ag‘darish — ikki karra xato: ham yolg‘on, ham adolatsizlik." },
        { t: "Indamay turadi, balki onasi unutib yuborar.", ok: false, fb: "Jim turish ham haqiqatni yashirishdir. Mas’uliyatli inson xatosini o‘zi tan oladi." }
      ] },
    { id: "k5b", grades: [5], scholar: "kaykovus", title: "Avtobusdagi joy",
      text: "Madina maktabdan avtobusda qaytmoqda. U charchagan, o‘tirgan joyidan turgisi kelmaydi. Bekatda qo‘lida og‘ir sumka bilan keksa ayol chiqdi, bo‘sh joy yo‘q.",
      q: "Madina qanday yo‘l tutadi?",
      opts: [
        { t: "Darhol o‘rnidan turib, ayolga joy beradi va sumkasini olishga yordam beradi.", ok: true, fb: "To‘g‘ri. Kaykovus kattani hurmat qilishni muomala odobining asosi deb biladi." },
        { t: "Ko‘zini yumib, uxlayotgandek o‘tiradi.", ok: false, fb: "Bu befarqlik va o‘zini aldash. Odob boshqalarning ehtiyojini ko‘rishdan boshlanadi." },
        { t: "Boshqa birov joy beradi, deb kutadi.", ok: false, fb: "Yaxshilikni boshqalarga qoldirmaslik kerak — tashabbus o‘zingizdan boshlansin." },
        { t: "Charchaganini aytib, uzr so‘raydi.", ok: false, fb: "Yosh va sog‘lom odam charchoqni keksa insonnikidan oson ko‘taradi. Hurmat qurbonlik talab qiladi." }
      ] },
    { id: "k6a", grades: [6], scholar: "beruniy", title: "Navbatchilik",
      text: "Sinfda navbatchilik jadvali bor. Bugun Jasurning navbati, lekin futbol mashg‘ulotiga shoshilmoqda. Do‘sti “Qo‘yaver, ertaga qilasan, hech kim sezmaydi” dedi.",
      q: "Jasur nima qiladi?",
      opts: [
        { t: "Navbatchilikni tez va sifatli bajarib, keyin mashg‘ulotga boradi.", ok: true, fb: "To‘g‘ri. Beruniy insonning qimmatini mehnati va ishini mahorat bilan bajarishi bilan o‘lchaydi." },
        { t: "Do‘stining gapiga kirib, ketib qoladi.", ok: false, fb: "Majburiyatni qoldirish — boshqalar zimmasiga yuk tashlash demak." },
        { t: "Boshqa sinfdoshiga pul berib, o‘rniga qildiradi.", ok: false, fb: "Bu mas’uliyatdan qochish. Mehnat tarbiyasi o‘z ishini o‘zi bajarishdan boshlanadi." },
        { t: "Faqat ko‘rinadigan joyni artib, qolganini tashlab ketadi.", ok: false, fb: "Chala ish — yarim yolg‘on. Ishni oxiriga yetkazish odati tarbiya bilan shakllanadi." }
      ] },
    { id: "k6b", grades: [6], scholar: "kaykovus", title: "Guruhdagi xabar",
      text: "Sinfning messenjer guruhida kimdir Nodiraning kulgili suratini yubordi. Hamma kulgichlar qo‘ymoqda. Nodira guruhda jim, ertasi kuni maktabga kelmadi.",
      q: "Siz nima qilasiz?",
      opts: [
        { t: "Kulgich qo‘ymayman, suratni o‘chirishni so‘rayman va Nodiraga yozib, qo‘llab-quvvatlayman.", ok: true, fb: "To‘g‘ri. Kaykovus haqorat va qo‘pollikdan saqlanishni o‘rgatadi; himoyaga turish — jasorat." },
        { t: "Ko‘pchilik qatori men ham kulgich qo‘yaman.", ok: false, fb: "Ko‘pchilikka qo‘shilib masxara qilish ham haqoratdir." },
        { t: "Suratni boshqa guruhlarga ham tarqataman.", ok: false, fb: "Bu kiberbulling: insonga ruhiy zarar yetkazadi va qonun bilan ham taqiqlangan." },
        { t: "Hech narsa qilmayman, bu mening ishim emas.", ok: false, fb: "Befarqlik zo‘ravonlikning davom etishiga yo‘l ochadi." }
      ] },
    { id: "k7a", grades: [7], scholar: "beruniy", title: "Shov-shuvli xabar",
      text: "Ijtimoiy tarmoqda “Ertaga barcha maktablarda dars bo‘lmaydi!” degan xabar tarqaldi. Manbasi ko‘rsatilmagan, lekin 10 mingdan ortiq ulashilgan.",
      q: "To‘g‘ri harakat qaysi?",
      opts: [
        { t: "Maktab yoki rasmiy manbadan tekshiraman, tasdiqlanmaguncha ulashmayman.", ok: true, fb: "To‘g‘ri. Beruniy bilimni xolis va tanqidiy o‘rganishni talab qilgan — axborotga ham shunday yondashiladi." },
        { t: "Ko‘p ulashilgan, demak rost. Do‘stlarimga yuboraman.", ok: false, fb: "Ulashishlar soni haqiqat dalili emas. Soxta xabar ko‘pincha tezroq tarqaladi." },
        { t: "Ertaga maktabga bormayman.", ok: false, fb: "Tekshirilmagan xabarga asoslangan qaror zarar keltirishi mumkin." },
        { t: "Xabar ostiga “Rost!” deb izoh yozaman.", ok: false, fb: "Tasdiqlanmagan ma’lumotni qo‘llab-quvvatlash ham uni tarqatishdir." }
      ] },
    { id: "k7b", grades: [7], scholar: "forobiy", title: "Loyiha jamoasi",
      text: "Ilmiy loyiha uchun 4 kishilik guruh tuzildi. Sardor faqat o‘z g‘oyasini qabul qilishni talab qilmoqda, qolganlar ranjigan, ish to‘xtab qolgan.",
      q: "Guruh qanday yo‘l tutishi kerak?",
      opts: [
        { t: "Har bir g‘oyani tinglab, ovoz berish va vazifalarni teng taqsimlash.", ok: true, fb: "To‘g‘ri. Forobiy fikricha, inson boshqalar bilan hamkorlikda kamol topadi; fozil jamoa adolat va hamkorlikka quriladi." },
        { t: "Sardorning gapiga ko‘nib, qolganlar jim turadi.", ok: false, fb: "Bir kishining hukmronligi jamoa salohiyatini so‘ndiradi." },
        { t: "Guruh tarqalib, har kim o‘zicha loyiha qiladi.", ok: false, fb: "Bu muammoni hal qilmaydi; jamoada ishlash ko‘nikmasi shakllanmaydi." },
        { t: "Sardorni guruhdan chiqarib yuborish.", ok: false, fb: "Qaror shoshilinch. Avval gaplashib, umumiy qoida kelishish kerak." }
      ] },
    { id: "k8a", grades: [8], lesson: "d3", scholar: "beruniy", title: "Kompyuter klubi",
      text: "Do‘stlari Azizni oxirgi darsdan qochib, kompyuter klubiga borishga undashmoqda: “Bitta darsdan hech narsa bo‘lmaydi, sen qo‘rqoqmisan?”",
      q: "Aziz qanday qaror qabul qilishi kerak?",
      opts: [
        { t: "To‘xtab o‘ylaydi, oqibatini ko‘radi va darsda qolishini xotirjam aytadi; dam olish kuni birga borishni taklif qiladi.", ok: true, fb: "To‘g‘ri. Beruniy fikricha, ongli inson kelajakni ko‘ra oladi va ehtiyot choralarini ko‘radi. “To‘xta — o‘yla — oqibatni ko‘r — tanla.”" },
        { t: "“Qo‘rqoq” demasliklari uchun ular bilan ketadi.", ok: false, fb: "Bosim ostidagi qaror o‘ziniki emas. Haqiqiy jasorat — “yo‘q” deya olish." },
        { t: "Ularni o‘qituvchiga chaqib beradi.", ok: false, fb: "Avval do‘stlarni o‘zingiz to‘xtatishga urinish kerak; maqsad — ularni ham asrash." },
        { t: "Darsdan qochib, klubga emas, uyga ketadi.", ok: false, fb: "Bu ham darsdan qochish. Muammo joyda emas, qarorda." }
      ] },
    { id: "k8b", grades: [8], lesson: "d6", scholar: "kaykovus", title: "Mehmon kutish",
      text: "Uyingizga otangizning hamkasblari mehmonga keldi. Siz sevimli serialingizni ko‘rib o‘tiribsiz, onangiz dasturxonga yordam so‘radi.",
      q: "“Qobusnoma” odobiga ko‘ra qanday yo‘l tutasiz?",
      opts: [
        { t: "Serialni to‘xtatib, mehmonlar bilan salomlashaman va dasturxonga yordam beraman.", ok: true, fb: "To‘g‘ri. Kaykovus mehmon kutish va kattalarni hurmat qilishni muomala madaniyatining asosi deb biladi." },
        { t: "Xonamdan chiqmay, serialni oxirigacha ko‘raman.", ok: false, fb: "Mehmonga e’tiborsizlik oila obro‘siga ta’sir qiladi." },
        { t: "Salomlashib, yana xonamga kirib ketaman.", ok: false, fb: "Salom yaxshi, lekin ota-onaga yordam ham farzand burchi." },
        { t: "Telefonimni olib, mehmonlar oldida o‘tiraman.", ok: false, fb: "Suhbat paytida telefonga berilish — muomala odobiga zid." }
      ] },
    { id: "k8c", grades: [8], lesson: "d7", scholar: "yassaviy", title: "Nazorat ishi",
      text: "Matematikadan nazorat ishi. Eng yaqin do‘stingiz Ulug‘bek tayyorlanmagan va sizdan javoblarni ko‘rsatishni iltimos qilmoqda.",
      q: "Rostgo‘ylik va do‘stlikni qanday uyg‘unlashtirasiz?",
      opts: [
        { t: "Ko‘rsatmayman, lekin darsdan keyin unga mavzuni tushuntirib, keyingisiga birga tayyorlanamiz.", ok: true, fb: "To‘g‘ri. Yassaviy halollik va o‘z-o‘ziga talabchanlikni ulug‘laydi. Haqiqiy do‘stlik — do‘stni o‘stirish." },
        { t: "Do‘stlik uchun javoblarni ko‘rsataman.", ok: false, fb: "Bu do‘stingizga yordam emas: u bilim olmaydi, ikkingiz ham halollikni buzasiz." },
        { t: "O‘qituvchiga uni ko‘chirmoqchi deb aytaman.", ok: false, fb: "Avval do‘st bilan o‘zingiz gaplashish kerak; maqsad — uni sharmanda qilish emas." },
        { t: "Javoblarni ko‘rsatmayman va u bilan gaplashmay qo‘yaman.", ok: false, fb: "Rad etish to‘g‘ri, lekin do‘stni yolg‘iz qoldirish — mehrga zid." }
      ] },
    { id: "k8d", grades: [8], lesson: "d4", scholar: "ibnsino", title: "Tungi o‘yin",
      text: "Dilshod har kuni kechasi soat 2 gacha telefonda o‘yin o‘ynaydi. Ertalab darsda uxlab qoladi, boshi og‘riydi, baholari pasaygan.",
      q: "Ibn Sino tamoyillari asosida Dilshodga qanday maslahat berasiz?",
      opts: [
        { t: "Kun tartibi tuzib, ekran vaqtini cheklash va uxlashdan bir soat oldin telefonni qo‘yish.", ok: true, fb: "To‘g‘ri. Ibn Sino tarbiyani aqliy va jismoniy rivojlanish birligi deb biladi; uyqu, ovqat va harakat muvozanati — sog‘liq asosi." },
        { t: "Kunduzi darsda uxlab, kechasi o‘ynayversin.", ok: false, fb: "Bu ham sog‘liqqa, ham bilimga zarar." },
        { t: "Boshog‘riqqa qarshi dori ichsin.", ok: false, fb: "Dori sababni emas, oqibatni bostiradi. Sabab — noto‘g‘ri kun tartibi." },
        { t: "Telefonni butunlay sindirib tashlasin.", ok: false, fb: "Keskin chora uzoqqa bormaydi; muvozanat va o‘zini boshqarish o‘rganilishi kerak." }
      ] },
    { id: "k8e", grades: [8], lesson: "d2", scholar: "forobiy", title: "Sinf sardori saylovi",
      text: "Sinfda sardor saylovi. Bir nomzod hammaga shirinlik va'da qilmoqda. Ikkinchisi kam gapiradi, lekin doim darsga tayyor, boshqalarga yordam beradi, adolatli.",
      q: "Forobiyning fozil rahbar haqidagi fikriga ko‘ra kimga ovoz berasiz?",
      opts: [
        { t: "Bilimli, adolatli va yordamga tayyor nomzodga.", ok: true, fb: "To‘g‘ri. Forobiy fozil hokimni bilimga havasli, haqgo‘y va adolatparvar bo‘lishi kerak deydi." },
        { t: "Shirinlik va'da qilganga.", ok: false, fb: "Va’da evaziga ovoz — saylovning ma’nosini yo‘qotadi." },
        { t: "Eng ko‘p do‘sti bor nomzodga.", ok: false, fb: "Mashhurlik — rahbarlik sifati emas." },
        { t: "Ovoz bermayman, baribir farqi yo‘q.", ok: false, fb: "Befarqlik — faol fuqarolikka zid. Har bir ovoz jamoa taqdiriga ta’sir qiladi." }
      ] },
    { id: "k8f", grades: [8], lesson: "d10", scholar: "avloniy", title: "Shubhali guruh",
      text: "Notanish akkaunt Sarvarni “tez boyish” va “haqiqiy yo‘l” haqida yozadigan yopiq guruhga taklif qildi. Guruhda maktabni, ota-onani tinglamaslikka chaqiruvlar bor.",
      q: "Sarvar qanday yo‘l tutadi?",
      opts: [
        { t: "Guruhdan chiqadi, akkauntni bloklab, ota-onasi yoki o‘qituvchisiga aytadi.", ok: true, fb: "To‘g‘ri. Ma’naviy immunitet — tanqidiy fikrlash va kattalar bilan ochiq muloqot. Avloniy tarbiyani “hayot-mamot masalasi” deydi." },
        { t: "Qiziq, nima deyishlarini bilish uchun guruhda qoladi.", ok: false, fb: "Yot g‘oyalar asta-sekin ta’sir qiladi; xavfli muhitda qolish — xavfni oshirish." },
        { t: "Do‘stlarini ham guruhga taklif qiladi.", ok: false, fb: "Bu xavfni tarqatish demak." },
        { t: "Hech kimga aytmay, sirni saqlaydi.", ok: false, fb: "Bunday holatda yashirish yordam emas. Kattalarni xabardor qilish kerak." }
      ] },
    { id: "k9a", grades: [9], scholar: "avloniy", title: "Haqsiz tanbeh",
      text: "Futbol musobaqasida hakam Bekzodga noto‘g‘ri sariq kartochka berdi. Bekzod juda jahli chiqqan, jamoadoshlari ham hakamga baqirmoqda.",
      q: "Bekzod hissiyotini qanday boshqaradi?",
      opts: [
        { t: "Chuqur nafas olib, o‘yinni davom ettiradi; e’tirozini o‘yindan keyin murabbiy orqali rasmiy bildiradi.", ok: true, fb: "To‘g‘ri. Avloniy sabrni “buyuk bir fazilat” deydi; hissiyotni boshqarish — kuchli irodaning belgisi." },
        { t: "Hakamga qo‘pol gapiradi.", ok: false, fb: "Qo‘pollik vaziyatni yomonlashtiradi va qizil kartochkaga olib kelishi mumkin." },
        { t: "Maydonni tashlab chiqib ketadi.", ok: false, fb: "Jamoani yolg‘iz qoldirish — mas’uliyatsizlik." },
        { t: "Raqib o‘yinchidan o‘ch oladi.", ok: false, fb: "Aybsiz odamga zarar — adolatsizlik." }
      ] },
    { id: "k9b", grades: [9], scholar: "navoiy", title: "Maktab yarmarkasi",
      text: "Maktab yarmarkasida sinfingiz qo‘lda tayyorlangan buyumlar sotmoqda. Bir sinfdoshingiz arzon xitoy buyumlarini “qo‘lda tayyorlangan” deb qimmatroq sotishni taklif qildi.",
      q: "Halol tadbirkorlik nuqtayi nazaridan to‘g‘ri yo‘l qaysi?",
      opts: [
        { t: "Taklifni rad etib, buyumlarning haqiqiy kelib chiqishini ochiq aytish.", ok: true, fb: "To‘g‘ri. Navoiy halol rizq bilan qanoatni komil inson belgisi deydi. Xaridor ishonchi — eng katta kapital." },
        { t: "Foyda ko‘p bo‘lsa, rozi bo‘lish.", ok: false, fb: "Aldov evaziga foyda — ham axloqqa, ham iste’molchi huquqiga zid." },
        { t: "Faqat notanish xaridorlarni aldash.", ok: false, fb: "Kimni aldashdan qat’i nazar, aldov aldovligicha qoladi." },
        { t: "Narxni oshirmay, “qo‘lda tayyorlangan” deb sotish.", ok: false, fb: "Narx o‘zgarmasa ham, yolg‘on ma’lumot berish nohalollikdir." }
      ] },
    { id: "k10a", grades: [10], scholar: "marginoniy", title: "Yo‘qolgan telefon",
      text: "Jamshid sport zalida qimmatbaho telefon topib oldi. Atrofda hech kim yo‘q. Do‘sti: “Sotib, pulini bo‘lishamiz, hech kim bilmaydi” dedi.",
      q: "Huquq, burch va vijdon nuqtayi nazaridan qanday yo‘l tutadi?",
      opts: [
        { t: "Telefonni zal ma’muriyatiga topshiradi yoki egasiga qo‘ng‘iroq qilib qaytaradi.", ok: true, fb: "To‘g‘ri. Marg‘inoniy diyonat, vijdon va burchni shaxs kamolotining asosi deb biladi; boshqaning mulkini o‘zlashtirish qonunga ham zid." },
        { t: "Sotib, pulini bo‘lishadi.", ok: false, fb: "Bu boshqaning mulkini o‘zlashtirish — huquqbuzarlik va vijdonga xiyonat." },
        { t: "O‘zida qoldirib, ishlatib yuradi.", ok: false, fb: "Topilma egasiga qaytarilishi kerak." },
        { t: "Joyida qoldirib ketadi.", ok: false, fb: "Bu befarqlik: telefon boshqa birovning qo‘liga o‘tib ketishi mumkin." }
      ] },
    { id: "k10b", grades: [10], scholar: "kaykovus", title: "Kasb tanlovi",
      text: "Nilufar tibbiyotga qiziqadi va biologiyadan yaxshi o‘qiydi. Dugonalari esa “Hamma iqtisodchi bo‘lyapti, biz bilan bir joyga hujjat topshir” deyishmoqda.",
      q: "Kasb tanlashda qanday yo‘l to‘g‘ri?",
      opts: [
        { t: "Qiziqishi, qobiliyati va kasbning jamiyatdagi o‘rnini tahlil qilib, ota-onasi va o‘qituvchisi bilan maslahatlashadi.", ok: true, fb: "To‘g‘ri. Kaykovus hunarni eng yaxshi meros deydi; kasb — butun umrlik yo‘l, uni ongli tanlash kerak." },
        { t: "Dugonalaridan ajralmaslik uchun iqtisodga hujjat topshiradi.", ok: false, fb: "Do‘stlik muhim, lekin kasb tanlash boshqalar uchun emas, o‘z kelajagi uchun." },
        { t: "Qaysi kasb ko‘p pul keltirsa, o‘shani tanlaydi.", ok: false, fb: "Faqat daromadga qarab tanlangan kasb qoniqish bermasligi mumkin." },
        { t: "Qaror qilishni keyinga qoldiradi.", ok: false, fb: "Kechikish imkoniyatlarni yo‘qotadi; tayyorgarlik oldindan boshlanadi." }
      ] },
    { id: "k11a", grades: [11], scholar: "fitrat", title: "Oiladagi kelishmovchilik",
      text: "Shahzodaning ota-onasi uning qaysi shaharda o‘qishi haqida kelisha olmayapti. Uyda tez-tez bahs bo‘lmoqda, Shahzoda o‘zini aybdor his qilyapti.",
      q: "Shahzoda qanday yo‘l tutadi?",
      opts: [
        { t: "Ota-onasi bilan xotirjam oilaviy suhbat o‘tkazib, o‘z fikrini dalillar bilan aytadi va umumiy yechim izlaydi.", ok: true, fb: "To‘g‘ri. Fitrat oilani tarbiyaning birlamchi maskani deydi; oilaviy muammolar hurmat va muloqot bilan hal etiladi." },
        { t: "Ularning gapiga aralashmay, kutib turadi.", ok: false, fb: "Masala aynan uning kelajagi haqida — fikrini aytishi kerak." },
        { t: "Tanlovni o‘zi qilib, ularga xabar ham bermaydi.", ok: false, fb: "Ota-onani chetlab o‘tish — oilaviy hurmatga zid." },
        { t: "Bahs to‘xtashi uchun o‘qishdan butunlay voz kechadi.", ok: false, fb: "Bu muammoni emas, imkoniyatni yo‘qotadi." }
      ] },
    { id: "k11b", grades: [11], scholar: "avloniy", title: "Mahalla muammosi",
      text: "Mahallangizdagi bolalar maydonchasi buzilgan, kechqurun yoritilmaydi. Ko‘pchilik shikoyat qiladi, lekin hech kim hech narsa qilmayapti.",
      q: "Faol fuqarolik pozitsiyasiga mos qadam qaysi?",
      opts: [
        { t: "Yoshlar bilan tashabbus guruhi tuzib, muammoni hujjatlashtirish va mahalla hamda hokimiyatga murojaat qilish, hasharni uyushtirish.", ok: true, fb: "To‘g‘ri. Avloniy vatanni sevishni yaxshi xulq deydi; vatan sevgisi mahalladan boshlanadigan amaliy ishda ko‘rinadi." },
        { t: "Ijtimoiy tarmoqda faqat tanqidiy post yozish.", ok: false, fb: "Muammoni ko‘rsatish yaxshi, lekin tanqid amaliy taklif bilan birga bo‘lsa samarali." },
        { t: "Boshqa mahalladagi maydonchaga borish.", ok: false, fb: "Muammodan qochish uni hal qilmaydi." },
        { t: "Kimdir hal qilar, deb kutish.", ok: false, fb: "Befarqlik — daxldorlikka zid." }
      ] }
  ],

  /* Krossvordlar: javoblar faqat lotin harflaridan, ‘ va ’ belgilarsiz. */
  crosswords: [
    { id: "kv-fazilat", title: "Fazilatlar", grades: [5, 6], words: [
      ["ODOB", "Kattaga hurmat, kichikka izzat — bu ..."],
      ["SABR", "Avloniy “buyuk bir fazilat” degan xulq"],
      ["MEHNAT", "Beruniy fikricha inson qimmatining mezoni"],
      ["ADOLAT", "“Qutadg‘u bilig”da Kuntug‘di timsoli"],
      ["ILM", "Navoiy fikricha komil axloq bilan birga eng buyuk baxt"],
      ["VIJDON", "Insonning o‘z xatti-harakatini baholovchi ichki tuyg‘usi"],
      ["SAXOVAT", "Qo‘li ochiqlik, beg‘araz yordam"],
      ["KAMTARLIK", "Maqtanchoqlikning aksi"],
      ["HALOLLIK", "Haromdan saqlanish, rostlik"],
      ["MEHR", "Yaqinlarga bo‘lgan iliq tuyg‘u"],
      ["BURCH", "Bajarilishi shart bo‘lgan majburiyat"]
    ] },
    { id: "kv-alloma", title: "Allomalar", grades: [8], words: [
      ["FOROBIY", "“Ikkinchi muallim”"],
      ["BERUNIY", "“Hindiston” asari muallifi"],
      ["AVITSENNA", "Ibn Sinoning Yevropadagi nomi"],
      ["NAVOIY", "“Xamsa” muallifi"],
      ["AVLONIY", "“Turkiy guliston yoxud axloq” muallifi"],
      ["FITRAT", "“Oila yoki oila boshqarish tartiblari” muallifi"],
      ["YASSAVIY", "“Devoni hikmat” muallifi"],
      ["KAYKOVUS", "“Qobusnoma” muallifi"],
      ["DONISH", "“Navodir ul-vaqoe” muallifi Ahmad ..."],
      ["KOSHIFIY", "“Axloqi Muhsiniy” muallifi"],
      ["YUSUF", "“Qutadg‘u bilig” muallifi ... Xos Hojib"]
    ] },
    { id: "kv-bilim", title: "Bilim va jamiyat", grades: [7, 9], words: [
      ["AXBOROT", "Tekshirib, keyin ulashiladigan ma’lumot"],
      ["JAMOA", "Forobiy fikricha inson shu yerda kamol topadi"],
      ["LIDER", "Jamoani ortidan ergashtiruvchi yetakchi"],
      ["ILM", "Beruniy: “...siz odob — zulmatda qolgan chiroq”"],
      ["SAYDANA", "Beruniyning dorivor o‘simliklar haqidagi asari"],
      ["HINDISTON", "Beruniy o‘rgangan va asar bag‘ishlagan mamlakat"],
      ["XAMSA", "Navoiyning besh dostondan iborat turkumi"],
      ["QOBUSNOMA", "Kaykovusning 44 bobli asari"],
      ["HIDOYA", "Marg‘inoniyning huquqiy asari: Al-..."],
      ["TADBIRKOR", "Halol biznes yurituvchi shaxs"]
    ] },
    { id: "kv-fuqaro", title: "Fuqaro va oila", grades: [10, 11], words: [
      ["OILA", "Fitrat: tarbiyaning birlamchi maskani"],
      ["HUQUQ", "Qonun bilan kafolatlangan imkoniyat"],
      ["BURCH", "Huquq bilan birga keladigan majburiyat"],
      ["VIJDON", "Marg‘inoniy ulug‘lagan ichki axloqiy tuyg‘u"],
      ["KASB", "Kaykovus: hunar — eng yaxshi meros; boshqacha aytganda ..."],
      ["FUQARO", "Davlatning teng huquqli a’zosi"],
      ["QONUN", "Xalq hikmati: “... — adolat mezoni”"],
      ["DAXLDORLIK", "Atrofdagi voqealarga befarq bo‘lmaslik"],
      ["VATANPARVARLIK", "Ona yurtga muhabbat va sadoqat"],
      ["MAHALLA", "O‘zbek xalqining qo‘shnichilik jamoasi"]
    ] }
  ]
};
