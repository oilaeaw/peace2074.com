import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

function read(rel: string) {
  const p = path.resolve(process.cwd(), rel)
  return fs.readFileSync(p, 'utf-8')
}

describe('miracles2 page localization', () => {
  const content = read('app/pages/miracles2.vue')

  it('uses metrics i18n keys', () => {
    expect(content).toContain("t('pages.miracles.metrics.chars')")
    expect(content).toContain("t('pages.miracles.metrics.words')")
    expect(content).toContain("t('pages.miracles.metrics.unique')")
  })

  it('uses changeVerse i18n key', () => {
    expect(content).toMatch(/t\(['\"]pages\.miracles\.changeVerse['\"]\)/)
  })

  it('uses numericExamples i18n keys', () => {
    const keys = [
      'oppositesTitle', 'oppositesBody', 'structureTitle', 'structureBody',
      'conceptsTitle', 'conceptsBody', 'lettersTitle', 'lettersBody'
    ]
    for (const k of keys) {
      const re = new RegExp(`t\\((?:'|\")pages\\.miracles\\.numericExamples\\.${k}(?:'|\")\\)`) 
      expect(content).toMatch(re)
    }
  })
})
