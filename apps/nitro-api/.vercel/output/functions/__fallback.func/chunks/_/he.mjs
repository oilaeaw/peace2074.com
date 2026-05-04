const chaptersRu = [
	{
		id: 1,
		name: "الفاتحة",
		transliteration: "Al-Fatihah",
		translation: "Открывающая Коран",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 2,
		name: "البقرة",
		transliteration: "Al-Baqarah",
		translation: "Корова",
		type: "medinan",
		total_verses: 286
	},
	{
		id: 3,
		name: "آل عمران",
		transliteration: "Ali 'Imran",
		translation: "Семейство Имрана",
		type: "medinan",
		total_verses: 200
	},
	{
		id: 4,
		name: "النساء",
		transliteration: "An-Nisa",
		translation: "Женщины",
		type: "medinan",
		total_verses: 176
	},
	{
		id: 5,
		name: "المائدة",
		transliteration: "Al-Ma'idah",
		translation: "Трапеза",
		type: "medinan",
		total_verses: 120
	},
	{
		id: 6,
		name: "الأنعام",
		transliteration: "Al-An'am",
		translation: "Скот",
		type: "meccan",
		total_verses: 165
	},
	{
		id: 7,
		name: "الأعراف",
		transliteration: "Al-A'raf",
		translation: "Ограды",
		type: "meccan",
		total_verses: 206
	},
	{
		id: 8,
		name: "الأنفال",
		transliteration: "Al-Anfal",
		translation: "Трофеи",
		type: "medinan",
		total_verses: 75
	},
	{
		id: 9,
		name: "التوبة",
		transliteration: "At-Tawbah",
		translation: "Покаяние",
		type: "medinan",
		total_verses: 129
	},
	{
		id: 10,
		name: "يونس",
		transliteration: "Yunus",
		translation: "Йунус",
		type: "meccan",
		total_verses: 109
	},
	{
		id: 11,
		name: "هود",
		transliteration: "Hud",
		translation: "Худ",
		type: "meccan",
		total_verses: 123
	},
	{
		id: 12,
		name: "يوسف",
		transliteration: "Yusuf",
		translation: "Йусуф",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 13,
		name: "الرعد",
		transliteration: "Ar-Ra'd",
		translation: "Гром",
		type: "medinan",
		total_verses: 43
	},
	{
		id: 14,
		name: "ابراهيم",
		transliteration: "Ibrahim",
		translation: "Ибрахим",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 15,
		name: "الحجر",
		transliteration: "Al-Hijr",
		translation: "Хиджр ",
		type: "meccan",
		total_verses: 99
	},
	{
		id: 16,
		name: "النحل",
		transliteration: "An-Nahl",
		translation: "Пчелы",
		type: "meccan",
		total_verses: 128
	},
	{
		id: 17,
		name: "الإسراء",
		transliteration: "Al-Isra",
		translation: "Ночной перенос",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 18,
		name: "الكهف",
		transliteration: "Al-Kahf",
		translation: "Пещера",
		type: "meccan",
		total_verses: 110
	},
	{
		id: 19,
		name: "مريم",
		transliteration: "Maryam",
		translation: "Марьям",
		type: "meccan",
		total_verses: 98
	},
	{
		id: 20,
		name: "طه",
		transliteration: "Taha",
		translation: "Та Ха ",
		type: "meccan",
		total_verses: 135
	},
	{
		id: 21,
		name: "الأنبياء",
		transliteration: "Al-Anbya",
		translation: "Пророки",
		type: "meccan",
		total_verses: 112
	},
	{
		id: 22,
		name: "الحج",
		transliteration: "Al-Hajj",
		translation: "Паломничество",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 23,
		name: "المؤمنون",
		transliteration: "Al-Mu'minun",
		translation: "Верующие",
		type: "meccan",
		total_verses: 118
	},
	{
		id: 24,
		name: "النور",
		transliteration: "An-Nur",
		translation: "Свет",
		type: "medinan",
		total_verses: 64
	},
	{
		id: 25,
		name: "الفرقان",
		transliteration: "Al-Furqan",
		translation: "аль-Фуркан",
		type: "meccan",
		total_verses: 77
	},
	{
		id: 26,
		name: "الشعراء",
		transliteration: "Ash-Shu'ara",
		translation: "Поэты",
		type: "meccan",
		total_verses: 227
	},
	{
		id: 27,
		name: "النمل",
		transliteration: "An-Naml",
		translation: "Муравьи",
		type: "meccan",
		total_verses: 93
	},
	{
		id: 28,
		name: "القصص",
		transliteration: "Al-Qasas",
		translation: "Рассказ",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 29,
		name: "العنكبوت",
		transliteration: "Al-'Ankabut",
		translation: "Паук",
		type: "meccan",
		total_verses: 69
	},
	{
		id: 30,
		name: "الروم",
		transliteration: "Ar-Rum",
		translation: "Римляне",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 31,
		name: "لقمان",
		transliteration: "Luqman",
		translation: "Лукман",
		type: "meccan",
		total_verses: 34
	},
	{
		id: 32,
		name: "السجدة",
		transliteration: "As-Sajdah",
		translation: "Земной поклон",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 33,
		name: "الأحزاب",
		transliteration: "Al-Ahzab",
		translation: "Союзники",
		type: "medinan",
		total_verses: 73
	},
	{
		id: 34,
		name: "سبإ",
		transliteration: "Saba",
		translation: "Сава",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 35,
		name: "فاطر",
		transliteration: "Fatir",
		translation: "Творец",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 36,
		name: "يس",
		transliteration: "Ya-Sin",
		translation: "Йа Син",
		type: "meccan",
		total_verses: 83
	},
	{
		id: 37,
		name: "الصافات",
		transliteration: "As-Saffat",
		translation: "Выстроившиеся в ряды",
		type: "meccan",
		total_verses: 182
	},
	{
		id: 38,
		name: "ص",
		transliteration: "Sad",
		translation: "Сод",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 39,
		name: "الزمر",
		transliteration: "Az-Zumar",
		translation: "Толпы",
		type: "meccan",
		total_verses: 75
	},
	{
		id: 40,
		name: "غافر",
		transliteration: "Ghafir",
		translation: "Прощающий",
		type: "meccan",
		total_verses: 85
	},
	{
		id: 41,
		name: "فصلت",
		transliteration: "Fussilat",
		translation: "Разъяснены",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 42,
		name: "الشورى",
		transliteration: "Ash-Shuraa",
		translation: "Совет",
		type: "meccan",
		total_verses: 53
	},
	{
		id: 43,
		name: "الزخرف",
		transliteration: "Az-Zukhruf",
		translation: "Украшения",
		type: "meccan",
		total_verses: 89
	},
	{
		id: 44,
		name: "الدخان",
		transliteration: "Ad-Dukhan",
		translation: "Дым",
		type: "meccan",
		total_verses: 59
	},
	{
		id: 45,
		name: "الجاثية",
		transliteration: "Al-Jathiyah",
		translation: "Коленопреклоненные",
		type: "meccan",
		total_verses: 37
	},
	{
		id: 46,
		name: "الأحقاف",
		transliteration: "Al-Ahqaf",
		translation: "Барханы",
		type: "meccan",
		total_verses: 35
	},
	{
		id: 47,
		name: "محمد",
		transliteration: "Muhammad",
		translation: "Мухаммад",
		type: "medinan",
		total_verses: 38
	},
	{
		id: 48,
		name: "الفتح",
		transliteration: "Al-Fath",
		translation: "Победа",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 49,
		name: "الحجرات",
		transliteration: "Al-Hujurat",
		translation: "Комнаты",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 50,
		name: "ق",
		transliteration: "Qaf",
		translation: "Каф",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 51,
		name: "الذاريات",
		transliteration: "Adh-Dhariyat",
		translation: "Рассеивающие прах",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 52,
		name: "الطور",
		transliteration: "At-Tur",
		translation: "Гора",
		type: "meccan",
		total_verses: 49
	},
	{
		id: 53,
		name: "النجم",
		transliteration: "An-Najm",
		translation: "Звезда",
		type: "meccan",
		total_verses: 62
	},
	{
		id: 54,
		name: "القمر",
		transliteration: "Al-Qamar",
		translation: "Месяц",
		type: "meccan",
		total_verses: 55
	},
	{
		id: 55,
		name: "الرحمن",
		transliteration: "Ar-Rahman",
		translation: "Милостивый",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 56,
		name: "الواقعة",
		transliteration: "Al-Waqi'ah",
		translation: "Событие",
		type: "meccan",
		total_verses: 96
	},
	{
		id: 57,
		name: "الحديد",
		transliteration: "Al-Hadid",
		translation: "Железо",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 58,
		name: "المجادلة",
		transliteration: "Al-Mujadila",
		translation: "Препирающаяся",
		type: "medinan",
		total_verses: 22
	},
	{
		id: 59,
		name: "الحشر",
		transliteration: "Al-Hashr",
		translation: "Сбор",
		type: "medinan",
		total_verses: 24
	},
	{
		id: 60,
		name: "الممتحنة",
		transliteration: "Al-Mumtahanah",
		translation: "Испытуемая",
		type: "medinan",
		total_verses: 13
	},
	{
		id: 61,
		name: "الصف",
		transliteration: "As-Saf",
		translation: "Ряды",
		type: "medinan",
		total_verses: 14
	},
	{
		id: 62,
		name: "الجمعة",
		transliteration: "Al-Jumu'ah",
		translation: "Собрание",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 63,
		name: "المنافقون",
		transliteration: "Al-Munafiqun",
		translation: "Лицемеры",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 64,
		name: "التغابن",
		transliteration: "At-Taghabun",
		translation: "Взаимное обделение",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 65,
		name: "الطلاق",
		transliteration: "At-Talaq",
		translation: "Развод",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 66,
		name: "التحريم",
		transliteration: "At-Tahrim",
		translation: "Запрещение",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 67,
		name: "الملك",
		transliteration: "Al-Mulk",
		translation: "Власть",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 68,
		name: "القلم",
		transliteration: "Al-Qalam",
		translation: "Письменная трость",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 69,
		name: "الحاقة",
		transliteration: "Al-Haqqah",
		translation: "Неминуемое",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 70,
		name: "المعارج",
		transliteration: "Al-Ma'arij",
		translation: "Ступени",
		type: "meccan",
		total_verses: 44
	},
	{
		id: 71,
		name: "نوح",
		transliteration: "Nuh",
		translation: "Нух",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 72,
		name: "الجن",
		transliteration: "Al-Jinn",
		translation: "Джинны",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 73,
		name: "المزمل",
		transliteration: "Al-Muzzammil",
		translation: "Закутавшийся",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 74,
		name: "المدثر",
		transliteration: "Al-Muddaththir",
		translation: "Завернувшийся",
		type: "meccan",
		total_verses: 56
	},
	{
		id: 75,
		name: "القيامة",
		transliteration: "Al-Qiyamah",
		translation: "Воскресение",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 76,
		name: "الانسان",
		transliteration: "Al-Insan",
		translation: "Человек",
		type: "medinan",
		total_verses: 31
	},
	{
		id: 77,
		name: "المرسلات",
		transliteration: "Al-Mursalat",
		translation: "Посылаемые",
		type: "meccan",
		total_verses: 50
	},
	{
		id: 78,
		name: "النبإ",
		transliteration: "An-Naba",
		translation: "Весть",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 79,
		name: "النازعات",
		transliteration: "An-Nazi'at",
		translation: "Исторгающие",
		type: "meccan",
		total_verses: 46
	},
	{
		id: 80,
		name: "عبس",
		transliteration: "'Abasa",
		translation: "Нахмурился",
		type: "meccan",
		total_verses: 42
	},
	{
		id: 81,
		name: "التكوير",
		transliteration: "At-Takwir",
		translation: "Скручивание",
		type: "meccan",
		total_verses: 29
	},
	{
		id: 82,
		name: "الإنفطار",
		transliteration: "Al-Infitar",
		translation: "Раскалывание",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 83,
		name: "المطففين",
		transliteration: "Al-Mutaffifin",
		translation: "Обвешивающие",
		type: "meccan",
		total_verses: 36
	},
	{
		id: 84,
		name: "الإنشقاق",
		transliteration: "Al-Inshiqaq",
		translation: "Разверзнется",
		type: "meccan",
		total_verses: 25
	},
	{
		id: 85,
		name: "البروج",
		transliteration: "Al-Buruj",
		translation: "Созвездия Зодиака",
		type: "meccan",
		total_verses: 22
	},
	{
		id: 86,
		name: "الطارق",
		transliteration: "At-Tariq",
		translation: "Ночной путник",
		type: "meccan",
		total_verses: 17
	},
	{
		id: 87,
		name: "الأعلى",
		transliteration: "Al-A'la",
		translation: "Всевышний",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 88,
		name: "الغاشية",
		transliteration: "Al-Ghashiyah",
		translation: "Покрывающее",
		type: "meccan",
		total_verses: 26
	},
	{
		id: 89,
		name: "الفجر",
		transliteration: "Al-Fajr",
		translation: "Заря",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 90,
		name: "البلد",
		transliteration: "Al-Balad",
		translation: "Город",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 91,
		name: "الشمس",
		transliteration: "Ash-Shams",
		translation: "Солнце",
		type: "meccan",
		total_verses: 15
	},
	{
		id: 92,
		name: "الليل",
		transliteration: "Al-Layl",
		translation: "Ночь",
		type: "meccan",
		total_verses: 21
	},
	{
		id: 93,
		name: "الضحى",
		transliteration: "Ad-Duhaa",
		translation: "Утро",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 94,
		name: "الشرح",
		transliteration: "Ash-Sharh",
		translation: "Раскрытие",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 95,
		name: "التين",
		transliteration: "At-Tin",
		translation: "Смоковница",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 96,
		name: "العلق",
		transliteration: "Al-'Alaq",
		translation: "Сгусток крови",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 97,
		name: "القدر",
		transliteration: "Al-Qadr",
		translation: "Предопределение",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 98,
		name: "البينة",
		transliteration: "Al-Bayyinah",
		translation: "Ясное знамение",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 99,
		name: "الزلزلة",
		transliteration: "Az-Zalzalah",
		translation: "Сотрясение",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 100,
		name: "العاديات",
		transliteration: "Al-'Adiyat",
		translation: "Скачущие",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 101,
		name: "القارعة",
		transliteration: "Al-Qari'ah",
		translation: "Великое бедствие",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 102,
		name: "التكاثر",
		transliteration: "At-Takathur",
		translation: "Страсть к приумножению",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 103,
		name: "العصر",
		transliteration: "Al-'Asr",
		translation: "Предвечернее время",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 104,
		name: "الهمزة",
		transliteration: "Al-Humazah",
		translation: "Хулитель",
		type: "meccan",
		total_verses: 9
	},
	{
		id: 105,
		name: "الفيل",
		transliteration: "Al-Fil",
		translation: "Слон",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 106,
		name: "قريش",
		transliteration: "Quraysh",
		translation: "Курейшиты",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 107,
		name: "الماعون",
		transliteration: "Al-Ma'un",
		translation: "Мелочь",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 108,
		name: "الكوثر",
		transliteration: "Al-Kawthar",
		translation: "Изобилие",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 109,
		name: "الكافرون",
		transliteration: "Al-Kafirun",
		translation: "Неверующие",
		type: "meccan",
		total_verses: 6
	},
	{
		id: 110,
		name: "النصر",
		transliteration: "An-Nasr",
		translation: "Помощь",
		type: "medinan",
		total_verses: 3
	},
	{
		id: 111,
		name: "المسد",
		transliteration: "Al-Masad",
		translation: "Пальмовые волокна",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 112,
		name: "الإخلاص",
		transliteration: "Al-Ikhlas",
		translation: "Очищение веры",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 113,
		name: "الفلق",
		transliteration: "Al-Falaq",
		translation: "Рассвет",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 114,
		name: "الناس",
		transliteration: "An-Nas",
		translation: "Люди",
		type: "meccan",
		total_verses: 6
	}
];

