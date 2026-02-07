import { defineEventHandler } from 'h3'
import chaptersEn from '../../../../src/shared/data/chapters/en.json'
import quranData from '../../../../src/shared/data/quran.json'

export default defineEventHandler(() => {
    const chapters = chaptersEn as any[]
    const book = quranData as Record<string, any[]>

    const list = (chapters || []).map((meta: any) => {
        const id = Number(meta?.id || meta?.number)
        const verses = Array.isArray(book[String(id)]) ? book[String(id)] : []
        return {
            id,
            name: String(meta?.name || meta?.suraName || meta?.transliteration || ''),
            e_name: String(meta?.translation || meta?.suraName || ''),
            type: String(meta?.type || ''),
            total_verses: verses.length,
        }
    })

    return list
})
