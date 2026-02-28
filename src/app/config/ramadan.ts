export type RamadanCampaignConfig = {
    id: string
    startsAt: string
    endsAt: string
    ctaRoutes: {
        quran: string
        tasbeeh: string
        chat: string
    }
    dailyPrompts: Record<string, string[]>
}

export const ramadanCampaign: RamadanCampaignConfig = {
    id: 'ramadan-2026',
    // Approximate Gregorian range for Ramadan 2026 (inclusive)
    startsAt: '2026-02-17T00:00:00.000Z',
    endsAt: '2026-03-19T23:59:59.999Z',
    ctaRoutes: {
        quran: '/quran',
        tasbeeh: '/tasbeeh',
        chat: '/chat',
    },
    dailyPrompts: {
        en: [
            'Read Surah Al-Mulk tonight and write one lesson you can practice tomorrow.',
            'Choose one verse about patience and reflect on it for 2 minutes.',
            'Send one kind message in community chat to encourage someone today.',
            'Recite 33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar in Tasbeeh mode.',
            'Open Quran bookmarks and revisit a verse you saved this month.',
            'Read the translation of Surah Al-Ikhlas and summarize it in one sentence.',
            'Read one page from Quran and note one word that touched your heart.',
        ],
        ar: [
            'اقرأ سورة الملك الليلة واكتب درسًا واحدًا تطبقه غدًا.',
            'اختر آية عن الصبر وتأمل فيها لدقيقتين.',
            'أرسل رسالة طيبة في الدردشة لتشجيع أحدهم اليوم.',
            'سبّح 33 مرة سبحان الله، 33 مرة الحمد لله، 34 مرة الله أكبر.',
            'افتح العلامات المرجعية وارجع إلى آية حفظتها هذا الشهر.',
            'اقرأ ترجمة سورة الإخلاص ولخّص معناها بجملة واحدة.',
            'اقرأ صفحة من القرآن واكتب كلمة أثّرت في قلبك.',
        ],
        de: [
            'Lies heute Nacht Sure Al-Mulk und notiere eine Lektion für morgen.',
            'Wähle einen Vers über Geduld und reflektiere 2 Minuten darüber.',
            'Sende eine freundliche Nachricht im Community-Chat.',
            'Rezitiere 33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar.',
            'Öffne deine Lesezeichen und lies einen gespeicherten Vers erneut.',
            'Lies die Übersetzung von Sure Al-Ikhlas und fasse sie in einem Satz zusammen.',
            'Lies eine Seite im Koran und notiere ein Wort, das dich berührt hat.',
        ],
        ru: [
            'Прочитайте сегодня вечером суру Аль-Мульк и запишите один урок на завтра.',
            'Выберите аят о терпении и поразмышляйте над ним 2 минуты.',
            'Отправьте доброе сообщение в чате сообщества.',
            'Произнесите 33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar.',
            'Откройте закладки и перечитайте сохранённый в этом месяце аят.',
            'Прочитайте перевод суры Аль-Ихлас и перескажите в одном предложении.',
            'Прочитайте одну страницу Корана и отметьте слово, которое тронуло сердце.',
        ],
        he: [
            'קראו הלילה את סורת אל-מולכ וכתבו לקח אחד למחר.',
            'בחרו פסוק על סבלנות והרהרו בו במשך שתי דקות.',
            'שלחו הודעה טובה אחת בצ׳אט הקהילתי.',
            'אמרו 33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar.',
            'פתחו את הסימניות וחזרו לפסוק ששמרתם החודש.',
            'קראו תרגום של סורת אל-אח׳לאס וסכמו במשפט אחד.',
            'קראו עמוד אחד מהקוראן וציינו מילה שנגעה בלבכם.',
        ],
    },
}

export function isRamadanCampaignActive(now = new Date()): boolean {
    const start = Date.parse(ramadanCampaign.startsAt)
    const end = Date.parse(ramadanCampaign.endsAt)
    const current = now.getTime()
    return Number.isFinite(start) && Number.isFinite(end) && current >= start && current <= end
}

export function getRamadanPrompt(locale: string, now = new Date()): string {
    const normalized = String(locale || 'en').toLowerCase().split('-')[0]
    const prompts = ramadanCampaign.dailyPrompts[normalized] || ramadanCampaign.dailyPrompts.en || []
    if (!prompts.length) return ''

    const start = Date.parse(ramadanCampaign.startsAt)
    const current = now.getTime()
    const dayIndex = Number.isFinite(start)
        ? Math.max(0, Math.floor((current - start) / (24 * 60 * 60 * 1000)))
        : 0

    return prompts[dayIndex % prompts.length]
}
