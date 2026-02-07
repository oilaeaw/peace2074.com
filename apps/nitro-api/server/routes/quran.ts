import { defineEventHandler } from 'h3'
import { useStorage } from '#imports'

export default defineEventHandler(async () => {
    const storage = useStorage('assets:quran')

    const chapters = await storage.getItem<any[]>('chapters/en.json') || []
    const book = await storage.getItem<Record<string, any[]>>('quran.json') || {}

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
