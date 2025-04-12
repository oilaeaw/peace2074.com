import { defineStore } from 'pinia'

type state = () => {
  Quran: ONE_INTERFACE[]
  Sura: ONE_INTERFACE
  Index: number
  LLegend: { letter: string, color: string, value: number }[]
  style: {
    pixel: {
      display: string
      backgroundColor: string
      height: number
      width: number
    }
    container: {
      display: string
      backgroundColor: string
      height: number
      width: number
    }
  }
}
export const useQ2P = defineStore('q2p', {
  state: (): state => ({
    Quran: [],
    Sura: {},
    Index: 1,
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
  actions: {
    async setUpQuran(data: ONE_INTERFACE[]) {
      this.Quran = [...data]
    },
    setQuran(payload: ONE_INTERFACE[]) {
      this.Quran = [...payload]
    },
    setSura(payload: ONE_INTERFACE) {
      this.Sura = { ...payload }
    },
    setIndex(payload: any) {
      this.Index = { ...payload }
    },
    setLegend(payload: { letter: string, color: string, value: number }) {
      if (!payload.letter) {
        return
      }
      this.LLegend.map((one) => {
        if (one.letter === payload.letter) {
          one.color = payload.color
        }
        return one
      })
    },
  },
  getters: {
    IdexNames: state => state.Quran.map(v => ({ names: v.name })),
    Legend: state => state.LLegend,
    GetQ: state => state.Quran,
    GetS: state => state.style.pixel,
    getContainerStyle: state => state.style.container,
  },

})
export default useQ2P
