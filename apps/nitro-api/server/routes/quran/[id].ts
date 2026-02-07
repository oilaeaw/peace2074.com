import { defineEventHandler, getRouterParam } from 'h3'
import { useStorage } from '#imports'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id') || 1)
    const storage = useStorage('assets:quran')

    const chapters = await storage.getItem<any[]>('chapters/en.json') || []
    const book = await storage.getItem<Record<string, any[]>>('quran.json') || {}

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
