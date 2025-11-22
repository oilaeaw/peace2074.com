import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { en, ar, de, ru } from '../app/locale'

// Minimal runtime i18n instance (composition API mode)
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar, de, ru },
})

describe('i18n runtime', () => {
  it('resolves existing core keys', () => {
    const { t } = useI18n({ useScope: 'global' , i18n })
    expect(t('general.SiteTitle')).toBe('Peace2074')
    expect(t('auth')).toBe('Authentication')
    expect(t('navigation.Profile')).toBe('My Profile')
  })

  it('falls back correctly for missing nested key variants', () => {
    const { te } = useI18n({ useScope: 'global' , i18n })
    // We deliberately check missing candidate key: meta.home.title (does not exist)
    expect(te('meta.home.title')).toBe(false)
    // Existing key must be present
    expect(te('meta.home')).toBe(true)
  })
})
