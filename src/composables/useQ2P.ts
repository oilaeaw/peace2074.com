import { ref, computed } from 'vue'
let localChapters: any[] | null = null
let localBook: Record<string, any[]> | null = null

type Aya = { verse: number; text: string; translation?: string }
type Sura = { id: number; name: string; e_name?: string; total_verses?: number; type?: string; ayat?: Aya[] }

const quranData = ref<Sura[]>([])
const currentIndex = ref<number>(1)
const currentLang = ref<string>('en')
const API_BASE = (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://127.0.0.1:3000').replace(/\/$/, '')

async function fetchJsonSequential(urls: string[]): Promise<any> {
    for (const url of urls) {
        try {
            const res = await fetch(url)
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

async function loadLocalData() {
    if (localChapters && localBook) return { chapters: localChapters, book: localBook }

    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const chaptersUrl = `${base}/data/chapters/en.json`
    const quranUrl = `${base}/data/quran.json`

    // Prefer fetch (client); fall back to dynamic import when not available (SSR)
    const fetchJson = async (url: string) => {
        if (typeof fetch === 'undefined') {
            const mod = await import(/* @vite-ignore */ url)
            return mod.default || mod
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to load ${url}`)
        return res.json()
    }

    const [chapters, book] = await Promise.all([
        fetchJson(chaptersUrl),
        fetchJson(quranUrl),
    ])

    localChapters = Array.isArray(chapters) ? chapters : []
    localBook = book && typeof book === 'object' ? book : {}
    return { chapters: localChapters, book: localBook }
}

async function buildLocalData() {
    const { chapters, book } = await loadLocalData()
    const ready: Sura[] = []

    chapters.forEach((chapter: any) => {
        const chapterId = chapter.id || chapter.number
        const versesForChapter = (book as any)[String(chapterId)] || []

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
}

export default function useQ2P() {

    async function init(index = 1, lang = 'en') {
        currentLang.value = lang
        try {
            // Try API first (Nitro: /quran/:id, or Waelio: /api/quran?s=ID)
            if (!Number.isNaN(Number(index)) && Number(index) > 0) {
                const id = Number(index)
                const payload = await fetchJsonSequential([
                    // Local Nitro API
                    `${API_BASE}/quran/${id}`,
                    // Remote Waelio-style API
                    `${API_BASE}/api/quran?s=${id}`,
                    `${API_BASE}/quran?s=${id}`,
                    `/api/quran?s=${id}`,
                ])
                const sura = (payload && (payload.sura || payload)) || null
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
            // Fallback to local bundled data (lazy-loaded to keep bundle light)
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
