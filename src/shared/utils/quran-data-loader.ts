export type QuranDataVerse = {
    chapter: number
    verse: number
    text: string
    translation?: string
}

export type QuranDataPayload = Record<string, QuranDataVerse[]>

let quranDataCache: QuranDataPayload | null = null
let quranDataPromise: Promise<QuranDataPayload> | null = null

function resolveQuranDataUrl() {
    const baseUrl = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${baseUrl}/data/quran.json`.replace(/^\/\//, '/')
}

export async function loadPublicQuranData(): Promise<QuranDataPayload> {
    if (quranDataCache) return quranDataCache
    if (quranDataPromise) return quranDataPromise

    quranDataPromise = (async () => {
        const res = await fetch(resolveQuranDataUrl(), {
            cache: 'force-cache',
            headers: {
                Accept: 'application/json',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to load Quran data (${res.status})`)
        }

        const payload = (await res.json()) as QuranDataPayload
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Invalid Quran data payload')
        }

        quranDataCache = payload
        return payload
    })()

    return quranDataPromise
}