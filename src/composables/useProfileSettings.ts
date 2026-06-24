import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.pinia'

export type QuranHighlightMode = 'word' | 'ayah'

export type RecitationPlaybackPosition = {
    suraId: number
    ayahIndex: number
    wordIndex: number
    audioTime: number
    timestamp: number
    readerMode?: 'audio' | 'tts'
}

type ProfileSettingsResponse = {
    ok?: boolean
    settings?: Record<string, any>
}

const DEFAULT_HIGHLIGHT_MODE: QuranHighlightMode = 'word'
const HIGHLIGHT_MODE_STORAGE_KEY = 'quran-highlight-mode'
const highlightMode = ref<QuranHighlightMode>(DEFAULT_HIGHLIGHT_MODE)
const savedPlaybackPosition = ref<RecitationPlaybackPosition | null>(null)
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

function readLocalHighlightMode(): QuranHighlightMode {
    if (typeof window === 'undefined') {
        return DEFAULT_HIGHLIGHT_MODE
    }

    try {
        return normalizeHighlightMode(
            window.localStorage.getItem(HIGHLIGHT_MODE_STORAGE_KEY)
        )
    } catch {
        return DEFAULT_HIGHLIGHT_MODE
    }
}

function writeLocalHighlightMode(mode: QuranHighlightMode) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(HIGHLIGHT_MODE_STORAGE_KEY, mode)
    } catch {
        // ignore storage failures
    }
}

function normalizePlaybackPosition(
    value: unknown
): RecitationPlaybackPosition | null {
    if (!value || typeof value !== 'object') {
        return null
    }

    const candidate = value as Record<string, unknown>
    const suraId = Number(candidate.suraId)
    const ayahIndex = Number(candidate.ayahIndex)
    const wordIndex = Number(candidate.wordIndex)
    const audioTime = Number(candidate.audioTime)
    const timestamp = Number(candidate.timestamp)

    if (
        !Number.isFinite(suraId) ||
        !Number.isFinite(ayahIndex) ||
        !Number.isFinite(audioTime) ||
        !Number.isFinite(timestamp)
    ) {
        return null
    }

    return {
        suraId,
        ayahIndex,
        wordIndex: Number.isFinite(wordIndex) ? wordIndex : -1,
        audioTime: Math.max(0, audioTime),
        timestamp,
        readerMode:
            candidate.readerMode === 'tts' || candidate.readerMode === 'audio'
                ? candidate.readerMode
                : undefined,
    }
}

function readPlaybackPositionFromSettings(
    settings: unknown
): RecitationPlaybackPosition | null {
    if (!settings || typeof settings !== 'object') {
        return null
    }

    const quran = (settings as Record<string, any>).quran
    if (!quran || typeof quran !== 'object') {
        return null
    }

    return normalizePlaybackPosition(
        (quran as Record<string, any>).playbackPosition
    )
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

    // In browser context (including dev), use relative /api so the Vite proxy
    // handles routing to the Nitro server regardless of the bound hostname.
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
            highlightMode.value = readLocalHighlightMode()
            savedPlaybackPosition.value = null
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
                savedPlaybackPosition.value = readPlaybackPositionFromSettings(
                    data.settings
                )
                loadedUserId.value = userId
            } catch (error) {
                console.warn('Failed to load profile settings:', error)
                highlightMode.value = readLocalHighlightMode()
                savedPlaybackPosition.value = null
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

        writeLocalHighlightMode(nextMode)

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

    async function saveRecitationProgress(
        position: RecitationPlaybackPosition | null
    ) {
        savedPlaybackPosition.value = position

        await authStore.hydrateSession()

        const userId = String(authStore.user?.id || '') || null
        if (!userId) {
            return
        }

        try {
            const response = await fetch(resolveNitroUrl('/auth/settings'), {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        quran: {
                            playbackPosition: position,
                        },
                    },
                }),
            })

            if (!response.ok) {
                throw new Error(
                    `Failed to save recitation progress: ${response.status}`
                )
            }

            const data =
                (await response.json().catch(() => ({}))) as ProfileSettingsResponse

            savedPlaybackPosition.value = readPlaybackPositionFromSettings(
                data.settings
            )
        } catch (error) {
            console.warn('Failed to save recitation progress:', error)
        }
    }

    return {
        highlightMode: computed(() => highlightMode.value),
        savedPlaybackPosition: computed(() => savedPlaybackPosition.value),
        profileSettingsLoading: computed(() => isLoading.value),
        loadProfileSettings,
        setHighlightMode,
        saveRecitationProgress,
    }
}
