import chaptersEn from '../../../src/shared/data/chapters/en.json'
import quranArabicData from '../../../src/shared/data/quran.json'

type ChapterPayload = {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

export type MobileVerse = {
  chapter: number
  verse: number
  text: string
}

type QuranPayload = Record<string, MobileVerse[]>

export type MobileSuraSummary = {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  totalVerses: number
  typeLabel: string
  metaLabel: string
}

export type MobileSura = MobileSuraSummary & {
  verses: MobileVerse[]
}

type SearchableSuraSummary = MobileSuraSummary & {
  searchText: string
}

const chapters = chaptersEn as ChapterPayload[]
const quranPayload = quranArabicData as QuranPayload

function formatRevelationType(type: string) {
  const normalized = String(type || '').trim().toLowerCase()

  if (normalized === 'meccan') return 'Meccan'
  if (normalized === 'medinan') return 'Medinan'

  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : 'Quran'
}

function normalizeSearchTerm(value: string) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .trim()
}

const summaries = chapters.map<SearchableSuraSummary>((chapter) => {
  const typeLabel = formatRevelationType(chapter.type)
  const summary: MobileSuraSummary = {
    id: Number(chapter.id),
    name: String(chapter.name || ''),
    transliteration: String(chapter.transliteration || ''),
    translation: String(chapter.translation || ''),
    type: String(chapter.type || ''),
    totalVerses: Number(chapter.total_verses || 0),
    typeLabel,
    metaLabel: `${typeLabel} • ${Number(chapter.total_verses || 0)} ayat`,
  }

  return {
    ...summary,
    searchText: normalizeSearchTerm(
      `${summary.id} ${summary.name} ${summary.transliteration} ${summary.translation} ${summary.typeLabel}`
    ),
  }
})

const suraById = new Map<number, MobileSura>(
  summaries.map((summary) => {
    const verses = Array.isArray(quranPayload[String(summary.id)])
      ? quranPayload[String(summary.id)].map((verse) => ({ ...verse }))
      : []

    return [summary.id, { ...summary, verses }]
  })
)

export const TOTAL_SURAS = summaries.length
export const TOTAL_AYAT = summaries.reduce(
  (total, summary) => total + summary.totalVerses,
  0
)

export function getSuraSummaries(): MobileSuraSummary[] {
  return summaries.map(({ searchText: _searchText, ...summary }) => ({
    ...summary,
  }))
}

export function filterSuras(query: string): MobileSuraSummary[] {
  const normalized = normalizeSearchTerm(query)

  if (!normalized) {
    return getSuraSummaries()
  }

  return summaries
    .filter((summary) => summary.searchText.includes(normalized))
    .map(({ searchText: _searchText, ...summary }) => ({ ...summary }))
}

export function getSuraSummary(id: number): MobileSuraSummary | null {
  const summary = summaries.find((entry) => entry.id === Number(id))

  if (!summary) return null

  const { searchText: _searchText, ...result } = summary
  return { ...result }
}

export function getSura(id: number): MobileSura | null {
  const sura = suraById.get(Number(id))

  if (!sura) return null

  return {
    ...sura,
    verses: sura.verses.map((verse) => ({ ...verse })),
  }
}