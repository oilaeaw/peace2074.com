import { createError, getRequestHeader, getRequestURL, type H3Event } from 'h3'

export type QuranDataVerse = {
  chapter: number
  verse: number
  text: string
  translation?: string
}

export type QuranDataPayload = Record<string, QuranDataVerse[]>

export type QuranEditionVerse = {
  verse: number
  text: string
}

export type QuranEditionPayload = Record<string, QuranEditionVerse[]>

type JsonValidator<T> = (payload: unknown) => payload is T

const jsonAssetCache = new Map<string, Promise<unknown>>()

function isObjectRecord(payload: unknown): payload is Record<string, unknown> {
  return !!payload && typeof payload === 'object' && !Array.isArray(payload)
}

export function isValidQuranPayload(payload: unknown): payload is QuranDataPayload {
  if (!isObjectRecord(payload)) {
    return false
  }

  const entries = Object.entries(payload)
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

export function isValidEditionPayload(payload: unknown): payload is QuranEditionPayload {
  if (!isObjectRecord(payload)) {
    return false
  }

  const entries = Object.entries(payload)
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

    const sample = verses[0] as Partial<QuranEditionVerse>
    return (
      typeof sample === 'object'
      && typeof sample?.verse === 'number'
      && typeof sample?.text === 'string'
    )
  })
}

function getAssetOrigins(event: H3Event) {
  const origins = new Set<string>()
  const requestUrl = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  })

  origins.add(requestUrl.origin)

  for (const headerName of ['origin', 'referer']) {
    const raw = String(getRequestHeader(event, headerName) || '').trim()
    if (!raw) continue

    try {
      origins.add(new URL(raw).origin)
    }
    catch {
      // ignore invalid header values
    }
  }

  return [...origins]
}

async function fetchJsonAsset<T>(url: string, assetPath: string, validate: JsonValidator<T>): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`${assetPath} responded with HTTP ${res.status}`)
  }

  const payload = await res.json() as unknown
  if (!validate(payload)) {
    throw new Error(`${assetPath} returned invalid JSON`)
  }

  return payload
}

async function readNodeJsonFile<T>(relativePath: string, assetPath: string, validate: JsonValidator<T>): Promise<T> {
  const [{ readFile }, { fileURLToPath }] = await Promise.all([
    import('node:fs/promises'),
    import('node:url'),
  ])

  const filePath = fileURLToPath(new URL(relativePath, import.meta.url))
  const raw = await readFile(filePath, 'utf8')
  const payload = JSON.parse(raw) as unknown

  if (!validate(payload)) {
    throw new Error(`${assetPath} fallback file was invalid`)
  }

  return payload
}

async function loadJsonAsset<T>(
  event: H3Event,
  assetPath: string,
  validate: JsonValidator<T>,
  nodeFallbackPath?: string,
): Promise<T> {
  const cacheKey = assetPath
  const cached = jsonAssetCache.get(cacheKey)
  if (cached) {
    return cached as Promise<T>
  }

  const promise = (async () => {
    const errors: string[] = []

    for (const origin of getAssetOrigins(event)) {
      const url = new URL(assetPath, `${origin}/`).toString()
      try {
        return await fetchJsonAsset(url, assetPath, validate)
      }
      catch (error) {
        errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    if (nodeFallbackPath) {
      try {
        return await readNodeJsonFile(nodeFallbackPath, assetPath, validate)
      }
      catch (error) {
        errors.push(`file:${nodeFallbackPath}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Unable to load ${assetPath}`,
      data: { errors },
    })
  })()

  jsonAssetCache.set(cacheKey, promise)

  try {
    return await promise
  }
  catch (error) {
    jsonAssetCache.delete(cacheKey)
    throw error
  }
}

export function loadQuranData(event: H3Event) {
  return loadJsonAsset(
    event,
    '/data/quran.json',
    isValidQuranPayload,
    '../../../../public/data/quran.json',
  )
}

export function loadEditionData(event: H3Event, locale: string) {
  return loadJsonAsset(
    event,
    `/data/editions/${locale}.json`,
    isValidEditionPayload,
    `../../../../public/data/editions/${locale}.json`,
  )
}

export async function tryLoadEditionData(event: H3Event, locale: string) {
  try {
    return await loadEditionData(event, locale)
  }
  catch {
    return null
  }
}