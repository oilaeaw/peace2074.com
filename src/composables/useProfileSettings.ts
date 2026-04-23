import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.pinia'

export type QuranHighlightMode = 'word' | 'ayah'

type ProfileSettingsResponse = {
  ok?: boolean
  settings?: Record<string, any>
}

const DEFAULT_HIGHLIGHT_MODE: QuranHighlightMode = 'word'
const highlightMode = ref<QuranHighlightMode>(DEFAULT_HIGHLIGHT_MODE)
const isLoading = ref(false)
const loadedUserId = ref<string | null>(null)
let loadPromise: Promise<void> | null = null

function normalizeHighlightMode(value: unknown): QuranHighlightMode {
  return value === 'ayah' ? 'ayah' : 'word'
}

function readHighlightModeFromSettings(settings: unknown): QuranHighlightMode {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_HIGHLIGHT_MODE
  }

  const quran = (settings as Record<string, any>).quran
  if (!quran || typeof quran !== 'object') {
    return DEFAULT_HIGHLIGHT_MODE
  }

  return normalizeHighlightMode((quran as Record<string, any>).highlightMode)
}

function computeNitroBase() {
  if (typeof window === 'undefined') {
    return '/api'
  }

  const env = (import.meta as any)?.env || {}
  const configured = env.VITE_NITRO_BASE
  const { protocol, hostname } = window.location

  if (configured && typeof configured === 'string') {
    return configured.replace(/\/$/, '')
  }

  if (
    protocol === 'capacitor:' ||
    protocol === 'ionic:' ||
    protocol === 'app:'
  ) {
    return 'https://peace2074.com/api'
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3000`
  }

  return '/api'
}

function resolveNitroUrl(path: string) {
  const base = computeNitroBase()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function useProfileSettings() {
  const authStore = useAuthStore()

  async function loadProfileSettings(force = false) {
    await authStore.hydrateSession()

    const userId = String(authStore.user?.id || '') || null

    if (!userId) {
      loadedUserId.value = null
      highlightMode.value = DEFAULT_HIGHLIGHT_MODE
      return
    }

    if (!force && loadedUserId.value === userId) {
      return
    }

    if (!force && loadPromise) {
      return loadPromise
    }

    isLoading.value = true
    loadPromise = (async () => {
      try {
        const response = await fetch(resolveNitroUrl('/auth/settings'), {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to load profile settings: ${response.status}`)
        }

        const data =
          (await response.json().catch(() => ({}))) as ProfileSettingsResponse

        highlightMode.value = readHighlightModeFromSettings(data.settings)
        loadedUserId.value = userId
      } catch (error) {
        console.warn('Failed to load profile settings:', error)
        highlightMode.value = DEFAULT_HIGHLIGHT_MODE
        loadedUserId.value = userId
      } finally {
        isLoading.value = false
        loadPromise = null
      }
    })()

    return loadPromise
  }

  async function setHighlightMode(mode: QuranHighlightMode) {
    const nextMode = normalizeHighlightMode(mode)
    const previousMode = highlightMode.value
    highlightMode.value = nextMode

    await authStore.hydrateSession()

    const userId = String(authStore.user?.id || '') || null
    if (!userId) {
      loadedUserId.value = null
      return nextMode
    }

    try {
      const response = await fetch(resolveNitroUrl('/auth/settings'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            quran: {
              highlightMode: nextMode,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save profile settings: ${response.status}`)
      }

      const data =
        (await response.json().catch(() => ({}))) as ProfileSettingsResponse

      highlightMode.value = readHighlightModeFromSettings(data.settings)
      loadedUserId.value = userId
      return highlightMode.value
    } catch (error) {
      highlightMode.value = previousMode
      throw error
    }
  }

  return {
    highlightMode: computed(() => highlightMode.value),
    profileSettingsLoading: computed(() => isLoading.value),
    loadProfileSettings,
    setHighlightMode,
  }
}
