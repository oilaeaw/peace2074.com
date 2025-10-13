/* eslint-disable node/prefer-global/process */
import type { H3Event } from 'h3'
import { readFileSync } from 'node:fs'

import { join } from 'node:path'

const DATA_PATH = join(process.cwd(), 'shared', 'data', 'quran.json')

// Simple in-memory cache
const cache: Record<string, { ts: number, data: any }> = {}
const CACHE_TTL = 1000 * 60 * 10 // 10 minutes

export default defineEventHandler(async (event: H3Event) => {
  const suraParam = event.context.params?.sura
  if (!suraParam)
    return sendError(event, createError({ statusCode: 400, statusMessage: 'sura param required' }))

  const suraId = Number(suraParam)
  if (Number.isNaN(suraId) || suraId <= 0)
    return sendError(event, createError({ statusCode: 400, statusMessage: 'invalid sura id' }))

  const cacheKey = String(suraId)
  const now = Date.now()
  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) {
    // set caching headers
    setHeader(event, 'Cache-Control', `public, max-age=${Math.floor(CACHE_TTL / 1000)}`)
    return cache[cacheKey].data
  }

  // Load file (synchronous ok here because small and called rarely)
  let raw: any
  try {
    raw = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
  }
  catch (err: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'failed to read quran data', cause: err }))
  }

  // Raw data may be:
  // - an object keyed by sura id ("1": [..], "2": [..])
  // - an object with Surah: []
  // - an array of sura objects
  let found: any = null

  // Case: keyed object where each key is a sura id -> value is array of ayat
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if (raw[String(suraId)]) {
      const ayat = raw[String(suraId)]
      found = {
        id: suraId,
        name: '',
        e_name: '',
        type: '',
        total_verses: Array.isArray(ayat) ? ayat.length : 0,
        ayat,
      }
    }
    else if (Array.isArray(raw.Surah)) {
      found = raw.Surah.find((s: any) => Number(s.id) === suraId) || null
    }
  }

  // Case: raw is an array of sura objects
  if (!found && Array.isArray(raw)) {
    found = raw.find((s: any) => Number(s.id) === suraId) || null
  }

  if (!found)
    return sendError(event, createError({ statusCode: 404, statusMessage: 'sura not found' }))

  const payload = { sura: found }
  cache[cacheKey] = { ts: now, data: payload }
  setHeader(event, 'Cache-Control', `public, max-age=${Math.floor(CACHE_TTL / 1000)}`)
  return payload
})