const chaptersTr = [
	{
		id: 1,
		name: "الفاتحة",
		transliteration: "Al-Fatihah",
		translation: "Fâtiha",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 2,
		name: "البقرة",
		transliteration: "Al-Baqarah",
		translation: "Bakara",
		type: "medinan",
		total_verses: 286
	},
	{
		id: 3,
		name: "آل عمران",
		transliteration: "Ali 'Imran",
		translation: "Âl-i İmrân",
		type: "medinan",
		total_verses: 200
	},
	{
		id: 4,
		name: "النساء",
		transliteration: "An-Nisa",
		translation: "Nisâ",
		type: "medinan",
		total_verses: 176
	},
	{
		id: 5,
		name: "المائدة",
		transliteration: "Al-Ma'idah",
		translation: "Mâide",
		type: "medinan",
		total_verses: 120
	},
	{
		id: 6,
		name: "الأنعام",
		transliteration: "Al-An'am",
		translation: "En'âm",
		type: "meccan",
		total_verses: 165
	},
	{
		id: 7,
		name: "الأعراف",
		transliteration: "Al-A'raf",
		translation: "A'râf",
		type: "meccan",
		total_verses: 206
	},
	{
		id: 8,
		name: "الأنفال",
		transliteration: "Al-Anfal",
		translation: "Enfâl",
		type: "medinan",
		total_verses: 75
	},
	{
		id: 9,
		name: "التوبة",
		transliteration: "At-Tawbah",
		translation: "Tevbe",
		type: "medinan",
		total_verses: 129
	},
	{
		id: 10,
		name: "يونس",
		transliteration: "Yunus",
		translation: "Yûnus",
		type: "meccan",
		total_verses: 109
	},
	{
		id: 11,
		name: "هود",
		transliteration: "Hud",
		translation: "Hûd",
		type: "meccan",
		total_verses: 123
	},
	{
		id: 12,
		name: "يوسف",
		transliteration: "Yusuf",
		translation: "Yûsuf",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 13,
		name: "الرعد",
		transliteration: "Ar-Ra'd",
		translation: "Ra'd",
		type: "medinan",
		total_verses: 43
	},
	{
		id: 14,
		name: "ابراهيم",
		transliteration: "Ibrahim",
		translation: "İbrâhîm",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 15,
		name: "الحجر",
		transliteration: "Al-Hijr",
		translation: "Hicr",
		type: "meccan",
		total_verses: 99
	},
	{
		id: 16,
		name: "النحل",
		transliteration: "An-Nahl",
		translation: "Nahl",
		type: "meccan",
		total_verses: 128
	},
	{
		id: 17,
		name: "الإسراء",
		transliteration: "Al-Isra",
		translation: "İsrâ",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 18,
		name: "الكهف",
		transliteration: "Al-Kahf",
		translation: "Kehf",
		type: "meccan",
		total_verses: 110
	},
	{
		id: 19,
		name: "مريم",
		transliteration: "Maryam",
		translation: "Meryem",
		type: "meccan",
		total_verses: 98
	},
	{
		id: 20,
		name: "طه",
		transliteration: "Taha",
		translation: "Tâhâ",
		type: "meccan",
		total_verses: 135
	},
	{
		id: 21,
		name: "الأنبياء",
		transliteration: "Al-Anbya",
		translation: "Enbiyâ",
		type: "meccan",
		total_verses: 112
	},
	{
		id: 22,
		name: "الحج",
		transliteration: "Al-Hajj",
		translation: "Hac",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 23,
		name: "المؤمنون",
		transliteration: "Al-Mu'minun",
		translation: "Mü'minûn",
		type: "meccan",
		total_verses: 118
	},
	{
		id: 24,
		name: "النور",
		transliteration: "An-Nur",
		translation: "Nûr",
		type: "medinan",
		total_verses: 64
	},
	{
		id: 25,
		name: "الفرقان",
		transliteration: "Al-Furqan",
		translation: "Furkân",
		type: "meccan",
		total_verses: 77
	},
	{
		id: 26,
		name: "الشعراء",
		transliteration: "Ash-Shu'ara",
		translation: "Şuarâ",
		type: "meccan",
		total_verses: 227
	},
	{
		id: 27,
		name: "النمل",
		transliteration: "An-Naml",
		translation: "Neml",
		type: "meccan",
		total_verses: 93
	},
	{
		id: 28,
		name: "القصص",
		transliteration: "Al-Qasas",
		translation: "Kasas",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 29,
		name: "العنكبوت",
		transliteration: "Al-'Ankabut",
		translation: "Ankebût",
		type: "meccan",
		total_verses: 69
	},
	{
		id: 30,
		name: "الروم",
		transliteration: "Ar-Rum",
		translation: "Rûm",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 31,
		name: "لقمان",
		transliteration: "Luqman",
		translation: "Lokmân",
		type: "meccan",
		total_verses: 34
	},
	{
		id: 32,
		name: "السجدة",
		transliteration: "As-Sajdah",
		translation: "Secde",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 33,
		name: "الأحزاب",
		transliteration: "Al-Ahzab",
		translation: "Ahzâb",
		type: "medinan",
		total_verses: 73
	},
	{
		id: 34,
		name: "سبإ",
		transliteration: "Saba",
		translation: "Sebe'",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 35,
		name: "فاطر",
		transliteration: "Fatir",
		translation: "Fâtır",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 36,
		name: "يس",
		transliteration: "Ya-Sin",
		translation: "Yâsîn",
		type: "meccan",
		total_verses: 83
	},
	{
		id: 37,
		name: "الصافات",
		transliteration: "As-Saffat",
		translation: "Sâffât",
		type: "meccan",
		total_verses: 182
	},
	{
		id: 38,
		name: "ص",
		transliteration: "Sad",
		translation: "Sâd",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 39,
		name: "الزمر",
		transliteration: "Az-Zumar",
		translation: "Zümer",
		type: "meccan",
		total_verses: 75
	},
	{
		id: 40,
		name: "غافر",
		transliteration: "Ghafir",
		translation: "Mü'min",
		type: "meccan",
		total_verses: 85
	},
	{
		id: 41,
		name: "فصلت",
		transliteration: "Fussilat",
		translation: "Fussilet",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 42,
		name: "الشورى",
		transliteration: "Ash-Shuraa",
		translation: "Şûrâ",
		type: "meccan",
		total_verses: 53
	},
	{
		id: 43,
		name: "الزخرف",
		transliteration: "Az-Zukhruf",
		translation: "Zuhruf",
		type: "meccan",
		total_verses: 89
	},
	{
		id: 44,
		name: "الدخان",
		transliteration: "Ad-Dukhan",
		translation: "Duhân",
		type: "meccan",
		total_verses: 59
	},
	{
		id: 45,
		name: "الجاثية",
		transliteration: "Al-Jathiyah",
		translation: "Câsiye",
		type: "meccan",
		total_verses: 37
	},
	{
		id: 46,
		name: "الأحقاف",
		transliteration: "Al-Ahqaf",
		translation: "Ahkâf",
		type: "meccan",
		total_verses: 35
	},
	{
		id: 47,
		name: "محمد",
		transliteration: "Muhammad",
		translation: "Muhammed",
		type: "medinan",
		total_verses: 38
	},
	{
		id: 48,
		name: "الفتح",
		transliteration: "Al-Fath",
		translation: "Fetih",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 49,
		name: "الحجرات",
		transliteration: "Al-Hujurat",
		translation: "Hucurât",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 50,
		name: "ق",
		transliteration: "Qaf",
		translation: "Kâf",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 51,
		name: "الذاريات",
		transliteration: "Adh-Dhariyat",
		translation: "Zâriyât",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 52,
		name: "الطور",
		transliteration: "At-Tur",
		translation: "Tûr",
		type: "meccan",
		total_verses: 49
	},
	{
		id: 53,
		name: "النجم",
		transliteration: "An-Najm",
		translation: "Necm",
		type: "meccan",
		total_verses: 62
	},
	{
		id: 54,
		name: "القمر",
		transliteration: "Al-Qamar",
		translation: "Kamer",
		type: "meccan",
		total_verses: 55
	},
	{
		id: 55,
		name: "الرحمن",
		transliteration: "Ar-Rahman",
		translation: "Rahmân",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 56,
		name: "الواقعة",
		transliteration: "Al-Waqi'ah",
		translation: "Vâkıa",
		type: "meccan",
		total_verses: 96
	},
	{
		id: 57,
		name: "الحديد",
		transliteration: "Al-Hadid",
		translation: "Hadîd",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 58,
		name: "المجادلة",
		transliteration: "Al-Mujadila",
		translation: "Mücâdele",
		type: "medinan",
		total_verses: 22
	},
	{
		id: 59,
		name: "الحشر",
		transliteration: "Al-Hashr",
		translation: "Haşr",
		type: "medinan",
		total_verses: 24
	},
	{
		id: 60,
		name: "الممتحنة",
		transliteration: "Al-Mumtahanah",
		translation: "Mümtehine",
		type: "medinan",
		total_verses: 13
	},
	{
		id: 61,
		name: "الصف",
		transliteration: "As-Saf",
		translation: "Saf",
		type: "medinan",
		total_verses: 14
	},
	{
		id: 62,
		name: "الجمعة",
		transliteration: "Al-Jumu'ah",
		translation: "Cuma",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 63,
		name: "المنافقون",
		transliteration: "Al-Munafiqun",
		translation: "Münâfikûn",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 64,
		name: "التغابن",
		transliteration: "At-Taghabun",
		translation: "Tegâbün",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 65,
		name: "الطلاق",
		transliteration: "At-Talaq",
		translation: "Talâk",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 66,
		name: "التحريم",
		transliteration: "At-Tahrim",
		translation: "Tahrîm",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 67,
		name: "الملك",
		transliteration: "Al-Mulk",
		translation: "Mülk",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 68,
		name: "القلم",
		transliteration: "Al-Qalam",
		translation: "Kalem",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 69,
		name: "الحاقة",
		transliteration: "Al-Haqqah",
		translation: "Hâkka",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 70,
		name: "المعارج",
		transliteration: "Al-Ma'arij",
		translation: "Meâric",
		type: "meccan",
		total_verses: 44
	},
	{
		id: 71,
		name: "نوح",
		transliteration: "Nuh",
		translation: "Nûh",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 72,
		name: "الجن",
		transliteration: "Al-Jinn",
		translation: "Cin",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 73,
		name: "المزمل",
		transliteration: "Al-Muzzammil",
		translation: "Müzzemmil",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 74,
		name: "المدثر",
		transliteration: "Al-Muddaththir",
		translation: "Müddessir",
		type: "meccan",
		total_verses: 56
	},
	{
		id: 75,
		name: "القيامة",
		transliteration: "Al-Qiyamah",
		translation: "Kıyâmet",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 76,
		name: "الانسان",
		transliteration: "Al-Insan",
		translation: "İnsân",
		type: "medinan",
		total_verses: 31
	},
	{
		id: 77,
		name: "المرسلات",
		transliteration: "Al-Mursalat",
		translation: "Mürselât",
		type: "meccan",
		total_verses: 50
	},
	{
		id: 78,
		name: "النبإ",
		transliteration: "An-Naba",
		translation: "Nebe",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 79,
		name: "النازعات",
		transliteration: "An-Nazi'at",
		translation: "Naziât",
		type: "meccan",
		total_verses: 46
	},
	{
		id: 80,
		name: "عبس",
		transliteration: "'Abasa",
		translation: "Abese",
		type: "meccan",
		total_verses: 42
	},
	{
		id: 81,
		name: "التكوير",
		transliteration: "At-Takwir",
		translation: "Tekvîr",
		type: "meccan",
		total_verses: 29
	},
	{
		id: 82,
		name: "الإنفطار",
		transliteration: "Al-Infitar",
		translation: "İnfitâr",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 83,
		name: "المطففين",
		transliteration: "Al-Mutaffifin",
		translation: "Mutaffifîn",
		type: "meccan",
		total_verses: 36
	},
	{
		id: 84,
		name: "الإنشقاق",
		transliteration: "Al-Inshiqaq",
		translation: "İnşikâk",
		type: "meccan",
		total_verses: 25
	},
	{
		id: 85,
		name: "البروج",
		transliteration: "Al-Buruj",
		translation: "Burûc",
		type: "meccan",
		total_verses: 22
	},
	{
		id: 86,
		name: "الطارق",
		transliteration: "At-Tariq",
		translation: "Târık",
		type: "meccan",
		total_verses: 17
	},
	{
		id: 87,
		name: "الأعلى",
		transliteration: "Al-A'la",
		translation: "A'lâ",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 88,
		name: "الغاشية",
		transliteration: "Al-Ghashiyah",
		translation: "Gâşiye",
		type: "meccan",
		total_verses: 26
	},
	{
		id: 89,
		name: "الفجر",
		transliteration: "Al-Fajr",
		translation: "Fecr",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 90,
		name: "البلد",
		transliteration: "Al-Balad",
		translation: "Beled",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 91,
		name: "الشمس",
		transliteration: "Ash-Shams",
		translation: "Şems",
		type: "meccan",
		total_verses: 15
	},
	{
		id: 92,
		name: "الليل",
		transliteration: "Al-Layl",
		translation: "Leyl",
		type: "meccan",
		total_verses: 21
	},
	{
		id: 93,
		name: "الضحى",
		transliteration: "Ad-Duhaa",
		translation: "Duhâ",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 94,
		name: "الشرح",
		transliteration: "Ash-Sharh",
		translation: "İnşirâh",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 95,
		name: "التين",
		transliteration: "At-Tin",
		translation: "Tîn",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 96,
		name: "العلق",
		transliteration: "Al-'Alaq",
		translation: "Alak",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 97,
		name: "القدر",
		transliteration: "Al-Qadr",
		translation: "Kadir",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 98,
		name: "البينة",
		transliteration: "Al-Bayyinah",
		translation: "Beyyine",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 99,
		name: "الزلزلة",
		transliteration: "Az-Zalzalah",
		translation: "Zilzâl",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 100,
		name: "العاديات",
		transliteration: "Al-'Adiyat",
		translation: "Âdiyât",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 101,
		name: "القارعة",
		transliteration: "Al-Qari'ah",
		translation: "Kâria",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 102,
		name: "التكاثر",
		transliteration: "At-Takathur",
		translation: "Tekâsür",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 103,
		name: "العصر",
		transliteration: "Al-'Asr",
		translation: "Asr",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 104,
		name: "الهمزة",
		transliteration: "Al-Humazah",
		translation: "Hümeze",
		type: "meccan",
		total_verses: 9
	},
	{
		id: 105,
		name: "الفيل",
		transliteration: "Al-Fil",
		translation: "Fîl",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 106,
		name: "قريش",
		transliteration: "Quraysh",
		translation: "Kureyş",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 107,
		name: "الماعون",
		transliteration: "Al-Ma'un",
		translation: "Maûn",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 108,
		name: "الكوثر",
		transliteration: "Al-Kawthar",
		translation: "Kevser",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 109,
		name: "الكافرون",
		transliteration: "Al-Kafirun",
		translation: "Kâfirûn",
		type: "meccan",
		total_verses: 6
	},
	{
		id: 110,
		name: "النصر",
		transliteration: "An-Nasr",
		translation: "Nasr",
		type: "medinan",
		total_verses: 3
	},
	{
		id: 111,
		name: "المسد",
		transliteration: "Al-Masad",
		translation: "Tebbet",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 112,
		name: "الإخلاص",
		transliteration: "Al-Ikhlas",
		translation: "İhlâs",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 113,
		name: "الفلق",
		transliteration: "Al-Falaq",
		translation: "Felak",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 114,
		name: "الناس",
		transliteration: "An-Nas",
		translation: "Nâs",
		type: "meccan",
		total_verses: 6
	}
];

