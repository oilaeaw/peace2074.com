export const appStoreLocales = [
    'en-US',
    'ar-SA',
    'de-DE',
    'es-ES',
    'ru',
    'he',
    'it',
    'tr',
] as const

export type AppStoreLocale = (typeof appStoreLocales)[number]

export const localizableMetadataFiles = [
    'name.txt',
    'subtitle.txt',
    'description.txt',
    'keywords.txt',
    'promotional_text.txt',
    'release_notes.txt',
] as const

export type LocalizableMetadataFile = (typeof localizableMetadataFiles)[number]

export const localizedMetadata: Record<
    AppStoreLocale,
    Record<LocalizableMetadataFile, string>
> = {
    'en-US': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Quran, Prayer & Guide',
        'description.txt': `Peace2074 is a multilingual Islamic companion for every Muslim — from first-time readers to lifelong learners.

Read the complete Quran
Explore all 114 Surahs with Arabic text, transliterations, and translations in English, Arabic, German, Spanish, Russian, Hebrew, Italian, and Turkish.

Discover the 99 Holy Names
Learn the meanings and reflections behind the 99 Names of Allah.

Tasbeeh Counter
Track your daily dhikr with a simple tap-to-count Tasbeeh.

AI Islamic Guide
Ask questions about the Quran, Islamic history, and daily practice.

Athan, articles, and offline access
Listen to the Athan, browse Islamic articles, and keep core Quran features available offline.

Built for multilingual use
Peace2074 supports RTL for Arabic and Hebrew and feels natural in every supported language.

Download Peace2074 and keep the Quran with you wherever you go.`,
        'keywords.txt': 'quran,islam,muslim,tasbeeh,athan,dhikr,prayer,holy names,islamic guide',
        'promotional_text.txt': 'Read the complete Quran in 8 languages, explore the 99 Holy Names, track Tasbeeh, and chat with an AI Islamic guide — all in one app.',
        'release_notes.txt': 'Initial iOS release of Peace2074. Read the full Quran in 8 languages, explore the 99 Holy Names, track Tasbeeh, and use the AI Islamic guide.',
    },
    'ar-SA': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'القرآن والصلاة والدليل',
        'description.txt': `Peace2074 هو رفيق إسلامي متعدد اللغات لكل مسلم — من المبتدئين إلى طلاب العلم مدى الحياة.

اقرأ القرآن كاملًا
استكشف جميع السور الـ114 مع النص العربي، والقراءة الصوتية، والترجمات إلى الإنجليزية والعربية والألمانية والإسبانية والروسية والعبرية والإيطالية والتركية.

اكتشف أسماء الله الحسنى الـ99
تعرّف على المعاني والتأملات المرتبطة بأسماء الله الحسنى.

عداد التسبيح
تابع ذكرك اليومي من خلال عداد تسبيح بسيط وسهل الاستخدام.

مرشد إسلامي بالذكاء الاصطناعي
اطرح أسئلة عن القرآن والتاريخ الإسلامي والممارسة اليومية.

الأذان والمقالات والوصول دون اتصال
استمع إلى الأذان، وتصفح المقالات الإسلامية، واحتفظ بميزات القرآن الأساسية متاحة دون إنترنت.

مصمم لتجربة متعددة اللغات
يدعم Peace2074 اتجاه RTL للعربية والعبرية ويمنحك تجربة طبيعية في كل لغة مدعومة.

حمّل Peace2074 وابقَ على صلة بالقرآن أينما كنت.`,
        'keywords.txt': 'القرآن,إسلام,مسلم,تسبيح,أذان,ذكر,صلاة,أسماء الله',
        'promotional_text.txt': 'اقرأ القرآن كاملًا بـ8 لغات، واستكشف أسماء الله الحسنى الـ99، وتتبع تسبيحك، وتحدث مع مرشد إسلامي بالذكاء الاصطناعي — كل ذلك في تطبيق واحد.',
        'release_notes.txt': 'الإصدار الأول من Peace2074 على iOS. اقرأ القرآن كاملًا بـ8 لغات، واستكشف أسماء الله الحسنى، وتتبع تسبيحك، واستخدم المرشد الإسلامي بالذكاء الاصطناعي.',
    },
    'de-DE': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Koran, Gebet & Begleiter',
        'description.txt': `Peace2074 ist ein mehrsprachiger islamischer Begleiter für jeden Muslim — vom ersten Lesen bis zum lebenslangen Lernen.

Lies den vollständigen Koran
Entdecke alle 114 Suren mit arabischem Text, Transkriptionen und Übersetzungen auf Englisch, Arabisch, Deutsch, Spanisch, Russisch, Hebräisch, Italienisch und Türkisch.

Entdecke die 99 schönen Namen
Lerne die Bedeutungen und Gedanken hinter den 99 Namen Allahs kennen.

Tasbeeh-Zähler
Verfolge deinen täglichen Dhikr mit einem einfachen Tasbeeh-Zähler.

Islamischer KI-Begleiter
Stelle Fragen zum Koran, zur islamischen Geschichte und zur täglichen Praxis.

Adhan, Artikel und Offline-Zugriff
Höre den Adhan, lies islamische Artikel und nutze die wichtigsten Koran-Funktionen auch ohne Internet.

Für mehrere Sprachen entwickelt
Peace2074 unterstützt RTL für Arabisch und Hebräisch und fühlt sich in jeder unterstützten Sprache natürlich an.

Lade Peace2074 herunter und trage den Koran überall mit dir.`,
        'keywords.txt': 'koran,islam,muslim,tasbeeh,adhan,dhikr,gebet,99 namen',
        'promotional_text.txt': 'Lies den vollständigen Koran in 8 Sprachen, entdecke die 99 Namen Allahs, zähle dein Tasbeeh und nutze einen islamischen KI-Begleiter — alles in einer App.',
        'release_notes.txt': 'Erste iOS-Version von Peace2074. Lies den vollständigen Koran in 8 Sprachen, entdecke die 99 Namen Allahs, zähle Tasbeeh und nutze den islamischen KI-Begleiter.',
    },
    'es-ES': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Corán, oración y guía',
        'description.txt': `Peace2074 es un compañero islámico multilingüe para cada musulmán, desde quienes empiezan a leer hasta quienes aprenden toda la vida.

Lee el Corán completo
Explora las 114 suras con texto árabe, transliteraciones y traducciones en inglés, árabe, alemán, español, ruso, hebreo, italiano y turco.

Descubre los 99 Bellos Nombres
Conoce el significado y la reflexión detrás de los 99 nombres de Allah.

Contador de Tasbeeh
Sigue tu dhikr diario con un contador sencillo y cómodo.

Guía islámica con IA
Haz preguntas sobre el Corán, la historia islámica y la práctica diaria.

Adhan, artículos y acceso sin conexión
Escucha el Adhan, lee artículos islámicos y mantén las funciones esenciales del Corán disponibles sin internet.

Pensado para varios idiomas
Peace2074 ofrece soporte RTL para árabe y hebreo y se siente natural en cada idioma compatible.

Descarga Peace2074 y lleva el Corán contigo donde vayas.`,
        'keywords.txt': 'coran,islam,musulman,tasbeeh,adhan,dhikr,oracion,99 nombres',
        'promotional_text.txt': 'Lee el Corán completo en 8 idiomas, explora los 99 nombres de Allah, sigue tu Tasbeeh y usa una guía islámica con IA — todo en una sola app.',
        'release_notes.txt': 'Lanzamiento inicial de Peace2074 para iOS. Lee el Corán completo en 8 idiomas, explora los 99 nombres de Allah, sigue tu Tasbeeh y usa la guía islámica con IA.',
    },
    'ru': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Коран, намаз и гид',
        'description.txt': `Peace2074 — многоязычный исламский помощник для каждого мусульманина: от начинающих читателей до тех, кто учится всю жизнь.

Читайте Коран полностью
Изучайте все 114 сур с арабским текстом, транслитерацией и переводами на английский, арабский, немецкий, испанский, русский, иврит, итальянский и турецкий языки.

Откройте 99 прекрасных имен
Узнайте смыслы и размышления, связанные с 99 именами Аллаха.

Счетчик тасбиха
Отслеживайте ежедневный зикр с простым и удобным счетчиком.

Исламский помощник с ИИ
Задавайте вопросы о Коране, исламской истории и ежедневной практике.

Азан, статьи и офлайн-доступ
Слушайте азан, читайте исламские статьи и пользуйтесь основными функциями Корана без интернета.

Удобно для разных языков
Peace2074 поддерживает RTL для арабского и иврита и естественно выглядит на каждом поддерживаемом языке.

Скачайте Peace2074 и носите Коран с собой везде.`,
        'keywords.txt': 'коран,ислам,мусульманин,тасбих,азан,зикр,намаз,99 имен',
        'promotional_text.txt': 'Читайте Коран полностью на 8 языках, изучайте 99 имен Аллаха, считайте тасбих и пользуйтесь исламским помощником с ИИ — в одном приложении.',
        'release_notes.txt': 'Первый релиз Peace2074 для iOS. Читайте Коран полностью на 8 языках, изучайте 99 имен Аллаха, считайте тасбих и пользуйтесь исламским помощником с ИИ.',
    },
    'he': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'קוראן, תפילה ומדריך',
        'description.txt': `Peace2074 הוא מלווה אסלאמי רב-לשוני לכל מוסלמי — מקוראים מתחילים ועד ללומדים כל החיים.

קראו את הקוראן המלא
גלו את כל 114 הסורות עם טקסט בערבית, תעתיק ותרגומים לאנגלית, ערבית, גרמנית, ספרדית, רוסית, עברית, איטלקית וטורקית.

גלו את 99 השמות היפים
למדו את המשמעויות והמחשבות שמאחורי 99 שמותיו של אללה.

מונה תסביח
עקבו אחר הד'יכר היומי שלכם עם מונה פשוט ונוח.

מדריך אסלאמי עם בינה מלאכותית
שאלו שאלות על הקוראן, ההיסטוריה האסלאמית והעשייה היומיומית.

אד'אן, מאמרים וגישה לא מקוונת
האזינו לאד'אן, קראו מאמרים אסלאמיים ושמרו על תכונות הקוראן המרכזיות זמינות גם ללא אינטרנט.

בנוי לשימוש רב-לשוני
Peace2074 תומך ב-RTL לערבית ולעברית ומרגיש טבעי בכל שפה נתמכת.

הורידו את Peace2074 ושאו את הקוראן איתכם לכל מקום.`,
        'keywords.txt': 'קוראן,אסלאם,מוסלמי,תסביח,אדאן,דיכר,תפילה,99 שמות',
        'promotional_text.txt': 'קראו את הקוראן המלא ב-8 שפות, גלו את 99 שמותיו של אללה, עקבו אחר התסביח והשתמשו במדריך אסלאמי עם בינה מלאכותית — הכל באפליקציה אחת.',
        'release_notes.txt': 'גרסת iOS הראשונה של Peace2074. קראו את הקוראן המלא ב-8 שפות, גלו את 99 שמותיו של אללה, עקבו אחר התסביח והשתמשו במדריך האסלאמי עם בינה מלאכותית.',
    },
    'it': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Corano, preghiera e guida',
        'description.txt': `Peace2074 è un compagno islamico multilingue per ogni musulmano, dai primi lettori a chi studia per tutta la vita.

Leggi il Corano completo
Esplora tutte le 114 sure con testo arabo, traslitterazioni e traduzioni in inglese, arabo, tedesco, spagnolo, russo, ebraico, italiano e turco.

Scopri i 99 Belli Nomi
Conosci i significati e le riflessioni legate ai 99 nomi di Allah.

Contatore Tasbeeh
Tieni traccia del tuo dhikr quotidiano con un contatore semplice e immediato.

Guida islamica con IA
Fai domande sul Corano, sulla storia islamica e sulla pratica quotidiana.

Adhan, articoli e accesso offline
Ascolta l'Adhan, leggi articoli islamici e mantieni disponibili offline le funzioni essenziali del Corano.

Pensato per più lingue
Peace2074 supporta RTL per arabo ed ebraico e risulta naturale in ogni lingua supportata.

Scarica Peace2074 e porta il Corano con te ovunque.`,
        'keywords.txt': 'corano,islam,musulmano,tasbeeh,adhan,dhikr,preghiera,99 nomi',
        'promotional_text.txt': 'Leggi il Corano completo in 8 lingue, scopri i 99 nomi di Allah, tieni il conto del Tasbeeh e usa una guida islamica con IA — tutto in un’unica app.',
        'release_notes.txt': 'Prima versione iOS di Peace2074. Leggi il Corano completo in 8 lingue, scopri i 99 nomi di Allah, tieni il conto del Tasbeeh e usa la guida islamica con IA.',
    },
    'tr': {
        'name.txt': 'Peace2074',
        'subtitle.txt': 'Kuran, namaz ve rehber',
        'description.txt': `Peace2074, ilk kez okuyanlardan ömür boyu öğrenenlere kadar her Müslüman için çok dilli bir İslami yardımcıdır.

Kur'an-ı Kerim'in tamamını okuyun
Arapça metin, okunuş ve İngilizce, Arapça, Almanca, İspanyolca, Rusça, İbranice, İtalyanca ve Türkçe çevirilerle 114 surenin tamamını keşfedin.

99 güzel ismi keşfedin
Allah’ın 99 isminin anlamlarını ve manevi yansımalarını öğrenin.

Tesbih sayacı
Günlük zikrinizi sade ve kullanışlı bir sayaçla takip edin.

Yapay zekâ destekli İslami rehber
Kur'an, İslam tarihi ve günlük ibadet hakkında sorular sorun.

Ezan, makaleler ve çevrimdışı erişim
Ezanı dinleyin, İslami yazıları okuyun ve Kur'an'ın temel özelliklerini internetsiz de kullanın.

Çok dilli kullanım için tasarlandı
Peace2074, Arapça ve İbranice için RTL desteği sunar ve her desteklenen dilde doğal hissettirir.

Peace2074'ü indirin ve Kur'an'ı her yere yanınızda taşıyın.`,
        'keywords.txt': 'kuran,islam,musluman,tesbih,ezan,zikir,namaz,99 isim',
        'promotional_text.txt': `Kur'an'ın tamamını 8 dilde okuyun, Allah'ın 99 ismini keşfedin, tesbihinizi takip edin ve yapay zekâ destekli İslami rehberi kullanın — hepsi tek uygulamada.`,
        'release_notes.txt': `Peace2074'ün iOS için ilk sürümü. Kur'an'ın tamamını 8 dilde okuyun, Allah'ın 99 ismini keşfedin, tesbihinizi takip edin ve yapay zekâ destekli İslami rehberi kullanın.`,
    },
}
