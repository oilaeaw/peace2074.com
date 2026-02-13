import type { QuranI, SuraI } from '@shared/types'
import { acceptHMRUpdate, defineStore } from 'pinia'

interface QSDT {
  chapter: number
  verse: number
  text: string
}

interface IDT {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

interface Style {
  display: string
  backgroundColor?: string
  height: number
  width: number
}

interface State {
  Book: any[]
  Sura: any
  Index: number
  LLegend: { letter: string, color: string, value: number }[]
  style: {
    pixel: Style
    container: Style
  }
}
let readyCache: any[] | null = null
let readyPromise: Promise<any[]> | null = null

async function loadLocalQuran(): Promise<any[]> {
  if (readyCache) return readyCache
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const [hdetails, hbook] = await Promise.all([
      import('@shared/data/chapters/en.json').then(m => m.default as any),
      import('@shared/data/quran.json').then(m => m.default as any),
    ])

    const chapters = Array.isArray(hdetails) ? hdetails : Object.values(hdetails as any)
    const assembled: any[] = []

    chapters.forEach((metaSample: any) => {
      const id = Number(metaSample?.id || metaSample?.number || 0)
      if (!id) return
      const qr = ((hbook as any)[String(id)] || []) as QSDT[]
      if (Array.isArray(qr)) {
        assembled.push({
          id,
          name: String(metaSample?.suraName || metaSample?.name || metaSample?.transliteration || ''),
          e_name: String(metaSample?.translation || metaSample?.suraName || ''),
          type: String(metaSample?.type || ''),
          total_verses: qr.length,
          ayat: qr,
        })
      }
    })

    readyCache = assembled
    return assembled
  })()

  return readyPromise
}

async function ensureBook(state: State, indexFallback = 1) {
  if (state.Book && Array.isArray(state.Book) && state.Book.length) return
  const ready = await loadLocalQuran()
  state.Book = JSON.parse(JSON.stringify(ready)) as any[]
  if (!state.Sura || !Object.keys(state.Sura).length) {
    state.Index = indexFallback
    state.Sura = state.Book[indexFallback - 1] || state.Book[0]
  }
}

