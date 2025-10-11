import type { QuranI, SuraI } from '~~/shared/types'
import { defineStore, acceptHMRUpdate } from 'pinia'
import hdetails from '~~/shared/data/chapters/en.json'
import hbook from '~~/shared/data/quran.json'

interface QSDT {
  chapter: number
  verse: number
  text: string[]
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
  Book: QuranI
  Sura: SuraI
  Index: number
  LLegend: { letter: string, color: string, value: number }[]
  style: {
    pixel: Style
    container: Style
  }
}
const ready: any[] = []

hdetails.forEach((item: IDT) => {
  const qr: QSDT = hbook[item.id as keyof typeof hbook]
  if (qr) {
    qr.find((v: any, index: number) => v[index] === item.id)
    ready.push({
      id: item.id,
      name: item.name,
      e_name: item.translation,
      type: item.type,
      total_verses: item.total_verses,
      ayat: qr,
    })
  }
})

export const useQ2P = defineStore('q2p', {
  state: (): State => ({
    Book: ready as QuranI,
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
        } catch {
          return null
        }
      },
      serialize: (value: any) => {
        try {
          return JSON.stringify(value)
        } catch {
          return '{}'
        }
      }
    }
  },
  actions: {
    init(index?: number): QuranI {
      this.setIndex(index || 1)
      return this.Book
    },
    setSura(payload: SuraI): void {
      this.Sura = payload
    },
    setIndex(payload: number) {
      this.Index = payload || 1
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
    FahrasP: state => {
      if (!state.Book || !Array.isArray(state.Book)) return []
      return state.Book.map(v => v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'name') ? v.name : '')
    },
    Legend: state => state.LLegend,
    GetQ: state => state.Book || [],
    GetSura: state => {
      if (!state.Book || !Array.isArray(state.Book) || state.Index < 1) return null
      return state.Book[state.Index - 1] || null
    },
    GetS: state => state.style.pixel,
    getContainerStyle: state => state.style.container,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQ2P, import.meta.hot))
}
