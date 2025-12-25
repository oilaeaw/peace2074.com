import { defineEventHandler } from 'h3'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

async function loadJSON<T = any>(p: string): Promise<T> {
    const buf = await readFile(p, 'utf-8')
    return JSON.parse(buf)
}

export default defineEventHandler(async () => {
    const root = path.resolve(process.cwd(), '..', '..')
    const chaptersPath = path.join(root, 'src', 'shared', 'data', 'chapters', 'en.json')
    const quranPath = path.join(root, 'src', 'shared', 'data', 'quran.json')

    const chapters = await loadJSON<any[]>(chaptersPath)
    const book: Record<string, any[]> = await loadJSON(quranPath)

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