const chaptersDe = [
	{
		id: 1,
		name: "الفاتحة",
		transliteration: "Al-Fatihah",
		translation: "Die Eröffnung",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 2,
		name: "البقرة",
		transliteration: "Al-Baqarah",
		translation: "Die Kuh",
		type: "medinan",
		total_verses: 286
	},
	{
		id: 3,
		name: "آل عمران",
		transliteration: "Ali 'Imran",
		translation: "Die Sippe Imrans",
		type: "medinan",
		total_verses: 200
	},
	{
		id: 4,
		name: "النساء",
		transliteration: "An-Nisa",
		translation: "Die Frauen",
		type: "medinan",
		total_verses: 176
	},
	{
		id: 5,
		name: "المائدة",
		transliteration: "Al-Ma'idah",
		translation: "Der Tisch",
		type: "medinan",
		total_verses: 120
	},
	{
		id: 6,
		name: "الأنعام",
		transliteration: "Al-An'am",
		translation: "Das Vieh",
		type: "meccan",
		total_verses: 165
	},
	{
		id: 7,
		name: "الأعراف",
		transliteration: "Al-A'raf",
		translation: "Die Höhen",
		type: "meccan",
		total_verses: 206
	},
	{
		id: 8,
		name: "الأنفال",
		transliteration: "Al-Anfal",
		translation: "Die Kriegsbeute",
		type: "medinan",
		total_verses: 75
	},
	{
		id: 9,
		name: "التوبة",
		transliteration: "At-Tawbah",
		translation: "Die Reue",
		type: "medinan",
		total_verses: 129
	},
	{
		id: 10,
		name: "يونس",
		transliteration: "Yunus",
		translation: "Jona",
		type: "meccan",
		total_verses: 109
	},
	{
		id: 11,
		name: "هود",
		transliteration: "Hud",
		translation: "Hud",
		type: "meccan",
		total_verses: 123
	},
	{
		id: 12,
		name: "يوسف",
		transliteration: "Yusuf",
		translation: "Josef",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 13,
		name: "الرعد",
		transliteration: "Ar-Ra'd",
		translation: "Der Donner",
		type: "medinan",
		total_verses: 43
	},
	{
		id: 14,
		name: "ابراهيم",
		transliteration: "Ibrahim",
		translation: "Abraham",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 15,
		name: "الحجر",
		transliteration: "Al-Hijr",
		translation: "Al-Hidschr",
		type: "meccan",
		total_verses: 99
	},
	{
		id: 16,
		name: "النحل",
		transliteration: "An-Nahl",
		translation: "Die Biene",
		type: "meccan",
		total_verses: 128
	},
	{
		id: 17,
		name: "الإسراء",
		transliteration: "Al-Isra",
		translation: "Die Nachtreise",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 18,
		name: "الكهف",
		transliteration: "Al-Kahf",
		translation: "Die Höhle",
		type: "meccan",
		total_verses: 110
	},
	{
		id: 19,
		name: "مريم",
		transliteration: "Maryam",
		translation: "Maria",
		type: "meccan",
		total_verses: 98
	},
	{
		id: 20,
		name: "طه",
		transliteration: "Taha",
		translation: "Ta-Ha",
		type: "meccan",
		total_verses: 135
	},
	{
		id: 21,
		name: "الأنبياء",
		transliteration: "Al-Anbya",
		translation: "Die Propheten",
		type: "meccan",
		total_verses: 112
	},
	{
		id: 22,
		name: "الحج",
		transliteration: "Al-Hajj",
		translation: "Die Pilgerfahrt",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 23,
		name: "المؤمنون",
		transliteration: "Al-Mu'minun",
		translation: "Die Gläubigen",
		type: "meccan",
		total_verses: 118
	},
	{
		id: 24,
		name: "النور",
		transliteration: "An-Nur",
		translation: "Das Licht",
		type: "medinan",
		total_verses: 64
	},
	{
		id: 25,
		name: "الفرقان",
		transliteration: "Al-Furqan",
		translation: "Die Unterscheidung",
		type: "meccan",
		total_verses: 77
	},
	{
		id: 26,
		name: "الشعراء",
		transliteration: "Ash-Shu'ara",
		translation: "Die Dichter",
		type: "meccan",
		total_verses: 227
	},
	{
		id: 27,
		name: "النمل",
		transliteration: "An-Naml",
		translation: "Die Ameise",
		type: "meccan",
		total_verses: 93
	},
	{
		id: 28,
		name: "القصص",
		transliteration: "Al-Qasas",
		translation: "Die Geschichte",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 29,
		name: "العنكبوت",
		transliteration: "Al-'Ankabut",
		translation: "Die Spinne",
		type: "meccan",
		total_verses: 69
	},
	{
		id: 30,
		name: "الروم",
		transliteration: "Ar-Rum",
		translation: "Die Byzantiner",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 31,
		name: "لقمان",
		transliteration: "Luqman",
		translation: "Luqman",
		type: "meccan",
		total_verses: 34
	},
	{
		id: 32,
		name: "السجدة",
		transliteration: "As-Sajdah",
		translation: "Die Anbetung",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 33,
		name: "الأحزاب",
		transliteration: "Al-Ahzab",
		translation: "Die Verbündeten",
		type: "medinan",
		total_verses: 73
	},
	{
		id: 34,
		name: "سبإ",
		transliteration: "Saba",
		translation: "Saba",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 35,
		name: "فاطر",
		transliteration: "Fatir",
		translation: "Der Schöpfer",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 36,
		name: "يس",
		transliteration: "Ya-Sin",
		translation: "Ya-Sin",
		type: "meccan",
		total_verses: 83
	},
	{
		id: 37,
		name: "الصافات",
		transliteration: "As-Saffat",
		translation: "Die in Reih und Glied Stehenden",
		type: "meccan",
		total_verses: 182
	},
	{
		id: 38,
		name: "ص",
		transliteration: "Sad",
		translation: "Sad",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 39,
		name: "الزمر",
		transliteration: "Az-Zumar",
		translation: "Die Scharen",
		type: "meccan",
		total_verses: 75
	},
	{
		id: 40,
		name: "غافر",
		transliteration: "Ghafir",
		translation: "Der Vergebende",
		type: "meccan",
		total_verses: 85
	},
	{
		id: 41,
		name: "فصلت",
		transliteration: "Fussilat",
		translation: "Detailliert dargelegt",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 42,
		name: "الشورى",
		transliteration: "Ash-Shuraa",
		translation: "Die Beratung",
		type: "meccan",
		total_verses: 53
	},
	{
		id: 43,
		name: "الزخرف",
		transliteration: "Az-Zukhruf",
		translation: "Der Prunk",
		type: "meccan",
		total_verses: 89
	},
	{
		id: 44,
		name: "الدخان",
		transliteration: "Ad-Dukhan",
		translation: "Der Rauch",
		type: "meccan",
		total_verses: 59
	},
	{
		id: 45,
		name: "الجاثية",
		transliteration: "Al-Jathiyah",
		translation: "Das Sich-Hinkauern",
		type: "meccan",
		total_verses: 37
	},
	{
		id: 46,
		name: "الأحقاف",
		transliteration: "Al-Ahqaf",
		translation: "Die Dünen",
		type: "meccan",
		total_verses: 35
	},
	{
		id: 47,
		name: "محمد",
		transliteration: "Muhammad",
		translation: "Muhammad",
		type: "medinan",
		total_verses: 38
	},
	{
		id: 48,
		name: "الفتح",
		transliteration: "Al-Fath",
		translation: "Der Sieg",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 49,
		name: "الحجرات",
		transliteration: "Al-Hujurat",
		translation: "Die Gemächer",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 50,
		name: "ق",
		transliteration: "Qaf",
		translation: "Qaf",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 51,
		name: "الذاريات",
		transliteration: "Adh-Dhariyat",
		translation: "Die Stürme",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 52,
		name: "الطور",
		transliteration: "At-Tur",
		translation: "Der Berg",
		type: "meccan",
		total_verses: 49
	},
	{
		id: 53,
		name: "النجم",
		transliteration: "An-Najm",
		translation: "Der Stern",
		type: "meccan",
		total_verses: 62
	},
	{
		id: 54,
		name: "القمر",
		transliteration: "Al-Qamar",
		translation: "Der Mond",
		type: "meccan",
		total_verses: 55
	},
	{
		id: 55,
		name: "الرحمن",
		transliteration: "Ar-Rahman",
		translation: "Der Allerbarmer",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 56,
		name: "الواقعة",
		transliteration: "Al-Waqi'ah",
		translation: "Das Ereignis",
		type: "meccan",
		total_verses: 96
	},
	{
		id: 57,
		name: "الحديد",
		transliteration: "Al-Hadid",
		translation: "Das Eisen",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 58,
		name: "المجادلة",
		transliteration: "Al-Mujadila",
		translation: "Die Streitende",
		type: "medinan",
		total_verses: 22
	},
	{
		id: 59,
		name: "الحشر",
		transliteration: "Al-Hashr",
		translation: "Die Versammlung",
		type: "medinan",
		total_verses: 24
	},
	{
		id: 60,
		name: "الممتحنة",
		transliteration: "Al-Mumtahanah",
		translation: "Die Geprüfte",
		type: "medinan",
		total_verses: 13
	},
	{
		id: 61,
		name: "الصف",
		transliteration: "As-Saf",
		translation: "Die Schlachtordnung",
		type: "medinan",
		total_verses: 14
	},
	{
		id: 62,
		name: "الجمعة",
		transliteration: "Al-Jumu'ah",
		translation: "Der Freitag",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 63,
		name: "المنافقون",
		transliteration: "Al-Munafiqun",
		translation: "Die Heuchler",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 64,
		name: "التغابن",
		transliteration: "At-Taghabun",
		translation: "Die gegenseitige Übervorteilung",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 65,
		name: "الطلاق",
		transliteration: "At-Talaq",
		translation: "Die Scheidung",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 66,
		name: "التحريم",
		transliteration: "At-Tahrim",
		translation: "Das Verbot",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 67,
		name: "الملك",
		transliteration: "Al-Mulk",
		translation: "Die Herrschaft",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 68,
		name: "القلم",
		transliteration: "Al-Qalam",
		translation: "Der Federkiel",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 69,
		name: "الحاقة",
		transliteration: "Al-Haqqah",
		translation: "Die Wirklichkeit",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 70,
		name: "المعارج",
		transliteration: "Al-Ma'arij",
		translation: "Die Aufsteigenden Stufen",
		type: "meccan",
		total_verses: 44
	},
	{
		id: 71,
		name: "نوح",
		transliteration: "Nuh",
		translation: "Noah",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 72,
		name: "الجن",
		transliteration: "Al-Jinn",
		translation: "Die Dschinn",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 73,
		name: "المزمل",
		transliteration: "Al-Muzzammil",
		translation: "Der Eingehüllte",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 74,
		name: "المدثر",
		transliteration: "Al-Muddaththir",
		translation: "Der Bedeckte",
		type: "meccan",
		total_verses: 56
	},
	{
		id: 75,
		name: "القيامة",
		transliteration: "Al-Qiyamah",
		translation: "Die Auferstehung",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 76,
		name: "الانسان",
		transliteration: "Al-Insan",
		translation: "Der Mensch",
		type: "medinan",
		total_verses: 31
	},
	{
		id: 77,
		name: "المرسلات",
		transliteration: "Al-Mursalat",
		translation: "Die Gesandten",
		type: "meccan",
		total_verses: 50
	},
	{
		id: 78,
		name: "النبإ",
		transliteration: "An-Naba",
		translation: "Die Nachricht",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 79,
		name: "النازعات",
		transliteration: "An-Nazi'at",
		translation: "Die Entreißenden",
		type: "meccan",
		total_verses: 46
	},
	{
		id: 80,
		name: "عبس",
		transliteration: "'Abasa",
		translation: "Er runzelte die Stirn",
		type: "meccan",
		total_verses: 42
	},
	{
		id: 81,
		name: "التكوير",
		transliteration: "At-Takwir",
		translation: "Das Umhüllen",
		type: "meccan",
		total_verses: 29
	},
	{
		id: 82,
		name: "الإنفطار",
		transliteration: "Al-Infitar",
		translation: "Das Zerbersten",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 83,
		name: "المطففين",
		transliteration: "Al-Mutaffifin",
		translation: "Das Betrügen",
		type: "meccan",
		total_verses: 36
	},
	{
		id: 84,
		name: "الإنشقاق",
		transliteration: "Al-Inshiqaq",
		translation: "Das Zerreißen",
		type: "meccan",
		total_verses: 25
	},
	{
		id: 85,
		name: "البروج",
		transliteration: "Al-Buruj",
		translation: "Die Sternbilder",
		type: "meccan",
		total_verses: 22
	},
	{
		id: 86,
		name: "الطارق",
		transliteration: "At-Tariq",
		translation: "Der Nachtstern",
		type: "meccan",
		total_verses: 17
	},
	{
		id: 87,
		name: "الأعلى",
		transliteration: "Al-A'la",
		translation: "Der Allerhöchste",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 88,
		name: "الغاشية",
		transliteration: "Al-Ghashiyah",
		translation: "Das Überwältigende",
		type: "meccan",
		total_verses: 26
	},
	{
		id: 89,
		name: "الفجر",
		transliteration: "Al-Fajr",
		translation: "Die Morgendämmerung",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 90,
		name: "البلد",
		transliteration: "Al-Balad",
		translation: "Die Stadt",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 91,
		name: "الشمس",
		transliteration: "Ash-Shams",
		translation: "Die Sonne",
		type: "meccan",
		total_verses: 15
	},
	{
		id: 92,
		name: "الليل",
		transliteration: "Al-Layl",
		translation: "Die Nacht",
		type: "meccan",
		total_verses: 21
	},
	{
		id: 93,
		name: "الضحى",
		transliteration: "Ad-Duhaa",
		translation: "Der Vormittag",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 94,
		name: "الشرح",
		transliteration: "Ash-Sharh",
		translation: "Das Öffnen",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 95,
		name: "التين",
		transliteration: "At-Tin",
		translation: "Die Feige",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 96,
		name: "العلق",
		transliteration: "Al-'Alaq",
		translation: "Der Blutklumpen",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 97,
		name: "القدر",
		transliteration: "Al-Qadr",
		translation: "Die Bestimmung",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 98,
		name: "البينة",
		transliteration: "Al-Bayyinah",
		translation: "Der klare Beweis",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 99,
		name: "الزلزلة",
		transliteration: "Az-Zalzalah",
		translation: "Das Erdbeben",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 100,
		name: "العاديات",
		transliteration: "Al-'Adiyat",
		translation: "Die Rennenden",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 101,
		name: "القارعة",
		transliteration: "Al-Qari'ah",
		translation: "Der Donnerschlag",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 102,
		name: "التكاثر",
		transliteration: "At-Takathur",
		translation: "Die Wettbewerbsucht",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 103,
		name: "العصر",
		transliteration: "Al-'Asr",
		translation: "Die Zeit",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 104,
		name: "الهمزة",
		transliteration: "Al-Humazah",
		translation: "Der Stichler",
		type: "meccan",
		total_verses: 9
	},
	{
		id: 105,
		name: "الفيل",
		transliteration: "Al-Fil",
		translation: "Der Elefant",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 106,
		name: "قريش",
		transliteration: "Quraysh",
		translation: "Quraisch",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 107,
		name: "الماعون",
		transliteration: "Al-Ma'un",
		translation: "Die Hilfeleistung",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 108,
		name: "الكوثر",
		transliteration: "Al-Kawthar",
		translation: "Die Überfülle",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 109,
		name: "الكافرون",
		transliteration: "Al-Kafirun",
		translation: "Die Ungläubigen",
		type: "meccan",
		total_verses: 6
	},
	{
		id: 110,
		name: "النصر",
		transliteration: "An-Nasr",
		translation: "Der Beistand",
		type: "medinan",
		total_verses: 3
	},
	{
		id: 111,
		name: "المسد",
		transliteration: "Al-Masad",
		translation: "Die Palmfasern",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 112,
		name: "الإخلاص",
		transliteration: "Al-Ikhlas",
		translation: "Die Aufrichtigkeit",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 113,
		name: "الفلق",
		transliteration: "Al-Falaq",
		translation: "Das Frühlicht",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 114,
		name: "الناس",
		transliteration: "An-Nas",
		translation: "Die Menschen",
		type: "meccan",
		total_verses: 6
	}
];

