<script setup lang="ts">
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import useQ2P from '@/composables/useQ2P'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch, computed, nextTick } from 'vue'
import { useQuasar, Dark } from 'quasar'
import { useBookmarksStore } from '@/stores/bookmarks.pinia'
import { useStorageRef } from '@/composables/useUStore'
import { useProfileSettings, type RecitationPlaybackPosition } from '@/composables/useProfileSettings'
import { useAuthStore } from '@/stores/auth.pinia'
import {
  applySeoMeta,
  buildBreadcrumbStructuredData,
  buildPageStructuredData,
} from '@/utils/seo'
import {
  useOfflineRecitation,
  type OfflineRecitationStatus,
  type RecitationQuality,
} from '@/composables/useOfflineRecitation'
import OfflineRecitationManager from '@/components/quran/OfflineRecitationManager.vue'
import {
  readTranslatorIdForLocale,
  TRANSLATOR_PREF_KEY,
} from '@shared/data/quran-translators'

// Define component name for keep-alive
defineOptions({
  name: 'QuranDetail',
})

type BookmarkEntry = {
  key: string
  normalized: string
  label: string
  suraId: number | null
  verse: number | null
  raw: any
  rawString: string
}

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const q2p = useQ2P()
const $q = useQuasar()
const bookmarksStore = useBookmarksStore()
const authStore = useAuthStore()
const QURAN_TRANSLATION_KEY = 'quran-show-translation'

/** Strip HTML tags that quran.com injects into some translation texts (e.g. <sup> footnotes). */
function cleanTranslationText(text: string): string {
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

const sura = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const selectedBookmark = ref('')

// Enhanced Notification System
interface TaggedNotification {
  id: string
  type: 'positive' | 'negative' | 'warning' | 'info'
  message: string
  tag?: string
  icon?: string
  timestamp: number
  group?: string
}

const notificationQueue = ref<TaggedNotification[]>([])
const notificationHistory = ref<TaggedNotification[]>([])
const announcementQueue = ref<
  { message: string; type: string; icon: string; actions?: any[] }[]
>([])
const showAnnouncementBanner = ref(false)
const currentAnnouncement = ref<any>(null)
const NOTIFICATION_BATCH_DELAY = 1500 // ms
let notificationTimer: ReturnType<typeof setTimeout> | null = null

function notify(options: {
  type: 'positive' | 'negative' | 'warning' | 'info'
  message: string
  tag?: string
  icon?: string
  group?: string
  position?: string
  timeout?: number
  caption?: string
  announce?: boolean
  actions?: any[]
}) {
  const notification: TaggedNotification = {
    id: `${Date.now()}-${Math.random()}`,
    type: options.type,
    message: options.message,
    tag: options.tag,
    icon: options.icon,
    timestamp: Date.now(),
    group: options.group,
  }

  // Add to history
  notificationHistory.value.unshift(notification)
  if (notificationHistory.value.length > 50) {
    notificationHistory.value = notificationHistory.value.slice(0, 50)
  }

  // Handle announcements separately
  if (options.announce) {
    announcementQueue.value.push({
      message: options.message,
      type: options.type,
      icon: options.icon || 'campaign',
      actions: options.actions,
    })
    showNextAnnouncement()
    return
  }

  // Check if we should batch this notification
  if (options.group) {
    const existingInQueue = notificationQueue.value.find(
      (n) => n.group === options.group
    )
    if (existingInQueue) {
      // Update existing notification instead of showing duplicate
      existingInQueue.message = options.message
      existingInQueue.timestamp = Date.now()
      return
    }
  }

  // Add to queue
  notificationQueue.value.push(notification)

  // Clear existing timer
  if (notificationTimer) {
    clearTimeout(notificationTimer)
  }

  // Set timer to flush queue
  notificationTimer = setTimeout(() => {
    flushNotificationQueue()
  }, NOTIFICATION_BATCH_DELAY)

  // Show immediately if it's important
  if (options.type === 'negative' || notificationQueue.value.length >= 3) {
    flushNotificationQueue()
  }
}

function flushNotificationQueue() {
  if (notificationTimer) {
    clearTimeout(notificationTimer)
    notificationTimer = null
  }

  if (notificationQueue.value.length === 0) return

  // Group notifications by tag
  const grouped = notificationQueue.value.reduce(
    (acc, notif) => {
      const key = notif.tag || 'general'
      if (!acc[key]) acc[key] = []
      acc[key].push(notif)
      return acc
    },
    {} as Record<string, TaggedNotification[]>
  )

  // Show grouped notifications
  Object.entries(grouped).forEach(([tag, notifs]) => {
    if (notifs.length === 1) {
      // Single notification
      $q.notify({
        type: notifs[0].type,
        message: notifs[0].message,
        icon: notifs[0].icon,
        position: 'top',
        timeout: 2500,
        caption: tag !== 'general' ? tag : undefined,
      })
    } else {
      // Batched notifications
      const messages = notifs.map((n) => n.message).join(' • ')
      $q.notify({
        type: notifs[0].type,
        message: `${notifs.length} updates`,
        caption: messages,
        icon: notifs[0].icon || 'notifications',
        position: 'top',
        timeout: 3500,
      })
    }
  })

  // Clear queue
  notificationQueue.value = []
}

function showNextAnnouncement() {
  if (showAnnouncementBanner.value || announcementQueue.value.length === 0)
    return

  currentAnnouncement.value = announcementQueue.value.shift()
  showAnnouncementBanner.value = true
}

function dismissAnnouncement(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  showAnnouncementBanner.value = false
  currentAnnouncement.value = null

  // Show next announcement after a short delay
  setTimeout(() => {
    if (announcementQueue.value.length > 0) {
      showNextAnnouncement()
    }
  }, 500)
}

function handleAnnouncementAction(action?: { handler?: () => void }) {
  try {
    action?.handler?.()
  } finally {
    dismissAnnouncement()
  }
}
const LAYOUT_STORAGE_KEY = 'quran-view-mode'
const layoutModeStore = useStorageRef<'reader' | 'mushaf' | 'native'>(
  LAYOUT_STORAGE_KEY,
  'mushaf'
)
const isIOSRuntime = computed(() => {
  if (typeof window === 'undefined') return false
  const nav = window.navigator
  const ua = String(nav?.userAgent || '')
  const platform = String(nav?.platform || '')
  const maxTouchPoints = Number(nav?.maxTouchPoints || 0)
  const isIOSUA = /iPad|iPhone|iPod/i.test(ua)
  const isIPadOSDesktopUA = platform === 'MacIntel' && maxTouchPoints > 1
  const locProtocol = String(window.location?.protocol || '')
  const isCapacitorLike =
    locProtocol === 'capacitor:' ||
    locProtocol === 'ionic:' ||
    locProtocol === 'app:'
  return isIOSUA || isIPadOSDesktopUA || isCapacitorLike
})
const showTranslation = ref(readShowTranslationPreference())
const layoutMode = computed<'reader' | 'mushaf' | 'native'>({
  get: () => layoutModeStore.value.value,
  set: (mode) => {
    layoutModeStore.set(mode)
    // Update URL param immediately
    if (route.params.mode !== mode) {
      router.replace({
        name: 'QuranDetail',
        params: { ...route.params, mode },
      })
    }
  },
})

const PAGEVIEW_DEDUPE_MS = 1500
let lastTrackedQuranDetailKey = ''
let lastTrackedQuranDetailAt = 0
const API_5XX_DEDUPE_MS = 15000
const recentApi5xxEvents = new Map<string, number>()
const QURAN_DETAIL_KEYWORDS = [
  'Quran surah',
  'Quran recitation',
  'verse sharing',
  'Quran bookmarks',
]
const QURAN_RECITER_NAME = 'Mishary Al-Afasy'

function trackPageView(pageTitle: string) {
  if (typeof window === 'undefined') return
  const gtag = (window as any)?.gtag
  if (typeof gtag !== 'function') return
  const pagePath = `${window.location.pathname}${window.location.search}`
  const dedupeKey = `${pagePath}|${pageTitle}|${Number(sura.value?.id || route.params.id || 0)}`
  const now = Date.now()
  if (
    lastTrackedQuranDetailKey === dedupeKey &&
    now - lastTrackedQuranDetailAt < PAGEVIEW_DEDUPE_MS
  ) {
    return
  }
  lastTrackedQuranDetailKey = dedupeKey
  lastTrackedQuranDetailAt = now

  const suraId = Number(sura.value?.id || route.params.id || 0)
  const suraNameEn = String(sura.value?.e_name || '')

  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
    content_group: 'quran',
    sura_id: suraId,
    sura_name_en: suraNameEn,
    source: 'quran_detail',
  })

  gtag('event', 'quran_detail_view', {
    sura_id: suraId,
    sura_name_en: suraNameEn,
    sura_name_ar: String(sura.value?.name || ''),
    verses_count: Number(sura.value?.total_verses || 0),
    page_path: pagePath,
    locale: String(locale.value || 'en'),
  })
}

function trackApi5xx(source: string, status: number, url: string) {
  if (status < 500) return
  if (typeof window === 'undefined') return
  const gtag = (window as any)?.gtag
  if (typeof gtag !== 'function') return

  const dedupeKey = `${source}|${status}|${url}`
  const now = Date.now()
  const lastSeen = recentApi5xxEvents.get(dedupeKey) || 0
  if (now - lastSeen < API_5XX_DEDUPE_MS) {
    return
  }
  recentApi5xxEvents.set(dedupeKey, now)

  // small cleanup to avoid unbounded growth in long sessions
  if (recentApi5xxEvents.size > 200) {
    for (const [key, ts] of recentApi5xxEvents.entries()) {
      if (now - ts > API_5XX_DEDUPE_MS * 2) {
        recentApi5xxEvents.delete(key)
      }
    }
  }

  gtag('event', 'api_5xx', {
    source,
    status,
    endpoint: url,
    sura_id: Number(route.params.id || 0),
    page_path: `${window.location.pathname}${window.location.search}`,
  })
}

function buildQuranDetailTitle() {
  const id = Number(sura.value?.id || route.params.id || 0)
  const enName = String(sura.value?.e_name || '')
  const arName = String(sura.value?.name || '')
  const quranLabel = String(t('pages.quran.title') || 'Quran')

  if (!id || (!enName && !arName)) {
    return `${String(t('pages.quran.detail') || 'Quran Detail')} | PEACE2074`
  }

  const names = [enName, arName].filter(Boolean).join(' — ')
  return `${quranLabel} ${id}: ${names} | PEACE2074`
}

function buildQuranDetailDescription() {
  const id = Number(sura.value?.id || route.params.id || 0)
  const enName = String(sura.value?.e_name || '').trim()
  const arName = String(sura.value?.name || '').trim()
  const versesCount = Number(sura.value?.total_verses || 0)
  const displayName = [enName, arName].filter(Boolean).join(' / ')

  if (!id) {
    return 'Read Quran surah details with recitation, verse sharing, and bookmarks on PEACE2074.'
  }

  if (displayName) {
    return `Read Surah ${id} (${displayName}) with ${versesCount || 'full'} ayat, recitation, verse sharing, and bookmarks on PEACE2074.`
  }

  return `Read Quran Surah ${id} with recitation, verse sharing, and bookmarks on PEACE2074.`
}

function applyQuranDetailTitle(sendPageView = false) {
  if (typeof document === 'undefined') return
  const title = buildQuranDetailTitle()
  const description = buildQuranDetailDescription()
  const suraId = Number(sura.value?.id || route.params.id || 0)
  const canonicalPath = suraId ? `/quran/${suraId}` : '/quran'
  const suraKeywords = [
    String(sura.value?.e_name || '').trim(),
    String(sura.value?.name || '').trim(),
  ].filter(Boolean)
  const keywords = Array.from(
    new Set([...QURAN_DETAIL_KEYWORDS, ...suraKeywords])
  )
  const schemaTitle = title.replace(/\s*\|\s*PEACE2074\s*$/i, '').trim()

  applySeoMeta({
    title,
    description,
    canonical: canonicalPath,
    keywords,
    locale: String(locale.value || 'en'),
    structuredData: [
      buildPageStructuredData({
        type: 'WebPage',
        title: schemaTitle,
        description,
        canonical: canonicalPath,
        locale: String(locale.value || 'en'),
        keywords,
      }),
      buildBreadcrumbStructuredData([
        {
          name: String(t('pages.home.title') || 'Home'),
          item: '/',
        },
        {
          name: String(t('pages.quran.title') || 'Quran'),
          item: '/quran',
        },
        {
          name:
            [String(sura.value?.e_name || ''), String(sura.value?.name || '')]
              .filter(Boolean)
              .join(' — ') || `Surah ${suraId}`,
          item: canonicalPath,
        },
      ]),
    ],
  })

  if (sendPageView) {
    trackPageView(title)
  }
}

// Quick access popular verses with unique IDs
interface QuickAccessVerse {
  id: string // Format: sura_verse (e.g., "2_255")
  suraId: number
  verse: number
  nameKey: string // i18n key for the verse name
  icon: string
}

const quickAccessVerses = ref<QuickAccessVerse[]>([
  {
    id: '2_255',
    suraId: 2,
    verse: 255,
    nameKey: 'pages.quran.quickAccess.kursi',
    icon: 'star',
  },
  {
    id: '1_1',
    suraId: 1,
    verse: 1,
    nameKey: 'pages.quran.quickAccess.fatiha',
    icon: 'menu_book',
  },
  {
    id: '36_1',
    suraId: 36,
    verse: 1,
    nameKey: 'pages.quran.quickAccess.yasin',
    icon: 'favorite',
  },
  {
    id: '67_1',
    suraId: 67,
    verse: 1,
    nameKey: 'pages.quran.quickAccess.mulk',
    icon: 'king_bed',
  },
  {
    id: '112_1',
    suraId: 112,
    verse: 1,
    nameKey: 'pages.quran.quickAccess.ikhlas',
    icon: 'brightness_7',
  },
])

const audioList = ref<string[]>([])
const bismillahIntroUrl = ref<string | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)
const nextAudioEl = ref<HTMLAudioElement | null>(null)
const isPlayingAudio = ref(false)
const currentAyahIndex = ref<number>(-1)
const currentWordIndex = ref<number>(-1)
const playbackRate = ref<number>(1)
const wordTimings = ref<Record<number, Array<{ start: number; end: number }>>>(
  {}
)
const syncedVerseWords = ref<Record<number, string[]>>({})
const stopRequested = ref(false)
const isStartingRecitation = ref(false)

// Offline recitation manager
const showOfflineManager = ref(false)
const offlineDownloadStatus = ref<{
  scope: 'current' | 'all'
  status: 'idle' | 'started' | 'completed' | 'failed'
  percent: number
}>({
  scope: 'current',
  status: 'idle',
  percent: 0,
})
const {
  getCachedAudioUrl,
  getOfflineRecitationStatus,
  loadCachedSurasList,
  setSelectedQualityPreference,
  selectedQuality,
} = useOfflineRecitation()
const isLoadingFromCache = ref(false)
const offlineRecitationStatus = ref<OfflineRecitationStatus | null>(null)

// Persistent playback position
interface PlaybackPosition extends RecitationPlaybackPosition {}
const PLAYBACK_POSITION_KEY = 'quran-playback-position'
const playbackPositionStore = useStorageRef<PlaybackPosition | null>(
  PLAYBACK_POSITION_KEY,
  null
)

// Auto-continue to next sura setting
const AUTO_CONTINUE_KEY = 'quran-auto-continue'
const autoContinueStore = useStorageRef<boolean>(AUTO_CONTINUE_KEY, false)
const autoContinueEnabled = computed({
  get: () => autoContinueStore.value.value,
  set: (enabled) => autoContinueStore.set(enabled),
})

// Highlight mode is sourced from the authenticated profile settings in MongoDB.
const { highlightMode, setHighlightMode, loadProfileSettings, saveRecitationProgress, savedPlaybackPosition } =
  useProfileSettings()

// YouTube Video Recitation Player State
const showYoutubePlayer = ref(false)

// Ayah action hover/tap widget state.
// This is a supported Quran reading interaction and should not be removed
// without providing an equivalent verse-actions UX and updating
// docs/QURAN_AYAH_HOVER_MENU.md.
const hoverWidgetVisible = ref(false)
const hoverWidgetVerse = ref<number | null>(null)
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const hoverWidgetPosition = ref({ top: 0, left: 0 })
const lastDoubleClickTime = ref(0)
const DOUBLE_CLICK_DEBOUNCE = 500 // ms
const AYAH_ACTION_CARD_HOVER_DELAY_MS = 800

