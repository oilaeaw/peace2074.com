import { defineEventHandler, getRouterParam } from 'h3'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

async function loadJSON<T = any>(p: string): Promise<T> {
    const buf = await readFile(p, 'utf-8')
    return JSON.parse(buf)
}

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id') || 1)
    const root = path.resolve(process.cwd(), '..', '..')
    const chaptersPath = path.join(root, 'src', 'shared', 'data', 'chapters', 'en.json')
    const quranPath = path.join(root, 'src', 'shared', 'data', 'quran.json')

    const chapters = await loadJSON<any[]>(chaptersPath)
    const book: Record<string, any[]> = await loadJSON(quranPath)

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
