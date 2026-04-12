import { defineEventHandler, getQuery, getRouterParam, getRequestHeader } from 'h3'
import chaptersEn from '../../../../../src/shared/data/chapters/en.json'
import chaptersRu from '../../../../../src/shared/data/chapters/ru.json'
import chaptersTr from '../../../../../src/shared/data/chapters/tr.json'
import chaptersDe from '../../../../../src/shared/data/chapters/de.json'
import chaptersHe from '../../../../../src/shared/data/chapters/he.json'

import quranData from '../../../../../src/shared/data/quran.json'
import editionsEn from '../../../../../src/shared/data/editions/en.json'
import editionsEs from '../../../../../src/shared/data/editions/es.json'
import editionsRu from '../../../../../src/shared/data/editions/ru.json'
import editionsTr from '../../../../../src/shared/data/editions/tr.json'
import editionsDe from '../../../../../src/shared/data/editions/de.json'
import editionsHe from '../../../../../src/shared/data/editions/he.json'

export default defineEventHandler((event) => {
    const id = Number(getRouterParam(event, 'id') || 1)
    const query = getQuery(event)
    const requested = String(query.lang || query.locale || '').toLowerCase().trim()
    const acceptLanguage = String(getRequestHeader(event, 'accept-language') || '').toLowerCase()
    const localeFromHeader = acceptLanguage.split(',')[0]?.split('-')[0]?.trim() || ''
    const normalizeLocale = (value: string) => {
        const raw = String(value || '').toLowerCase().trim().replace('_', '-')
        const base = raw.split('-')[0] || ''
        const aliasMap: Record<string, string> = {
            iw: 'he',
            in: 'id',
            ji: 'yi',
        }
        return aliasMap[base] || base
    }
    const locale = normalizeLocale(requested || localeFromHeader || 'en') || 'en'

    const chapters = chaptersEn as any[]
    const chaptersRuList = chaptersRu as any[]
    const chaptersTrList = chaptersTr as any[]
    const chaptersDeList = chaptersDe as any[]
    const chaptersHeList = chaptersHe as any[]
    const book = quranData as Record<string, any[]>
    const editionsByLocale: Record<string, Record<string, any[]>> = {
        en: editionsEn as Record<string, any[]>,
        es: editionsEs as Record<string, any[]>,
        ru: editionsRu as Record<string, any[]>,
        tr: editionsTr as Record<string, any[]>,
        de: editionsDe as Record<string, any[]>,
        he: editionsHe as Record<string, any[]>,
    }

    const meta = (chapters || []).find((c: any) => Number(c?.id || c?.number) === id)
    const metaRu = (chaptersRuList || []).find((c: any) => Number(c?.id || c?.number) === id)
    const metaTr = (chaptersTrList || []).find((c: any) => Number(c?.id || c?.number) === id)
    const metaDe = (chaptersDeList || []).find((c: any) => Number(c?.id || c?.number) === id)
    const metaHe = (chaptersHeList || []).find((c: any) => Number(c?.id || c?.number) === id)
    const verses = Array.isArray(book[String(id)]) ? book[String(id)] : []

    const localeEdition = editionsByLocale[locale] || editionsByLocale.en
    const englishEdition = editionsByLocale.en
    const translatedVerses = Array.isArray(localeEdition?.[String(id)]) ? localeEdition[String(id)] : []
    const englishVerses = Array.isArray(englishEdition?.[String(id)]) ? englishEdition[String(id)] : []

    const byVerse = (arr: any[]) => {
        const out = new Map<number, string>()
            ; (arr || []).forEach((v: any) => {
                const verseNo = Number(v?.verse)
                const txt = String(v?.text || '').trim()
                if (verseNo > 0 && txt) out.set(verseNo, txt)
            })
        return out
    }

    const translatedByVerse = byVerse(translatedVerses)
    const englishByVerse = byVerse(englishVerses)

    const sura = {
        id,
        name: String(meta?.name || meta?.suraName || meta?.transliteration || ''),
        e_name: String(meta?.translation || meta?.suraName || ''),
        ru_name: String(metaRu?.translation || metaRu?.suraName || meta?.translation || '').trim(),
        tr_name: String(metaTr?.translation || metaTr?.suraName || meta?.translation || '').trim(),
        de_name: String(metaDe?.translation || metaDe?.suraName || meta?.translation || '').trim(),
        he_name: String(metaHe?.translation || metaHe?.suraName || meta?.translation || '').trim(),
        translation_locale: locale,
        type: String(meta?.type || ''),
        total_verses: verses.length,
        ayat: verses.map((v: any) => {
            const verseNo = Number(v?.verse)
            return {
                verse: verseNo,
                text: v?.text,
                translation: translatedByVerse.get(verseNo) || englishByVerse.get(verseNo) || String(v?.translation || ''),
            }
        }),
    }

    return { sura }
})