function isTouchPointerDevice() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    (navigator as any)?.maxTouchPoints > 0
  )
}

function shouldDockAyahActionCard() {
  if (typeof window === 'undefined') return false
  return isTouchPointerDevice() && window.innerWidth <= 640
}

function supportsAyahActionCardHover() {
  if (typeof window === 'undefined') return false
  const hoverMediaQuery = window.matchMedia?.(
    '(hover: hover) and (pointer: fine)'
  )
  if (typeof hoverMediaQuery?.matches === 'boolean') {
    return hoverMediaQuery.matches
  }
  return !isTouchPointerDevice()
}

function clearHoverWidgetTimeout() {
  if (!hoverTimeout.value) return
  clearTimeout(hoverTimeout.value)
  hoverTimeout.value = null
}

function showHoverWidgetAtPosition(
  position: { top: number; left: number },
  verse: number
) {
  hoverWidgetPosition.value = position
  hoverWidgetVerse.value = verse
  hoverWidgetVisible.value = true
}

function showHoverWidgetForVerseEvent(event: MouseEvent, verse: number) {
  showHoverWidgetAtPosition(
    {
      top: event.clientY,
      left: event.clientX,
    },
    verse
  )
}

const getAyahHoverTargetTestId = (
  layout: 'reader' | 'mushaf' | 'native',
  verse: number | string
) => `ayah-${layout}-${verse}`

function getHoverWidgetVerseNumber() {
  return Number(hoverWidgetVerse.value || 0)
}

function switchHoverRecitationToAudio() {
  if (readerMode.value === 'tts') {
    stopTTS()
    readerMode.value = 'audio'
  }
}

const isOfflineRecitationReady = computed(() =>
  Boolean(offlineRecitationStatus.value?.currentSuraAvailable)
)

const offlineRecitationChipLabel = computed(() =>
  isOfflineRecitationReady.value
    ? t('offline.listenWithoutInternet')
    : t('offline.internetRequired')
)

const offlineRecitationChipHint = computed(() => {
  if (offlineRecitationStatus.value?.fullQuranAvailable) {
    return t('offline.fullLibraryReadyHint')
  }

  if (offlineRecitationStatus.value?.currentSuraAvailable) {
    return t('offline.currentSuraReadyHint')
  }

  return t('offline.internetRequiredHint')
})

const offlineRecitationChipColor = computed(() =>
  isOfflineRecitationReady.value ? 'positive' : 'warning'
)

const offlineRecitationChipIcon = computed(() =>
  isOfflineRecitationReady.value ? 'offline_pin' : 'cloud_off'
)

const offlineManagerButtonLabel = computed(() => {
  if (offlineDownloadStatus.value.status === 'started') {
    const safePercent = Math.max(
      0,
      Math.min(100, offlineDownloadStatus.value.percent || 0)
    )
    return `${t('offline.downloading')} ${safePercent}%`
  }

  if (offlineDownloadStatus.value.status === 'completed') {
    return `${t('offline.title')} ✓`
  }

  if (offlineDownloadStatus.value.status === 'failed') {
    return `${t('offline.title')} !`
  }

  return t('offline.title')
})

const offlineManagerButtonIcon = computed(() => {
  if (offlineDownloadStatus.value.status === 'started') {
    return 'downloading'
  }

  if (offlineDownloadStatus.value.status === 'completed') {
    return 'check_circle'
  }

  if (offlineDownloadStatus.value.status === 'failed') {
    return 'error'
  }

  return 'download'
})

const offlineManagerButtonColor = computed(() => {
  if (offlineDownloadStatus.value.status === 'started') {
    return 'warning'
  }

  if (offlineDownloadStatus.value.status === 'completed') {
    return 'positive'
  }

  if (offlineDownloadStatus.value.status === 'failed') {
    return 'negative'
  }

  return 'primary'
})

function readShowTranslationPreference(): boolean {
  if (typeof window === 'undefined') return true
  const raw = window.localStorage.getItem(QURAN_TRANSLATION_KEY)
  if (raw === null) return true
  return raw === 'true'
}

function syncShowTranslationPreference() {
  showTranslation.value = readShowTranslationPreference()
}

// TTS (Text-to-Speech) state
const READER_MODE_KEY = 'quran-reader-mode'
const readerModeStore = useStorageRef<'audio' | 'tts'>(READER_MODE_KEY, 'audio')
const readerMode = computed<'audio' | 'tts'>({
  get: () => readerModeStore.value.value,
  set: (mode) => readerModeStore.set(mode),
})
const isTTSPlaying = ref(false)
const ttsVoice = ref<SpeechSynthesisVoice | null>(null)
const availableVoices = ref<SpeechSynthesisVoice[]>([])
const ttsRate = ref<number>(0.8)

const currentSuraId = computed(() =>
  Number(sura.value?.id || route.params.id || 0)
)

// Swipe detection state
const touchStartX = ref(0)
const touchEndX = ref(0)
const MIN_SWIPE_DISTANCE = 50

const viewModeOptions = computed(() => [
  {
    label: t('pages.quran.modes.mushaf'),
    value: 'mushaf',
    icon: 'auto_stories',
  },
  { label: t('pages.quran.modes.reader'), value: 'reader', icon: 'menu_book' },
  { label: t('pages.quran.modes.native'), value: 'native', icon: 'article' },
])

const readerModeOptions = computed(() => [
  {
    label: t('pages.quran.readerMode.audio') || 'Audio',
    value: 'audio',
    icon: 'volume_up',
  },
  {
    label: t('pages.quran.readerMode.tts') || 'TTS',
    value: 'tts',
    icon: 'record_voice_over',
  },
])

// Track which Quick Access verse is currently playing
const activeQuickAccessId = computed(() => {
  if (!isReading.value || currentAyahIndex.value < 0) return null
  return `${currentSuraId.value}_${currentAyahIndex.value + 1}`
})

// Track which Bookmark is currently playing
const activeBookmarkId = computed(() => {
  if (!isReading.value || currentAyahIndex.value < 0) return null
  return bookmarkEntries.value.find(
    (entry) =>
      entry.suraId === currentSuraId.value &&
      entry.verse === currentAyahIndex.value + 1
  )?.key
})

// Check if a specific Quick Access verse is currently playing
const isQuickAccessPlaying = (qa: QuickAccessVerse) => {
  return (
    isReading.value &&
    currentSuraId.value === qa.suraId &&
    currentAyahIndex.value === qa.verse - 1
  )
}

// Check if a specific Bookmark is currently playing
const isBookmarkPlaying = (entry: BookmarkEntry) => {
  return (
    isReading.value &&
    currentSuraId.value === entry.suraId &&
    currentAyahIndex.value === (entry.verse || 1) - 1
  )
}

const bookmarkEntries = computed<BookmarkEntry[]>(() => {
  const rows = (bookmarksStore.bookmarks || []) as any[]
  return rows
    .map<BookmarkEntry | null>((bm: any, idx: number) => {
      let rawString = ''
      if (typeof bm === 'string') {
        rawString = bm
      } else if (bm && typeof bm.bookmark === 'string') {
        rawString = bm.bookmark
      } else if (bm && typeof bm === 'object') {
        rawString = String(bm.bookmark || bm._id || '')
      }
      if (!rawString || typeof rawString !== 'string') return null
      const normalized = rawString.startsWith('id_')
        ? rawString.slice(3)
        : rawString
      const [suraPart, versePart] = normalized.split('_')

      return {
        key:
          typeof bm === 'string'
            ? `${normalized}_${idx}`
            : bm?._id || `${normalized}_${idx}`,
        normalized,
        label: suraPart && versePart ? `${suraPart}:${versePart}` : normalized,
        suraId: suraPart ? Number(suraPart) : null,
        verse: versePart ? Number(versePart) : null,
        raw: bm,
        rawString,
      }
    })
    .filter((entry): entry is BookmarkEntry => Boolean(entry?.normalized))
})

const hasBookmarks = computed(() => bookmarkEntries.value.length > 0)

const getVerseElementId = (verse: number | string) =>
  `aya-${currentSuraId.value}-${verse}`

const getBookmarkId = (verse: number | string, suraId = currentSuraId.value) =>
  `id_${suraId}_${verse}`

const isVerseSelected = (verse: number | string) =>
  selectedBookmark.value === getBookmarkId(verse)

const isVerseBookmarked = (verse: number | string) => {
  const normalized = `${currentSuraId.value}_${verse}`
  return bookmarkEntries.value.some((entry) => entry.normalized === normalized)
}

const bookmarkActionLabel = (verse: number | string) =>
  t('pages.quran.bookmarks.add', { verse })

const shareActionLabel = (reference: string) =>
  t('pages.quran.share.action', { reference })

const shareVerseActionLabel = (verse: number | string) =>
  t('pages.quran.share.verseAction', {
    reference: `${currentSuraId.value}:${verse}`,
  })

const QURAN_PAUSE_MARKS_RE = /\s+([ۖۗۘۙۚۛۜ۝])/gu

function normalizeTimedWordText(text: string) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(QURAN_PAUSE_MARKS_RE, '$1')
    .trim()
}

function splitVerseWords(text: string) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .map((word) => normalizeTimedWordText(word))
    .filter(Boolean)
}

function getSyncedVerseWords(verseNumber: number) {
  return syncedVerseWords.value[verseNumber - 1] || []
}

function hasTimingMatchedWords(verseNumber: number) {
  const idx = verseNumber - 1
  const words = syncedVerseWords.value[idx] || []
  const timings = wordTimings.value[idx] || []
  return (
    words.length > 0 && timings.length > 0 && words.length === timings.length
  )
}

function isActiveAyah(verseNumber: number) {
  return currentAyahIndex.value === verseNumber - 1
}

function isActiveWord(verseNumber: number, wordIndex: number) {
  return (
    hasTimingMatchedWords(verseNumber) &&
    currentAyahIndex.value === verseNumber - 1 &&
    currentWordIndex.value === wordIndex
  )
}

// Mark sura as read in localStorage
const READ_KEY = 'quran-read-suras'
function markSuraAsRead(suraId: number) {
  try {
    const stored = localStorage.getItem(READ_KEY)
    const readSet = stored ? new Set(JSON.parse(stored)) : new Set<number>()
    readSet.add(suraId)
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readSet)))
  } catch (e) {
    console.error('Failed to mark sura as read:', e)
  }
}

// Mark sura as completed in Ramadan progress tracking
const PROGRESS_KEY = 'quran-ramadan-progress'
function markSuraAsCompleted(suraId: number) {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    const completedSet = stored
      ? new Set(JSON.parse(stored))
      : new Set<number>()

    // Only mark as complete if not already completed
    if (!completedSet.has(suraId)) {
      completedSet.add(suraId)
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(Array.from(completedSet))
      )

      // Show completion notification
      $q.notify({
        type: 'positive',
        message:
          t('pages.quran.ramadanProgress.suraCompleted', { sura: suraId }) ||
          `Sura ${suraId} completed! ✓`,
        icon: 'check_circle',
        timeout: 3000,
        position: 'top',
        actions: [
          {
            label: t('pages.quran.ramadanProgress.viewProgress'),
            color: 'white',
            handler: () => {
              router.push('/quran')
            },
          },
        ],
      })
    }
  } catch (e) {
    console.error('Failed to mark sura as completed:', e)
  }
}

async function bookmarkVerse(
  verse: number | string,
  event?: MouseEvent | Event
) {
  event?.preventDefault()
  event?.stopPropagation()

  if (!sura.value) return
  const normalized = `${sura.value.id}_${verse}`

  // Check if already bookmarked
  if (isVerseBookmarked(verse)) {
    notify({
      type: 'info',
      message: t('pages.quran.bookmarks.alreadySaved'),
      tag: 'bookmark',
      icon: 'info',
      group: 'bookmark-duplicate',
    })
    return
  }

  try {
    const saved = await bookmarksStore.createBookmark(normalized)
    if (!saved?.ok) {
      throw new Error(t('pages.quran.bookmarks.error'))
    }

    selectedBookmark.value = `id_${normalized}`

    // Refresh from server only when actually stored there
    if (saved.source === 'server') {
      await bookmarksStore.fetchBookmarks()
    }

    notify({
      type: 'positive',
      message: t('pages.quran.bookmarks.saved'),
      tag: 'bookmark',
      icon: 'bookmark',
      group: 'bookmark-save',
      announce: true,
      actions: [
        {
          label: t('general.undo'),
          color: 'white',
          handler: () =>
            removeBookmark({
              normalized,
              key: normalized,
              label: `${sura.value?.id}:${verse}`,
              suraId: sura.value?.id ?? null,
              verse,
              raw: normalized,
              rawString: normalized,
            } as BookmarkEntry),
        },
      ],
    })
  } catch (err: any) {
    console.error('[Bookmark] Failed to save:', err)
    notify({
      type: 'negative',
      message: err?.message || t('pages.quran.bookmarks.error'),
      tag: 'error',
      icon: 'error',
      group: 'bookmark-error',
    })
  }
}

function removeBookmark(entry: BookmarkEntry, event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  const identifier =
    typeof entry.raw === 'string'
      ? entry.raw
      : entry.raw?._id || entry.raw?.bookmark || entry.normalized

  bookmarksStore.deleteBookmark(identifier)

  // Force refresh after deletion
  nextTick(() => {
    bookmarksStore.fetchBookmarks()
  })
}

function buildVerseShareUrl(entry: BookmarkEntry) {
  const suraId = Number(entry.suraId || currentSuraId.value)
  const verse = Number(entry.verse || 1)
  return buildVerseShareUrlFromParts(suraId, verse)
}

function buildVerseShareUrlFromParts(
  suraId: number,
  verse: number,
  options: { autoplay?: boolean; mode?: string } = {}
) {
  if (!suraId || !verse) return ''
  const path = `/quran/${suraId}:${verse}`
  const env = (import.meta as any)?.env || {}
  const configuredSite = String(env.VITE_SITE_URL || '').trim()
  const i18nSite = String(t('general.SiteDomain') || '').trim()
  const base = (configuredSite || i18nSite || 'https://peace2074.com').replace(
    /\/$/,
    ''
  )

  // Add query parameters
  const params = new URLSearchParams()
  if (options.autoplay) {
    params.set('autoplay', 'true')
  }
  if (options.mode && ['reader', 'mushaf', 'native'].includes(options.mode)) {
    params.set('mode', options.mode)
  }

  const queryString = params.toString()
  return `${base}${path}${queryString ? `?${queryString}` : ''}`
}

async function shareVerseLink(
  suraId: number,
  verse: number,
  label = `${suraId}:${verse}`
) {
  // Include current mode and autoplay in share link
  const url = buildVerseShareUrlFromParts(suraId, verse, {
    autoplay: true,
    mode: layoutMode.value,
  })
  if (!url) return

  // Get sura name for better share text
  const suraName = sura.value?.e_name || `Sura ${suraId}`
  const shareTitle = `${suraName} ${verse}`
  const shareText = String(
    t('pages.quran.share.text', {
      suraName,
      reference: `${suraId}:${verse}`,
    })
  )

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url,
      })
      notify({
        type: 'positive',
        message: t('pages.quran.share.shared', { label }),
        tag: 'share',
        icon: 'share',
        group: 'share-success',
      })
      return
    }
  } catch (err: any) {
    // If native share is canceled by user, don't show error
    if (err?.name === 'AbortError') return
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      notify({
        type: 'positive',
        message: t('pages.quran.share.linkCopied', { text: shareText }),
        tag: 'clipboard',
        icon: 'content_copy',
        caption: url,
        group: 'clipboard-copy',
      })
      return
    }
  } catch {
    // ignore and fallback notify
  }

  $q.notify({
    type: 'info',
    message: url,
    icon: 'link',
    position: 'top',
    timeout: 3000,
  })
}

async function shareBookmark(entry: BookmarkEntry, event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  const suraId = Number(entry.suraId || currentSuraId.value)
  const verse = Number(entry.verse || 1)
  await shareVerseLink(suraId, verse, entry.label)
}

async function shareHoverVerse(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  const verse = Number(hoverWidgetVerse.value || 0)
  const suraId = Number(currentSuraId.value || 0)
  if (!suraId || !verse) return
  await shareVerseLink(suraId, verse, `${suraId}:${verse}`)
}

