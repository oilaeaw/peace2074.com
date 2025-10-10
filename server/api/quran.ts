import type { H3Event } from 'h3'
import type { QDBI } from '../../shared/types'

import hdetails from '~~/shared/data/chapters/en.json'
import hbook from '~~/shared/data/quran.json'

export interface QSDT {
  chapter: number
  verse: number
  text: string[]
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
  const params = getQuery(event)
  const { s } = params
  const ready = []
  hdetails.forEach((item: IDT) => {
    const qr: QSDT = hbook[item.id]
    qr.find((v, index) => v[index] === item.id)
    ready.push({
      id: item.id,
      name: item.name,
      e_name: item.translation,
      type: item.type,
      total_verses: item.total_verses,
      ayat: qr,
    })
  })
  return s ? ready[s] : ready as QDBI
})
