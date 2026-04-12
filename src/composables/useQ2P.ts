import { ref, computed } from 'vue'
import {
    loadPublicQuranData,
    type QuranDataPayload,
} from '@/shared/utils/quran-data-loader'

type Aya = { verse: number; text: string; translation?: string }
type Sura = { id: number; name: string; e_name?: string; total_verses?: number; type?: string; ayat?: Aya[] }

const quranData = ref<Sura[]>([])
const currentIndex = ref<number>(1)
const currentLang = ref<string>('en')
const API_BASE = (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://127.0.0.1:3000').replace(/\/$/, '')

let chaptersCache: any[] | null = null
let quranCache: QuranDataPayload | null = null
let localDataPromise: Promise<Sura[]> | null = null
const API_5XX_DEDUPE_MS = 15000
const recentApi5xxEvents = new Map<string, number>()

function trackApi5xx(url: string, status: number) {
    if (status < 500) return
    if (typeof window === 'undefined') return
    const gtag = (window as any)?.gtag
    if (typeof gtag !== 'function') return

    const dedupeKey = `quran_api|${status}|${url}`
    const now = Date.now()
    const lastSeen = recentApi5xxEvents.get(dedupeKey) || 0
    if (now - lastSeen < API_5XX_DEDUPE_MS) {
        return
    }
    recentApi5xxEvents.set(dedupeKey, now)

    if (recentApi5xxEvents.size > 200) {
        for (const [key, ts] of recentApi5xxEvents.entries()) {
            if (now - ts > API_5XX_DEDUPE_MS * 2) {
                recentApi5xxEvents.delete(key)
            }
        }
    }

    gtag('event', 'api_5xx', {
        source: 'quran_api',
        status,
        endpoint: url,
        page_path: `${window.location.pathname}${window.location.search}`,
    })
}

async function fetchJsonSequential(urls: string[]): Promise<any> {
    for (const url of urls) {
        try {
            const res = await fetch(url)
            if (!res.ok) {
                trackApi5xx(url, res.status)
            }
            if (!res.ok) continue
            const ct = String(res.headers.get('content-type') || '')
            if (!ct.includes('application/json')) continue
            return await res.json()
        } catch {
            // try next
        }
    }
    throw new Error('All API endpoints failed')
}

function normalizeApiLang(lang: string): string {
    const raw = String(lang || 'en').trim().toLowerCase().replace('_', '-')
    const base = raw.split('-')[0] || 'en'
    const aliasMap: Record<string, string> = {
        iw: 'he',
        in: 'id',
        ji: 'yi',
    }
    return aliasMap[base] || base
}

async function buildLocalData() {
    if (localDataPromise) return localDataPromise

    localDataPromise = (async () => {
        if (!chaptersCache) {
            chaptersCache = await import('@/shared/data/chapters/en.json').then(m => m.default as any[])
        }
        if (!quranCache) {
            quranCache = await loadPublicQuranData()
        }

        const ready: Sura[] = []
        const chapters = Array.isArray(chaptersCache) ? chaptersCache : []

        chapters.forEach((chapter: any) => {
            const chapterId = chapter.id || chapter.number
            const versesForChapter = (quranCache as any)[String(chapterId)] || []

            ready.push({
                id: chapterId,
                name: chapter.name || '',
                e_name: chapter.translation || chapter.transliteration || '',
                type: chapter.type || '',
                total_verses: versesForChapter.length,
                ayat: versesForChapter.map((v: any) => ({
                    verse: v.verse,
                    text: v.text,
                    translation: v.translation,
                })),
            })
        })
        return ready
    })()

    return localDataPromise
}

export default function useQ2P() {

    async function init(index = 1, lang = 'en') {
        currentLang.value = lang
        const apiLang = normalizeApiLang(lang)
        try {
            // Try API first (Nitro: /quran/:id, or Waelio: /api/quran?s=ID)
            if (!Number.isNaN(Number(index)) && Number(index) > 0) {
                const id = Number(index)
                const payload = await fetchJsonSequential([
                    // Local Nitro API through Vite proxy
                    `${API_BASE}/api/quran/${id}?lang=${encodeURIComponent(apiLang)}`,
                    `/api/quran/${id}?lang=${encodeURIComponent(apiLang)}`,
                    // Waelio-style API fallback
                    `${API_BASE}/api/quran?s=${id}&lang=${encodeURIComponent(apiLang)}`,
                    `/api/quran?s=${id}&lang=${encodeURIComponent(apiLang)}`,
                ])
                let sura = (payload && (payload.sura || payload)) || null
                if (Array.isArray(sura)) {
                    sura = sura.find((entry: any) => Number(entry?.id || entry?.chapter || entry?.number) === id) || null
                }
                if (sura && (sura.id || sura.chapter || sura.number)) {
                    // normalize id field
                    const sid = Number(sura.id || sura.chapter || sura.number || id)
                    const normalized = Object.assign({}, sura, { id: sid })
                    const existing = quranData.value.find(s => s.id === sid)
                    if (existing) Object.assign(existing, normalized)
                    else quranData.value.push(normalized as any)
                } else {
                    throw new Error('API payload missing sura')
                }
            } else {
                const data = await fetchJsonSequential([
                    // Local Nitro list endpoint, then generic /api/quran
                    `${API_BASE}/quran`,
                    `${API_BASE}/api/quran`,
                    `/api/quran`,
                ])
                if (Array.isArray(data)) quranData.value = data as Sura[]
                else if (data && typeof data === 'object' && Array.isArray((data as any).list)) quranData.value = (data as any).list
                else throw new Error('API returned non-array data')
            }
        } catch (e) {
            // Fallback to local bundled data
            console.warn('API load failed, falling back to local data', e)
            quranData.value = await buildLocalData()
        }
        setIndex(index)
    }

    function setIndex(i: number) {
        currentIndex.value = Math.max(1, Number(i) || 1)
    }

    const GetQ = computed(() => quranData.value)
    const GetSura = computed(() => quranData.value.find(s => s.id === currentIndex.value))

    return {
        init,
        setIndex,
        GetQ,
        GetSura,
        currentLang,
    }
}