const chaptersHe = [
	{
		id: 1,
		name: "الفاتحة",
		transliteration: "Al-Fatihah",
		translation: "הפותח",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 2,
		name: "البقرة",
		transliteration: "Al-Baqarah",
		translation: "הפרה",
		type: "medinan",
		total_verses: 286
	},
	{
		id: 3,
		name: "آل عمران",
		transliteration: "Ali 'Imran",
		translation: "משפחת עמרם",
		type: "medinan",
		total_verses: 200
	},
	{
		id: 4,
		name: "النساء",
		transliteration: "An-Nisa",
		translation: "הנשים",
		type: "medinan",
		total_verses: 176
	},
	{
		id: 5,
		name: "المائدة",
		transliteration: "Al-Ma'idah",
		translation: "השולחן הערוך",
		type: "medinan",
		total_verses: 120
	},
	{
		id: 6,
		name: "الأنعام",
		transliteration: "Al-An'am",
		translation: "הבקר",
		type: "meccan",
		total_verses: 165
	},
	{
		id: 7,
		name: "الأعراف",
		transliteration: "Al-A'raf",
		translation: "המקומות הגבוהים",
		type: "meccan",
		total_verses: 206
	},
	{
		id: 8,
		name: "الأنفال",
		transliteration: "Al-Anfal",
		translation: "שלל המלחמה",
		type: "medinan",
		total_verses: 75
	},
	{
		id: 9,
		name: "التوبة",
		transliteration: "At-Tawbah",
		translation: "התשובה",
		type: "medinan",
		total_verses: 129
	},
	{
		id: 10,
		name: "يونس",
		transliteration: "Yunus",
		translation: "יונה",
		type: "meccan",
		total_verses: 109
	},
	{
		id: 11,
		name: "هود",
		transliteration: "Hud",
		translation: "הוד",
		type: "meccan",
		total_verses: 123
	},
	{
		id: 12,
		name: "يوسف",
		transliteration: "Yusuf",
		translation: "יוסף",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 13,
		name: "الرعد",
		transliteration: "Ar-Ra'd",
		translation: "הרעם",
		type: "medinan",
		total_verses: 43
	},
	{
		id: 14,
		name: "ابراهيم",
		transliteration: "Ibrahim",
		translation: "אברהם",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 15,
		name: "الحجر",
		transliteration: "Al-Hijr",
		translation: "האזור הסלעי",
		type: "meccan",
		total_verses: 99
	},
	{
		id: 16,
		name: "النحل",
		transliteration: "An-Nahl",
		translation: "הדבורה",
		type: "meccan",
		total_verses: 128
	},
	{
		id: 17,
		name: "الإسراء",
		transliteration: "Al-Isra",
		translation: "מסע הלילה",
		type: "meccan",
		total_verses: 111
	},
	{
		id: 18,
		name: "الكهف",
		transliteration: "Al-Kahf",
		translation: "המערה",
		type: "meccan",
		total_verses: 110
	},
	{
		id: 19,
		name: "مريم",
		transliteration: "Maryam",
		translation: "מרים",
		type: "meccan",
		total_verses: 98
	},
	{
		id: 20,
		name: "طه",
		transliteration: "Taha",
		translation: "טאהא",
		type: "meccan",
		total_verses: 135
	},
	{
		id: 21,
		name: "الأنبياء",
		transliteration: "Al-Anbya",
		translation: "הנביאים",
		type: "meccan",
		total_verses: 112
	},
	{
		id: 22,
		name: "الحج",
		transliteration: "Al-Hajj",
		translation: "העלייה לרגל",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 23,
		name: "المؤمنون",
		transliteration: "Al-Mu'minun",
		translation: "המאמינים",
		type: "meccan",
		total_verses: 118
	},
	{
		id: 24,
		name: "النور",
		transliteration: "An-Nur",
		translation: "האור",
		type: "medinan",
		total_verses: 64
	},
	{
		id: 25,
		name: "الفرقان",
		transliteration: "Al-Furqan",
		translation: "האמת המבדילה",
		type: "meccan",
		total_verses: 77
	},
	{
		id: 26,
		name: "الشعراء",
		transliteration: "Ash-Shu'ara",
		translation: "המשוררים",
		type: "meccan",
		total_verses: 227
	},
	{
		id: 27,
		name: "النمل",
		transliteration: "An-Naml",
		translation: "הנמלה",
		type: "meccan",
		total_verses: 93
	},
	{
		id: 28,
		name: "القصص",
		transliteration: "Al-Qasas",
		translation: "הסיפורים",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 29,
		name: "العنكبوت",
		transliteration: "Al-'Ankabut",
		translation: "העכביש",
		type: "meccan",
		total_verses: 69
	},
	{
		id: 30,
		name: "الروم",
		transliteration: "Ar-Rum",
		translation: "הרומאים",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 31,
		name: "لقمان",
		transliteration: "Luqman",
		translation: "לוקמאן",
		type: "meccan",
		total_verses: 34
	},
	{
		id: 32,
		name: "السجدة",
		transliteration: "As-Sajdah",
		translation: "ההשתחוויה",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 33,
		name: "الأحزاب",
		transliteration: "Al-Ahzab",
		translation: "הכוחות המאוחדים",
		type: "medinan",
		total_verses: 73
	},
	{
		id: 34,
		name: "سبإ",
		transliteration: "Saba",
		translation: "שבא",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 35,
		name: "فاطر",
		transliteration: "Fatir",
		translation: "היוצר",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 36,
		name: "يس",
		transliteration: "Ya-Sin",
		translation: "יא סין",
		type: "meccan",
		total_verses: 83
	},
	{
		id: 37,
		name: "الصافات",
		transliteration: "As-Saffat",
		translation: "העורכים בשורות",
		type: "meccan",
		total_verses: 182
	},
	{
		id: 38,
		name: "ص",
		transliteration: "Sad",
		translation: "האות צאד",
		type: "meccan",
		total_verses: 88
	},
	{
		id: 39,
		name: "الزمر",
		transliteration: "Az-Zumar",
		translation: "הגדודים",
		type: "meccan",
		total_verses: 75
	},
	{
		id: 40,
		name: "غافر",
		transliteration: "Ghafir",
		translation: "הסולח",
		type: "meccan",
		total_verses: 85
	},
	{
		id: 41,
		name: "فصلت",
		transliteration: "Fussilat",
		translation: "המפורט",
		type: "meccan",
		total_verses: 54
	},
	{
		id: 42,
		name: "الشورى",
		transliteration: "Ash-Shuraa",
		translation: "ההתייעצות",
		type: "meccan",
		total_verses: 53
	},
	{
		id: 43,
		name: "الزخرف",
		transliteration: "Az-Zukhruf",
		translation: "קישוטי הזהב",
		type: "meccan",
		total_verses: 89
	},
	{
		id: 44,
		name: "الدخان",
		transliteration: "Ad-Dukhan",
		translation: "העשן",
		type: "meccan",
		total_verses: 59
	},
	{
		id: 45,
		name: "الجاثية",
		transliteration: "Al-Jathiyah",
		translation: "הכורעים",
		type: "meccan",
		total_verses: 37
	},
	{
		id: 46,
		name: "الأحقاف",
		transliteration: "Al-Ahqaf",
		translation: "גבעות החול המעוקלות",
		type: "meccan",
		total_verses: 35
	},
	{
		id: 47,
		name: "محمد",
		transliteration: "Muhammad",
		translation: "מוחמד",
		type: "medinan",
		total_verses: 38
	},
	{
		id: 48,
		name: "الفتح",
		transliteration: "Al-Fath",
		translation: "הניצחון",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 49,
		name: "الحجرات",
		transliteration: "Al-Hujurat",
		translation: "החדרים",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 50,
		name: "ق",
		transliteration: "Qaf",
		translation: "האות קאף",
		type: "meccan",
		total_verses: 45
	},
	{
		id: 51,
		name: "الذاريات",
		transliteration: "Adh-Dhariyat",
		translation: "רוחות המזרה",
		type: "meccan",
		total_verses: 60
	},
	{
		id: 52,
		name: "الطور",
		transliteration: "At-Tur",
		translation: "ההר",
		type: "meccan",
		total_verses: 49
	},
	{
		id: 53,
		name: "النجم",
		transliteration: "An-Najm",
		translation: "הכוכב",
		type: "meccan",
		total_verses: 62
	},
	{
		id: 54,
		name: "القمر",
		transliteration: "Al-Qamar",
		translation: "הירח",
		type: "meccan",
		total_verses: 55
	},
	{
		id: 55,
		name: "الرحمن",
		transliteration: "Ar-Rahman",
		translation: "הרחמן",
		type: "medinan",
		total_verses: 78
	},
	{
		id: 56,
		name: "الواقعة",
		transliteration: "Al-Waqi'ah",
		translation: "הבלתי נמנע",
		type: "meccan",
		total_verses: 96
	},
	{
		id: 57,
		name: "الحديد",
		transliteration: "Al-Hadid",
		translation: "הברזל",
		type: "medinan",
		total_verses: 29
	},
	{
		id: 58,
		name: "المجادلة",
		transliteration: "Al-Mujadila",
		translation: "האישה הטוענת",
		type: "medinan",
		total_verses: 22
	},
	{
		id: 59,
		name: "الحشر",
		transliteration: "Al-Hashr",
		translation: "הגלות",
		type: "medinan",
		total_verses: 24
	},
	{
		id: 60,
		name: "الممتحنة",
		transliteration: "Al-Mumtahanah",
		translation: "זו שתיבדק",
		type: "medinan",
		total_verses: 13
	},
	{
		id: 61,
		name: "الصف",
		transliteration: "As-Saf",
		translation: "השורות",
		type: "medinan",
		total_verses: 14
	},
	{
		id: 62,
		name: "الجمعة",
		transliteration: "Al-Jumu'ah",
		translation: "הקהילה, יום השישי",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 63,
		name: "المنافقون",
		transliteration: "Al-Munafiqun",
		translation: "הצבועים",
		type: "medinan",
		total_verses: 11
	},
	{
		id: 64,
		name: "التغابن",
		transliteration: "At-Taghabun",
		translation: "ההתפכחות ההדדית",
		type: "medinan",
		total_verses: 18
	},
	{
		id: 65,
		name: "الطلاق",
		transliteration: "At-Talaq",
		translation: "הגירושין",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 66,
		name: "التحريم",
		transliteration: "At-Tahrim",
		translation: "האיסור",
		type: "medinan",
		total_verses: 12
	},
	{
		id: 67,
		name: "الملك",
		transliteration: "Al-Mulk",
		translation: "הריבונות",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 68,
		name: "القلم",
		transliteration: "Al-Qalam",
		translation: "העט",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 69,
		name: "الحاقة",
		transliteration: "Al-Haqqah",
		translation: "המציאות",
		type: "meccan",
		total_verses: 52
	},
	{
		id: 70,
		name: "المعارج",
		transliteration: "Al-Ma'arij",
		translation: "מדרגות העלייה",
		type: "meccan",
		total_verses: 44
	},
	{
		id: 71,
		name: "نوح",
		transliteration: "Nuh",
		translation: "נח",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 72,
		name: "الجن",
		transliteration: "Al-Jinn",
		translation: "השדים",
		type: "meccan",
		total_verses: 28
	},
	{
		id: 73,
		name: "المزمل",
		transliteration: "Al-Muzzammil",
		translation: "המתעטף",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 74,
		name: "المدثر",
		transliteration: "Al-Muddaththir",
		translation: "העוטה",
		type: "meccan",
		total_verses: 56
	},
	{
		id: 75,
		name: "القيامة",
		transliteration: "Al-Qiyamah",
		translation: "התחייה",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 76,
		name: "الانسان",
		transliteration: "Al-Insan",
		translation: "האדם",
		type: "medinan",
		total_verses: 31
	},
	{
		id: 77,
		name: "المرسلات",
		transliteration: "Al-Mursalat",
		translation: "השליחים",
		type: "meccan",
		total_verses: 50
	},
	{
		id: 78,
		name: "النبإ",
		transliteration: "An-Naba",
		translation: "הבשורה",
		type: "meccan",
		total_verses: 40
	},
	{
		id: 79,
		name: "النازعات",
		transliteration: "An-Nazi'at",
		translation: "המושכים בכוח",
		type: "meccan",
		total_verses: 46
	},
	{
		id: 80,
		name: "عبس",
		transliteration: "'Abasa",
		translation: "הפנה את פניו",
		type: "meccan",
		total_verses: 42
	},
	{
		id: 81,
		name: "التكوير",
		transliteration: "At-Takwir",
		translation: "ההתהפכות",
		type: "meccan",
		total_verses: 29
	},
	{
		id: 82,
		name: "الإنفطار",
		transliteration: "Al-Infitar",
		translation: "ההבקעה",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 83,
		name: "المطففين",
		transliteration: "Al-Mutaffifin",
		translation: "המקפחים",
		type: "meccan",
		total_verses: 36
	},
	{
		id: 84,
		name: "الإنشقاق",
		transliteration: "Al-Inshiqaq",
		translation: "ההתבקעות",
		type: "meccan",
		total_verses: 25
	},
	{
		id: 85,
		name: "البروج",
		transliteration: "Al-Buruj",
		translation: "מעונות הכוכבים",
		type: "meccan",
		total_verses: 22
	},
	{
		id: 86,
		name: "الطارق",
		transliteration: "At-Tariq",
		translation: "הבא בלילה",
		type: "meccan",
		total_verses: 17
	},
	{
		id: 87,
		name: "الأعلى",
		transliteration: "Al-A'la",
		translation: "העליון",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 88,
		name: "الغاشية",
		transliteration: "Al-Ghashiyah",
		translation: "המכריע",
		type: "meccan",
		total_verses: 26
	},
	{
		id: 89,
		name: "الفجر",
		transliteration: "Al-Fajr",
		translation: "השחר",
		type: "meccan",
		total_verses: 30
	},
	{
		id: 90,
		name: "البلد",
		transliteration: "Al-Balad",
		translation: "העיר",
		type: "meccan",
		total_verses: 20
	},
	{
		id: 91,
		name: "الشمس",
		transliteration: "Ash-Shams",
		translation: "השמש",
		type: "meccan",
		total_verses: 15
	},
	{
		id: 92,
		name: "الليل",
		transliteration: "Al-Layl",
		translation: "הלילה",
		type: "meccan",
		total_verses: 21
	},
	{
		id: 93,
		name: "الضحى",
		transliteration: "Ad-Duhaa",
		translation: "שעות הבוקר",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 94,
		name: "الشرح",
		transliteration: "Ash-Sharh",
		translation: "ההקלה",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 95,
		name: "التين",
		transliteration: "At-Tin",
		translation: "התאנה",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 96,
		name: "العلق",
		transliteration: "Al-'Alaq",
		translation: "הקריש",
		type: "meccan",
		total_verses: 19
	},
	{
		id: 97,
		name: "القدر",
		transliteration: "Al-Qadr",
		translation: "העוצמה",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 98,
		name: "البينة",
		transliteration: "Al-Bayyinah",
		translation: "הראיה הברורה",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 99,
		name: "الزلزلة",
		transliteration: "Az-Zalzalah",
		translation: "הרעש",
		type: "medinan",
		total_verses: 8
	},
	{
		id: 100,
		name: "العاديات",
		transliteration: "Al-'Adiyat",
		translation: "הדוהר",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 101,
		name: "القارعة",
		transliteration: "Al-Qari'ah",
		translation: "האסון",
		type: "meccan",
		total_verses: 11
	},
	{
		id: 102,
		name: "التكاثر",
		transliteration: "At-Takathur",
		translation: "התחרות בהצטברות",
		type: "meccan",
		total_verses: 8
	},
	{
		id: 103,
		name: "العصر",
		transliteration: "Al-'Asr",
		translation: "הזמן הדועך",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 104,
		name: "الهمزة",
		transliteration: "Al-Humazah",
		translation: "המשמיץ",
		type: "meccan",
		total_verses: 9
	},
	{
		id: 105,
		name: "الفيل",
		transliteration: "Al-Fil",
		translation: "הפיל",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 106,
		name: "قريش",
		transliteration: "Quraysh",
		translation: "קורייש",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 107,
		name: "الماعون",
		transliteration: "Al-Ma'un",
		translation: "החסדים הקטנים",
		type: "meccan",
		total_verses: 7
	},
	{
		id: 108,
		name: "الكوثر",
		transliteration: "Al-Kawthar",
		translation: "השפע",
		type: "meccan",
		total_verses: 3
	},
	{
		id: 109,
		name: "الكافرون",
		transliteration: "Al-Kafirun",
		translation: "הכופרים",
		type: "meccan",
		total_verses: 6
	},
	{
		id: 110,
		name: "النصر",
		transliteration: "An-Nasr",
		translation: "התמיכה האלוהית",
		type: "medinan",
		total_verses: 3
	},
	{
		id: 111,
		name: "المسد",
		transliteration: "Al-Masad",
		translation: "סיב הדקל",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 112,
		name: "الإخلاص",
		transliteration: "Al-Ikhlas",
		translation: "הכנות",
		type: "meccan",
		total_verses: 4
	},
	{
		id: 113,
		name: "الفلق",
		transliteration: "Al-Falaq",
		translation: "שחר",
		type: "meccan",
		total_verses: 5
	},
	{
		id: 114,
		name: "الناس",
		transliteration: "An-Nas",
		translation: "האנושות",
		type: "meccan",
		total_verses: 6
	}
];

export { chaptersTr as a, chaptersDe as b, chaptersRu as c, chaptersHe as d };
//# sourceMappingURL=he.mjs.map
