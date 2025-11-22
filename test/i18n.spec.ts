import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

function readJSON(rel: string) {
  const p = path.resolve(process.cwd(), rel)
  const raw = fs.readFileSync(p, 'utf-8')
  return JSON.parse(raw)
}

function get(obj: any, dotPath: string) {
  return dotPath.split('.').reduce((acc, k) => (acc && (k in acc) ? acc[k] : undefined), obj)
}

describe('i18n locales integrity', () => {
  const locales = [
    { code: 'en', file: 'app/locale/en.json' },
    { code: 'ar', file: 'app/locale/ar.json' },
    { code: 'de', file: 'app/locale/de.json' },
    { code: 'ru', file: 'app/locale/ru.json' },
  ] as const

  const requiredKeys = [
    // general
    'pages.main.offlineMessage',
    'pages.quran.notfoundDetail',
    // reported missing keys in en
    'general.SiteTitle',
    'terms_and_conditions',
    'privacy_policy',
    'button.Contact',
    'navigation.Profile',
    'settings.title',
    // miracles2 metrics & actions
    'pages.miracles.metrics.chars',
    'pages.miracles.metrics.words',
    'pages.miracles.metrics.unique',
    'pages.miracles.changeVerse',
    // miracles2 list items
    'pages.miracles.numericExamples.oppositesTitle',
    'pages.miracles.numericExamples.oppositesBody',
    'pages.miracles.numericExamples.structureTitle',
    'pages.miracles.numericExamples.structureBody',
    'pages.miracles.numericExamples.conceptsTitle',
    'pages.miracles.numericExamples.conceptsBody',
    'pages.miracles.numericExamples.lettersTitle',
    'pages.miracles.numericExamples.lettersBody',
  ]

  for (const loc of locales) {
    it(`parses ${loc.code} locale JSON`, () => {
      expect(() => readJSON(loc.file)).not.toThrow()
    })

    it(`has required keys in ${loc.code}`, () => {
      const data = readJSON(loc.file)
      for (const key of requiredKeys) {
        const v = get(data, key)
        expect(v, `${loc.code} missing ${key}`).toBeDefined()
        if (typeof v === 'string') {
          expect(v.length, `${loc.code} empty ${key}`).toBeGreaterThan(0)
        }
      }
    })
  }
})
