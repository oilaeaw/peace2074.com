export type QuranDataVerse = {
    chapter: number
    verse: number
    text: string
    translation?: string
}

export type QuranDataPayload = Record<string, QuranDataVerse[]>

let quranDataCache: QuranDataPayload | null = null
let quranDataPromise: Promise<QuranDataPayload> | null = null

const DEFAULT_NITRO_PORT = 3000
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'

function isValidQuranPayload(payload: unknown): payload is QuranDataPayload {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return false
    }

    const entries = Object.entries(payload as Record<string, unknown>)
    if (!entries.length) {
        return false
    }

    const chapterEntries = entries.filter(([key]) => /^\d+$/.test(key))
    if (!chapterEntries.length) {
        return false
    }

    return chapterEntries.every(([, verses]) => {
        if (!Array.isArray(verses)) return false
        if (!verses.length) return true

        const sample = verses[0] as Partial<QuranDataVerse>
        return (
            typeof sample === 'object'
            && typeof sample?.chapter === 'number'
            && typeof sample?.verse === 'number'
            && typeof sample?.text === 'string'
        )
    })
}

function resolveQuranDataUrl() {
    const baseUrl = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${baseUrl}/data/quran.json`.replace(/^\/\//, '/')
}

function resolveNitroBase() {
    const configured = String(import.meta.env.VITE_NITRO_BASE || '').trim()
    if (configured) {
        return configured.replace(/\/$/, '')
    }

    if (typeof window !== 'undefined') {
        const { protocol, hostname } = window.location

        if (protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'app:') {
            return DEFAULT_MOBILE_API_BASE
        }

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`.replace(/\/$/, '')
        }
    }

    return '/api'
}

function resolveQuranApiDataUrl() {
    return `${resolveNitroBase()}/quran/data`
}

async function fetchQuranPayload(url: string, cache: RequestCache): Promise<QuranDataPayload> {
    const res = await fetch(url, {
        cache,
        headers: {
            Accept: 'application/json',
        },
    })

    if (!res.ok) {
        throw new Error(`Failed to load Quran data (${res.status})`)
    }

    const payload = (await res.json()) as unknown
    if (!isValidQuranPayload(payload)) {
        throw new Error('Invalid Quran data payload')
    }

    return payload
}

export async function loadPublicQuranData(): Promise<QuranDataPayload> {
    if (quranDataCache) return quranDataCache
    if (quranDataPromise) return quranDataPromise

    quranDataPromise = (async () => {
        try {
            const payload = await fetchQuranPayload(resolveQuranDataUrl(), 'force-cache')
            quranDataCache = payload
            return payload
        } catch (publicError: any) {
            try {
                const payload = await fetchQuranPayload(resolveQuranApiDataUrl(), 'no-cache')
                quranDataCache = payload
                return payload
            } catch (apiError: any) {
                quranDataPromise = null
                const publicMessage = publicError?.message || 'Failed to load public Quran data'
                const apiMessage = apiError?.message || 'Failed to load Quran API fallback'
                throw new Error(`${publicMessage}. Fallback failed: ${apiMessage}`)
            }
        }
    })()

    return quranDataPromise
}