export const useQ2P = defineStore('q2p', {
  state: (): State => ({
    // Lazily loaded to keep initial bundle light; populated via init/fetchSura
    Book: [] as any[],
    Sura: {} as SuraI,
    Index: 0,
    LLegend: [
      { letter: ' ', color: '#ffffff', value: 0 },
      { letter: 'ا', color: '#000000', value: 1 },
      { letter: 'أ', color: '#000000', value: 1 },
      { letter: 'إ', color: '#000000', value: 1 },
      { letter: 'آ', color: '#000000', value: 1 },
      { letter: 'ء', color: '#000000', value: 1 },
      { letter: 'ب', color: '#000000', value: 2 },
      { letter: 'ت', color: '#000000', value: 400 },
      { letter: 'ث', color: '#000000', value: 500 },
      { letter: 'ج', color: '#000000', value: 3 },
      { letter: 'ح', color: '#000000', value: 8 },
      { letter: 'خ', color: '#000000', value: 600 },
      { letter: 'د', color: '#000000', value: 4 },
      { letter: 'ذ', color: '#000000', value: 700 },
      { letter: 'ر', color: '#000000', value: 200 },
      { letter: 'ز', color: '#000000', value: 7 },
      { letter: 'س', color: '#000000', value: 60 },
      { letter: 'ش', color: '#000000', value: 300 },
      { letter: 'ص', color: '#000000', value: 90 },
      { letter: 'ض', color: '#000000', value: 800 },
      { letter: 'ط', color: '#000000', value: 9 },
      { letter: 'ظ', color: '#000000', value: 900 },
      { letter: 'ع', color: '#000000', value: 70 },
      { letter: 'غ', color: '#000000', value: 1000 },
      { letter: 'ف', color: '#000000', value: 80 },
      { letter: 'ق', color: '#000000', value: 100 },
      { letter: 'ك', color: '#000000', value: 20 },
      { letter: 'ل', color: '#000000', value: 30 },
      { letter: 'م', color: '#000000', value: 40 },
      { letter: 'ن', color: '#000000', value: 50 },
      { letter: 'ه', color: '#000000', value: 5 },
      { letter: 'ة', color: '#000000', value: 400 },
      { letter: 'و', color: '#000000', value: 6 },
      { letter: 'ؤ', color: '#000000', value: 1 },
      { letter: 'ى', color: '#000000', value: 1 },
      { letter: 'ي', color: '#000000', value: 10 },
      { letter: 'ئ', color: '#000000', value: 31 },
    ],
    style: {
      pixel: {
        display: 'inline-block',
        backgroundColor: '#000000',
        height: 10,
        width: 10,
      },
      container: {
        display: 'inline-block',
        backgroundColor: '#000000',
        height: 10,
        width: 10,
      },
    },
  }),
  persist: {
    key: 'q2p-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    serializer: {
      deserialize: (value: string) => {
        try {
          const parsed = JSON.parse(value)
          return parsed
        }
        catch {
          return null
        }
      },
      serialize: (value: any) => {
        try {
          return JSON.stringify(value)
        }
        catch {
          return '{}'
        }
      },
    },
  },
  actions: {
    async init(index?: number): Promise<any[]> {
      const targetIndex = Number(index) || 1
      await ensureBook(this, targetIndex)
      this.setIndex(targetIndex)
      return this.Book
    },
    setSura(payload: SuraI): void {
      this.Sura = payload
    },
    async fetchSura(suraId: number) {
      // Attempt to fetch a single sura from server API and update Book/Sura
      try {
        const id = Number(suraId) || 1
        await ensureBook(this, id)
        const runtimeBase = (((typeof window !== 'undefined' && window.location)
          ? `${window.location.origin}`
          : 'http://127.0.0.1:3000')).replace(/\/$/, '')
        const urls = [
          // Prefer local Nitro API via Vite proxy
          `${runtimeBase}/api/quran/${id}`,
          `/api/quran/${id}`,
          // Fallback to Waelio-style query endpoint
          `${runtimeBase}/api/quran?s=${id}`,
          `/api/quran?s=${id}`,
        ]
        let sura: any = null
        for (const u of urls) {
          try {
            const res = await fetch(u)
            if (!res.ok) continue
            const ct = String(res.headers.get('content-type') || '')
            if (!ct.includes('application/json')) continue
            const json = await res.json()
            sura = json?.sura || json
            if (Array.isArray(sura)) {
              sura = sura.find((entry: any) => Number(entry?.id || entry?.chapter || entry?.number) === id) || null
            }
            if (sura) break
          } catch {
            // try next
          }
        }
        if (!sura) {
          this.setIndex(id)
          return this.Sura
        }

        // Update our Book array: replace or insert the sura at (id - 1)
        if (!this.Book || !Array.isArray(this.Book)) this.Book = [] as any[]
        const sid = Number(sura.id || sura.chapter || sura.number || id)
        this.Book[sid - 1] = Object.assign({}, sura, { id: sid })
        this.setIndex(id)
        this.Sura = sura
        return this.Sura
      } catch (err) {
        // network or parse error — fallback
        this.setIndex(suraId)
        return this.Sura
      }
    },
    setIndex(payload: number) {
      // Defensive: coerce to number and ensure within bounds. Default to 1.
      let idx = Number(payload) || 1
      if (!this.Book || !Array.isArray(this.Book) || this.Book.length === 0) {
        // Load asynchronously; once available, update index/sura.
        ensureBook(this, idx).then(() => this.setIndex(idx)).catch(() => { })
        return
      }

      if (idx < 1 || idx > this.Book.length)
        idx = 1

      this.Index = idx
      // Update the Sura when index changes
      this.Sura = this.Book[this.Index - 1] || this.Book[0]
    },
    setLegend(payload: { letter: string, color: string, value: number }) {
      if (!payload.letter) {
        return
      }
      this.LLegend = this.LLegend.map((one) => {
        if (one.letter === payload.letter) {
          return { ...one, color: payload.color }
        }
        return one
      })
    },
  },
  getters: {
    QuranIndex: state => state.Index,
    FahrasP: (state) => {
      if (!state.Book || !Array.isArray(state.Book))
        return []
      return state.Book.map(v => v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'name') ? v.name : '')
    },
    Legend: state => state.LLegend,
    GetQ: state => state.Book || [],
    GetSura: (state) => {
      if (!state.Book || !Array.isArray(state.Book) || state.Index < 1)
        return null
      return state.Book[state.Index - 1] || null
    },
    GetS: state => state.style.pixel,
    getContainerStyle: state => state.style.container,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQ2P, import.meta.hot))
}