async function handleBookmarkNavigate(
  entry: BookmarkEntry,
  event?: MouseEvent | Event
) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (!entry) return

  if (isRecitationSessionLocked.value) {
    return
  }

  selectedBookmark.value = `id_${entry.normalized}`

  const playVerseAfterLoad = async () => {
    // Wait for sura to fully load (check loading state and correct sura)
    let retries = 30 // 30 x 200ms = 6 seconds max wait
    while (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      // Check if we're on the correct sura and audio is loaded
      if (
        !loading.value &&
        currentSuraId.value === entry.suraId &&
        audioList.value.length >= (entry.verse || 0)
      ) {
        break
      }
      retries--
    }

    // Verify we have the correct audio list before playing
    const verseIndex = (entry.verse || 1) - 1
    if (
      currentSuraId.value === entry.suraId &&
      audioList.value.length > verseIndex &&
      verseIndex >= 0
    ) {
      stopRequested.value = false
      // Scroll to verse first
      await nextTick()
      scrollToVerse(entry.verse)
      // Small delay to ensure scroll completes
      await new Promise((resolve) => setTimeout(resolve, 100))
      await startAudioRecitation(verseIndex, { withIntro: true })
      $q.notify({
        type: 'positive',
        message: t('pages.quran.notifications.playingSelectionWithReciter', {
          label: entry.label,
          reciter: QURAN_RECITER_NAME,
        }),
        icon: 'play_arrow',
        timeout: 2000,
      })
    }
  }

  if (entry.suraId && entry.suraId !== currentSuraId.value) {
    await router.push({
      path: `/quran/${entry.suraId}`,
      hash: `#${entry.normalized}`,
    })
    // Wait for sura to load and then play
    await playVerseAfterLoad()
  } else {
    // Same sura - scroll and play immediately
    scrollToVerse(entry.verse)
    await playVerseAfterLoad()
  }
}

/**
 * Navigate to a quick access verse using the Red-Black Tree for O(log n) lookup
 * After navigation, automatically plays the ayah audio
 */
async function navigateToQuickAccess(
  qaVerse: QuickAccessVerse,
  event?: MouseEvent | Event
) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (isRecitationSessionLocked.value) {
    return
  }

  selectedBookmark.value = `id_${qaVerse.id}`

  const playVerseAfterLoad = async () => {
    // Wait for sura to fully load (check loading state and correct sura)
    let retries = 30 // 30 x 200ms = 6 seconds max wait
    while (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      // Check if we're on the correct sura and audio is loaded
      if (
        !loading.value &&
        currentSuraId.value === qaVerse.suraId &&
        audioList.value.length >= qaVerse.verse
      ) {
        break
      }
      retries--
    }

    // Verify we have the correct audio list before playing
    const verseIndex = qaVerse.verse - 1
    if (
      currentSuraId.value === qaVerse.suraId &&
      audioList.value.length > verseIndex &&
      verseIndex >= 0
    ) {
      stopRequested.value = false
      // Scroll to verse first
      await nextTick()
      scrollToVerse(qaVerse.verse)
      // Small delay to ensure scroll completes
      await new Promise((resolve) => setTimeout(resolve, 100))
      await startAudioRecitation(verseIndex, { withIntro: true })
      $q.notify({
        type: 'positive',
        message: t('pages.quran.notifications.playingSelectionWithReciter', {
          label: t(qaVerse.nameKey),
          reciter: QURAN_RECITER_NAME,
        }),
        icon: 'play_arrow',
        timeout: 2000,
      })
    } else {
      console.error(
        `[QuickAccess] Failed to play: sura=${currentSuraId.value}, expected=${qaVerse.suraId}, audioLen=${audioList.value.length}, verseIndex=${verseIndex}`
      )
    }
  }

  if (qaVerse.suraId !== currentSuraId.value) {
    // Navigate to different sura, then play after load
    await router.push({
      path: `/quran/${qaVerse.suraId}`,
      hash: `#${qaVerse.id}`,
    })
    // Wait for sura to load and then play
    await playVerseAfterLoad()
  } else {
    // Same sura - scroll and play immediately
    scrollToVerse(qaVerse.verse)
    await playVerseAfterLoad()
  }
}

