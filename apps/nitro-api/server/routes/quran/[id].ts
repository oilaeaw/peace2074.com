import { defineEventHandler, getRouterParam } from 'h3'
import chaptersEn from '../../../../../src/shared/data/chapters/en.json'
import quranData from '../../../../../src/shared/data/quran.json'

export default defineEventHandler((event) => {
    const id = Number(getRouterParam(event, 'id') || 1)
    const chapters = chaptersEn as any[]
    const book = quranData as Record<string, any[]>

    const meta = (chapters || []).find((c: any) => Number(c?.id || c?.number) === id)
    const verses = Array.isArray(book[String(id)]) ? book[String(id)] : []

    const sura = {
        id,
        name: String(meta?.name || meta?.suraName || meta?.transliteration || ''),
        e_name: String(meta?.translation || meta?.suraName || ''),
        type: String(meta?.type || ''),
        total_verses: verses.length,
        ayat: verses.map((v: any) => ({ verse: v.verse, text: v.text, translation: v.translation })),
    }

    return { sura }
})
