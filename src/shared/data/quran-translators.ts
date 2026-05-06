export interface QuranTranslator {
    id: number
    name: string
}

/**
 * Available translators per language code (quran.com translation IDs).
 * First entry in each array is the curated default for that locale.
 */
export const QURAN_TRANSLATORS: Record<string, QuranTranslator[]> = {
    ar: [
        { id: 16, name: 'تفسير المیسر' },
        { id: 17, name: 'تفسير الجلالين' },
        { id: 230, name: 'تفسير ابن كثير' },
    ],
    en: [
        { id: 20, name: 'Saheeh International' },
        { id: 22, name: 'Abdullah Yusuf Ali' },
        { id: 19, name: 'Pickthall' },
        { id: 85, name: 'Abdel Haleem (Oxford)' },
        { id: 149, name: "Bridges' Translation (Fadel Soliman)" },
    ],
    de: [
        { id: 27, name: 'Bubenheim & Nadeem' },
        { id: 208, name: 'Abu Reda Muhammad ibn Ahmad' },
    ],
    fr: [
        { id: 31, name: 'Muhammad Hamidullah' },
        { id: 136, name: 'Montada Islamic Foundation' },
        { id: 779, name: 'Rashid Maash' },
    ],
    ru: [
        { id: 45, name: 'Elmir Kuliev' },
        { id: 79, name: 'Abu Adel' },
    ],
    tr: [
        { id: 77, name: 'Diyanet İşleri' },
        { id: 52, name: 'Elmalılı Hamdi Yazır' },
    ],
    ur: [
        { id: 84, name: 'Mufti Taqi Usmani' },
        { id: 54, name: 'Maulana Muhammad Junagarhi' },
        { id: 97, name: 'Tafheem e Quran – Maududi' },
    ],
    /**
     * Hebrew: quran.com has one entry (ID 233) but coverage is limited.
     * The bundled he.json edition is used as the primary offline source;
     * 233 is available as an online option.
     */
    he: [
        { id: 233, name: 'Dar Al-Salam Center' },
    ],
    id: [
        { id: 33, name: 'Kementerian Agama RI' },
        { id: 134, name: 'King Fahad Quran Complex' },
    ],
    sv: [
        { id: 48, name: 'Knut Bernström' },
    ],
    zh: [
        { id: 56, name: 'Ma Jian (Simplified)' },
        { id: 109, name: 'Muhammad Makin' },
    ],
    bn: [
        { id: 162, name: 'Rawai Al-bayan (Bayaan Foundation)' },
        { id: 161, name: 'Taisirul Quran' },
        { id: 213, name: 'Dr. Abu Bakr Muhammad Zakaria' },
    ],
    es: [
        { id: 83, name: 'Sheikh Isa Garcia' },
        { id: 140, name: 'Montada Islamic Foundation' },
        { id: 199, name: 'Noor International Center' },
    ],
    it: [
        { id: 153, name: 'Hamza Roberto Piccardo' },
        { id: 209, name: 'Othman al-Sharif' },
    ],
}

/** The default (first) translator ID for each locale. Falls back to English (Saheeh International). */
export function getDefaultTranslatorId(locale: string): number {
    const list = QURAN_TRANSLATORS[locale]
    return list?.[0]?.id ?? QURAN_TRANSLATORS.en[0].id
}

/** localStorage key storing a JSON map of locale → translator ID. */
export const TRANSLATOR_PREF_KEY = 'quran-translator-prefs'

/** Read the stored translator ID for a given locale, or return the curated default. */
export function readTranslatorIdForLocale(locale: string): number {
    if (typeof window === 'undefined') return getDefaultTranslatorId(locale)
    try {
        const raw = window.localStorage.getItem(TRANSLATOR_PREF_KEY)
        const prefs: Record<string, number> = raw ? JSON.parse(raw) : {}
        return prefs[locale] ?? getDefaultTranslatorId(locale)
    } catch {
        return getDefaultTranslatorId(locale)
    }
}

/** Persist the translator choice for a locale. */
export function persistTranslatorIdForLocale(locale: string, id: number): void {
    if (typeof window === 'undefined') return
    try {
        const raw = window.localStorage.getItem(TRANSLATOR_PREF_KEY)
        const prefs: Record<string, number> = raw ? JSON.parse(raw) : {}
        prefs[locale] = id
        window.localStorage.setItem(TRANSLATOR_PREF_KEY, JSON.stringify(prefs))
    } catch {
        // ignore storage errors
    }
}