function scrollToVerse(verse?: number | null) {
  if (typeof window === 'undefined' || verse === undefined || verse === null)
    return
  const el = document.getElementById(getVerseElementId(verse))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function scrollToHash(
  rawHash?: string | null,
  options: { autoplay?: boolean } = {}
) {
  if (typeof window === 'undefined') return
  const hash = (rawHash || window.location.hash || '').replace(/^#/, '')
  if (!hash) return
  const normalized = hash.startsWith('id_') ? hash.slice(3) : hash
  const [suraPart, versePart] = normalized.split('_')
  if (Number(suraPart) !== currentSuraId.value) return
  selectedBookmark.value = `id_${normalized}`
  await nextTick()
  scrollToVerse(versePart ? Number(versePart) : undefined)

  // Autoplay from the shared verse if requested
  if (options.autoplay && versePart && audioList.value.length > 0) {
    const verseIndex = Number(versePart) - 1
    if (verseIndex >= 0 && verseIndex < audioList.value.length) {
      stopRequested.value = false
      // Small delay to ensure scroll completes
      await new Promise((resolve) => setTimeout(resolve, 100))
      await startAudioRecitation(verseIndex, { withIntro: true })
      $q.notify({
        type: 'positive',
        message: t('pages.quran.notifications.playingVerseWithReciter', {
          verse: versePart,
          reciter: QURAN_RECITER_NAME,
        }),
        icon: 'play_arrow',
        timeout: 2500,
      })
    }
  }
}

async function autoplayCurrentSuraFromStart() {
  if (readerMode.value === 'tts') {
    currentAyahIndex.value = 0
    stopRequested.value = false
    startTTS()
    return
  }

  if (audioList.value.length > 0) {
    stopRequested.value = false
    await startAudioRecitation(0, { withIntro: true })
    $q.notify({
      type: 'positive',
      message: t('pages.quran.notifications.playingSuraFromVerse', {
        sura: currentSuraId.value,
        verse: 1,
      }),
      icon: 'play_arrow',
      timeout: 2000,
    })
  }
}

async function loadSuraById(id: number) {
  loading.value = true
  error.value = ''
  selectedBookmark.value = ''
  stopAudio()

  // Mark sura as read
  markSuraAsRead(id)

  try {
    await q2p.init(id, locale.value || 'en')
    sura.value = q2p.GetSura?.value || null

    // Check for query params (autoplay and mode)
    const shouldAutoplay =
      route.query.autoplay === 'true' || Boolean(route.hash)
    const queryMode = route.query.mode as
      | 'reader'
      | 'mushaf'
      | 'native'
      | undefined

    // Apply mode from query param if present
    if (queryMode && ['reader', 'mushaf', 'native'].includes(queryMode)) {
      layoutMode.value = queryMode
      // Update URL to use path param instead of query param
      router.replace({
        name: 'QuranDetail',
        params: { ...route.params, mode: queryMode },
        hash: route.hash,
      })
    }

    // Render the sura text as soon as the bundled Quran data is ready.
    // Audio/timing metadata can take longer because it depends on remote APIs,
    // and the reading UI should not stay blocked behind that network work.
    loading.value = false
    await nextTick()

    const normalizedHash = String(route.hash || '').replace(/^#/, '')
    await refreshOfflineRecitationStatus(id)
    await scrollToHash(route.hash)
    applyQuranDetailTitle(true)

    // Load audio from remote services after the verse content is already visible.
    await loadAudioAndTimings(id)

    // Enable autoplay if query param or hash is present (shared verse link)
    await scrollToHash(route.hash, { autoplay: shouldAutoplay })

    // For auto-continue to next sura (`?autoplay=true`) with no verse hash,
    // start from the first ayah of the loaded sura.
    if (shouldAutoplay && !normalizedHash) {
      await autoplayCurrentSuraFromStart()
    }
  } catch (e: any) {
    error.value = e?.message || String(t('pages.quran.loadSuraError'))
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
}

/**
 * Load audio from offline cache
 */
async function loadAudioFromCache(id: number): Promise<boolean> {
  return loadAudioFromCacheWithQuality(id, selectedQuality.value)
}

async function loadAudioFromCacheWithQuality(
  id: number,
  quality: RecitationQuality
): Promise<boolean> {
  try {
    const suraData = sura.value
    if (!suraData) return false

    isLoadingFromCache.value = true
    audioList.value = []
    wordTimings.value = {} // Word timings not available offline
    syncedVerseWords.value = {}

    // Load each verse from cache
    for (let verse = 1; verse <= suraData.total_verses; verse++) {
      const cachedUrl = await getCachedAudioUrl(id, verse, quality)
      if (cachedUrl) {
        audioList.value[verse - 1] = cachedUrl
      } else {
        // Cache incomplete, fall back to online
        console.warn(`[Offline Audio] Missing verse ${verse} in cache`)
        return false
      }
    }

    console.debug(
      `[Offline Audio] Loaded ${audioList.value.length} verses from cache for sura ${id}`
    )

    notify({
      type: 'positive',
      message:
        t('pages.quran.playingOffline') || 'Playing from offline storage',
      icon: 'offline_pin',
      position: 'top',
      timeout: 2000,
    })

    return true
  } catch (err) {
    console.error('[Offline Audio] Load error:', err)
    return false
  } finally {
    isLoadingFromCache.value = false
  }
}

/**
 * Load audio URLs and word timings from quran.com API.
 * Uses per-verse audio with synchronized word segments.
 * Checks offline cache first before making network requests.
 */
async function loadAudioAndTimings(id: number) {
  audioList.value = []
  wordTimings.value = {}
  syncedVerseWords.value = {}
  currentAyahIndex.value = -1

  await refreshOfflineRecitationStatus(id)

  const preferredOfflineQuality =
    offlineRecitationStatus.value?.preferredQuality || null

  if (preferredOfflineQuality) {
    // Prefer downloaded/on-device audio to reduce internet dependency.
    const loadedFromCache = await loadAudioFromCacheWithQuality(
      id,
      preferredOfflineQuality
    )
    if (loadedFromCache) {
      // Audio is offline — load translations from bundled editions.
      await loadTranslationsFromBundled(id)
      return
    }
    // If cache load failed, continue to online loading
  }

  const AUDIO_BASE_URL = 'https://verses.quran.com/'

  const translatorId = readTranslatorIdForLocale(locale.value || 'en')

  try {
    // Fetch verses with audio segments for reciter 7 (Al-Afasy) + preferred translation.
    const sourceUrl = `https://api.quran.com/api/v4/verses/by_chapter/${id}?audio=7&words=true&word_fields=text_uthmani&translations=${translatorId}&per_page=300`
    const res = await fetch(sourceUrl)
    if (!res.ok) {
      trackApi5xx('quran_com_verses', res.status, sourceUrl)
      console.warn(
        '[Quran Audio] Failed to load from quran.com, falling back to alquran.cloud'
      )
      await loadAudioListFallback(id)
      await loadTranslationsFromBundled(id)
      return
    }

    const json = await res.json()
    const verses = json?.verses || []

    verses.forEach((verse: any) => {
      const verseNum = verse?.verse_number
      if (!verseNum) return

      // Build full audio URL
      const audioPath = verse?.audio?.url
      if (audioPath) {
        audioList.value[verseNum - 1] = `${AUDIO_BASE_URL}${audioPath}`
      }

      // Extract word timings from segments
      // Segment format: [char_start, char_end, start_ms, end_ms]
      const segments: number[][] = verse?.audio?.segments || []
      const timings = segments
        .filter((seg: number[]) => seg.length >= 4)
        .map((seg: number[]) => ({
          start: (seg[2] ?? 0) / 1000,
          end: (seg[3] ?? 0) / 1000,
        }))

      const words = Array.isArray(verse?.words)
        ? verse.words
            .filter((word: any) => word?.char_type_name === 'word')
            .map((word: any) =>
              normalizeTimedWordText(
                word?.text_uthmani ||
                  word?.text_uthmani_simple ||
                  word?.text ||
                  ''
              )
            )
            .filter(Boolean)
        : []

      if (timings.length > 0) {
        wordTimings.value[verseNum - 1] = timings
        if (words.length === timings.length) {
          syncedVerseWords.value[verseNum - 1] = words
        }
      }

      // Merge translation text into sura ayat
      const translationText = verse?.translations?.[0]?.text
      if (translationText && sura.value?.ayat) {
        const ayah = sura.value.ayat[verseNum - 1]
        if (ayah) {
          ayah.translation = cleanTranslationText(translationText)
        }
      }
    })

    // Compact the list: fill holes with empty string then filter,
    // but preserve index alignment by only removing trailing empty slots.
    // Use a dense array built from the max verse index so playback
    // indices always match actual ayah numbers.
    const maxVerse = verses.reduce((max: number, v: any) => Math.max(max, v?.verse_number || 0), 0)
    const dense: string[] = []
    for (let i = 0; i < maxVerse; i++) {
      dense.push(audioList.value[i] || '')
    }
    audioList.value = dense

    console.debug(
      `[Quran Audio] Loaded ${audioList.value.length} verses with ${Object.keys(wordTimings.value).length} word timing sets and ${Object.keys(syncedVerseWords.value).length} synced word maps for sura ${id}`
    )
  } catch (err) {
    console.error('[Quran Audio] Failed to load from quran.com:', err)
    await loadAudioListFallback(id)
    await loadTranslationsFromBundled(id)
  }
}

/**
 * Offline fallback: load translation text from the bundled edition JSON
 * for the current locale. Used when the quran.com API is unreachable.
 */
async function loadTranslationsFromBundled(id: number) {
  if (!sura.value?.ayat) return
  const loc = locale.value || 'en'
  try {
    const edition = await import(`../../shared/data/editions/${loc}.json`)
    const verses: Array<{ verse: number; text: string }> =
      edition.default?.[String(id)] || []
    verses.forEach((v) => {
      const ayah = sura.value?.ayat?.[v.verse - 1]
      if (ayah && v.text) ayah.translation = v.text
    })
  } catch {
    // No bundled edition for this locale — API will provide the translation
  }
}

async function ensureBismillahIntroUrl() {
  if (bismillahIntroUrl.value) return bismillahIntroUrl.value

  const offlineIntroStatus = await getOfflineRecitationStatus(
    1,
    selectedQuality.value
  )
  const offlineIntroQuality = offlineIntroStatus.preferredQuality

  if (offlineIntroQuality) {
    const cachedIntroUrl = await getCachedAudioUrl(1, 1, offlineIntroQuality)
    if (cachedIntroUrl) {
      bismillahIntroUrl.value = cachedIntroUrl
      return bismillahIntroUrl.value
    }
  }

  try {
    const sourceUrl = 'https://api.quran.com/api/v4/verses/by_key/1:1?audio=7'
    const res = await fetch(sourceUrl)
    if (!res.ok) {
      trackApi5xx('quran_com_bismillah_intro', res.status, sourceUrl)
      return null
    }

    const json = await res.json()
    const audioPath = json?.verse?.audio?.url
    if (audioPath) {
      bismillahIntroUrl.value = `https://verses.quran.com/${audioPath}`
      return bismillahIntroUrl.value
    }
  } catch {
    // silent; intro is optional
  }

  return null
}

async function refreshOfflineRecitationStatus(suraId = currentSuraId.value) {
  if (!suraId) {
    offlineRecitationStatus.value = null
    return
  }

  offlineRecitationStatus.value = await getOfflineRecitationStatus(
    suraId,
    selectedQuality.value
  )
}

async function playBismillahIntro(): Promise<void> {
  const introUrl = await ensureBismillahIntroUrl()
  if (!introUrl || stopRequested.value) return

  await new Promise<void>((resolve) => {
    const intro = new Audio(introUrl)
    intro.preload = 'auto'
    intro.playbackRate = playbackRate.value
    intro.onended = () => resolve()
    intro.onerror = () => resolve()
    void intro.play().catch(() => resolve())
  })
}

async function startAudioRecitation(
  index: number,
  opts: { withIntro?: boolean } = {}
) {
  // Prevent concurrent starts from rapid clicks and block repeat starts
  if (isRecitationSessionLocked.value) {
    console.debug(
      '[Audio] Recitation session already active, ignoring duplicate call'
    )
    return
  }

  const withIntro = opts.withIntro !== false
  const startIndex = Math.max(0, index)

  if (!audioList.value.length || startIndex >= audioList.value.length) return

  isStartingRecitation.value = true
  try {
    stopAudio()
    stopRequested.value = false
    currentWordIndex.value = -1

    if (withIntro) {
      await playBismillahIntro()
    }

    if (!stopRequested.value) {
      playAyah(startIndex)
    }
  } finally {
    isStartingRecitation.value = false
  }
}

/**
 * Fallback audio loader using alquran.cloud API (no word timings)
 */
async function loadAudioListFallback(id: number) {
  try {
    const sourceUrl = `https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`
    const res = await fetch(sourceUrl)
    if (!res.ok) {
      trackApi5xx('alquran_cloud_fallback', res.status, sourceUrl)
      return
    }
    const json = await res.json()
    const ayahs = json?.data?.ayahs || []
    audioList.value = ayahs.map((a: any) => a?.audio).filter(Boolean)
  } catch {
    // silent fallback; list stays empty
  }
}

function preloadNextAyah(index: number) {
  // Skip to the next index that has a real URL
  let nextIndex = index
  while (nextIndex < audioList.value.length && !audioList.value[nextIndex]) {
    nextIndex++
  }
  if (nextIndex < 0 || nextIndex >= audioList.value.length) {
    nextAudioEl.value = null
    return
  }
  const src = audioList.value[nextIndex]
  const el = new Audio(src)
  el.preload = 'auto'
  el.playbackRate = playbackRate.value
  nextAudioEl.value = el
}

function playAyah(index: number) {
  if (stopRequested.value) {
    isPlayingAudio.value = false
    return
  }
  if (!audioList.value.length || index < 0 || index >= audioList.value.length) {
    stopAudio()
    return
  }
  // Skip empty slots (ayahs with no audio URL) without stopping
  if (!audioList.value[index]) {
    playAyah(index + 1)
    return
  }
  try {
    audioEl.value?.pause()

    // Use preloaded audio if available for this index
    let el: HTMLAudioElement
    const expectedSrc = audioList.value[index]
    if (nextAudioEl.value && nextAudioEl.value.src === expectedSrc) {
      el = nextAudioEl.value
      nextAudioEl.value = null
    } else {
      el = new Audio(expectedSrc)
    }

    el.playbackRate = playbackRate.value
    audioEl.value = el
    currentAyahIndex.value = index
    isPlayingAudio.value = true
    currentWordIndex.value = -1

    // Preload next ayah for seamless playback
    preloadNextAyah(index + 1)

    el.ontimeupdate = () => {
      updateCurrentWord(el.currentTime)
      savePlaybackPosition()
    }
    el.onended = () => {
      if (stopRequested.value) {
        stopAudio()
      } else if (index + 1 >= audioList.value.length) {
        // Sura completed - mark as complete
        markSuraAsCompleted(currentSuraId.value)

        // Check if auto-continue is enabled
        if (autoContinueEnabled.value && currentSuraId.value < 114) {
          // Navigate to next sura and start playing
          const nextSuraId = currentSuraId.value + 1
          $q.notify({
            type: 'info',
            message: t('pages.quran.notifications.startingSura', {
              sura: nextSuraId,
            }),
            icon: 'skip_next',
            timeout: 2000,
            position: 'top',
          })

          // Navigate and set flag to autoplay
          setTimeout(async () => {
            await router.push(`/quran/${nextSuraId}?autoplay=true`)
          }, 1000)
        } else {
          stopAudio()
        }
      } else {
        playAyah(index + 1)
      }
    }
    el.onerror = () => {
      if (stopRequested.value) {
        stopAudio()
      } else {
        playAyah(index + 1)
      }
    }
    void el.play().catch(() => {
      playAyah(index + 1)
    })
  } catch {
    playAyah(index + 1)
  }
}

async function startSuraAudio() {
  // Prevent concurrent starts from rapid clicks and block repeat starts
  if (isRecitationSessionLocked.value) {
    console.debug(
      '[Audio] Sura audio session already active, ignoring duplicate call'
    )
    return
  }

  stopRequested.value = false
  currentWordIndex.value = -1

  if (!audioList.value.length) {
    notify({
      type: 'warning',
      message: t('pages.quran.loadingAudio'),
      tag: 'audio',
      icon: 'downloading',
      group: 'audio-loading',
    })
    return
  }

  // Reload audio and timings if word timings are missing
  if (!Object.keys(wordTimings.value).length && currentSuraId.value) {
    await loadAudioAndTimings(Number(currentSuraId.value))
  }

  const startIndex = currentAyahIndex.value >= 0 ? currentAyahIndex.value : 0
  await startAudioRecitation(startIndex, { withIntro: true })
}

function stopAudio() {
  stopRequested.value = true
  if (audioEl.value) {
    audioEl.value.onended = null
    audioEl.value.onerror = null
    audioEl.value.ontimeupdate = null
    audioEl.value.pause()
    audioEl.value = null
  }
  // Clear preloaded audio
  nextAudioEl.value = null
  isPlayingAudio.value = false
  currentAyahIndex.value = -1
  currentWordIndex.value = -1
  // Clear saved playback position when completely stopped
  clearPlaybackPosition()
}

let lastPlaybackSaveAt = 0

function pickSavedPlaybackPosition(): PlaybackPosition | null {
  const local = playbackPositionStore.value.value
  const remote = savedPlaybackPosition.value

  if (!local) return remote
  if (!remote) return local

  return local.timestamp >= remote.timestamp ? local : remote
}

function savePlaybackPosition(force = false) {
  if (currentAyahIndex.value < 0 || !currentSuraId.value) {
    return
  }

  const position: PlaybackPosition = {
    suraId: currentSuraId.value,
    ayahIndex: currentAyahIndex.value,
    wordIndex: currentWordIndex.value,
    audioTime: audioEl.value?.currentTime || 0,
    timestamp: Date.now(),
    readerMode: readerMode.value,
  }

  playbackPositionStore.set(position)

  const now = Date.now()
  if (!force && now - lastPlaybackSaveAt < 2500) {
    return
  }
  lastPlaybackSaveAt = now

  if (authStore.isAuthenticated) {
    void saveRecitationProgress(position)
  }
}

function clearPlaybackPosition() {
  playbackPositionStore.set(null)
  if (authStore.isAuthenticated) {
    void saveRecitationProgress(null)
  }
}

async function restorePlaybackPosition() {
  const saved = pickSavedPlaybackPosition()
  if (!saved || saved.suraId !== currentSuraId.value) {
    return false
  }

  // Check if position is not too old (within last 7 days)
  const hoursSinceLastPlay = (Date.now() - saved.timestamp) / (1000 * 60 * 60)
  if (hoursSinceLastPlay > 24 * 7) {
    clearPlaybackPosition()
    return false
  }

  // Automatically restore position and continue playback instantly without any manual prompt
  currentAyahIndex.value = saved.ayahIndex
  currentWordIndex.value =
    typeof saved.wordIndex === 'number' ? saved.wordIndex : -1
  if (saved.readerMode === 'audio' || saved.readerMode === 'tts') {
    readerMode.value = saved.readerMode
  }

  stopRequested.value = false
  await startAudioRecitation(saved.ayahIndex, { withIntro: false })
  if (audioEl.value && saved.audioTime > 0) {
    audioEl.value.currentTime = saved.audioTime
    updateCurrentWord(saved.audioTime)
  } else if (currentWordIndex.value >= 0) {
    scrollToCurrentWord(saved.ayahIndex, currentWordIndex.value)
  }
  syncUrlQueryParams()
  return true
}

// Reactive URL state parameter computed property
const activeUrlQueryParams = computed(() => {
  if (typeof window === 'undefined') return {}
  const params: Record<string, string> = { ...(route.query as Record<string, string>) }

  if (route.query.theme || route.query.mode) {
    params.theme = Dark.isActive ? 'dark' : 'light'
  }

  if (layoutMode.value) {
    params.layout = layoutMode.value
  }

  if (highlightMode.value) {
    params.highlight = highlightMode.value
  }

  if (currentAyahIndex.value >= 0) {
    params.verse = String(currentAyahIndex.value + 1)
  }

  if (isPlayingAudio.value) {
    params.play = 'true'
  } else {
    delete params.play
  }

  if (locale.value) {
    params.lang = locale.value
  }

  return params
})

// Automatically keep browser URL parameters synchronized in real time whenever active state changes
watch(
  activeUrlQueryParams,
  (newParams) => {
    if (typeof window === 'undefined') return
    const searchStr = new URLSearchParams(newParams).toString()
    const newUrl = `${window.location.pathname}${searchStr ? '?' + searchStr : ''}`
    window.history.replaceState(window.history.state, '', newUrl)
  },
  { deep: true }
)

function syncUrlQueryParams() {
  if (typeof window === 'undefined') return
  const searchStr = new URLSearchParams(activeUrlQueryParams.value).toString()
  const newUrl = `${window.location.pathname}${searchStr ? '?' + searchStr : ''}`
  window.history.replaceState(window.history.state, '', newUrl)
}

function getRecitationScrollOffset() {
  if (typeof window === 'undefined') {
    return 120
  }

  const heading = document.querySelector('.sura-heading.is-reciting')
  const headingHeight = heading?.getBoundingClientRect().height || 0
  const appHeader =
    document.querySelector('.q-header')?.getBoundingClientRect().height || 56
  const safeTop = isIOSRuntime.value
    ? Math.max(0, window.visualViewport?.offsetTop || 0)
    : 0

  return Math.ceil(headingHeight + appHeader + safeTop + 16)
}

function persistRecitationBeforeLeave() {
  if (currentAyahIndex.value >= 0) {
    savePlaybackPosition(true)
  }

  if (isPlayingAudio.value) {
    pauseAudio()
  } else if (isTTSPlaying.value) {
    pauseTTS()
  }
}

function canStartHoveredVerse(verse: number) {
  return verse > 0 && audioList.value.length >= verse
}

function isHoveredVerseCurrentlyPlaying(verse: number) {
  const verseIndex = verse - 1
  return (
    verseIndex >= 0 &&
    isPlayingAudio.value &&
    currentAyahIndex.value === verseIndex
  )
}

async function startReadingFromVerse(verse: number) {
  if (!canStartHoveredVerse(verse)) return false

  switchHoverRecitationToAudio()
  await nextTick()
  await startAudioRecitation(verse - 1, { withIntro: true })
  return true
}

async function restartReadingFromVerse(verse: number) {
  if (!canStartHoveredVerse(verse)) return false

  switchHoverRecitationToAudio()
  await nextTick()

  if (audioEl.value) {
    stopAudio()
    await nextTick()
  }

  await startAudioRecitation(verse - 1, { withIntro: true })
  return true
}

async function togglePauseResume() {
  if (isStartingRecitation.value) {
    return
  }

  if (!audioEl.value) {
    const verse = getHoverWidgetVerseNumber()
    if (verse > 0) {
      await startReadingFromVerse(verse)
    }
    return
  }

  if (audioEl.value.paused) {
    resumeAudio()
  } else {
    pauseAudio()
  }
}

function handleVerseTap(event: MouseEvent, verse: number) {
  if (!isTouchPointerDevice()) return

  event.preventDefault()
  event.stopPropagation()

  if (hoverWidgetVisible.value && hoverWidgetVerse.value === verse) {
    hideHoverWidget()
    return
  }

  showHoverWidgetForVerseEvent(event, verse)
}

// Hover widget functions
function onVerseMouseEnter(event: MouseEvent, verse: number) {
  if (!supportsAyahActionCardHover()) return

  clearHoverWidgetTimeout()
  hoverTimeout.value = setTimeout(() => {
    showHoverWidgetForVerseEvent(event, verse)
  }, AYAH_ACTION_CARD_HOVER_DELAY_MS)
}

function onVerseMouseLeave() {
  clearHoverWidgetTimeout()
}

function hideHoverWidget() {
  hoverWidgetVisible.value = false
  hoverWidgetVerse.value = null
}

async function restartFromVerse(verse: number, event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  if (!canStartHoveredVerse(verse)) {
    return
  }

  hideHoverWidget()
  await nextTick()
  await restartReadingFromVerse(verse)
}

async function restartSura(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  if (isRecitationSessionLocked.value) {
    return
  }

  hideHoverWidget()
  await nextTick()
  await startAudioRecitation(0, { withIntro: true })
}

function goHome(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  hideHoverWidget()
  stopAudio()
  router.push('/')
}

function scrollToTop(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function pauseFromHover(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  pauseAudio()
}

async function handleVerseDoubleClick(event: MouseEvent, verse: number) {
  event.preventDefault()
  event.stopPropagation()

  // Debounce to prevent rapid double-clicks
  const now = Date.now()
  if (now - lastDoubleClickTime.value < DOUBLE_CLICK_DEBOUNCE) {
    console.debug('[DoubleClick] Debounced - too soon')
    return
  }
  lastDoubleClickTime.value = now

  // Show hover widget at double-click location
  clearHoverWidgetTimeout()
  showHoverWidgetForVerseEvent(event, verse)

  const verseIndex = verse - 1
  const isThisVerseCurrent = currentAyahIndex.value === verseIndex
  const isAudioSessionLocked =
    isStartingRecitation.value || audioEl.value !== null

  // Check if this verse is currently playing
  const isThisVersePlaying = isHoveredVerseCurrentlyPlaying(verse)

  if (isAudioSessionLocked && !isThisVerseCurrent) {
    return
  }

  if (isThisVersePlaying) {
    // If this verse is already playing, stop it
    stopReading()
    $q.notify({
      type: 'info',
      message: t('pages.quran.notifications.stoppedVerse', { verse }),
      icon: 'stop',
      timeout: 1500,
      position: 'top',
    })
  } else if (await restartReadingFromVerse(verse)) {
    // If it's not playing or a different verse is playing, start this verse
    stopRequested.value = false
    $q.notify({
      type: 'positive',
      message: t('pages.quran.notifications.playingVerse', { verse }),
      icon: 'play_arrow',
      timeout: 1500,
      position: 'top',
    })
  }
}

// Swipe handlers for sura navigation
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0].clientX
}

function handleTouchEnd() {
  const swipeDistance = touchEndX.value - touchStartX.value

  if (Math.abs(swipeDistance) < MIN_SWIPE_DISTANCE) {
    // Not a significant swipe
    return
  }

  const nextId =
    swipeDistance < 0
      ? currentSuraId.value + 1 // Swipe left = next sura
      : currentSuraId.value - 1 // Swipe right = previous sura

  // Validate sura ID range (1-114)
  if (nextId >= 1 && nextId <= 114) {
    router.push(`/quran/${nextId}`)
    $q.notify({
      type: 'info',
      message:
        swipeDistance < 0
          ? t('pages.quran.notifications.nextSura')
          : t('pages.quran.notifications.previousSura'),
      timeout: 1000,
      position: 'top',
    })
  }
}

// TTS (Text-to-Speech) Functions
function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const voices = window.speechSynthesis.getVoices()
  // Prefer Arabic voices, fallback to any available
  const arabicVoices = voices.filter((v) => v.lang.startsWith('ar'))
  availableVoices.value = arabicVoices.length ? arabicVoices : voices
  // Auto-select first Arabic voice if available
  if (!ttsVoice.value && availableVoices.value.length) {
    ttsVoice.value = availableVoices.value[0]
  }
}

function speakAyah(index: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    $q.notify({
      type: 'warning',
      message:
        t('pages.quran.ttsNotSupported') ||
        'Text-to-speech not supported in this browser',
    })
    return
  }

  if (stopRequested.value) {
    isTTSPlaying.value = false
    return
  }

  const ayat = sura.value?.ayat || []
  if (index < 0 || index >= ayat.length) {
    stopTTS()
    return
  }

  const ayah = ayat[index]
  const text = typeof ayah === 'string' ? ayah : ayah?.text || ''
  if (!text) {
    speakAyah(index + 1)
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = ttsRate.value
  utterance.lang = 'ar'
  if (ttsVoice.value) {
    utterance.voice = ttsVoice.value
  }

  currentAyahIndex.value = index
  isTTSPlaying.value = true

  utterance.onend = () => {
    if (!stopRequested.value) {
      speakAyah(index + 1)
    }
  }

  utterance.onerror = () => {
    if (!stopRequested.value) {
      speakAyah(index + 1)
    }
  }

  window.speechSynthesis.speak(utterance)
}

function startTTS() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    $q.notify({
      type: 'warning',
      message:
        t('pages.quran.ttsNotSupported') || 'Text-to-speech not supported',
    })
    return
  }

  stopRequested.value = false
  loadVoices()
  speakAyah(currentAyahIndex.value >= 0 ? currentAyahIndex.value : 0)
}

function stopTTS() {
  stopRequested.value = true
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  isTTSPlaying.value = false
  currentAyahIndex.value = -1
}

