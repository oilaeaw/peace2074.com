import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLangsStore } from '@app/store/langs.pinia'

describe('Langs Store (langs.pinia.ts)', () => {
  // Before each test, create a new Pinia instance to ensure tests are isolated.
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with a default list of locales and an empty locale string', () => {
    const langs = useLangsStore()

    // Check that the list of locales is populated correctly
    expect(langs.locales).toHaveLength(4)
    expect(langs.locales[0].code).toBe('en')

    // Check that the initial locale is an empty string
    expect(langs.locale).toBe('')
  })

  it('`setLocale` action correctly updates the locale state', () => {
    const langs = useLangsStore()
    langs.setLocale('ar')
    expect(langs.locale).toBe('ar')
  })

  it('`currentLocale` computed property returns the correct locale object or null', () => {
    const langs = useLangsStore()

    // Initially, it should be null because the locale string is empty
    expect(langs.currentLocale).toBe(null)

    // After setting a valid locale
    langs.setLocale('de')
    expect(langs.currentLocale).toEqual({
      code: 'de',
      name: 'Deutsch',
    })

    // It should return null for an invalid locale code
    langs.setLocale('xx')
    expect(langs.currentLocale).toBe(null)
  })
})
