import type { QDBI } from '@shared/types'
import type { H3Event } from 'h3'
import hdetails from '@server/data/editions/en.json'
import hbook from '@server/data/quran.json'

export interface QSDT {
  chapter: number
  verse: number
  text: string
}
export interface IDT {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

export default defineEventHandler((event: H3Event) => {
  const params = getQuery(event) as Record<string, any>
  const s = params?.s
  const ready: Array<{
    id: number
    name: string
    e_name: string
    type: string
    total_verses: number
    ayat: QSDT[]
  }> = []

  // hdetails is a map keyed by chapter number as string -> array of verses with english text
  // hbook is the arabic text with same shape. We will use metadata from one and ayat from hbook.
  Object.keys(hdetails as any).forEach((key) => {
    const id = Number(key)
    const metaSample = ((hdetails as any)[key] || [])[0] as any
    const ayat = ((hbook as any)[key] || []) as QSDT[]
    if (!Array.isArray(ayat)) return
    ready.push({
      id,
      name: String(metaSample?.suraName || ''),
      e_name: String(metaSample?.suraName || ''),
      type: String(metaSample?.type || ''),
      total_verses: ayat.length,
      ayat: ayat as QSDT[],
    })
  })

  if (s) {
    const idx = Number(Array.isArray(s) ? s[0] : s)
    const found = ready.find(r => r.id === idx)
    return found as unknown as QDBI
  }
  return ready as unknown as QDBI
})