function startReading(event?: MouseEvent | Event) {
  // Prevent default browser behavior and concurrent starts
  event?.preventDefault()
  event?.stopPropagation()

  if (isStartingRecitation.value) {
    console.debug('[Reading] Already starting, ignoring duplicate click')
    return
  }

  if (readerMode.value === 'tts') {
    // TTS: pause/resume if already speaking, otherwise start
    if (isTTSPlaying.value) {
      pauseTTS()
    } else if (currentAyahIndex.value >= 0) {
      resumeTTS()
    } else {
      startTTS()
    }
  } else {
    // Audio: pause/resume if already playing, otherwise start
    if (isPlayingAudio.value && audioEl.value && !audioEl.value.paused) {
      pauseAudio()
    } else if (
      audioEl.value &&
      audioEl.value.paused &&
      currentAyahIndex.value >= 0
    ) {
      resumeAudio()
    } else {
      startSuraAudio()
    }
  }
}

function stopReading(event?: MouseEvent | Event) {
  event?.preventDefault()
  event?.stopPropagation()

  if (readerMode.value === 'tts') {
    stopTTS()
  } else {
    stopAudio()
  }
}

const isReading = computed(() =>
  readerMode.value === 'tts' ? isTTSPlaying.value : isPlayingAudio.value
)

const isPaused = computed(() => {
  if (readerMode.value === 'tts') {
    return !isTTSPlaying.value && currentAyahIndex.value >= 0
  } else {
    return audioEl.value?.paused && currentAyahIndex.value >= 0
  }
})

const showRecitationStickyHeader = computed(
  () =>
    isReading.value ||
    isPaused.value ||
    (currentAyahIndex.value >= 0 && highlightMode.value === 'word')
)

const toolsVisible = ref(false)
function toggleTools() { toolsVisible.value = !toolsVisible.value }

const isHoverAudioPaused = computed(
  () => Boolean(audioEl.value?.paused) && currentAyahIndex.value >= 0
)

const canPauseHoverAudio = computed(() => {
  const audio = audioEl.value
  return audio ? !audio.paused : false
})

const canRestartHoveredVerse = computed(() =>
  canStartHoveredVerse(getHoverWidgetVerseNumber())
)

const canUseHoverPrimaryAction = computed(() => {
  if (isStartingRecitation.value) {
    return false
  }

  if (isHoverAudioPaused.value) {
    return true
  }

  return canRestartHoveredVerse.value
})

const hoverPrimaryActionIcon = computed(() =>
  isPlayingAudio.value ? 'pause' : 'play_arrow'
)

const hoverPrimaryActionTitle = computed(() => {
  if (isPlayingAudio.value) {
    return t('pages.quran.pause')
  }

  if (isHoverAudioPaused.value) {
    return t('pages.quran.resume')
  }

  return t('pages.quran.play')
})

const isRecitationSessionLocked = computed(() => {
  if (isStartingRecitation.value) {
    return true
  }

  if (readerMode.value === 'tts') {
    return isTTSPlaying.value || currentAyahIndex.value >= 0
  }

  return audioEl.value !== null
})

function isRecitationTriggerDisabled(isCurrentTarget = false) {
  return isRecitationSessionLocked.value && !isCurrentTarget
}

// Current playback status for display
const playbackStatus = computed(() => {
  if (isReading.value) {
    return {
      state: 'playing',
      verse: currentAyahIndex.value + 1,
      sura: currentSuraId.value,
      mode: readerMode.value,
      icon: 'play_arrow',
      color: 'positive',
    }
  } else if (isPaused.value) {
    return {
      state: 'paused',
      verse: currentAyahIndex.value + 1,
      sura: currentSuraId.value,
      mode: readerMode.value,
      icon: 'pause',
      color: 'warning',
    }
  } else {
    return {
      state: 'stopped',
      verse: -1,
      sura: currentSuraId.value,
      mode: readerMode.value,
      icon: 'stop',
      color: 'grey',
    }
  }
})

const recitationStatusTitle = computed(() => {
  if (isStartingRecitation.value) {
    return t('pages.quran.startingRecitation') || 'Starting recitation'
  }
  if (playbackStatus.value.state === 'playing') {
    return t('pages.quran.playing') || 'Recitation playing'
  }
  if (playbackStatus.value.state === 'paused') {
    return t('pages.quran.paused') || 'Recitation paused'
  }
  return t('pages.quran.playRecitation') || 'Recitation ready'
})

const recitationVerseDisplay = computed(() => {
  return playbackStatus.value.verse > 0 ? playbackStatus.value.verse : 1
})

const isRecitationSwitchOn = computed(
  () => playbackStatus.value.state !== 'stopped' || isStartingRecitation.value
)

const recitationSwitchLabel = computed(() => {
  if (isStartingRecitation.value) {
    return t('pages.quran.startingRecitation') || 'Starting recitation'
  }

  return isRecitationSwitchOn.value
    ? t('pages.quran.stopRecitation')
    : t('pages.quran.playRecitation')
})

function handleRecitationSwitchChange(enabled: boolean) {
  if (isStartingRecitation.value) {
    return
  }

  if (enabled) {
    if (playbackStatus.value.state === 'stopped') {
      startReading()
    }
    return
  }

  if (playbackStatus.value.state !== 'stopped') {
    stopReading()
  }
}

function pauseAudio() {
  if (audioEl.value && !audioEl.value.paused) {
    audioEl.value.pause()
    isPlayingAudio.value = false
    // Save position for later resumption
    savePlaybackPosition(true)
    notify({
      type: 'info',
      message: t('pages.quran.paused') || 'Paused',
      tag: 'playback',
      icon: 'pause',
      group: 'audio-pause',
    })
  }
}

function resumeAudio() {
  if (audioEl.value && audioEl.value.paused) {
    audioEl.value.play()
    isPlayingAudio.value = true
    notify({
      type: 'positive',
      message: t('pages.quran.resumed') || 'Resumed',
      tag: 'playback',
      icon: 'play_arrow',
      group: 'audio-resume',
    })
  }
}

function pauseTTS() {
  if (
    typeof window !== 'undefined' &&
    window.speechSynthesis &&
    window.speechSynthesis.speaking
  ) {
    window.speechSynthesis.pause()
    isTTSPlaying.value = false
    // Save position for TTS as well
    savePlaybackPosition(true)
    notify({
      type: 'info',
      message: t('pages.quran.paused') || 'Paused',
      tag: 'tts',
      icon: 'pause',
      group: 'tts-pause',
    })
  }
}

function resumeTTS() {
  if (
    typeof window !== 'undefined' &&
    window.speechSynthesis &&
    window.speechSynthesis.paused
  ) {
    window.speechSynthesis.resume()
    isTTSPlaying.value = true
    $q.notify({
      type: 'positive',
      message: t('pages.quran.resumed') || 'Resumed',
      icon: 'play_arrow',
      timeout: 1000,
    })
  } else if (currentAyahIndex.value >= 0) {
    // If not currently paused but we have a position, restart from that position
    startTTS()
  }
}

function updateCurrentWord(time: number) {
  const idx = currentAyahIndex.value
  if (idx < 0) return
  if (!hasTimingMatchedWords(idx + 1)) {
    if (currentWordIndex.value !== -1) {
      currentWordIndex.value = -1
    }
    return
  }

  const timings = wordTimings.value[idx] || []
  if (!timings.length) return
  const found = timings.findIndex((seg) => time >= seg.start && time <= seg.end)
  if (found !== currentWordIndex.value && found >= 0) {
    currentWordIndex.value = found
    // Scroll to the current word
    scrollToCurrentWord(idx, found)
  } else if (found < 0 && currentWordIndex.value >= 0) {
    currentWordIndex.value = found
  }
}

function scrollToCurrentWord(ayahIndex: number, wordIndex: number) {
  if (typeof window === 'undefined') return

  // Try to find the word element based on current layout mode
  const verseNum = ayahIndex + 1
  let wordId: string

  if (layoutMode.value === 'mushaf') {
    wordId = `word-mushaf-${verseNum}-${wordIndex}`
  } else if (layoutMode.value === 'native') {
    wordId = `word-native-${verseNum}-${wordIndex}`
  } else {
    wordId = `word-${verseNum}-${wordIndex}` // reader mode
  }

  const el = document.getElementById(wordId)
  if (!el) return

  const offset = getRecitationScrollOffset()
  const rect = el.getBoundingClientRect()
  const viewportBandTop = offset
  const viewportBandBottom = window.innerHeight - Math.min(window.innerHeight * 0.2, 120)
  const isWithinViewport =
    rect.top >= viewportBandTop && rect.bottom <= viewportBandBottom

  if (isWithinViewport) {
    return
  }

  const targetTop =
    window.scrollY + rect.top - offset - (window.innerHeight - offset) * 0.32

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: 'smooth',
  })
}

function getHoverWidgetStyle() {
  if (shouldDockAyahActionCard()) {
    return {
      top: 'auto',
      left: '50%',
      right: 'auto',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
      transform: 'translateX(-50%)',
    }
  }

  const WIDGET_WIDTH = 260
  const WIDGET_HEIGHT = 50
  const PADDING = 12
  const OFFSET = 12 // Distance from cursor

  let top = hoverWidgetPosition.value.top + OFFSET
  let left = hoverWidgetPosition.value.left + OFFSET

  // Adjust for viewport boundaries
  if (typeof window !== 'undefined') {
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Keep widget within viewport - move above cursor if too close to bottom
    if (top + WIDGET_HEIGHT > viewportHeight - PADDING) {
      top = hoverWidgetPosition.value.top - WIDGET_HEIGHT - OFFSET
    }

    // Move left if too close to right edge
    if (left + WIDGET_WIDTH > viewportWidth - PADDING) {
      left = hoverWidgetPosition.value.left - WIDGET_WIDTH - OFFSET
    }

    // Ensure minimum distances from viewport edges
    top = Math.max(
      PADDING,
      Math.min(top, viewportHeight - WIDGET_HEIGHT - PADDING)
    )
    left = Math.max(
      PADDING,
      Math.min(left, viewportWidth - WIDGET_WIDTH - PADDING)
    )
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: 'translate(0, 0)',
  }
}

// Offline quality handlers
async function handleOfflineQualityChanged(quality: RecitationQuality) {
  setSelectedQualityPreference(quality)
  await loadCachedSurasList()
  await refreshOfflineRecitationStatus(currentSuraId.value)

  // Reload audio if currently playing to use new quality
  if (isPlayingAudio.value || isReading.value) {
    stopReading()
    notify({
      type: 'info',
      message:
        t('offline.qualityChanged') ||
        'Quality changed. Reload to use offline audio.',
      icon: 'info',
      timeout: 3000,
    })
  }
  // Reload audio list to check new quality cache
  await loadAudioAndTimings(currentSuraId.value)
}

async function handleSuraDownloaded(suraId: number) {
  await loadCachedSurasList()
  await refreshOfflineRecitationStatus(currentSuraId.value)

  // Reload audio to use cached version if it's the current sura
  if (suraId === currentSuraId.value) {
    await loadAudioAndTimings(suraId)
  }
}

async function handleOfflineStateChanged() {
  await loadCachedSurasList()
  await refreshOfflineRecitationStatus(currentSuraId.value)

  if (
    offlineRecitationStatus.value?.currentSuraAvailable &&
    !isReading.value &&
    currentAyahIndex.value < 0
  ) {
    await loadAudioAndTimings(currentSuraId.value)
  }
}

function handleOfflineDownloadStatus(status: {
  scope: 'current' | 'all'
  status: 'started' | 'completed' | 'failed'
  percent: number
}) {
  offlineDownloadStatus.value = {
    ...offlineDownloadStatus.value,
    ...status,
  }

  if (status.status === 'completed') {
    notify({
      type: 'positive',
      message: t('offline.downloadComplete'),
      icon: 'check_circle',
      announce: true,
    })
  }
}

const handleRecitationBeforeUnload = () => {
  persistRecitationBeforeLeave()
}

const handlePageHidden = () => {
  if (typeof document === 'undefined') return
  if (document.visibilityState !== 'hidden') return
  if (currentAyahIndex.value >= 0) {
    savePlaybackPosition(true)
  }
  if (isPlayingAudio.value) {
    pauseAudio()
  } else if (isTTSPlaying.value) {
    pauseTTS()
  }
}

onBeforeRouteLeave(() => {
  persistRecitationBeforeLeave()
})

// Keep-alive hooks (AppShell wraps QuranDetail) — onUnmounted does NOT run when cached
onDeactivated(() => {
  if (currentAyahIndex.value >= 0) {
    savePlaybackPosition(true)
  }
})

onActivated(async () => {
  await loadProfileSettings(true)
  if (currentWordIndex.value >= 0 && currentAyahIndex.value >= 0) {
    scrollToCurrentWord(currentAyahIndex.value, currentWordIndex.value)
  }
})

onMounted(async () => {
  await authStore.hydrateSession()
  await loadProfileSettings()
  syncShowTranslationPreference()
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleRecitationBeforeUnload)
    window.addEventListener('pagehide', handleRecitationBeforeUnload)
    document.addEventListener('visibilitychange', handlePageHidden)
    window.addEventListener(
      'quran-translation-visibility-changed',
      syncShowTranslationPreference
    )
    window.addEventListener('quran-translator-changed', onTranslatorChanged)
  }

  // Load list of cached suras for offline detection
  await loadCachedSurasList()

  // Process URL Query Parameters state override (theme, layout, highlight mode, verse, autoplay)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const queryTheme = (route.query.theme || searchParams?.get('theme') || route.query.mode || searchParams?.get('mode') || '').toString().toLowerCase()
  if (['light', 'dark'].includes(queryTheme)) {
    Dark.set(queryTheme === 'dark')
  }

  const queryLayout = (route.query.layout || searchParams?.get('layout') || '').toString().toLowerCase()
  if (['reader', 'mushaf', 'native'].includes(queryLayout)) {
    layoutMode.value = queryLayout as any
  }

  const queryHighlight = (route.query.highlight || searchParams?.get('highlight') || '').toString().toLowerCase()
  if (['word', 'ayah'].includes(queryHighlight)) {
    void setHighlightMode(queryHighlight as any)
  }

  // Initialize layout mode from route param if present
  const paramMode = route.params.mode as
    | 'reader'
    | 'mushaf'
    | 'native'
    | undefined
  if (paramMode && ['reader', 'mushaf', 'native'].includes(paramMode)) {
    layoutMode.value = paramMode
  } else if (!route.params.mode) {
    // Add current mode to URL if not present, preserving query parameters
    router.replace({
      name: 'QuranDetail',
      params: { ...route.params, mode: layoutMode.value },
      query: route.query,
    })
  }

  await loadSuraById(Number(route.params.id || 1))
  try {
    await bookmarksStore.init()
  } catch {}

  const queryVerse = Number(route.query.verse || route.query.ayah || 0)
  if (queryVerse > 0) {
    setTimeout(() => {
      scrollToVerse(queryVerse)
    }, 400)
  }

  const queryAutoplay =
    route.query.play === '1' ||
    route.query.play === 'true' ||
    route.query.autoplay === 'true' ||
    route.query.autoplay === '1'

  if (queryAutoplay) {
    setTimeout(() => {
      const startIndex = queryVerse > 0 ? queryVerse - 1 : 0
      void startAudioRecitation(startIndex, { withIntro: false })
    }, 600)
  }

  // Load TTS voices
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices()
    // Chrome loads voices async
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  // Check for saved playback position and offer to resume, or auto-start recitation permanently
  await nextTick()
  if (audioList.value.length > 0) {
    const restored = await restorePlaybackPosition()
    if (!restored && !isPlayingAudio.value) {
      setTimeout(() => {
        const startIndex = queryVerse > 0 ? queryVerse - 1 : 0
        void startAudioRecitation(startIndex, { withIntro: false })
      }, 400)
    }
  }

  // Show feature announcement for auto-continue (only once)
  const FEATURE_ANNOUNCEMENT_KEY = 'quran-feature-auto-continue-announced'
  const hasSeenAnnouncement = localStorage.getItem(FEATURE_ANNOUNCEMENT_KEY)
  if (!hasSeenAnnouncement) {
    setTimeout(() => {
      notify({
        type: 'info',
        message: t('pages.quran.autoContinueAnnouncement'),
        icon: 'auto_awesome',
        announce: true,
        actions: [
          {
            label: t('general.close'),
            color: 'white',
            handler: () => {
              localStorage.setItem(FEATURE_ANNOUNCEMENT_KEY, 'true')
              dismissAnnouncement()
            },
          },
        ],
      })
    }, 2000) // Show after 2 seconds to avoid overwhelming user
  }
