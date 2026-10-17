/* Platforma kontenti.
   Manba: “Tarbiya fanini o‘qitish metodikasi” darsligi (Guliston davlat universiteti).
   Malaka talablari va kompetensiya darajalari darslikning 5.1-bo‘limidan olingan. */

window.DATA = {
  research: {
    title: "Tarbiya fanini O‘rta Osiyo allomalari ilmiy merosidan foydalanib o‘qitish metodikasini takomillashtirish",
    subtitle: "Umumiy o‘rta ta’lim maktablarining 8-sinfi misolida",
    goal: "Tarbiya darslarida O‘rta Osiyo allomalarining ta’lim-tarbiyaviy g‘oyalarini tizimli qo‘llash orqali o‘quvchilarda ma’naviy-axloqiy kompetensiyalarni shakllantirish metodikasini ishlab chiqish va uning samaradorligini tajriba-sinov orqali asoslash.",
    stages: [
      { name: "Aniqlovchi bosqich", text: "Tajriba va nazorat guruhlarida dastlabki diagnostika (test va so‘rovnoma) o‘tkaziladi. Guruhlarning boshlang‘ich darajasi bir xil ekanligi tekshiriladi." },
      { name: "Shakllantiruvchi bosqich", text: "Tajriba guruhida 8-sinf moduli darslari allomalar merosi asosida o‘tiladi. Nazorat guruhida darslar an’anaviy tartibda davom etadi." },
      { name: "Nazorat bosqichi", text: "Ikkala guruhda yakuniy diagnostika o‘tkaziladi. Natijalar o‘rtacha ko‘rsatkich, samaradorlik koeffitsienti va Styudent t-mezoni bilan taqqoslanadi." }
    ]
  },

  levels: {
    A2: { name: "A2 — tayanch daraja", desc: "Umumiy o‘rta ta’limning boshlang‘ich bosqichidan keyingi tayanch daraja." },
    "A2+": { name: "A2+ — kuchaytirilgan tayanch daraja", desc: "9-sinf bitiruvchisi uchun belgilangan daraja." },
    B1: { name: "B1 — umumiy daraja", desc: "11-sinf bitiruvchisi uchun belgilangan daraja." }
  },

  scholars: [
    {
      id: "forobiy", name: "Abu Nasr Forobiy", years: "873–950", place: "Forob (O‘tror)",
      title: "“Ikkinchi muallim”, “Sharq Aristoteli”",
      works: ["Fozil odamlar shahri", "Baxt-saodatga erishish haqida", "Kitob al-musiqa al-kabir"],
      ideas: [
        "Fozil inson va fozil jamoa g‘oyasi: jamiyat taraqqiyoti axloqiy tarbiya bilan uyg‘un bo‘ladi.",
        "Ta’lim so‘z va o‘rgatish orqali, tarbiya esa amaliy ish va mashq orqali amalga oshadi.",
        "Komil bo‘lish uchun inson tafakkuri yuksak darajada rivojlangan bo‘lishi lozim.",
        "Inson tabiatan ijtimoiy mavjudot, u boshqalar bilan hamkorlikda kamol topadi."
      ],
      quote: "Insondagi fazilat ham, nuqson ham tarbiya orqali hosil bo‘ladi. Qaysi xislat ustida tarbiya va mashq ko‘p bo‘lsa, o‘sha sifat kuchayadi.",
      grades: [6, 7, 8, 9, 11]
    },
    {
      id: "beruniy", name: "Abu Rayhon Beruniy", years: "973–1048", place: "Kat (Xorazm)",
      title: "Qomusiy olim",
      works: ["Qadimgi xalqlardan qolgan yodgorliklar", "Hindiston", "Mas’ud qonuni", "Saydana"],
      ideas: [
        "Insonning qimmati uning mehnati va o‘z ishini mahorat bilan bajarishi bilan o‘lchanadi.",
        "Inson ongi bilan farqlanadi: u kelajakni ko‘ra oladi va ehtiyot choralarini ko‘radi.",
        "Tarbiya va muhit insonning qaysi yo‘nalishda shakllanishini belgilaydi.",
        "Ilm va odob bir-biridan ajralmas; bilim xolis va tanqidiy o‘rganilishi kerak."
      ],
      quote: "Inson tabiatan hamma narsaga moyil bo‘ladi, lekin unga yo‘l ko‘rsatadigan tarbiya va muhit qaysi tomonga og‘irlik qilsa, u ham o‘sha yo‘nalishda shakllanadi.",
      grades: [6, 7, 8, 11]
    },
    {
      id: "ibnsino", name: "Abu Ali ibn Sino", years: "980–1037", place: "Afshona (Buxoro)",
      title: "“Shayx ur-rais”",
      works: ["Tib qonunlari", "Donishnoma", "Tadbir al-manozil", "Axloq haqida risola"],
      ideas: [
        "Tarbiya tug‘ma emas, ijtimoiy muhit mahsuli; xulq odamlar bilan muloqotda shakllanadi.",
        "Ta’lim-tarbiyani erta, olti yoshdan boshlash lozim; jamoaviy ta’lim samaraliroq.",
        "Insonni tarbiyalash aqliy va jismoniy rivojlanish birligini ta’minlashdir.",
        "Ota oilada xulq, muloqot, nutq madaniyati va rostgo‘ylikda namuna bo‘lishi kerak."
      ],
      quote: "Kichik bolaning idrok kuchi kattalarniki bilan barobardir.",
      grades: [5, 6, 7, 8, 11]
    },
    {
      id: "koshgariy", name: "Mahmud Koshg‘ariy", years: "XI asr", place: "Koshg‘ar",
      title: "Tilshunos, birinchi turkiy qomus muallifi",
      works: ["Devonu lug‘otit turk"],
      ideas: [
        "Xalq maqollari va hikmatlari orqali odob, mehnat va do‘stlik saboqlarini beradi.",
        "Ona tili xalqning ma’naviy xazinasi sifatida qadrlanadi."
      ],
      quote: null,
      grades: [5]
    },
    {
      id: "yusuf", name: "Yusuf Xos Hojib", years: "XI asr", place: "Bolasog‘un",
      title: "Shoir va mutafakkir",
      works: ["Qutadg‘u bilig (1069–1070)"],
      ideas: [
        "Adolat, vatanparvarlik, halollik va ilmga intilish fazilatlarini targ‘ib qiladi.",
        "Asar to‘rt timsolga qurilgan: Kuntug‘di — adolat, Oyto‘ldi — davlat va baxt, O‘gdulmish — aql, O‘zg‘urmish — qanoat va oxirat.",
        "Bilim insonni baxtga eltuvchi yo‘l, rahbar esa bilimli va adolatli bo‘lishi kerak."
      ],
      quote: "Farzand ota-onadan ko‘rgan odat va axloq asosida shakllanadi.",
      grades: [8, 9]
    },
    {
      id: "kaykovus", name: "Kaykovus", years: "XI asr", place: "Gurgon",
      title: "Adib, “Qobusnoma” muallifi",
      works: ["Qobusnoma (44 bob)"],
      ideas: [
        "Ota-onaning farzand tarbiyasidagi vazifa va burchlarini ochib beradi.",
        "Muomala odobi, kattani hurmat qilish, haqorat va qo‘pollikdan saqlanishni o‘rgatadi.",
        "Farzandga ilm bilan birga hunar o‘rgatishni eng yaxshi meros deb biladi."
      ],
      quote: "Farzandga adab, hunar o‘rgatmakni meros deb bilg‘il.",
      grades: [5, 6, 8, 10]
    },
    {
      id: "yassaviy", name: "Xoja Ahmad Yassaviy", years: "XI–XII asrlar (vaf. 1166)", place: "Sayram, Yassi",
      title: "Mutasavvuf shoir",
      works: ["Devoni hikmat"],
      ideas: [
        "Ayyorlik va gunohni yashirish o‘zgalarga xiyonat hisoblanadi.",
        "Rostgo‘ylik, halollik va o‘z-o‘ziga talabchanlikni targ‘ib qiladi.",
        "Zahmat chekkan odam sabrli, bardoshli va irodali bo‘ladi.",
        "Hushyorlik shaxsni faol harakatga undaydi, fitna va fisqu fasoddan saqlaydi."
      ],
      quote: null,
      grades: [5, 8, 9]
    },
    {
      id: "marginoniy", name: "Burhoniddin Marg‘inoniy", years: "1123–1197", place: "Rishton (Marg‘ilon)",
      title: "Faqih, huquqshunos",
      works: ["Al-Hidoya"],
      ideas: [
        "Diyonat, iymon, vijdon, burch va insoniylik shaxsni uyg‘un rivojlantiradi.",
        "Erkinlik, insonparvarlik, mehnatsevarlik, odillik va mustaqil fikrni ulug‘laydi.",
        "Axloqiy va huquqiy tarbiya bir-biri bilan bog‘liq holda olib boriladi."
      ],
      quote: null,
      grades: [8, 10]
    },
    {
      id: "navoiy", name: "Alisher Navoiy", years: "1441–1501", place: "Hirot",
      title: "Shoir, mutafakkir, davlat arbobi",
      works: ["Mahbub ul-qulub", "Hayrat ul-abror", "Nasoyim ul-muhabbat", "Makorim ul-axloq"],
      ideas: [
        "Inson uchun eng buyuk baxt komil axloq va ilmdir.",
        "Komil insonda halol rizq bilan qanoat, kamtarlik, shirinsuxanlik, rahm-shafqat, saxovat, sabr va vafo bo‘ladi.",
        "Ota-onani hurmat qilish farzand uchun majburiyatdir.",
        "Yaxshi farzand oilaning davlati va baxtidir."
      ],
      quote: "Bu ikkisiga xizmatni birdek qil, xizmating qancha ortiq bo‘lsa ham, kam deb bil.",
      grades: [5, 7, 8, 9]
    },
    {
      id: "koshifiy", name: "Husayn Voiz Koshifiy", years: "XV asr (vaf. 1505)", place: "Hirot",
      title: "Notiq va axloqshunos",
      works: ["Axloqi Muhsiniy (40 bob)"],
      ideas: [
        "Yaxshi xulqlar (sabr, saxovat, kamtarlik, vafo) va ularni tarbiyalash yo‘llarini bayon etadi.",
        "Axloqni amaliy hayot misollari va hikoyatlar orqali o‘rgatadi."
      ],
      quote: null,
      grades: [7]
    },
    {
      id: "donish", name: "Ahmad Donish", years: "1827–1897", place: "Buxoro",
      title: "Ma’rifatparvar mutafakkir",
      works: ["Navodir ul-vaqoe"],
      ideas: [
        "Jamiyat taraqqiyotini ilm-fan, ma’rifat va adolatli boshqaruvda ko‘radi.",
        "Yoshlarni dunyoviy bilimlarni egallashga, mehnat va kasbga chorlaydi."
      ],
      quote: null,
      grades: [10]
    },
    {
      id: "avloniy", name: "Abdulla Avloniy", years: "1878–1934", place: "Toshkent",
      title: "Pedagog, jadid ma’rifatparvari",
      works: ["Turkiy guliston yoxud axloq (1913)"],
      ideas: [
        "Tarbiyani inson hayotining asosiy tayanchi deb biladi.",
        "Xulqlarni yaxshi va yomon xulqlarga ajratib, har birini hayotiy misollar bilan tushuntiradi.",
        "Sabr, ilm, vatanni sevish va mehnatni yaxshi xulqlar qatoriga qo‘yadi."
      ],
      quote: "Tarbiya biz uchun yo hayot — yo mamot, yo najot — yo halokat, yo saodat — yo falokat masalasidir.",
      grades: [6, 8, 9, 11]
    },
    {
      id: "fitrat", name: "Abdurauf Fitrat", years: "1886–1938", place: "Buxoro",
      title: "Jadid adibi va olimi",
      works: ["Oila yoki oila boshqarish tartiblari (1916)"],
      ideas: [
        "Xalqning taqdiri bolalikdan olingan tarbiyaga bog‘liq.",
        "Oila — tarbiyaning birlamchi maskani, ota-ona farzand kamoloti uchun mas’ul."
      ],
      quote: "Xalqning aniq bir maqsad sari harakat qilishi, davlatmand bo‘lishi, baxtli bo‘lib izzat-hurmat topishi... ularning o‘z ota-onalaridan bolalikdan olgan tarbiyalariga bog‘liq.",
      grades: [10, 11]
    }
  ],

  methods: [
    { id: "suhbat", name: "Suhbat", type: "An’anaviy", text: "O‘qituvchi va o‘quvchilar savol-javob orqali muloqot qiladi. Mustaqil fikrlash va o‘z qarashini ifodalashni rivojlantiradi.", steps: ["Mavzuga oid muammoli savol qo‘yiladi.", "O‘quvchilar fikr bildiradi, o‘qituvchi yo‘naltiradi.", "Alloma fikri bilan solishtirib xulosa chiqariladi."], example: "“Odobli bola qanday bo‘lishi kerak?”" },
    { id: "bahs", name: "Bahs-munozara", type: "An’anaviy", text: "Tanqidiy fikrlash, o‘z qarashini dalillash ko‘nikmasini shakllantiradi.", steps: ["Ikki qarama-qarshi pozitsiya belgilanadi.", "Guruhlar dalil tayyorlaydi (5 daqiqa).", "Navbat bilan chiqish va savollar.", "Umumiy xulosa."], example: "“Haqiqiy do‘st qanday bo‘ladi?”" },
    { id: "guruh", name: "Guruhli ishlash", type: "Interfaol", text: "Kichik guruhlarda topshiriq bajarish jamoada ishlash, hamkorlik va mas’uliyatni shakllantiradi.", steps: ["Sinf 4–5 kishilik guruhlarga bo‘linadi.", "Har guruhga bitta alloma yoki matn beriladi.", "Guruh natijani taqdim etadi."], example: "Har guruh bir alloma qarashlari asosida barkamol shaxs modelini tuzadi." },
    { id: "klaster", name: "Klaster", type: "Interfaol", text: "Mavzuga oid asosiy tushunchalar grafik ko‘rinishda bog‘lanadi.", steps: ["Doska markaziga tayanch so‘z yoziladi.", "O‘quvchilar bog‘liq tushunchalarni tarmoq ko‘rinishida qo‘shadi.", "Tarmoqlar allomalar fikri bilan to‘ldiriladi."], example: "“Mehnatsevarlik” klasteri" },
    { id: "rol", name: "Rol o‘ynash", type: "Interfaol", text: "Tarbiyaviy vaziyatlar jonli sahnalashtiriladi. O‘quvchi real hayotda to‘g‘ri yo‘l tutishni o‘rganadi.", steps: ["Vaziyat va rollar taqsimlanadi.", "Sahna 3–5 daqiqa ijro etiladi.", "Tomoshabinlar xatti-harakatlarni tahlil qiladi."], example: "“Qobusnoma” asosida mehmon kutish odobi" },
    { id: "keys", name: "Keys-stadi", type: "Interfaol", text: "Aniq hayotiy vaziyat tahlil qilinib, muammoga yechim topiladi.", steps: ["Keys matni o‘qiladi.", "Muammo aniqlanadi.", "Yechim variantlari va oqibatlari muhokama qilinadi.", "Eng maqbul yechim allomalar g‘oyasi bilan asoslanadi."], example: "“Sinfdoshlar o‘rtasida kelishmovchilik yuzaga kelsa, qanday yo‘l tutish kerak?”" },
    { id: "aqliy", name: "Aqliy hujum", type: "Interfaol", text: "Qisqa vaqtda iloji boricha ko‘p g‘oya to‘planadi, tanqid keyinga qoldiriladi.", steps: ["Savol qo‘yiladi.", "3–5 daqiqa ichida barcha g‘oyalar yoziladi.", "G‘oyalar saralanadi va baholanadi."], example: "“Fozil jamoa a’zosi qanday bo‘ladi?”" },
    { id: "baliq", name: "Baliq skeleti", type: "Interfaol", text: "Muammoning sabablari va oqibatlari tizimli tahlil qilinadi.", steps: ["“Bosh”ga muammo yoziladi.", "Yuqori suyaklarga sabablar, pastkilariga dalillar yoziladi.", "“Dum”ga yechim yoziladi."], example: "“Nima uchun ayrim yoshlar yot g‘oyalar ta’siriga tushadi?”" },
    { id: "insert", name: "Insert", type: "Interfaol", text: "Matnni belgilar bilan faol o‘qish usuli.", steps: ["V — bilaman", "+ — men uchun yangi", "− — boshqacha o‘ylardim", "? — tushunarsiz, savolim bor"], example: "“Qutadg‘u bilig”dan parcha o‘qish" },
    { id: "blits", name: "Blits-so‘rov", type: "Interfaol", text: "Tezkor savollar orqali bilimlar mustahkamlanadi.", steps: ["O‘qituvchi qisqa savollar beradi.", "O‘quvchilar 5–10 soniyada javob beradi.", "To‘g‘ri javoblar darhol izohlanadi."], example: "“Qaysi alloma qaysi asar muallifi?”" },
    { id: "loyiha", name: "Loyiha", type: "Innovatsion", text: "O‘quvchilar mavzu bo‘yicha loyiha tayyorlab, uni taqdim etadi. Tadqiqot va jamoada ishlash ko‘nikmasi rivojlanadi.", steps: ["Mavzu va muddat belgilanadi.", "Guruh ma’lumot to‘playdi.", "Taqdimot (slayd, plakat, video) tayyorlanadi.", "Himoya va baholash."], example: "“Mening allomam” loyihasi" },
    { id: "oyin", name: "Didaktik o‘yin", type: "Innovatsion", text: "O‘yin motivatsiyani oshiradi va bilimni mustahkamlaydi.", steps: ["O‘yin qoidasi tushuntiriladi.", "Jamoalar bellashadi.", "G‘oliblar aniqlanadi, xulosa qilinadi."], example: "“Topqirlar bellashuvi”, “Kim chaqqon?”" }
  ],

  grades: {
    5: {
      age: "10–11 yosh", level: "A2",
      focus: "Odob asoslari, mas’uliyat va sog‘lom turmush tarzi",
      requirements: [
        "mustaqil tafakkurga ega bo‘ladi;",
        "mas’uliyat va majburiyatiga amal qiladi;",
        "shaxs sifatida o‘zini anglaydi;",
        "mustaqil sog‘lom fikrga ega bo‘ladi;",
        "favqulodda vaziyatlarda to‘g‘ri harakatlanishni biladi;",
        "orasta kiyinadi va sog‘lom turmush tarziga amal qiladi."
      ],
      topics: [
        { title: "Odob — ilk saboq", scholar: "koshgariy", idea: "“Devonu lug‘otit turk”dagi maqollar orqali odob, kattaga hurmat va kichikka izzat tushunchalari o‘rganiladi.", method: "klaster", task: "Odob haqida 5 ta maqol yozib, ma’nosini tushuntiring." },
        { title: "Ota-onaga hurmat", scholar: "navoiy", idea: "Navoiy ota-onaga xizmatni “qancha ortiq bo‘lsa ham, kam deb bil” deydi. Farzandning burchi muhokama qilinadi.", method: "suhbat", task: "“Men oilamga qanday yordam beraman?” mavzusida kichik hikoya yozing." },
        { title: "Sog‘lom tanda — sog‘lom aql", scholar: "ibnsino", idea: "Ibn Sino tarbiyani aqliy va jismoniy rivojlanish birligi deb biladi. Kun tartibi, ovqatlanish va harakat.", method: "oyin", task: "Bir haftalik kun tartibingizni tuzing." },
        { title: "Burch va mas’uliyat", scholar: "kaykovus", idea: "“Qobusnoma”da farzand va ota-ona burchlari. O‘z vazifasini vaqtida bajarish odobi.", method: "rol", task: "Sinfdagi navbatchilik burchlari ro‘yxatini tuzing." },
        { title: "Rostgo‘ylik", scholar: "yassaviy", idea: "Yassaviy ayyorlik va yolg‘onni xiyonat deb biladi. Rost so‘zlash insonga ishonch keltiradi.", method: "keys", task: "Rostgo‘ylik sizga yordam bergan voqeani yozing." }
      ],
      quiz: [
        { q: "“Devonu lug‘otit turk” asarining muallifi kim?", a: ["Mahmud Koshg‘ariy", "Alisher Navoiy", "Ibn Sino", "Beruniy"], c: 0 },
        { q: "Ibn Sino fikricha, tarbiya nimaning birligini ta’minlaydi?", a: ["Boylik va mansab", "Aqliy va jismoniy rivojlanish", "Faqat o‘yin", "Faqat mehnat"], c: 1 },
        { q: "“Qobusnoma” nechta bobdan iborat?", a: ["12", "40", "44", "100"], c: 2 },
        { q: "Yassaviy fikricha, gunohni yashirish nima hisoblanadi?", a: ["Ehtiyotkorlik", "Xiyonat", "Kamtarlik", "Sabr"], c: 1 }
      ]
    },
    6: {
      age: "11–12 yosh", level: "A2",
      focus: "O‘zini o‘zi rivojlantirish, muloqot madaniyati va mehnatsevarlik",
      requirements: [
        "o‘z faoliyatini tahlil qiladi, baholaydi;",
        "o‘zini-o‘zi rivojlantiradi, maqsadlari sari intiladi;",
        "mas’uliyat va majburiyatini bajaradi;",
        "o‘z-o‘ziga xizmat ko‘rsatishga odatlanadi;",
        "o‘z oldiga maqsad qo‘ya oladi;",
        "mustaqil sog‘lom fikrlaydi;",
        "muloqot madaniyatiga rioya qiladi;",
        "ma’naviy-axloq me’yorlarga rioya qiladi."
      ],
      topics: [
        { title: "Ta’lim va tarbiya — mashq orqali", scholar: "forobiy", idea: "Forobiy: qaysi xislat ustida mashq ko‘p bo‘lsa, o‘sha sifat kuchayadi. O‘z odatlarini tahlil qilish.", method: "insert", task: "Rivojlantirmoqchi bo‘lgan bitta odatingiz va unga 21 kunlik reja tuzing." },
        { title: "Muomala odobi", scholar: "kaykovus", idea: "“Qobusnoma”da so‘zlash, tinglash va kattalar bilan muomala odobi.", method: "rol", task: "Telefon va onlayn muloqot odobi qoidalarini yozing." },
        { title: "Mehnat — inson qimmati", scholar: "beruniy", idea: "Beruniy insonni o‘z ishini mahorat bilan bajarishiga qarab baholaydi.", method: "klaster", task: "Uyda o‘zingiz bajaradigan ishlar ro‘yxatini tuzing." },
        { title: "Yaxshi va yomon xulqlar", scholar: "avloniy", idea: "Avloniy “Turkiy guliston yoxud axloq”da xulqlarni yaxshi va yomonga ajratadi.", method: "guruh", task: "Ikki ustunli jadval: yaxshi xulqlar / yomon xulqlar." },
        { title: "Maqsad sari intilish", scholar: "ibnsino", idea: "Ibn Sino yoshligidan ilmga intilib, yosh tabib bo‘lib yetishgan. Maqsad qo‘yish va reja tuzish.", method: "suhbat", task: "Bir yillik o‘quv maqsadingizni yozing." }
      ],
      quiz: [
        { q: "Forobiyning faxriy unvoni qaysi?", a: ["Shayx ur-rais", "Ikkinchi muallim", "Sulton ul-ulamo", "Hujjat ul-islom"], c: 1 },
        { q: "Beruniy fikricha, inson qimmatining asosiy mezoni nima?", a: ["Kiyimi", "Nasl-nasabi", "Mehnati va ishi", "Boyligi"], c: 2 },
        { q: "“Turkiy guliston yoxud axloq” muallifi kim?", a: ["Abdulla Avloniy", "Fitrat", "Behbudiy", "Navoiy"], c: 0 },
        { q: "Forobiy fikricha, xislat qanday kuchayadi?", a: ["O‘z-o‘zidan", "Tarbiya va mashq ko‘p bo‘lsa", "Faqat irsiyat orqali", "Yosh o‘tishi bilan"], c: 1 }
      ]
    },
    7: {
      age: "12–13 yosh", level: "A2",
      focus: "Bilimga intilish, axborot madaniyati va jamoada ijodkorlik",
      requirements: [
        "o‘z harakatlarini baholaydi;",
        "bilimli bo‘lish zarurligini anglaydi;",
        "jismoniy va intellektual imkoniyatlarini rivojlantiradi;",
        "jamoa bilan hamkorlikda kreativ sifatlarini namoyon qiladi;",
        "axborot olish, uni tahlil qilish, axborot madaniyatiga ega bo‘ladi;",
        "yon-atrofida bo‘layotgan voqea-hodisalarga dahldor bo‘ladi."
      ],
      topics: [
        { title: "Ilm — kamolot kaliti", scholar: "beruniy", idea: "Beruniy ilm va odobni ajralmas deb biladi. Bilimli bo‘lish nima uchun zarur?", method: "aqliy", task: "Beruniy kashfiyotlaridan biri haqida qisqa ma’lumot tayyorlang." },
        { title: "Axborotni tekshirish odobi", scholar: "beruniy", idea: "Beruniy turli manbalarni solishtirib, xolis xulosa chiqargan. Internetdagi xabarni tekshirish usullari.", method: "keys", task: "Bitta xabarni ikki manba orqali tekshirib, natijani yozing." },
        { title: "Jamoada kamol topish", scholar: "forobiy", idea: "Forobiy insonni ijtimoiy mavjudot deb biladi: kamolot hamkorlikda erishiladi.", method: "guruh", task: "Sinf uchun foydali kichik loyiha g‘oyasini taklif qiling." },
        { title: "Yaxshi xulq hikoyatlarda", scholar: "koshifiy", idea: "“Axloqi Muhsiniy”dagi hikoyatlar orqali sabr, saxovat va kamtarlik.", method: "rol", task: "Bitta hikoyatni sahnalashtiring." },
        { title: "Xalqqa daxldorlik", scholar: "navoiy", idea: "Navoiy madrasa, shifoxona va ko‘priklar qurdirgan. Atrofdagi muammolarga befarq bo‘lmaslik.", method: "loyiha", task: "Mahallangizdagi bitta muammo va uning yechimini yozing." }
      ],
      quiz: [
        { q: "Beruniy qaysi asar muallifi?", a: ["Qadimgi xalqlardan qolgan yodgorliklar", "Qobusnoma", "Mahbub ul-qulub", "Devoni hikmat"], c: 0 },
        { q: "“Axloqi Muhsiniy” muallifi kim?", a: ["Husayn Voiz Koshifiy", "Kaykovus", "Ahmad Donish", "Yusuf Xos Hojib"], c: 0 },
        { q: "Forobiy fikricha, inson qanday mavjudot?", a: ["Yolg‘iz", "Ijtimoiy", "Faqat biologik", "O‘zgarmas"], c: 1 },
        { q: "Internetdagi xabarni tekshirishning to‘g‘ri yo‘li qaysi?", a: ["Darhol ulashish", "Bir necha ishonchli manbaga solishtirish", "Sarlavhaga ishonish", "Izohlarni o‘qish"], c: 1 }
      ]
    },
    9: {
      age: "14–15 yosh", level: "A2+",
      focus: "Hissiyotlarni boshqarish, liderlik, tadbirkorlik va axborot xavfsizligi",
      requirements: [
        "maqsad qo‘ya oladi va uni amalga oshirishga harakat qiladi;",
        "mas’uliyat va majburiyatiga amal qiladi;",
        "hislarini anglaydi va nazorat qila oladi;",
        "mustaqil sog‘lom fikrga ega bo‘ladi;",
        "pul topish ko‘nikmalari shakllanadi;",
        "liderlik sifatlarini namoyon etadi;",
        "biznes va tadbirkorlik g‘oyalarini ilgari sura oladi;",
        "kreativ sifatlarini namoyon qiladi;",
        "to‘g‘ri qaror qabul qiladi;",
        "sog‘lom turmush tarziga rioya qiladi va uni targ‘ib qiladi;",
        "faol fuqarolik pozitsiyasiga ega bo‘ladi;",
        "axborotni tahlil qila oladi va axborot xavfsizligidan himoyalana oladi;",
        "bag‘rikenglikni namoyon qila oladi."
      ],
      topics: [
        { title: "Sabr va o‘zini boshqarish", scholar: "avloniy", idea: "Avloniy sabrni “buyuk bir fazilat” deydi. Yassaviy zahmatdan iroda tug‘ilishini aytadi.", method: "keys", task: "G‘azab paytida o‘zini tutishning 3 usulini yozing." },
        { title: "Adolatli yetakchi", scholar: "yusuf", idea: "“Qutadg‘u bilig”dagi Kuntug‘di — adolat timsoli. Lider bilimli va adolatli bo‘ladi.", method: "bahs", task: "Sinf sardori uchun 5 ta qoida tuzing." },
        { title: "Halol rizq va tadbirkorlik", scholar: "navoiy", idea: "Navoiy komil inson sifatlari qatoriga halol rizq bilan qanoatni qo‘yadi.", method: "loyiha", task: "Kichik halol biznes g‘oyasini reja ko‘rinishida yozing." },
        { title: "Bag‘rikenglik", scholar: "forobiy", idea: "Halollik, mehmondo‘stlik, kattaga hurmat kabi qadriyatlar bag‘rikenglikni mustahkamlaydi.", method: "guruh", task: "Turli millat vakillari do‘stligi haqida misol keltiring." },
        { title: "Axborot xavfsizligi", scholar: "beruniy", idea: "Ijtimoiy tarmoqlar orqali yot g‘oyalar tarqatiladi. Tanqidiy fikrlash ma’naviy immunitet beradi.", method: "baliq", task: "Shubhali xabarni aniqlash belgilarini sanab bering." }
      ],
      quiz: [
        { q: "“Qutadg‘u bilig”da adolat timsoli kim?", a: ["Kuntug‘di", "Oyto‘ldi", "O‘gdulmish", "O‘zg‘urmish"], c: 0 },
        { q: "Avloniy sabrni qanday ta’riflaydi?", a: ["Zaiflik", "Buyuk bir fazilat", "Befarqlik", "Odat"], c: 1 },
        { q: "Ma’naviy immunitetning asosiy vositasi qaysi?", a: ["Internetdan uzilish", "Tanqidiy fikrlash va bilim", "Ko‘p obunachi", "Mashhurlik"], c: 1 },
        { q: "Navoiy komil inson sifatlari qatoriga nimani qo‘yadi?", a: ["Halol rizq bilan qanoat", "Mansabparastlik", "Isrofgarchilik", "Maqtanchoqlik"], c: 0 }
      ]
    },
    10: {
      age: "15–16 yosh", level: "A2+",
      focus: "Ma’naviy tahdidlar, huquq va burch, kasb-hunar",
      requirements: [
        "hislarini anglaydi va nazorat qila oladi;",
        "pul topish ko‘nikmalari shakllanadi;",
        "biznes va tadbirkorlik g‘oyalarini ilgari sura oladi;",
        "kreativ sifatlarni namoyon qiladi;",
        "ma’naviy tahdidlarni anglaydi va baholaydi;",
        "ma’naviy, ruhiy va intellektual kamolotga intiladi;",
        "o‘zini-o‘zi nazorat qila oladi;",
        "daxldorlikni his etadi va faol ishtirok etadi;",
        "zamonaviy kasblar haqida tasavvurga ega bo‘ladi;",
        "o‘zining fuqarolik burch va huquqlarini biladi."
      ],
      topics: [
        { title: "Ma’naviy tahdidlarni anglash", scholar: "marginoniy", idea: "Buyuk allomalar asarlari milliy tarbiyaning bosh g‘oyasi bo‘lib qolishi lozim. Yot g‘oyalarga qarshi ma’naviy immunitet.", method: "baliq", task: "“Ommaviy madaniyat”ning salbiy ko‘rinishlarini tahlil qiling." },
        { title: "Huquq, burch va vijdon", scholar: "marginoniy", idea: "Marg‘inoniy diyonat, vijdon va burchni shaxs kamolotining asosi deb biladi.", method: "keys", task: "Konstitutsiyadagi bitta huquq va unga mos burchni yozing." },
        { title: "Hunar — eng yaxshi meros", scholar: "kaykovus", idea: "“Qobusnoma”: farzandga adab va hunar o‘rgatish meros sanaladi. Zamonaviy kasblar.", method: "loyiha", task: "Qiziqqan kasbingiz haqida ma’lumot va unga yo‘l xaritasini tuzing." },
        { title: "Ma’rifat va taraqqiyot", scholar: "donish", idea: "Ahmad Donish taraqqiyotni ilm-fan va adolatli boshqaruvda ko‘radi.", method: "bahs", task: "“Bilim — eng katta boylik” mavzusida esse yozing." },
        { title: "Daxldorlik", scholar: "fitrat", idea: "Fitrat xalqning taqdiri tarbiyaga bog‘liq deydi. Jamiyat hayotida faol ishtirok.", method: "guruh", task: "Volontyorlik tashabbusi rejasini tuzing." }
      ],
      quiz: [
        { q: "“Al-Hidoya” muallifi kim?", a: ["Burhoniddin Marg‘inoniy", "Imom Buxoriy", "Ahmad Donish", "Fitrat"], c: 0 },
        { q: "“Navodir ul-vaqoe” muallifi kim?", a: ["Ahmad Donish", "Avloniy", "Koshifiy", "Navoiy"], c: 0 },
        { q: "Kaykovus nimani eng yaxshi meros deydi?", a: ["Oltin", "Adab va hunar", "Uy-joy", "Mansab"], c: 1 },
        { q: "Fitrat fikricha, xalq taqdiri nimaga bog‘liq?", a: ["Tasodifga", "Bolalikdan olingan tarbiyaga", "Iqlimga", "Qo‘shnilarga"], c: 1 }
      ]
    },
    11: {
      age: "16–17 yosh", level: "B1",
      focus: "Kasb tanlash, oilaviy qadriyatlar, fuqarolik va ijtimoiy hayotga tayyorgarlik",
      requirements: [
        "hislarini anglaydi va nazorat qila oladi;",
        "pul topish ko‘nikmalari shakllanadi;",
        "kasb tanlash to‘g‘risida qaror qabul qila oladi;",
        "biznes va tadbirkorlik g‘oyalarini ilgari sura oladi;",
        "kreativ sifatlarini namoyon qiladi;",
        "oilaviy qadriyatlarning mohiyatini anglaydi;",
        "sog‘lom fikrga ega bo‘ladi, muammolarni yecha oladi;",
        "vatan oldidagi huquq, burch va majburiyatlarini biladi, amal qiladi;",
        "kommunikativlik, liderlik qobiliyatini namoyon qiladi;",
        "maqsadlarini amalga oshirish uchun ilmiy, fuqarolik savodxonligini namoyon qiladi;",
        "faol fuqarolik pozitsiyasiga ega bo‘ladi;",
        "ma’naviy-axloqiy qadriyatlarga ega bo‘ladi;",
        "axborot bilan ishlash ko‘nikmasi shakllanadi;",
        "muvaffaqiyatli ijtimoiy hayotga tayyorligini namoyon qila oladi."
      ],
      topics: [
        { title: "Oila — ma’naviy qo‘rg‘on", scholar: "fitrat", idea: "Fitratning “Oila” asari, Ibn Sinoning “Tadbir al-manozil” risolasi va “Avesto”dagi oila haqidagi qarashlar.", method: "klaster", task: "“Baxtli oilaning 5 sharti” klasterini tuzing." },
        { title: "Ota — oilada namuna", scholar: "ibnsino", idea: "Ibn Sino: oila boshlig‘i tajribasiz va ojiz bo‘lsa, oila a’zolariga yaxshi tarbiya bera olmaydi.", method: "bahs", task: "Ota-ona va farzand munosabatlari haqida esse yozing." },
        { title: "Kasb tanlash", scholar: "beruniy", idea: "Beruniy insonni o‘z ishini mohirona bajarishiga qarab baholagan. Kasb — qiziqish va mahorat uyg‘unligi.", method: "loyiha", task: "Shaxsiy kasbiy rejangizni 3 bosqichda yozing." },
        { title: "Vatan va fuqarolik", scholar: "avloniy", idea: "Avloniy vatanni sevishni yaxshi xulqlar qatoriga qo‘yadi. Fuqarolik burchi va faollik.", method: "guruh", task: "Mahalla uchun fuqarolik tashabbusi loyihasini yozing." },
        { title: "Baxt-saodatga erishish", scholar: "forobiy", idea: "Forobiy baxtni ezgu fazilatlar va bilim orqali erishiladigan maqsad deb biladi.", method: "suhbat", task: "“Men uchun baxt nima?” mavzusida mulohaza yozing." }
      ],
      quiz: [
        { q: "“Oila yoki oila boshqarish tartiblari” muallifi kim?", a: ["Fitrat", "Avloniy", "Qodiriy", "Cho‘lpon"], c: 0 },
        { q: "Ibn Sinoning oila tarbiyasiga bag‘ishlangan risolasi qaysi?", a: ["Tadbir al-manozil", "Tib qonunlari", "Hindiston", "Saydana"], c: 0 },
        { q: "11-sinf bitiruvchisi uchun belgilangan daraja qaysi?", a: ["A1", "A2", "A2+", "B1"], c: 3 },
        { q: "Forobiyning baxt haqidagi risolasi qaysi?", a: ["Baxt-saodatga erishish haqida", "Mahbub ul-qulub", "Qobusnoma", "Hidoya"], c: 0 }
      ]
    }
  },

  /* 8-sinf: dissertatsiya tajriba moduli */
  grade8: {
    age: "13–14 yosh", level: "A2 → A2+",
    focus: "O‘rta Osiyo allomalari merosi asosida ma’naviy-axloqiy kompetensiyalarni shakllantirish",
    requirements: [
      "to‘g‘ri qaror qabul qiladi;",
      "jismoniy va intellektual imkoniyatlarini rivojlantiradi;",
      "kommunikativlik, faollik, tashkilotchilik, tashabbuskorlik ko‘rsatadi;",
      "axborot va ekomadaniyatga ega bo‘ladi;",
      "sog‘lom turmush tarziga amal qiladi va targ‘ib qiladi;",
      "umuminsoniy va milliy madaniyatga rioya qiladi;",
      "faol fuqarolik pozitsiyasiga ega bo‘ladi."
    ],
    principles: [
      { name: "Merosga tayanish", text: "Har bir dars bitta alloma va uning asaridagi aniq g‘oyaga quriladi." },
      { name: "Kompetensiyaga yo‘naltirilganlik", text: "Har bir dars 8-sinf malaka talablaridan biriga xizmat qiladi." },
      { name: "Faollik", text: "Interfaol metodlar orqali o‘quvchi g‘oyani o‘zi tahlil qiladi va hayotga bog‘laydi." },
      { name: "Uzviylik", text: "Dars mavzusi oila, mahalla va maktab hayotidagi vaziyatlar bilan bog‘lanadi." }
    ],
    lessons: [
      {
        id: "d1", title: "Ajdodlar merosi — tarbiya manbai", scholar: "avloniy", work: "Turkiy guliston yoxud axloq",
        competency: "umuminsoniy va milliy madaniyatga rioya qiladi",
        goals: {
          talimiy: "O‘rta Osiyo allomalari va ularning tarbiyaga oid asosiy asarlari bilan tanishtirish.",
          tarbiyaviy: "Milliy merosga hurmat va g‘urur tuyg‘usini shakllantirish.",
          rivojlantiruvchi: "Ma’lumotni tizimlashtirish va xronologik tartibga solish ko‘nikmasini rivojlantirish."
        },
        quote: "Tarbiya biz uchun yo hayot — yo mamot, yo najot — yo halokat, yo saodat — yo falokat masalasidir.",
        flow: [
          { t: 5, name: "Tashkiliy qism", text: "Avloniy iqtibosi doskaga yoziladi. “Nima uchun tarbiya hayot-mamot masalasi?” degan savol qo‘yiladi." },
          { t: 10, name: "Aqliy hujum", text: "O‘quvchilar biladigan allomalar nomlarini aytadi, o‘qituvchi ularni “vaqt chizig‘i”ga joylaydi (IX–XX asrlar)." },
          { t: 15, name: "Guruhli ishlash", text: "4 guruhga allomalar kartochkalari beriladi: Forobiy, Ibn Sino, Navoiy, Avloniy. Har guruh: yashagan davri, asari, bitta tarbiyaviy g‘oyasi." },
          { t: 10, name: "Taqdimot", text: "Guruhlar 2 daqiqadan taqdimot qiladi, qolganlar savol beradi." },
          { t: 5, name: "Refleksiya", text: "“Bugun men uchun yangi bo‘lgan alloma va uning bir fikri” — har bir o‘quvchi bir jumla yozadi." }
        ],
        questions: ["Nima uchun Avloniy tarbiyani hayot-mamot masalasi deydi?", "Qaysi alloma g‘oyasi bugun siz uchun eng dolzarb?"],
        homework: "Oilangizda avloddan-avlodga o‘tib kelayotgan bitta tarbiyaviy an’anani yozing.",
        quiz: [
          { q: "“Turkiy guliston yoxud axloq” qachon yozilgan?", a: ["1913", "1069", "1501", "1991"], c: 0 },
          { q: "Qaysi alloma eng avval yashagan?", a: ["Forobiy", "Navoiy", "Avloniy", "Fitrat"], c: 0 },
          { q: "Avloniy tarbiyani nima deb ataydi?", a: ["Ikkinchi darajali ish", "Hayot-mamot masalasi", "Faqat maktab ishi", "Ixtiyoriy narsa"], c: 1 }
        ]
      },
      {
        id: "d2", title: "Fozil inson va fozil jamoa", scholar: "forobiy", work: "Fozil odamlar shahri",
        competency: "faol fuqarolik pozitsiyasiga ega bo‘ladi",
        goals: {
          talimiy: "Forobiyning fozil inson va fozil jamoa haqidagi qarashlarini o‘rganish.",
          tarbiyaviy: "Jamoaga daxldorlik va adolatparvarlik tuyg‘usini tarbiyalash.",
          rivojlantiruvchi: "Ideal model tuzish va uni real hayot bilan taqqoslash ko‘nikmasini rivojlantirish."
        },
        quote: "Fozillar shahri hokimi... ta’lim olishga, bilim, ma’rifatga havasli, ...haq va haqiqatni, odil va haqgo‘y odamlarni sevadigan, ...tabiatan adolatparvar bo‘lishi zarur.",
        flow: [
          { t: 5, name: "Kirish", text: "“Siz yashashni xohlaydigan ideal shahar qanday?” savoli bilan boshlanadi." },
          { t: 10, name: "Insert", text: "Forobiy iqtibosi va darslikdagi parcha V, +, −, ? belgilari bilan o‘qiladi." },
          { t: 15, name: "Klaster", text: "“Fozil inson” klasteri tuziladi: bilimli, adolatli, haqgo‘y, rahmdil, mehnatkash..." },
          { t: 10, name: "Loyiha-taqdimot", text: "Guruhlar “Fozil sinf” nizomini (5 qoida) tuzib taqdim etadi." },
          { t: 5, name: "Refleksiya", text: "Har bir o‘quvchi o‘zida rivojlantirmoqchi bo‘lgan bitta fozil sifatni yozadi." }
        ],
        questions: ["Forobiy bo‘yicha jamiyat rahbari qanday sifatlarga ega bo‘lishi kerak?", "Sinfimiz “fozil jamoa” bo‘lishi uchun nima qilish kerak?"],
        homework: "“Fozil sinf” nizomini oila a’zolaringiz bilan muhokama qilib, ularning fikrini yozing.",
        quiz: [
          { q: "“Fozil odamlar shahri” muallifi kim?", a: ["Forobiy", "Beruniy", "Ibn Sino", "Navoiy"], c: 0 },
          { q: "Forobiy fikricha, fozil hokim qanday bo‘ladi?", a: ["Boy va kuchli", "Bilimli va adolatparvar", "Qattiqqo‘l", "Mashhur"], c: 1 },
          { q: "Forobiy fikricha, tarbiya qanday amalga oshadi?", a: ["Faqat so‘z bilan", "Amaliy ish va mashq bilan", "Jazo bilan", "O‘z-o‘zidan"], c: 1 }
        ]
      },
      {
        id: "d3", title: "Ilm va muhit: to‘g‘ri qaror qabul qilish", scholar: "beruniy", work: "Qadimgi xalqlardan qolgan yodgorliklar",
        competency: "to‘g‘ri qaror qabul qiladi",
        goals: {
          talimiy: "Beruniyning inson, muhit va tarbiya haqidagi qarashlarini o‘rganish.",
          tarbiyaviy: "Ilmga hurmat va do‘st tanlashda ehtiyotkorlikni tarbiyalash.",
          rivojlantiruvchi: "Vaziyatni tahlil qilib, oqibatlarini oldindan ko‘rish ko‘nikmasini rivojlantirish."
        },
        quote: "Inson tabiatan hamma narsaga moyil bo‘ladi, lekin unga yo‘l ko‘rsatadigan tarbiya va muhit qaysi tomonga og‘irlik qilsa, u ham o‘sha yo‘nalishda shakllanadi.",
        flow: [
          { t: 5, name: "Kirish", text: "Beruniy iqtibosi o‘qiladi. “Muhit insonni o‘zgartira oladimi?” savoli." },
          { t: 10, name: "Suhbat", text: "Beruniy haqida qisqa ma’lumot: u kelajakni ko‘ra olish va ehtiyot choralarini ko‘rishni ongli insonning belgisi deb bilgan." },
          { t: 15, name: "Keys-stadi", text: "Keys: “Do‘stlari Azizni darsdan qochib, kompyuter klubiga borishga undashmoqda.” Variantlar, oqibatlar va eng to‘g‘ri qaror muhokama qilinadi." },
          { t: 10, name: "Qaror algoritmi", text: "Sinf birgalikda “To‘g‘ri qarorning 4 qadami”ni tuzadi: to‘xta, o‘yla, oqibatni ko‘r, tanla." },
          { t: 5, name: "Refleksiya", text: "“Mening muhitim meni qaysi tomonga yo‘naltirmoqda?” — qisqa yozma javob." }
        ],
        questions: ["Beruniy fikricha, insonni hayvondan nima farqlaydi?", "Muhit tanlashda nimalarga e’tibor berish kerak?"],
        homework: "Yaqinda qabul qilgan bitta qaroringizni “4 qadam” bo‘yicha tahlil qiling.",
        quiz: [
          { q: "Beruniy fikricha, insonni nima shakllantiradi?", a: ["Faqat irsiyat", "Tarbiya va muhit", "Tasodif", "Iqlim"], c: 1 },
          { q: "Beruniyning tug‘ilgan joyi qayer?", a: ["Kat (Xorazm)", "Afshona", "Hirot", "Toshkent"], c: 0 },
          { q: "To‘g‘ri qarorning birinchi qadami qaysi?", a: ["Darhol harakat qilish", "To‘xtab, o‘ylab ko‘rish", "Ko‘pchilikka ergashish", "Kutib turish"], c: 1 }
        ]
      },
      {
        id: "d4", title: "Sog‘lom turmush — aql va tan uyg‘unligi", scholar: "ibnsino", work: "Tib qonunlari, Donishnoma",
        competency: "sog‘lom turmush tarziga amal qiladi va targ‘ib qiladi",
        goals: {
          talimiy: "Ibn Sinoning aqliy va jismoniy tarbiya birligi haqidagi ta’limotini o‘rganish.",
          tarbiyaviy: "O‘z sog‘lig‘iga mas’uliyat bilan qarash va zararli odatlardan saqlanishni tarbiyalash.",
          rivojlantiruvchi: "Shaxsiy kun tartibini rejalashtirish ko‘nikmasini rivojlantirish."
        },
        quote: "Kichik bolaning idrok kuchi kattalarniki bilan barobardir.",
        flow: [
          { t: 5, name: "Kirish", text: "“Tib qonunlari” asari haqida qisqa ma’lumot: asar asrlar davomida Yevropa universitetlarida o‘qitilgan." },
          { t: 10, name: "Blits-so‘rov", text: "Uyqu, ovqatlanish, harakat, ekran vaqti haqida tezkor savollar." },
          { t: 15, name: "Guruhli ishlash", text: "Guruhlar Ibn Sino tamoyillari asosida 8-sinf o‘quvchisi uchun “Sog‘lom kun” jadvalini tuzadi." },
          { t: 10, name: "Bahs-munozara", text: "“Smartfon — do‘stmi yoki dushman?” mavzusida ikki tomon bahsi." },
          { t: 5, name: "Refleksiya", text: "Har bir o‘quvchi bir haftalik sog‘lom odat majburiyatini yozadi." }
        ],
        questions: ["Ibn Sino tarbiyani nimaning birligi deb biladi?", "Ekran vaqti aqliy va jismoniy salomatlikka qanday ta’sir qiladi?"],
        homework: "Bir hafta davomida “Sog‘lom kun” jadvaliga amal qilib, kundalik yuriting.",
        quiz: [
          { q: "“Tib qonunlari” muallifi kim?", a: ["Ibn Sino", "Beruniy", "Forobiy", "Ulug‘bek"], c: 0 },
          { q: "Ibn Sino ta’limni necha yoshdan boshlashni tavsiya qilgan?", a: ["3", "6", "10", "14"], c: 1 },
          { q: "Ibn Sino qaysi ta’lim shaklini afzal ko‘rgan?", a: ["Yakka", "Jamoaviy", "Faqat oilaviy", "Masofaviy"], c: 1 }
        ]
      },
      {
        id: "d5", title: "Adolat va bilim — baxt yo‘li", scholar: "yusuf", work: "Qutadg‘u bilig",
        competency: "faol fuqarolik pozitsiyasiga ega bo‘ladi",
        goals: {
          talimiy: "“Qutadg‘u bilig”dagi to‘rt timsol va ularning ma’nosini o‘rganish.",
          tarbiyaviy: "Adolat, halollik va bilimga intilishni tarbiyalash.",
          rivojlantiruvchi: "Ramziy obrazlarni tahlil qilish va hayotga ko‘chirish ko‘nikmasini rivojlantirish."
        },
        quote: "Farzand ota-onadan ko‘rgan odat va axloq asosida shakllanadi.",
        flow: [
          { t: 5, name: "Kirish", text: "Asar nomining ma’nosi: “Baxtga eltuvchi bilim”." },
          { t: 10, name: "Insert", text: "To‘rt timsol haqidagi matn o‘qiladi: Kuntug‘di — adolat, Oyto‘ldi — davlat va baxt, O‘gdulmish — aql, O‘zg‘urmish — qanoat." },
          { t: 15, name: "Rol o‘ynash", text: "4 o‘quvchi timsollar rolida “Sinfda adolatsiz baho qo‘yildi” vaziyatini muhokama qiladi." },
          { t: 10, name: "Klaster", text: "“Adolatli inson” klasteri tuziladi va zamonaviy misollar bilan to‘ldiriladi." },
          { t: 5, name: "Refleksiya", text: "“Men qaysi timsolga ko‘proq o‘xshayman va nima uchun?”" }
        ],
        questions: ["Nima uchun Yusuf Xos Hojib adolatni hukmdor timsolida tasvirlagan?", "Bilim va baxt o‘rtasida qanday bog‘liqlik bor?"],
        homework: "Timsollardan birining nomidan bugungi yoshlarga maktub yozing.",
        quiz: [
          { q: "“Qutadg‘u bilig” qachon yozilgan?", a: ["1069–1070", "1441", "1913", "950"], c: 0 },
          { q: "O‘gdulmish qaysi tushuncha timsoli?", a: ["Adolat", "Aql", "Davlat", "Qanoat"], c: 1 },
          { q: "“Qutadg‘u bilig” so‘zining ma’nosi?", a: ["Baxtga eltuvchi bilim", "Turkiy so‘zlar devoni", "Yaxshi xulqlar", "Fozil shahar"], c: 0 }
        ]
      },
      {
        id: "d6", title: "Muomala madaniyati va kommunikativlik", scholar: "kaykovus", work: "Qobusnoma",
        competency: "kommunikativlik, faollik, tashkilotchilik, tashabbuskorlik ko‘rsatadi",
        goals: {
          talimiy: "“Qobusnoma”dagi muomala odobi qoidalarini o‘rganish.",
          tarbiyaviy: "Suhbatdoshga hurmat, qo‘pollik va haqoratdan saqlanishni tarbiyalash.",
          rivojlantiruvchi: "Nutq madaniyati va faol tinglash ko‘nikmasini rivojlantirish."
        },
        quote: "Farzandga adab, hunar o‘rgatmakni meros deb bilg‘il.",
        flow: [
          { t: 5, name: "Kirish", text: "“Qobusnoma” — 44 bobli tarbiya kitobi; Kaykovus uni o‘g‘liga nasihat sifatida yozgan." },
          { t: 10, name: "Suhbat", text: "Asardagi muomala qoidalari: kattani hurmat qilish, so‘zni o‘ylab aytish, haqorat va qo‘pollikdan saqlanish." },
          { t: 15, name: "Rol o‘ynash", text: "Vaziyatlar: “Sinfdosh sizni ranjitdi”, “Onlayn chatda tortishuv”. Avval noto‘g‘ri, keyin to‘g‘ri muomala namoyish qilinadi." },
          { t: 10, name: "Guruhli ishlash", text: "“Raqamli muomala odobnomasi” — 7 qoida tuziladi." },
          { t: 5, name: "Refleksiya", text: "Blits: “Bugun kimga yaxshi so‘z aytaman?”" }
        ],
        questions: ["Kaykovus nima uchun hunarni meros deb biladi?", "Onlayn muloqotda qaysi odob qoidalari muhim?"],
        homework: "Oila a’zolaringiz bilan “Qobusnoma”dan bitta nasihatni o‘qib, uning bugungi ahamiyatini yozing.",
        quiz: [
          { q: "“Qobusnoma” muallifi kim?", a: ["Kaykovus", "Koshifiy", "Navoiy", "Yassaviy"], c: 0 },
          { q: "“Qobusnoma” kimga nasihat sifatida yozilgan?", a: ["Shogirdlariga", "O‘g‘liga", "Podshohga", "Do‘stiga"], c: 1 },
          { q: "Muomala odobiga qaysi biri zid?", a: ["Faol tinglash", "Haqorat va qo‘pollik", "Salomlashish", "Minnatdorchilik"], c: 1 }
        ]
      },
      {
        id: "d7", title: "Rostgo‘ylik, sabr va iroda", scholar: "yassaviy", work: "Devoni hikmat",
        competency: "to‘g‘ri qaror qabul qiladi",
        goals: {
          talimiy: "Yassaviy hikmatlaridagi rostgo‘ylik, sabr va hushyorlik g‘oyalarini o‘rganish.",
          tarbiyaviy: "Halollik, o‘z-o‘ziga talabchanlik va irodani tarbiyalash.",
          rivojlantiruvchi: "O‘z xatti-harakatini tanqidiy baholash ko‘nikmasini rivojlantirish."
        },
        quote: null,
        flow: [
          { t: 5, name: "Kirish", text: "Yassaviy va “Devoni hikmat” haqida qisqa ma’lumot." },
          { t: 10, name: "Aqliy hujum", text: "“Yolg‘on nima uchun xavfli?” — sabablar va oqibatlar to‘planadi." },
          { t: 15, name: "Baliq skeleti", text: "Muammo: “Nazorat ishida ko‘chirish”. Sabablar, oqibatlar va yechim Yassaviy g‘oyalari asosida tahlil qilinadi." },
          { t: 10, name: "Keys-stadi", text: "“Do‘stingiz xatosini yashirishni so‘radi” — rostgo‘ylik va do‘stlik o‘rtasidagi tanlov." },
          { t: 5, name: "Refleksiya", text: "“Iroda kundaligi”: bir hafta bajaradigan qiyin, lekin foydali ish." }
        ],
        questions: ["Yassaviy nima uchun gunohni yashirishni xiyonat deydi?", "Zahmat va sabr irodani qanday shakllantiradi?"],
        homework: "Bir hafta “Iroda kundaligi” yuritib, natijani yozing.",
        quiz: [
          { q: "Yassaviy asari qaysi?", a: ["Devoni hikmat", "Hidoya", "Qobusnoma", "Donishnoma"], c: 0 },
          { q: "Yassaviy fikricha, zahmat chekkan odam qanday bo‘ladi?", a: ["Zaif", "Sabrli va irodali", "Achchiq", "Dangasa"], c: 1 },
          { q: "Hushyorlik insonni nimaga undaydi?", a: ["Faol harakatga", "Befarqlikka", "Qo‘rquvga", "Dangasalikka"], c: 0 }
        ]
      },
      {
        id: "d8", title: "Huquqiy ong va vijdon", scholar: "marginoniy", work: "Al-Hidoya",
        competency: "faol fuqarolik pozitsiyasiga ega bo‘ladi",
        goals: {
          talimiy: "Marg‘inoniyning axloqiy-huquqiy qarashlari bilan tanishtirish.",
          tarbiyaviy: "Qonunga hurmat, vijdon va burch tuyg‘usini tarbiyalash.",
          rivojlantiruvchi: "Huquq va burch o‘rtasidagi bog‘liqlikni tahlil qilish ko‘nikmasini rivojlantirish."
        },
        quote: null,
        flow: [
          { t: 5, name: "Kirish", text: "Marg‘inoniy va “Al-Hidoya” asari: asr osha huquqshunoslar foydalangan manba." },
          { t: 10, name: "Klaster", text: "“Vijdonli fuqaro”: diyonat, iymon, vijdon, burch, insoniylik, odillik, mustaqil fikr." },
          { t: 15, name: "Keys-stadi", text: "“Maktab mulkiga zarar yetkazilganini ko‘rdingiz” — o‘quvchining huquq va burchlari." },
          { t: 10, name: "Guruhli ishlash", text: "Har guruh bitta huquq va unga mos burchni juftlab, misol keltiradi." },
          { t: 5, name: "Refleksiya", text: "“Men qaysi burchimni yaxshiroq bajarishim kerak?”" }
        ],
        questions: ["Marg‘inoniy qaysi sifatlarni shaxs kamolotining asosi deb biladi?", "Huquq va burch nima uchun ajralmas?"],
        homework: "Konstitutsiyadan o‘quvchiga oid bitta modda topib, uni o‘z so‘zlaringiz bilan tushuntiring.",
        quiz: [
          { q: "“Al-Hidoya” qaysi sohaga oid?", a: ["Huquq (fiqh)", "Tibbiyot", "Astronomiya", "Musiqa"], c: 0 },
          { q: "Marg‘inoniy qayerda tug‘ilgan?", a: ["Rishton (Marg‘ilon)", "Buxoro", "Samarqand", "Xiva"], c: 0 },
          { q: "Qaysi biri Marg‘inoniy ulug‘lagan fazilat?", a: ["Vijdon", "Hasad", "Kibr", "Isrof"], c: 0 }
        ]
      },
      {
        id: "d9", title: "Komil inson axloqi", scholar: "navoiy", work: "Mahbub ul-qulub, Nasoyim ul-muhabbat",
        competency: "umuminsoniy va milliy madaniyatga rioya qiladi",
        goals: {
          talimiy: "Navoiy asarlaridagi komil inson fazilatlarini o‘rganish.",
          tarbiyaviy: "Ota-onaga hurmat, kamtarlik, saxovat va vafodorlikni tarbiyalash.",
          rivojlantiruvchi: "Badiiy matndan tarbiyaviy g‘oyani ajratib olish ko‘nikmasini rivojlantirish."
        },
        quote: "Bu ikkisiga xizmatni birdek qil, xizmating qancha ortiq bo‘lsa ham, kam deb bil.",
        flow: [
          { t: 5, name: "Kirish", text: "Navoiyning “Inson uchun eng buyuk baxt — komil axloq va ilm” degan g‘oyasi." },
          { t: 10, name: "Insert", text: "“Nasoyim ul-muhabbat”dagi komil inson sifatlari ro‘yxati o‘qiladi." },
          { t: 15, name: "Guruhli ishlash", text: "Har guruh bitta sifatni (kamtarlik, saxovat, sabr, vafo) zamonaviy hayotiy misol bilan sahnalashtiradi." },
          { t: 10, name: "Suhbat", text: "Navoiyning ota-ona haqidagi nasihati muhokama qilinadi." },
          { t: 5, name: "Refleksiya", text: "“Ota-onam uchun bugun nima qila olaman?”" }
        ],
        questions: ["Navoiy komil inson sifatlaridan qaysilarini sanaydi?", "Navoiy ota-onaga xizmat haqida nima deydi?"],
        homework: "“Mahbub ul-qulub”dan bitta hikmatni yod olib, uning ma’nosini yozing.",
        quiz: [
          { q: "Navoiy fikricha, inson uchun eng buyuk baxt nima?", a: ["Boylik", "Komil axloq va ilm", "Shon-shuhrat", "Mansab"], c: 1 },
          { q: "Navoiy qaysi shaharda yashab ijod qilgan?", a: ["Hirot", "Buxoro", "Qo‘qon", "Xiva"], c: 0 },
          { q: "Navoiy ota-onaga xizmatni qanday baholaydi?", a: ["Ixtiyoriy", "Qancha ko‘p bo‘lsa ham, kam", "Ortiqcha", "Faqat bayramda"], c: 1 }
        ]
      },
      {
        id: "d10", title: "Axborot asrida ma’naviy immunitet va ekomadaniyat", scholar: "beruniy", work: "Allomalar merosi (yakuniy loyiha darsi)",
        competency: "axborot va ekomadaniyatga ega bo‘ladi",
        goals: {
          talimiy: "Allomalar g‘oyalarini axborot xavfsizligi va tabiatga munosabat masalalariga tatbiq etish.",
          tarbiyaviy: "Yot g‘oyalarga qarshi ma’naviy immunitet va tabiatga ehtiyotkor munosabatni tarbiyalash.",
          rivojlantiruvchi: "Loyiha tayyorlash va himoya qilish ko‘nikmasini rivojlantirish."
        },
        quote: null,
        flow: [
          { t: 5, name: "Kirish", text: "Darslikdagi fikr: yoshlar vaqtining qariyb yarmi virtual muloqotga sarflanmoqda." },
          { t: 10, name: "Baliq skeleti", text: "“Nima uchun yoshlar yot g‘oyalar ta’siriga tushadi?” — sabablar va yechimlar." },
          { t: 20, name: "Loyiha himoyasi", text: "“Mening allomam” loyihalari: har guruh bir alloma g‘oyasini bugungi muammoga (axborot, ekologiya, oila) tatbiq etadi." },
          { t: 5, name: "Refleksiya", text: "Modul bo‘yicha xulosa: “Allomalardan olgan eng muhim saboq”." },
          { t: 5, name: "Yakuniy diagnostika", text: "O‘quvchilar platformadagi yakuniy testni topshiradi." }
        ],
        questions: ["Ma’naviy immunitet nima va u qanday shakllanadi?", "Qaysi alloma g‘oyasi tabiatga munosabatni o‘rgatadi?"],
        homework: "Modul davomida o‘rgangan allomalardan biri haqida taqdimot (5–7 slayd) tayyorlang.",
        quiz: [
          { q: "Darslikka ko‘ra yoshlar vaqtining qancha qismi virtual muloqotga ketmoqda?", a: ["10%", "Taxminan 50%", "90%", "5%"], c: 1 },
          { q: "Yot g‘oyalarga qarshi eng samarali vosita qaysi?", a: ["Bilim va ma’naviy tarbiya", "Internetdan voz kechish", "Befarqlik", "Faqat taqiqlash"], c: 0 },
          { q: "Ekomadaniyat nimani anglatadi?", a: ["Tabiatga oqilona munosabat", "Moda", "Sport", "Musiqa"], c: 0 }
        ]
      }
    ]
  },

  /* 8-sinf dastlabki va yakuniy diagnostikasi (bir xil test, ikki bosqichda) */
  diagnostic: {
    test: [
      { q: "“Fozil odamlar shahri” asarining muallifi kim?", a: ["Abu Nasr Forobiy", "Abu Rayhon Beruniy", "Alisher Navoiy", "Kaykovus"], c: 0 },
      { q: "“Qutadg‘u bilig” asarida adolat timsoli kim?", a: ["Oyto‘ldi", "Kuntug‘di", "O‘gdulmish", "O‘zg‘urmish"], c: 1 },
      { q: "Ibn Sino tarbiyani nimaning birligi deb biladi?", a: ["Boylik va bilim", "Aqliy va jismoniy rivojlanish", "Maktab va mahalla", "Ish va dam olish"], c: 1 },
      { q: "“Qobusnoma” necha bobdan iborat?", a: ["44", "40", "12", "100"], c: 0 },
      { q: "“Tarbiya biz uchun yo hayot — yo mamot...” degan so‘zlar kimga tegishli?", a: ["Fitrat", "Behbudiy", "Abdulla Avloniy", "Navoiy"], c: 2 },
      { q: "Beruniy fikricha, inson qimmatining asosiy mezoni nima?", a: ["Nasl-nasab", "Mehnat va ish", "Boylik", "Tashqi ko‘rinish"], c: 1 },
      { q: "“Al-Hidoya” asari muallifi kim?", a: ["Imom Buxoriy", "Burhoniddin Marg‘inoniy", "Ahmad Yassaviy", "Mahmud Koshg‘ariy"], c: 1 },
      { q: "Navoiy fikricha, inson uchun eng buyuk baxt nima?", a: ["Komil axloq va ilm", "Davlat", "Shuhrat", "Mol-mulk"], c: 0 },
      { q: "Ahmad Yassaviy fikricha, gunohni yashirish nima hisoblanadi?", a: ["Kamtarlik", "Xiyonat", "Ehtiyotkorlik", "Sabr"], c: 1 },
      { q: "Sinfdoshingiz sizni haqorat qildi. Allomalar o‘gitiga ko‘ra eng to‘g‘ri yo‘l qaysi?", a: ["Javobiga haqorat qilish", "Xotirjam gaplashib, sababini aniqlash", "Gina saqlab yurish", "Ijtimoiy tarmoqda yozish"], c: 1 },
      { q: "Ijtimoiy tarmoqda manbasi noma’lum shov-shuvli xabar ko‘rdingiz. To‘g‘ri harakat qaysi?", a: ["Darhol ulashish", "Ishonchli manbalar bilan tekshirish", "Izohda bahslashish", "Hammaga yuborish"], c: 1 },
      { q: "Forobiy fikricha, xislat qanday kuchayadi?", a: ["O‘z-o‘zidan", "Tarbiya va mashq ko‘p bo‘lsa", "Faqat irsiyat bilan", "Jazo bilan"], c: 1 },
      { q: "Kaykovus farzandga nimani o‘rgatishni meros deb biladi?", a: ["Adab va hunar", "Savdo", "Harbiy ish", "Ov"], c: 0 },
      { q: "Do‘stingiz nazorat ishida ko‘chirib berishni so‘radi. Rostgo‘ylik va do‘stlikni uyg‘unlashtirgan javob qaysi?", a: ["Ko‘chirtirib qo‘yish", "Rad etib, darsdan keyin unga tushuntirib berish", "O‘qituvchiga aytish va so‘kish", "E’tibor bermaslik"], c: 1 },
      { q: "Qaysi alloma Hirotda madrasa va shifoxona qurdirgan?", a: ["Alisher Navoiy", "Ibn Sino", "Forobiy", "Avloniy"], c: 0 }
    ],
    survey: [
      "Qiyin vaziyatda shoshilmay, oqibatini o‘ylab qaror qabul qilaman.",
      "Sinfdoshlarim va kattalar bilan hurmat bilan muloqot qilaman.",
      "Kun tartibiga va sog‘lom turmush tarziga amal qilaman.",
      "Internetdagi xabarlarni ulashishdan oldin tekshiraman.",
      "Tabiat va atrof-muhitni asrashga harakat qilaman.",
      "Sinf va mahalla ishlarida tashabbus ko‘rsataman.",
      "Ota-onamni hurmat qilaman va uy ishlarida yordam beraman.",
      "O‘rta Osiyo allomalarining hayoti va asarlari menga qiziq."
    ],
    likert: ["Hech qachon", "Kamdan-kam", "Ba’zan", "Ko‘pincha", "Doimo"]
  }
};
