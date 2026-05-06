import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type QuranVerse = {
  chapter: number
  verse: number
  text: string
  translation?: string
}

type QuranPayload = Record<string, QuranVerse[]>

type EditionVerse = {
  verse: number
  text: string
}

type EditionPayload = Record<string, EditionVerse[]>

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourcePath = resolve(__dirname, '../src/shared/data/quran.json')
const targetPath = resolve(__dirname, '../public/data/quran.json')
const editionsSourceDir = resolve(__dirname, '../src/shared/data/editions')
const editionsTargetDir = resolve(__dirname, '../public/data/editions')

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

function isValidEditionPayload(payload: unknown): payload is EditionPayload {
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

    const sample = verses[0] as Partial<EditionVerse>
    return (
      typeof sample === 'object' &&
      typeof sample?.verse === 'number' &&
      typeof sample?.text === 'string'
    )
  })
}

async function readJsonFile(path: string) {
  const raw = await readFile(path, 'utf8')
  return { raw, parsed: JSON.parse(raw) as unknown }
}

async function syncJsonFile<T>(options: {
  sourcePath: string
  targetPath: string
  label: string
  validate: (payload: unknown) => payload is T
}) {
  const source = await readJsonFile(options.sourcePath)
  if (!options.validate(source.parsed)) {
    throw new Error(`Source JSON is invalid: ${options.sourcePath}`)
  }

  let shouldWrite = false

  try {
    const target = await readJsonFile(options.targetPath)
    if (!options.validate(target.parsed) || target.raw !== source.raw) {
      shouldWrite = true
    }
  } catch {
    shouldWrite = true
  }

  if (!shouldWrite) {
    return false
  }

  await mkdir(dirname(options.targetPath), { recursive: true })
  await writeFile(options.targetPath, source.raw, 'utf8')
  console.log(`[sync:quran:data] Synced ${options.label}`)
  return true
}

async function main() {
  let changed = false

  changed = await syncJsonFile<QuranPayload>({
    sourcePath,
    targetPath,
    label: 'public/data/quran.json from src/shared/data/quran.json',
    validate: isValidQuranPayload,
  }) || changed

  await mkdir(editionsTargetDir, { recursive: true })
  const editionEntries = await readdir(editionsSourceDir, { withFileTypes: true })

  for (const entry of editionEntries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue

    const editionSource = resolve(editionsSourceDir, entry.name)
    const editionTarget = resolve(editionsTargetDir, entry.name)

    changed = await syncJsonFile<EditionPayload>({
      sourcePath: editionSource,
      targetPath: editionTarget,
      label: `public/data/editions/${entry.name} from src/shared/data/editions/${entry.name}`,
      validate: isValidEditionPayload,
    }) || changed
  }

  if (!changed) {
    console.log('[sync:quran:data] public Quran assets are already up to date')
  }
}

main().catch((error) => {
  console.error('[sync:quran:data] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})