onBeforeRouteLeave(() => {
  persistRecitationBeforeLeave()
})

onDeactivated(() => {
  persistRecitationBeforeLeave()
})

onActivated(async () => {
  await nextTick()
  if (audioList.value.length > 0) {
    await restorePlaybackPosition()
  }
})

onUnmounted(() => {
  persistRecitationBeforeLeave()
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', handleRecitationBeforeUnload)
    window.removeEventListener('pagehide', handleRecitationBeforeUnload)
    document.removeEventListener('visibilitychange', handlePageHidden)
    window.removeEventListener(
      'quran-translation-visibility-changed',
      syncShowTranslationPreference
    )
    window.removeEventListener('quran-translator-changed', onTranslatorChanged)
  }
})

function onTranslatorChanged() {
  if (!sura.value) return
  // Reload only translations (not audio) when the preference changes.
  loadTranslationsFromBundled(currentSuraId.value).then(() => {
    loadAudioAndTimings(currentSuraId.value)
  })
}

watch(
  () => route.params.id,
  (newId) => {
    if (!newId) return
    loadSuraById(Number(newId))
  }
)

watch(
  () => route.hash,
  (hash) => {
    if (!hash) return
    scrollToHash(hash)
  }
)

watch(locale, async () => {
  if (!sura.value) return
  if (isPlayingAudio.value) {
    // Locale changed during active recitation — reload translations without
    // stopping audio, then fetch quran.com translations for the new locale.
    await q2p.init(currentSuraId.value, locale.value || 'en')
    sura.value = q2p.GetSura?.value || null
    applyQuranDetailTitle(false)
    await loadTranslationsFromBundled(currentSuraId.value)
    loadAudioAndTimings(currentSuraId.value)
    return
  }
  loadSuraById(currentSuraId.value)
  applyQuranDetailTitle(false)
})

// Watch layoutModeStore for changes (deep watch for nested ref)
watch(
  layoutModeStore.value,
  (newMode) => {
    if (route.params.mode !== newMode) {
      router.replace({
        name: 'QuranDetail',
        params: { ...route.params, mode: newMode },
      })
    }
  },
  { deep: true }
)

// Watch for URL param changes (browser back/forward)
watch(
  () => route.params.mode,
  (newMode) => {
    if (newMode && ['reader', 'mushaf', 'native'].includes(newMode as string)) {
      const mode = newMode as 'reader' | 'mushaf' | 'native'
      if (layoutMode.value !== mode) {
        layoutMode.value = mode
      }
    }
  }
)
</script>

<template>
  <div class="quran-detail-page">
    <q-btn
      flat
      class="q-mb-md"
      to="/quran"
      :label="`← ${t('pages.quran.backToList')}`"
    />

    <!-- Announcement Banner -->
    <Transition name="slide-down">
      <q-banner
        v-if="showAnnouncementBanner && currentAnnouncement"
        class="announcement-banner q-mb-md"
        rounded
        dense
      >
        <template v-slot:avatar>
          <q-icon
            :name="currentAnnouncement.icon"
            color="primary"
            size="32px"
            class="pulse-icon"
          />
        </template>
        <div class="announcement-content">
          <div class="text-weight-bold text-h6">
            {{ currentAnnouncement.message }}
          </div>
        </div>
        <template v-slot:action>
          <q-btn
            v-for="(action, idx) in currentAnnouncement.actions"
            :key="idx"
            flat
            :label="action.label"
            :color="action.color || 'primary'"
            @click.prevent="handleAnnouncementAction(action)"
          />
          <q-btn
            flat
            icon="close"
            @click.prevent="dismissAnnouncement"
            :aria-label="t('pages.quran.dismissAnnouncement')"
          />
        </template>
      </q-banner>
    </Transition>

    <!-- Recitation Indicator (always visible while sura is loaded) -->
    <Transition name="slide-down">
      <q-banner
        v-if="!loading && !error && sura"
        class="paused-indicator-banner"
        rounded
        dense
      >
        <template v-slot:avatar>
          <q-icon
            :name="playbackStatus.icon"
            :color="playbackStatus.color"
            size="28px"
            class="pulse-icon"
          />
        </template>
        <div class="paused-info">
          <div class="text-weight-bold">{{ recitationStatusTitle }}</div>
          <div class="text-caption">
            {{ t('pages.quran.sura.id') }} {{ currentSuraId }} •
            {{ t('pages.quran.verses') }}
            {{ recitationVerseDisplay }} / {{ sura?.total_verses || 0 }} •
            {{
              playbackStatus.mode === 'audio'
                ? t('pages.quran.readerMode.audio')
                : t('pages.quran.readerMode.tts')
            }}
          </div>
        </div>
        <template v-slot:action>
          <div class="recitation-switch-wrap">
            <span class="recitation-switch-label">{{
              recitationSwitchLabel
            }}</span>
            <q-toggle
              :model-value="isRecitationSwitchOn"
              checked-icon="volume_up"
              unchecked-icon="play_arrow"
              color="primary"
              keep-color
              :disable="
                (readerMode === 'audio' && !audioList.length) ||
                isStartingRecitation
              "
              @update:model-value="handleRecitationSwitchChange"
            />
          </div>
        </template>
      </q-banner>
    </Transition>

    <div v-if="loading" class="status">{{ t('pages.quran.loading') }}</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="sura">
      <!-- YouTube HD Video Player Banner -->
      <Transition name="slide-down">
        <div
          v-if="showYoutubePlayer || route.query.video === 'true' || route.query.youtube === 'true'"
          class="youtube-banner-wrapper q-mb-md"
        >
          <div class="video-bar-header row items-center justify-between q-px-md q-py-xs bg-grey-10 text-white">
            <div class="row items-center gap-sm">
              <q-icon name="smart_display" color="red" size="24px" />
              <span class="text-weight-bold">YouTube Official HD Video Recitation · Surah {{ currentSuraId }}</span>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showYoutubePlayer = false" />
          </div>
          <div class="video-ratio-box">
            <iframe
              :src="`https://www.youtube.com/embed/videoseries?list=PLEJ9VLBcEoKg&index=${currentSuraId - 1}&autoplay=1`"
              title="YouTube Quran Recitation"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </Transition>

      <div
        class="sura-heading"
        :class="{
          'is-reciting': showRecitationStickyHeader,
          'is-mushaf-mode': layoutMode === 'mushaf' && !toolsVisible,
          'is-mushaf-mode--open': layoutMode === 'mushaf' && toolsVisible,
        }"
      >
        <div>
          <div
            class="text-h5 sura-title-swipeable"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            {{ sura?.e_name }} — {{ sura?.name }}
          </div>
          <div class="text-caption q-mt-xs">
            {{ t('pages.quran.sura.id') }}: {{ sura?.id }} • {{ sura?.type }} •
            {{ sura?.total_verses }}
            {{ t('pages.quran.verses') }}
          </div>
        </div>
        <div class="heading-actions">
          <!-- Reader Mode Toggle -->
          <q-btn-toggle
            v-model="readerMode"
            :options="readerModeOptions"
            rounded
            dense
            toggle-color="secondary"
            :color="$q.dark.isActive ? 'grey-10' : 'white'"
            :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
            unelevated
            size="sm"
            class="q-mr-sm reader-mode-toggle"
            @update:model-value="stopReading"
          >
            <template v-slot:audio>
              <div class="row items-center q-gutter-xs">
                <q-icon name="volume_up" size="16px" />
                <span>{{ t('pages.quran.readerMode.audio') || 'Audio' }}</span>
              </div>
            </template>
            <template v-slot:tts>
              <div class="row items-center q-gutter-xs">
                <q-icon name="record_voice_over" size="16px" />
                <span>{{ t('pages.quran.readerMode.tts') || 'TTS' }}</span>
              </div>
            </template>
          </q-btn-toggle>
          <div class="recitation-header-controls">
            <q-btn
              v-if="isReading || isPaused"
              :icon="isReading ? 'pause' : 'play_arrow'"
              color="primary"
              flat
              dense
              @click.prevent="startReading"
              :disable="isStartingRecitation"
              :label="
                isReading ? t('pages.quran.pause') : t('pages.quran.resume')
              "
            />

            <div class="recitation-switch-wrap recitation-switch-wrap--header">
              <span class="recitation-switch-label">{{
                recitationSwitchLabel
              }}</span>
              <q-toggle
                :model-value="isRecitationSwitchOn"
                checked-icon="volume_up"
                unchecked-icon="play_arrow"
                color="primary"
                keep-color
                :disable="
                  (readerMode === 'audio' && !audioList.length) ||
                  isStartingRecitation
                "
                @update:model-value="handleRecitationSwitchChange"
              />
            </div>
          </div>

          <!-- Auto-continue toggle -->
          <q-toggle
            v-model="autoContinueEnabled"
            :label="t('pages.quran.autoContinue')"
            color="secondary"
            dense
            class="q-ml-sm"
          />

          <!-- Audio playback rate (audio mode) -->
          <q-select
            v-if="readerMode === 'audio'"
            dense
            outlined
            :dark="$q.dark.isActive"
            hide-dropdown-icon
            v-model="playbackRate"
            :options="[
              { label: '0.75x', value: 0.75 },
              { label: '1x', value: 1 },
              { label: '1.25x', value: 1.25 },
              { label: '1.5x', value: 1.5 },
            ]"
            emit-value
            map-options
            style="width: 90px"
            @update:model-value="
              (v) => {
                if (audioEl) audioEl.playbackRate = v
              }
            "
          />
          <!-- TTS rate (TTS mode) -->
          <q-select
            v-if="readerMode === 'tts'"
            dense
            outlined
            :dark="$q.dark.isActive"
            hide-dropdown-icon
            v-model="ttsRate"
            :options="[
              { label: '0.5x', value: 0.5 },
              { label: '0.8x', value: 0.8 },
              { label: '1x', value: 1 },
              { label: '1.2x', value: 1.2 },
            ]"
            emit-value
            map-options
            style="width: 90px"
            :label="t('pages.quran.ttsSpeed')"
          />
          <!-- TTS Voice selector -->
          <q-select
            v-if="readerMode === 'tts' && availableVoices.length > 1"
            dense
            outlined
            :dark="$q.dark.isActive"
            v-model="ttsVoice"
            :options="availableVoices"
            :option-label="(v) => v?.name || 'Default'"
            style="width: 150px"
            :label="t('pages.quran.ttsVoice')"
          />
          <div class="view-toggle">
            <q-btn-toggle
              v-model="layoutMode"
              :options="viewModeOptions"
              rounded
              glossy
              toggle-color="primary"
              :color="$q.dark.isActive ? 'grey-10' : 'white'"
              :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
              unelevated
              size="sm"
              class="mode-toggle-buttons"
            >
              <template v-slot:mushaf>
                <div class="row items-center q-gutter-xs">
                  <q-icon name="auto_stories" size="16px" />
                  <span>{{ t('pages.quran.modes.mushaf') }}</span>
                  <q-icon
                    name="star"
                    size="14px"
                    color="amber"
                    class="recommended-icon"
                  />
                </div>
              </template>
            </q-btn-toggle>
          </div>
          <!-- Quick Access for popular verses like Ayat al-Kursi -->
          <q-btn
            outline
            icon="flash_on"
            class="quick-access-btn q-mr-sm"
            :label="t('pages.quran.quickAccess.menu')"
          >
            <q-menu auto-close anchor="bottom right" self="top right">
              <q-list class="quick-access-list">
                <q-item-label header>{{
                  t('pages.quran.quickAccess.title')
                }}</q-item-label>
                <q-item
                  v-for="qa in quickAccessVerses"
                  :key="qa.id"
                  clickable
                  :disable="
                    isRecitationTriggerDisabled(isQuickAccessPlaying(qa))
                  "
                  @click.prevent="navigateToQuickAccess(qa)"
                >
                  <q-item-section avatar>
                    <q-icon :name="qa.icon" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t(qa.nameKey) }}</q-item-label>
                    <q-item-label caption
                      >{{ qa.suraId }}:{{ qa.verse }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-btn
                        round
                        dense
                        flat
                        size="sm"
                        :icon="isQuickAccessPlaying(qa) ? 'stop' : 'play_arrow'"
                        :color="
                          isQuickAccessPlaying(qa) ? 'negative' : 'primary'
                        "
                        :disable="
                          isRecitationTriggerDisabled(isQuickAccessPlaying(qa))
                        "
                        @click.stop.prevent="
                          isQuickAccessPlaying(qa)
                            ? stopReading()
                            : navigateToQuickAccess(qa)
                        "
                        class="animated-play-btn"
                      >
                        <q-tooltip v-if="isQuickAccessPlaying(qa)">
                          {{ t('pages.quran.stopRecitation') }} ({{
                            playbackStatus.mode
                          }})
                        </q-tooltip>
                        <q-tooltip v-else>
                          {{ t('pages.quran.playRecitation') }}
                        </q-tooltip>
                      </q-btn>
                      <q-icon
                        :name="
                          qa.suraId === currentSuraId &&
                          isQuickAccessPlaying(qa)
                            ? 'graphic_eq'
                            : qa.suraId === currentSuraId
                              ? 'check_circle'
                              : 'chevron_right'
                        "
                        :color="
                          isQuickAccessPlaying(qa)
                            ? 'positive'
                            : qa.suraId === currentSuraId
                              ? 'positive'
                              : 'grey'
                        "
                        :class="{ 'pulse-icon': isQuickAccessPlaying(qa) }"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            outline
            icon="bookmark"
            class="bookmark-menu-btn"
            :label="t('pages.quran.bookmarks.menu')"
          >
            <q-menu auto-close anchor="bottom right" self="top right">
              <div v-if="!hasBookmarks" class="bookmark-empty">
                {{ t('pages.quran.bookmarks.empty') }}
              </div>
              <q-list v-else class="bookmark-list">
                <q-item
                  v-for="entry in bookmarkEntries"
                  :key="entry.key"
                  clickable
                  :disable="
                    isRecitationTriggerDisabled(isBookmarkPlaying(entry))
                  "
                  @click.prevent="handleBookmarkNavigate(entry)"
                >
                  <q-item-section>
                    <div class="bookmark-label">
                      {{ entry.label }}
                      <span
                        v-if="entry.suraId === currentSuraId"
                        class="bookmark-chip"
                      >
                        {{ t('pages.quran.bookmarks.current') }}
                      </span>
                    </div>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-btn
                        round
                        dense
                        flat
                        size="sm"
                        :icon="isBookmarkPlaying(entry) ? 'stop' : 'play_arrow'"
                        :color="
                          isBookmarkPlaying(entry) ? 'negative' : 'primary'
                        "
                        :disable="
                          isRecitationTriggerDisabled(isBookmarkPlaying(entry))
                        "
                        @click.stop.prevent="
                          isBookmarkPlaying(entry)
                            ? stopReading()
                            : handleBookmarkNavigate(entry)
                        "
                        class="animated-play-btn"
                      >
                        <q-tooltip v-if="isBookmarkPlaying(entry)">
                          {{ t('pages.quran.stopRecitation') }} ({{
                            playbackStatus.mode
                          }})
                        </q-tooltip>
                        <q-tooltip v-else>
                          {{ t('pages.quran.playRecitation') }}
                        </q-tooltip>
                        <q-badge
                          v-if="isBookmarkPlaying(entry)"
                          color="positive"
                          floating
                          rounded
                        />
                      </q-btn>
                      <q-btn
                        round
                        dense
                        flat
                        size="sm"
                        icon="share"
                        color="teal"
                        @click.stop.prevent="shareBookmark(entry)"
                      >
                        <q-tooltip>{{ t('general.share') }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        dense
                        flat
                        size="sm"
                        icon="delete"
                        color="negative"
                        @click.stop.prevent="removeBookmark(entry)"
                      >
                        <q-tooltip>{{ t('general.delete') }}</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-chip
            v-if="offlineRecitationStatus"
            data-testid="offline-recitation-status"
            :data-offline-ready="isOfflineRecitationReady ? 'true' : 'false'"
            dense
            :icon="offlineRecitationChipIcon"
            :color="offlineRecitationChipColor"
            :text-color="isOfflineRecitationReady ? 'white' : 'dark'"
            class="offline-recitation-chip"
          >
            {{ offlineRecitationChipLabel }}
            <q-tooltip>{{ offlineRecitationChipHint }}</q-tooltip>
          </q-chip>

          <!-- Offline Recitation Manager Button -->
          <q-btn
            outline
            data-testid="offline-recitation-manager-button"
            :data-download-status="offlineDownloadStatus.status"
            :data-download-percent="String(offlineDownloadStatus.percent)"
            :icon="offlineManagerButtonIcon"
            class="q-ml-sm"
            :class="{
              'offline-download-working':
                offlineDownloadStatus.status === 'started',
            }"
            :loading="offlineDownloadStatus.status === 'started'"
            :color="offlineManagerButtonColor"
            :label="offlineManagerButtonLabel"
            @click="showOfflineManager = true"
          >
            <q-tooltip>{{ t('offline.subtitle') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div v-if="layoutMode === 'reader'" class="reader-layout q-mt-lg">
        <div class="arabic-block">
          <div
            v-for="a in sura?.ayat || []"
            :key="a.verse"
            :id="getVerseElementId(a.verse)"
            :data-testid="getAyahHoverTargetTestId('reader', a.verse)"
            class="verse-row q-mb-md"
            :class="{
              'is-selected': isVerseSelected(a.verse),
              'is-current-ayah': isActiveAyah(a.verse),
            }"
            @click="handleVerseTap($event, a.verse)"
            @dblclick="handleVerseDoubleClick($event, a.verse)"
            @mouseenter="onVerseMouseEnter($event, a.verse)"
            @mouseleave="onVerseMouseLeave"
          >
            <div class="verse-main-row">
              <div class="verse-inline-actions">
                <span class="verse-num" @click="scrollToVerse(a.verse)">{{
                  a.verse
                }}</span>
                <button
                  type="button"
                  class="bookmark-trigger inline-trigger"
                  :class="{ 'is-active': isVerseBookmarked(a.verse) }"
                  @click.stop="bookmarkVerse(a.verse)"
                  :aria-label="bookmarkActionLabel(a.verse)"
                >
                  <q-icon
                    :name="isVerseBookmarked(a.verse) ? 'star' : 'star_outline'"
                    size="18px"
                  />
                </button>
                <button
                  type="button"
                  class="share-trigger inline-trigger"
                  @click.stop="
                    shareVerseLink(
                      currentSuraId,
                      a.verse,
                      `${currentSuraId}:${a.verse}`
                    )
                  "
                  :aria-label="shareVerseActionLabel(a.verse)"
                  :title="shareActionLabel(`${currentSuraId}:${a.verse}`)"
                >
                  <q-icon name="share" size="18px" />
                </button>
              </div>
              <div class="arabic-text">
                <template v-if="hasTimingMatchedWords(a.verse)">
                  <template
                    v-for="(word, wIdx) in getSyncedVerseWords(a.verse)"
                    :key="`${a.verse}-${wIdx}`"
                  >
                    <span
                      :id="`word-${a.verse}-${wIdx}`"
                      :class="{
                        'is-current-word': isActiveWord(a.verse, wIdx),
                      }"
                      >{{ word }}</span
                    >{{ ' ' }}
                  </template>
                </template>
                <template v-else>
                  {{ a.text }}
                </template>
              </div>
            </div>
            <div class="verse-meta">
              <div
                class="verse-translation"
                v-if="showTranslation && a.translation"
              >
                {{ a.translation }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="layoutMode === 'mushaf'" class="mushaf-layout">
        <!-- Floating tools toggle button -->
        <button class="tools-toggle-btn" @click="toggleTools" :title="toolsVisible ? 'Hide tools' : 'Show tools'">
          <span class="tools-toggle-icon">⚙</span>
          <span class="tools-toggle-chevron" :class="{ 'is-open': toolsVisible }">›</span>
        </button>
        <div class="mushaf-page">
          <div class="page-border">
            <div class="mushaf-header">
              <div class="mushaf-title">{{ sura?.name }}</div>
              <div class="mushaf-meta">
                {{ sura?.type }} • {{ sura?.total_verses }}
                {{ t('pages.quran.verses') }}
              </div>
            </div>
            <div class="mushaf-body">
              <div class="mushaf-flow-text">
                <span
                  v-for="a in sura?.ayat || []"
                  :key="`m-${a.verse}`"
                  :id="getVerseElementId(a.verse)"
                  :data-testid="getAyahHoverTargetTestId('mushaf', a.verse)"
                  class="mushaf-ayah-inline"
                  :class="{
                    'is-selected': isVerseSelected(a.verse),
                    'is-current-ayah': isActiveAyah(a.verse),
                  }"
                  @click="handleVerseTap($event, a.verse)"
                  @dblclick="handleVerseDoubleClick($event, a.verse)"
                  @mouseenter="onVerseMouseEnter($event, a.verse)"
                  @mouseleave="onVerseMouseLeave"
                >
                  <template v-if="hasTimingMatchedWords(a.verse)">
                    <template
                      v-for="(word, wIdx) in getSyncedVerseWords(a.verse)"
                      :key="`m-${a.verse}-${wIdx}`"
                    >
                      <span
                        :id="`word-mushaf-${a.verse}-${wIdx}`"
                        :class="{
                          'is-current-word': isActiveWord(a.verse, wIdx),
                        }"
                        >{{ word }}</span
                      >{{ ' ' }}
                    </template>
                  </template>
                  <template v-else>
                    {{ a.text }}
                  </template>
                  <span
                    class="ayah-inline-number"
                    @click="scrollToVerse(a.verse)"
                    >{{ a.verse }}</span
                  >
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="layoutMode === 'native'"
        class="native-layout q-mt-lg"
        :class="{ 'is-ios-native': isIOSRuntime }"
      >
        <article class="native-content">
          <p
            v-for="a in sura?.ayat || []"
            :key="`n-${a.verse}`"
            :id="getVerseElementId(a.verse)"
            :data-testid="getAyahHoverTargetTestId('native', a.verse)"
            class="verse-paragraph"
            :class="{
              'is-selected': isVerseSelected(a.verse),
              'is-current-ayah': isActiveAyah(a.verse),
            }"
            @click="handleVerseTap($event, a.verse)"
            @dblclick="handleVerseDoubleClick($event, a.verse)"
            @mouseenter="onVerseMouseEnter($event, a.verse)"
            @mouseleave="onVerseMouseLeave"
          >
            <span class="verse-marker" @click="scrollToVerse(a.verse)">{{
              a.verse
            }}</span>
            <span class="native-inline-actions">
              <button
                type="button"
                class="bookmark-trigger native-trigger"
                :class="{ 'is-active': isVerseBookmarked(a.verse) }"
                @click.stop="bookmarkVerse(a.verse)"
                :aria-label="bookmarkActionLabel(a.verse)"
              >
                <q-icon
                  :name="isVerseBookmarked(a.verse) ? 'star' : 'star_outline'"
                  size="18px"
                />
              </button>
              <button
                type="button"
                class="share-trigger native-trigger"
                @click.stop="
                  shareVerseLink(
                    currentSuraId,
                    a.verse,
                    `${currentSuraId}:${a.verse}`
                  )
                "
                :aria-label="shareVerseActionLabel(a.verse)"
                :title="shareActionLabel(`${currentSuraId}:${a.verse}`)"
              >
                <q-icon name="share" size="18px" />
              </button>
            </span>
            <span class="verse-text-arabic">
              <template v-if="hasTimingMatchedWords(a.verse)">
                <template
                  v-for="(word, wIdx) in getSyncedVerseWords(a.verse)"
                  :key="`n-${a.verse}-${wIdx}`"
                >
                  <span
                    :id="`word-native-${a.verse}-${wIdx}`"
                    :class="{
                      'is-current-word': isActiveWord(a.verse, wIdx),
                    }"
                    >{{ word }}</span
                  >{{ ' ' }}
                </template>
              </template>
              <template v-else>
                {{ a.text }}
              </template>
            </span>
            <span
              v-if="showTranslation && a.translation"
              class="verse-translation-native"
              >{{ a.translation }}</span
            >
          </p>
        </article>
      </div>

      <!--
        Ayah action hover/tap widget.
        Keep this feature available for verse-level actions; if interaction
        mechanics change, update docs/QURAN_AYAH_HOVER_MENU.md as well.
      -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="hoverWidgetVisible && hoverWidgetVerse !== null"
            class="audio-hover-widget"
            data-testid="ayah-action-card"
            data-feature="protected-ayah-action-card"
            data-recitation-source="audio"
            :data-verse="String(hoverWidgetVerse)"
            :data-layout-mode="layoutMode"
            :style="getHoverWidgetStyle()"
            @mouseleave="hideHoverWidget"
          >
            <q-card class="ayah-action-card" flat bordered>
              <q-card-actions
                align="around"
                class="ayah-action-buttons q-pa-sm"
              >
                <q-btn
                  round
                  dense
                  :icon="hoverPrimaryActionIcon"
                  color="primary"
                  @click="togglePauseResume"
                  :disable="!canUseHoverPrimaryAction"
                  :title="hoverPrimaryActionTitle"
                />
                <q-btn
                  v-if="canPauseHoverAudio && hoverPrimaryActionIcon !== 'pause'"
                  round
                  dense
                  icon="pause"
                  color="orange"
                  @click="pauseFromHover"
                  :disable="!canPauseHoverAudio"
                  :title="t('pages.quran.pause')"
                />
                <q-btn
                  round
                  dense
                  icon="replay"
                  color="secondary"
                  @click="restartFromVerse(hoverWidgetVerse!)"
                  :disable="!canRestartHoveredVerse"
                  :title="t('pages.quran.restart') || 'Restart verse'"
                />
                <q-btn
                  round
                  dense
                  :icon="
                    isVerseBookmarked(hoverWidgetVerse!)
                      ? 'star'
                      : 'star_outline'
                  "
                  color="accent"
                  @click="bookmarkVerse(hoverWidgetVerse!)"
                  :title="
                    t('pages.quran.bookmarks.add', { verse: hoverWidgetVerse })
                  "
                />
                <q-btn
                  round
                  dense
                  icon="share"
                  color="teal"
                  @click="shareHoverVerse"
                  :title="
                    shareActionLabel(`${currentSuraId}:${hoverWidgetVerse}`)
                  "
                />
                <q-btn
                  round
                  dense
                  icon="north"
                  color="indigo"
                  @click="scrollToTop"
                  :title="t('pages.quran.scrollToTop')"
                />
                <q-btn
                  round
                  dense
                  icon="home"
                  color="primary"
                  @click="goHome"
                  :title="t('general.Home')"
                />
                <q-btn
                  round
                  dense
                  icon="close"
                  color="grey-7"
                  @click="hideHoverWidget"
                  :title="t('general.close')"
                />
              </q-card-actions>
            </q-card>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Offline Recitation Manager Dialog -->
    <q-dialog v-model="showOfflineManager" maximized>
      <OfflineRecitationManager
        :current-sura-id="currentSuraId"
        :current-sura-total-verses="sura?.total_verses"
        @quality-changed="handleOfflineQualityChanged"
        @download-complete="handleSuraDownloaded"
        @download-status="handleOfflineDownloadStatus"
        @offline-state-changed="handleOfflineStateChanged"
        @close="showOfflineManager = false"
      />
    </q-dialog>
  </div>
