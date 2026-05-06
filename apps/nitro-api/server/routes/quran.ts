import { defineEventHandler, getQuery } from 'h3'
import chaptersEn from '../../../../src/shared/data/chapters/en.json'
import { loadQuranData } from '../utils/quran-data'

export default defineEventHandler(async (event) => {
    const chapters = chaptersEn as any[]
    const book = await loadQuranData(event)

    const query = getQuery(event)
    const requestedId = Number(query?.s || query?.id || 0)

    if (requestedId > 0) {
        const meta = (chapters || []).find((c: any) => Number(c?.id || c?.number) === requestedId)
        const verses = Array.isArray(book[String(requestedId)]) ? book[String(requestedId)] : []

        return {
            sura: {
                id: requestedId,
                name: String(meta?.name || meta?.suraName || meta?.transliteration || ''),
                e_name: String(meta?.translation || meta?.suraName || ''),
                type: String(meta?.type || ''),
                total_verses: verses.length,
                ayat: verses.map((v: any) => ({ verse: v.verse, text: v.text, translation: v.translation })),
            }
        }
    }

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
