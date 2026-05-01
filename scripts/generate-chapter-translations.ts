import fs from 'node:fs/promises'

type LocaleCode = 'de' | 'he'

interface ChapterTitle {
    id: number
    name: string
    transliteration: string
    translation: string
    type: string
    total_verses: number
}

interface TranslationResponseItem {
    id: number
    translation: string
}

interface KimiResponse {
    choices?: Array<{
        message?: {
            content?: string | null
        }
    }>
    error?: {
        message?: string
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

const chaptersEn = JSON.parse(
    await fs.readFile('src/shared/data/chapters/en.json', 'utf8'),
) as ChapterTitle[]

const apiKey =
    process.env.KIMI_API_KEY || process.env.NITRO_KIMI_API_KEY
const baseURL = (
    process.env.KIMI_BASE_URL ||
    process.env.NITRO_KIMI_BASE_URL ||
    'https://api.kimi.com/v1'
).replace(/\/$/, '')
const model = process.env.KIMI_MODEL || 'kimi-chat'

if (!apiKey || String(apiKey).trim() === '') {
    throw new Error('Missing KIMI_API_KEY (or NITRO_KIMI_API_KEY).')
}

async function translateBatch(
    target: LocaleCode,
    langName: string,
): Promise<ChapterTitle[]> {
    const payload = chaptersEn.map((chapter) => ({
        id: chapter.id,
        text: chapter.translation,
    }))

    const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${String(apiKey).trim()}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: `You are a precise translator. Translate each English Quran chapter title to ${langName}. Return ONLY valid JSON array in this exact shape: [{"id":1,"translation":"..."}]. Keep ids unchanged and preserve meaning. No markdown.`,
                },
                {
                    role: 'user',
                    content: JSON.stringify(payload),
                },
            ],
        }),
    })

    const json = await response.json() as KimiResponse

    if (!response.ok) {
        throw new Error(
            `translateBatch(${target}) HTTP ${response.status}: ${json.error?.message || 'unknown error'}`,
        )
    }

    const content = String(json.choices?.[0]?.message?.content || '').trim()
    const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim()
    const parsed = JSON.parse(cleaned) as unknown

    if (!Array.isArray(parsed)) {
        throw new Error(`Invalid ${target} translation response format`)
    }

    const byId = new Map<number, string>(
        parsed
            .map((item): TranslationResponseItem => {
                const record = isRecord(item) ? item : {}
                return {
                    id: Number(record.id),
                    translation: String(record.translation || '').trim(),
                }
            })
            .filter((item) => item.id > 0)
            .map((item) => [item.id, item.translation]),
    )

    return chaptersEn.map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        transliteration: chapter.transliteration,
        translation: byId.get(chapter.id) || chapter.translation,
        type: chapter.type,
        total_verses: chapter.total_verses,
    }))
}

const de = await translateBatch('de', 'German')
const he = await translateBatch('he', 'Hebrew')

await fs.writeFile(
    'src/shared/data/chapters/de.json',
    `${JSON.stringify(de, null, 2)}\n`,
)
await fs.writeFile(
    'src/shared/data/chapters/he.json',
    `${JSON.stringify(he, null, 2)}\n`,
)

console.log(
    'Generated chapters/de.json and chapters/he.json (Kimi batch mode).',
)