</template>

<style scoped>
.status {
  margin: 1rem 0;
}
.status.error {
  color: #b00020;
}

.quran-detail-page {
  color: #111827;
}

.sura-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.sura-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.sura-heading.is-reciting {
  position: sticky;
  top: calc(env(safe-area-inset-top, 0px) + 56px);
  z-index: 25;
  margin: -16px -16px 12px;
  padding: 12px 16px 10px;
  border-radius: 0 0 16px 16px;
  background: rgba(253, 251, 246, 0.96);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* In mushaf mode: collapse the heading to zero height, expand on hover */
.sura-heading.is-mushaf-mode {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  transition:
    max-height 0.35s ease,
    opacity 0.25s ease,
    padding 0.25s ease;
}

.sura-heading.is-mushaf-mode:hover,
.sura-heading.is-mushaf-mode:focus-within {
  max-height: 200px;
  opacity: 1;
  pointer-events: auto;
  padding-top: 12px;
  padding-bottom: 12px;
}

/* Toggled open via button */
.sura-heading.is-mushaf-mode--open {
  max-height: 300px;
  opacity: 1;
  pointer-events: auto;
  overflow: hidden;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
  transition:
    max-height 0.35s ease,
    opacity 0.25s ease,
    padding 0.25s ease;
}

/* Floating toggle button */
.tools-toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 30;
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(116, 84, 40, 0.2);
  border-radius: 999px;
  padding: 4px 10px 4px 8px;
  font-size: 0.78rem;
  color: #7c6142;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(80, 57, 35, 0.1);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
  line-height: 1;
}

.tools-toggle-btn:hover {
  background: rgba(255, 243, 220, 0.98);
  box-shadow: 0 4px 14px rgba(80, 57, 35, 0.16);
  transform: translateY(-1px);
}

.tools-toggle-icon {
  font-size: 0.85rem;
  opacity: 0.8;
}

.tools-toggle-chevron {
  font-size: 1.1rem;
  display: inline-block;
  transform: rotate(90deg);
  transition: transform 0.3s ease;
  line-height: 1;
}

.tools-toggle-chevron.is-open {
  transform: rotate(-90deg);
}

.sura-title-swipeable {
  user-select: none;
  touch-action: pan-y;
  cursor: grab;
  position: relative;
  padding: 8px 0;
  transition: transform 0.2s ease;
}

