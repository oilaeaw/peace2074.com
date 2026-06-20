export const FONT_SIZE_KEY = 'pref-font-size'
export const HIGH_CONTRAST_KEY = 'pref-high-contrast'

const FONT_SIZE_CLASSES = [
  'font-small',
  'font-medium',
  'font-large',
  'font-xlarge',
] as const

export function readFontSizePreference(): number {
  if (typeof window === 'undefined') return 1
  const stored = window.localStorage.getItem(FONT_SIZE_KEY)
  if (stored === null) return 1
  const parsed = parseInt(stored, 10)
  return Number.isFinite(parsed) ? Math.min(3, Math.max(0, parsed)) : 1
}

export function readHighContrastPreference(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(HIGH_CONTRAST_KEY)
  if (stored !== null) return stored === 'true'
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

export function applyFontSize(size: number) {
  if (typeof document === 'undefined') return
  const sizes = ['small', 'medium', 'large', 'xlarge'] as const
  const root = document.documentElement
  root.classList.remove(...FONT_SIZE_CLASSES)
  root.classList.add(`font-${sizes[Math.min(3, Math.max(0, size))]}`)
}

export function applyHighContrast(enabled: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('high-contrast', enabled)
}

/** Apply saved accessibility prefs as early as possible (before first paint). */
export function bootstrapAccessibilityPreferences() {
  if (typeof window === 'undefined') return
  applyFontSize(readFontSizePreference())
  applyHighContrast(readHighContrastPreference())
}

if (typeof window !== 'undefined') {
  bootstrapAccessibilityPreferences()
}
