import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type QuranVerse = {
  chapter: number
  verse: number
  text: string
  translation?: string
}

type QuranPayload = Record<string, QuranVerse[]>

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourcePath = resolve(__dirname, '../src/shared/data/quran.json')
const targetPath = resolve(__dirname, '../public/data/quran.json')

function isValidQuranPayload(payload: unknown): payload is QuranPayload {
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

    const sample = verses[0] as Partial<QuranVerse>
    return (
      typeof sample === 'object' &&
      typeof sample?.chapter === 'number' &&
      typeof sample?.verse === 'number' &&
      typeof sample?.text === 'string'
    )
  })
}

async function readJsonFile(path: string) {
  const raw = await readFile(path, 'utf8')
  return { raw, parsed: JSON.parse(raw) as unknown }
}

async function main() {
  const source = await readJsonFile(sourcePath)
  if (!isValidQuranPayload(source.parsed)) {
    throw new Error('Source Quran data is invalid: src/shared/data/quran.json')
  }

  let shouldWrite = false

  try {
    const target = await readJsonFile(targetPath)
    if (!isValidQuranPayload(target.parsed) || target.raw !== source.raw) {
      shouldWrite = true
    }
  } catch {
    shouldWrite = true
  }

  if (!shouldWrite) {
    console.log('[sync:quran:data] public/data/quran.json is already up to date')
    return
  }

  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, source.raw, 'utf8')
  console.log('[sync:quran:data] Synced public/data/quran.json from src/shared/data/quran.json')
}

main().catch((error) => {
  console.error('[sync:quran:data] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})