.sura-title-swipeable:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.heading-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.recitation-header-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.view-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.mode-toggle-buttons :deep(.q-btn-group) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mode-toggle-buttons :deep(.q-btn:nth-child(1)) {
  background: linear-gradient(135deg, #757575, #616161) !important;
  color: white !important;
}

.mode-toggle-buttons :deep(.q-btn:nth-child(2)) {
  background: linear-gradient(135deg, #ffd54f, #ffb300) !important;
  color: #5d4037 !important;
}

.mode-toggle-buttons :deep(.q-btn:nth-child(3)) {
  background: linear-gradient(135deg, #66bb6a, #4caf50) !important;
  color: white !important;
}

.mode-toggle-buttons :deep(.q-btn.q-btn--active) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.bookmark-menu-btn {
  white-space: nowrap;
}

.offline-recitation-chip {
  white-space: nowrap;
}

.offline-download-working {
  animation: pulse-download 1s ease-in-out infinite;
}

@keyframes pulse-download {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

.bookmark-list {
  min-width: 240px;
  max-height: 320px;
  overflow-y: auto;
}

.bookmark-empty {
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #7c6142;
}

.bookmark-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bookmark-chip {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(122, 97, 66, 0.14);
  color: #6a481d;
  padding: 2px 6px;
  border-radius: 999px;
}

.recitation-switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.recitation-switch-wrap--header {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(35, 75, 42, 0.08);
}

.recitation-switch-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #234b2a;
}

.reader-layout .arabic-block {
  font-family: 'Noto Naskh Arabic', serif;
  font-size: clamp(1.25rem, 2.5vw, 2.5rem);
  line-height: 1.8;
  direction: rtl;
  text-align: justify;
  background: #ffffff;
  padding: clamp(16px, 3vw, 32px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.verse-row {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
}

.verse-row:hover {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 8px;
}

.verse-row:last-child {
  border-bottom: none;
}

.verse-row.is-selected {
  background: rgba(255, 193, 7, 0.08);
  border-radius: 16px;
  padding: 12px;
  border: 2px solid #ffc107;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
}

.verse-row.is-current-ayah {
  background: rgba(76, 175, 80, 0.08);
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(46, 125, 50, 0.22);
}

.arabic-text {
  font-feature-settings:
    'rlig' 1,
    'liga' 1;
  direction: rtl;
  text-align: justify;
  font-family: 'Noto Naskh Arabic', serif;
}

.verse-main-row {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: start;
  column-gap: 24px;
  direction: rtl;
}

.verse-main-row .arabic-text {
  min-width: 0;
  overflow: hidden;
}

.verse-inline-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  direction: rtl;
  min-width: 108px;
  margin-top: 2px;
}

.verse-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  direction: ltr;
}

.verse-meta-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.verse-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  background: #f5f5f5;
  color: #424242;
  border: 2px solid #e0e0e0;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.verse-num:hover {
  background: #ffc107;
  color: white;
  border-color: #ffb300;
  transform: scale(1.1);
}

.verse-translation {
  flex: 1;
  font-size: 0.95rem;
  color: #4b5563;
}

.verse-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bookmark-trigger {
  border: none;
  background: transparent;
  color: #9e9e9e;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.inline-trigger,
.native-trigger {
  width: 28px;
  height: 28px;
}

.bookmark-trigger:hover {
  background: rgba(255, 193, 7, 0.15);
  color: #ffa726;
  transform: scale(1.1);
}

.bookmark-trigger.is-active {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.2);
}

.bookmark-trigger.is-active:hover {
  color: #ffb300;
  transform: scale(1.15);
}

.share-trigger {
  border: none;
  background: transparent;
  color: #00796b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.share-trigger.inline-trigger,
.share-trigger.native-trigger,
.share-trigger.mushaf-trigger {
  width: 28px;
  height: 28px;
}

.share-trigger:hover {
  background: rgba(0, 150, 136, 0.15);
  color: #00897b;
  transform: scale(1.1);
}

.share-trigger:active {
  background: rgba(0, 150, 136, 0.3);
  transform: scale(1.05);
}

.verse-row.is-selected .arabic-text {
  color: #000000;
  font-weight: 500;
}

.mushaf-layout {
  position: relative;
  background: linear-gradient(135deg, #f7f2e7, #fefbf4);
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(116, 84, 40, 0.1);
  width: 100%;
}

.mushaf-page {
  background: #fffdfa;
  border-radius: 18px;
  padding: 18px;
  box-shadow: inset 0 0 0 2px rgba(115, 84, 40, 0.15);
  width: 100%;
}

.page-border {
  border: 1px solid rgba(115, 84, 40, 0.35);
  border-radius: 14px;
  padding: 18px;
  background-image: radial-gradient(
    circle at top,
    rgba(214, 185, 128, 0.22),
    transparent 50%
  );
  width: 100%;
}

.mushaf-header {
  text-align: center;
  margin-bottom: 18px;
}

.mushaf-title {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.mushaf-meta {
  font-size: 0.9rem;
  color: #7c6142;
}

.mushaf-body {
  column-count: 1;
  column-gap: 0;
  column-fill: auto;
  direction: rtl;
  font-family: 'Noto Naskh Arabic', serif;
  font-size: clamp(1.45rem, 2.8vw, 2rem);
  line-height: 2.35;
  width: 100%;
}

.mushaf-flow-text {
  display: block;
  text-align: justify;
  word-spacing: 0.05em;
  width: 100%;
}

.mushaf-ayah-inline {
  display: inline;
  direction: rtl;
  cursor: text;
  transition: background 0.2s ease;
}

.mushaf-ayah-inline.is-selected {
  background: rgba(212, 175, 55, 0.16);
  border-radius: 6px;
}

.mushaf-ayah-inline.is-current-ayah {
  background: rgba(76, 175, 80, 0.12);
  border-radius: 6px;
}

@media (hover: hover) and (pointer: fine) {
  .mushaf-ayah-inline {
    cursor: pointer;
  }

  .mushaf-ayah-inline:hover {
    background: rgba(212, 175, 55, 0.08);
    border-radius: 6px;
  }

  body.body--dark .mushaf-ayah-inline:hover {
    background: rgba(255, 193, 7, 0.1);
  }
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Recitation Highlight: Whole Ayah / Sentence (Light Mode) */
.verse-row.is-current-ayah,
.mushaf-ayah-inline.is-current-ayah,
.verse-paragraph.is-current-ayah {
  background: rgba(245, 158, 11, 0.12) !important;
  border-inline-start: 4px solid #f59e0b !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15) !important;
  border-radius: 12px;
  transition: all 0.25s ease-in-out;
}

/* Recitation Highlight: Word (Light Mode) */
.is-current-word {
  background: #f59e0b !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4) !important;
  transition: background 0.12s ease-in-out, color 0.12s ease-in-out;
  display: inline-block;
}

/* Recitation Highlight: Whole Ayah / Sentence (Dark Mode) */
body.body--dark .verse-row.is-current-ayah,
body.body--dark .mushaf-ayah-inline.is-current-ayah,
body.body--dark .verse-paragraph.is-current-ayah {
  background: rgba(251, 191, 36, 0.16) !important;
  border-inline-start: 4px solid #fbbf24 !important;
  box-shadow: 0 0 24px rgba(251, 191, 36, 0.2) !important;
  border-radius: 12px;
  transition: all 0.25s ease-in-out;
}

/* Recitation Highlight: Word (Dark Mode) */
body.body--dark .is-current-word {
  background: #fbbf24 !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: 6px !important;
  box-shadow: 0 0 14px rgba(251, 191, 36, 0.6) !important;
  transition: background 0.12s ease-in-out, color 0.12s ease-in-out;
  display: inline-block;
}

body.body--dark .sura-heading.is-reciting {
  background: rgba(18, 18, 18, 0.96);
  border-bottom-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.audio-hover-widget {
  position: fixed;
  z-index: 9999;
  backdrop-filter: blur(6px);
  pointer-events: auto;
  max-width: min(96vw, 420px);
}

.ayah-action-card {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.ayah-action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.ayah-action-buttons :deep(.q-btn) {
  min-width: 34px;
  min-height: 34px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ayah-inline-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.95em;
  height: 1.95em;
  margin-inline: 0.35em 0.2em;
  padding: 0 0.3em;
  vertical-align: middle;
  font-size: 0.56em;
  line-height: 1;
  color: #d4af37;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #d4af37;
  border-radius: 50%;
  cursor: text;
  font-weight: 700;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(212, 175, 55, 0.2);
}

.ayah-inline-number:hover {
  color: #d4af37;
  background: rgba(255, 255, 255, 0.98);
  border-color: #d4af37;
  transform: none;
  box-shadow: 0 1px 4px rgba(212, 175, 55, 0.2);
}

.native-layout {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #81c784;
}

.native-layout.is-ios-native {
  background: linear-gradient(180deg, #f7f8fa 0%, #eef2f7 100%);
  border: 1px solid rgba(60, 60, 67, 0.14);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
  padding: 16px;
}

.native-content {
  max-width: 100%;
  margin: 0 auto;
  line-height: 2;
  padding: 0 clamp(16px, 2vw, 48px);
}

.native-layout.is-ios-native .native-content {
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display',
    'Noto Sans', sans-serif;
  line-height: 1.6;
  padding: 0 clamp(8px, 2vw, 20px);
}

.verse-paragraph {
  margin: 16px 0;
  padding: 12px;
  border-inline-end: 4px solid #4caf50;
  padding-inline-end: 16px;
  font-size: 1.05rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: justify;
  direction: rtl;
}

.native-layout.is-ios-native .verse-paragraph {
  margin: 10px 0;
  padding: 12px 14px;
  border-inline-end: none;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(60, 60, 67, 0.12);
  border-radius: 14px;
  text-align: start;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
}

.verse-paragraph:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  transform: translateX(4px);
}

.native-layout.is-ios-native .verse-paragraph:hover {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 14px rgba(17, 24, 39, 0.08);
  transform: translateX(0);
}

.verse-paragraph.is-selected {
  background: rgba(255, 193, 7, 0.08);
  border-inline-end-color: #ffc107;
  border-inline-end-width: 6px;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
  transform: translateX(4px);
}

.verse-paragraph.is-current-ayah {
  background: rgba(76, 175, 80, 0.1);
  border-inline-end-color: #2e7d32;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.18);
}

.native-layout.is-ios-native .verse-paragraph.is-selected {
  background: rgba(10, 132, 255, 0.1);
  border: 1px solid rgba(10, 132, 255, 0.35);
  box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.14);
  transform: translateX(0);
}

.verse-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 0.9rem;
  color: #fff;
  background: linear-gradient(135deg, #66bb6a, #4caf50);
  border: 2px solid #4caf50;
  border-radius: 50%;
  margin-inline-start: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.native-layout.is-ios-native .verse-marker {
  min-width: 30px;
  height: 30px;
  font-size: 0.8rem;
  background: #f2f2f7;
  border: 1px solid rgba(60, 60, 67, 0.28);
  color: #1c1c1e;
  box-shadow: none;
}

.verse-marker:hover {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  border-color: #388e3c;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.5);
}

.native-layout.is-ios-native .verse-marker:hover {
  background: #e5e5ea;
  border-color: rgba(60, 60, 67, 0.36);
  color: #1c1c1e;
  transform: scale(1.03);
  box-shadow: none;
}

.native-inline-actions {
  display: inline-flex;
  vertical-align: middle;
  margin-inline: 6px 8px;
  direction: ltr;
}

.native-layout.is-ios-native .native-inline-actions {
  gap: 6px;
  margin-inline: 8px;
}

.native-layout.is-ios-native .native-trigger {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(60, 60, 67, 0.16);
}

.verse-text-arabic {
  font-family: 'Noto Naskh Arabic', serif;
  direction: rtl;
  unicode-bidi: embed;
  display: block;
  margin: 8px 0;
  font-size: clamp(1.1rem, 2.2vw, 2.2rem);
  line-height: 1.8;
}

.native-layout.is-ios-native .verse-text-arabic {
  font-size: clamp(1.18rem, 2.8vw, 2.05rem);
  line-height: 1.9;
}

.verse-translation-native {
  display: block;
  margin-top: 8px;
  color: #555;
  font-style: italic;
  font-size: 0.95rem;
}

.native-layout.is-ios-native .verse-translation-native {
  margin-top: 10px;
  color: #3a3a3c;
  font-style: normal;
  font-size: 0.95rem;
  line-height: 1.45;
}

/* Dark mode overrides */
body.body--dark .sura-card {
  background: #000000;
  color: #f2f2f2;
}

body.body--dark .quran-detail-page {
  color: #f3f4f6;
}

body.body--dark .reader-mode-toggle :deep(.q-btn) {
  background: #050505;
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.1);
}

body.body--dark .reader-mode-toggle :deep(.q-btn--active) {
  color: #111827;
}

body.body--dark .recitation-switch-wrap--header {
  background: rgba(255, 255, 255, 0.08);
}

body.body--dark .recitation-switch-label {
  color: #f3f4f6;
}

body.body--dark .sura-title-swipeable {
  color: #e0e0e0;
}

body.body--dark .reader-layout .arabic-block {
  background: #000000;
  border-color: rgba(255, 255, 255, 0.14);
}

body.body--dark .arabic-text {
  color: #e0e0e0;
}

body.body--dark .verse-row {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

body.body--dark .verse-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

body.body--dark .verse-row.is-current-ayah {
  background: rgba(102, 187, 106, 0.16);
  border-color: rgba(129, 199, 132, 0.3);
}

body.body--dark .verse-translation {
  color: #b0b0b0;
}

body.body--dark .verse-num {
  background: #050505;
  color: #f2f2f2;
  border-color: #262626;
}

body.body--dark .bookmark-empty {
  color: #b0b0b0;
}

body.body--dark .bookmark-chip {
  background: rgba(255, 193, 7, 0.2);
  color: #ffd54f;
}

body.body--dark .ayah-action-card {
  background: rgba(0, 0, 0, 0.96);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f3f4f6;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
}

body.body--dark .mushaf-layout {
  background: linear-gradient(135deg, #080808 0%, #000000 100%);
}

body.body--dark .mushaf-page {
  background: #000000;
  box-shadow: inset 0 0 0 2px rgba(255, 193, 7, 0.12);
}

body.body--dark .page-border {
  border-color: rgba(255, 193, 7, 0.25);
  background-image: radial-gradient(
    circle at top,
    rgba(255, 193, 7, 0.08),
    transparent 50%
  );
}

body.body--dark .mushaf-title {
  color: #ffd54f;
}

body.body--dark .mushaf-meta {
  color: #b0b0b0;
}

body.body--dark .mushaf-ayah-inline {
  color: #e0e0e0;
}

body.body--dark .ayah-inline-number {
  background: rgba(0, 0, 0, 0.96);
  color: #d4af37;
  border-color: #d4af37;
}

body.body--dark .ayah-inline-number:hover {
  background: #d4af37;
  color: #1a1a1a;
  border-color: #ffc107;
}

body.body--dark .mushaf-ayah-inline.is-selected {
  background: rgba(255, 193, 7, 0.18);
}

body.body--dark .mushaf-ayah-inline.is-current-ayah {
  background: rgba(102, 187, 106, 0.2);
}

body.body--dark .native-layout {
  background: linear-gradient(135deg, #061108 0%, #000000 100%);
  border-color: #4caf50;
}

body.body--dark .native-layout.is-ios-native {
  background: linear-gradient(180deg, #050505 0%, #000000 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.42);
}

body.body--dark .verse-paragraph {
  background: rgba(0, 0, 0, 0.82);
  color: #f0f0f0;
}

body.body--dark .native-layout.is-ios-native .verse-paragraph {
  background: rgba(0, 0, 0, 0.88);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f2f2f7;
}

body.body--dark .native-layout.is-ios-native .verse-paragraph.is-selected {
  background: rgba(10, 132, 255, 0.16);
  border-color: rgba(10, 132, 255, 0.46);
  box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.2);
}

body.body--dark .verse-paragraph.is-current-ayah {
  background: rgba(102, 187, 106, 0.18);
  border-inline-end-color: rgba(129, 199, 132, 0.8);
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.18);
}

body.body--dark .verse-paragraph:hover {
  background: rgba(255, 255, 255, 0.04);
}

body.body--dark .native-layout.is-ios-native .verse-paragraph:hover {
  background: rgba(255, 255, 255, 0.05);
}

body.body--dark .verse-text-arabic {
  color: #e0e0e0;
}

body.body--dark .native-layout.is-ios-native .verse-marker {
  background: rgba(0, 0, 0, 0.94);
  border-color: rgba(255, 255, 255, 0.2);
  color: #f2f2f7;
}

body.body--dark .native-layout.is-ios-native .verse-marker:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.28);
}

body.body--dark .native-layout.is-ios-native .native-trigger {
  background: rgba(0, 0, 0, 0.84);
  border-color: rgba(255, 255, 255, 0.14);
}

body.body--dark .verse-translation-native {
  color: #b0b0b0;
}

body.body--dark .native-layout.is-ios-native .verse-translation-native {
  color: #d1d1d6;
}

/* Landscape Optimizations */
@media (orientation: landscape) and (max-height: 500px) {
  /* Compact header for more content space */
  .sura-heading {
    padding: 8px 0;
  }

  .text-h5 {
    font-size: 1.2rem !important;
  }

  .heading-actions {
    gap: 4px;
  }
}

@media (orientation: landscape) and (min-width: 768px) {
  /* Keep translation below Arabic for transparency */
  .verse-row {
    display: block;
  }

  .verse-main-row {
    grid-template-columns: max-content minmax(0, 1fr);
  }

  .verse-meta {
    margin-top: 8px;
    display: flex;
    align-items: flex-start;
  }

  .verse-translation {
    padding: 0;
    background: transparent;
    border-radius: 0;
    min-height: auto;
  }

  body.body--dark .verse-translation {
    background: rgba(255, 255, 255, 0.03);
  }

  /* Keep mushaf in one full-width flow in landscape */
  .mushaf-body {
    column-count: 1;
    column-gap: 0;
  }
}

/* Animation for active play buttons */
.animated-play-btn {
  transition: all 0.3s ease;
}

.animated-play-btn:hover {
  transform: scale(1.15);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.pulse-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Reader mode toggle enhancements */
.reader-mode-toggle {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.reader-mode-toggle:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* Paused indicator banner */
.paused-indicator-banner {
  margin-bottom: 16px;
  position: sticky;
  top: 10px;
  z-index: 30;
  background: linear-gradient(
    135deg,
    rgba(255, 193, 7, 0.15),
    rgba(255, 152, 0, 0.1)
  );
  border: 2px solid #ffc107;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.25);
}

.paused-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Slide down transition for paused banner */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

body.body--dark .paused-indicator-banner {
  background: linear-gradient(
    135deg,
    rgba(255, 193, 7, 0.2),
    rgba(255, 152, 0, 0.15)
  );
  border-color: #ffb300;
}

/* Recommended mode indicator */
.recommended-icon {
  margin-left: 2px;
  filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.5));
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

body.body--dark .recommended-icon {
  filter: drop-shadow(0 0 3px rgba(255, 193, 7, 0.7));
}

/* Announcement banner */
.announcement-banner {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.15),
    rgba(21, 101, 192, 0.1)
  );
  border: 2px solid #2196f3;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5);
  }
}

.announcement-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

body.body--dark .announcement-banner {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.25),
    rgba(21, 101, 192, 0.15)
  );
  border-color: #42a5f5;
}

/* Notification badges */
:deep(.q-notification__badge) {
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.youtube-banner-wrapper {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.video-ratio-box {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
}

.video-ratio-box iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
