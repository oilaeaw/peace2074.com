import { defineEventHandler, getQuery, getRouterParam, getRequestHeader } from 'h3'
import chaptersEn from '../../../../../src/shared/data/chapters/en.json'
import chaptersRu from '../../../../../src/shared/data/chapters/ru.json'
import chaptersTr from '../../../../../src/shared/data/chapters/tr.json'
import chaptersDe from '../../../../../src/shared/data/chapters/de.json'
import chaptersHe from '../../../../../src/shared/data/chapters/he.json'
import chaptersFr from '../../../../../src/shared/data/chapters/fr.json'
import chaptersBn from '../../../../../src/shared/data/chapters/bn.json'
import chaptersId from '../../../../../src/shared/data/chapters/id.json'
import chaptersSv from '../../../../../src/shared/data/chapters/sv.json'
import chaptersUr from '../../../../../src/shared/data/chapters/ur.json'
import chaptersZh from '../../../../../src/shared/data/chapters/zh.json'
import chaptersEs from '../../../../../src/shared/data/chapters/es.json'

import quranData from '../../../../../src/shared/data/quran.json'
import editionsEn from '../../../../../src/shared/data/editions/en.json'
import editionsEs from '../../../../../src/shared/data/editions/es.json'
import editionsRu from '../../../../../src/shared/data/editions/ru.json'
import editionsTr from '../../../../../src/shared/data/editions/tr.json'
import editionsDe from '../../../../../src/shared/data/editions/de.json'
import editionsHe from '../../../../../src/shared/data/editions/he.json'
import editionsFr from '../../../../../src/shared/data/editions/fr.json'
import editionsBn from '../../../../../src/shared/data/editions/bn.json'
import editionsId from '../../../../../src/shared/data/editions/id.json'
import editionsSv from '../../../../../src/shared/data/editions/sv.json'
import editionsUr from '../../../../../src/shared/data/editions/ur.json'
import editionsZh from '../../../../../src/shared/data/editions/zh.json'
import editionsTranslit from '../../../../../src/shared/data/editions/transliteration.json'

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

    const chaptersData: Record<string, any[]> = {
        en: chaptersEn as any[],
        ru: chaptersRu as any[],
        tr: chaptersTr as any[],
        de: chaptersDe as any[],
        he: chaptersHe as any[],
        fr: chaptersFr as any[],
        bn: chaptersBn as any[],
        id: chaptersId as any[],
        sv: chaptersSv as any[],
        ur: chaptersUr as any[],
        zh: chaptersZh as any[],
        es: chaptersEs as any[],
    }
    const book = quranData as Record<string, any[]>
    const editionsByLocale: Record<string, Record<string, any[]>> = {
        en: editionsEn as Record<string, any[]>,
        es: editionsEs as Record<string, any[]>,
        ru: editionsRu as Record<string, any[]>,
        tr: editionsTr as Record<string, any[]>,
        de: editionsDe as Record<string, any[]>,
        he: editionsHe as Record<string, any[]>,
        fr: editionsFr as Record<string, any[]>,
        bn: editionsBn as Record<string, any[]>,
        id: editionsId as Record<string, any[]>,
        sv: editionsSv as Record<string, any[]>,
        ur: editionsUr as Record<string, any[]>,
        zh: editionsZh as Record<string, any[]>,
        transliteration: editionsTranslit as Record<string, any[]>,
    }

    const metaByLocale = (loc: string) =>
        (chaptersData[loc] || chaptersData.en || []).find((c: any) => Number(c?.id || c?.number) === id)

    const meta = metaByLocale('en')
    const metaRu = metaByLocale('ru')
    const metaTr = metaByLocale('tr')
    const metaDe = metaByLocale('de')
    const metaHe = metaByLocale('he')
    const verses = Array.isArray(book[String(id)]) ? book[String(id)] : []

    const localeEdition = editionsByLocale[locale] ?? null
    const translatedVerses = Array.isArray(localeEdition?.[String(id)]) ? localeEdition[String(id)] : []

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

    const sura = {
        id,
        name: String(meta?.name || meta?.suraName || meta?.transliteration || ''),
        e_name: String(meta?.translation || meta?.suraName || ''),
        ru_name: String(metaRu?.translation || metaRu?.suraName || meta?.translation || '').trim(),
        tr_name: String(metaTr?.translation || metaTr?.suraName || meta?.translation || '').trim(),
        de_name: String(metaDe?.translation || metaDe?.suraName || meta?.translation || '').trim(),
        he_name: String(metaHe?.translation || metaHe?.suraName || meta?.translation || '').trim(),
        fr_name: String(metaByLocale('fr')?.translation || metaByLocale('fr')?.suraName || meta?.translation || '').trim(),
        bn_name: String(metaByLocale('bn')?.translation || metaByLocale('bn')?.suraName || meta?.translation || '').trim(),
        id_name: String(metaByLocale('id')?.translation || metaByLocale('id')?.suraName || meta?.translation || '').trim(),
        sv_name: String(metaByLocale('sv')?.translation || metaByLocale('sv')?.suraName || meta?.translation || '').trim(),
        ur_name: String(metaByLocale('ur')?.translation || metaByLocale('ur')?.suraName || meta?.translation || '').trim(),
        zh_name: String(metaByLocale('zh')?.translation || metaByLocale('zh')?.suraName || meta?.translation || '').trim(),
        es_name: String(metaByLocale('es')?.translation || metaByLocale('es')?.suraName || meta?.translation || '').trim(),
        locale_name: String(metaByLocale(locale)?.translation || metaByLocale(locale)?.suraName || meta?.translation || '').trim(),
        translation_locale: locale,
        type: String(meta?.type || ''),
        total_verses: verses.length,
        ayat: verses.map((v: any) => {
            const verseNo = Number(v?.verse)
            return {
                verse: verseNo,
                text: v?.text,
                translation: translatedByVerse.get(verseNo) ?? String(v?.translation || ''),
            }
        }),
    }

    return { sura }
})
