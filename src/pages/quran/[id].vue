<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import useQ2P from '@/composables/useQ2P'
import { useQuranTree } from '@/composables/useQuranTree'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useBookmarksStore } from '@/stores/bookmarks.pinia'
import { useStorageRef } from '@/composables/useUStore'

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

const sura = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const selectedBookmark = ref('')
const LAYOUT_STORAGE_KEY = 'quran-view-mode'
const layoutModeStore = useStorageRef<'reader' | 'mushaf' | 'native'>(LAYOUT_STORAGE_KEY, 'reader')
const layoutMode = computed<'reader' | 'mushaf' | 'native'>({
  get: () => layoutModeStore.value.value,
  set: (mode) => layoutModeStore.set(mode),
})

// Quran verse tree for O(log n) verse lookup
const quranTree = useQuranTree()

// Quick access popular verses with unique IDs
interface QuickAccessVerse {
  id: string // Format: sura_verse (e.g., "2_255")
  suraId: number
  verse: number
  nameKey: string // i18n key for the verse name
  icon: string
}

const quickAccessVerses = ref<QuickAccessVerse[]>([
  { id: '2_255', suraId: 2, verse: 255, nameKey: 'pages.quran.quickAccess.kursi', icon: 'star' },
  { id: '1_1', suraId: 1, verse: 1, nameKey: 'pages.quran.quickAccess.fatiha', icon: 'menu_book' },
  { id: '36_1', suraId: 36, verse: 1, nameKey: 'pages.quran.quickAccess.yasin', icon: 'favorite' },
  { id: '67_1', suraId: 67, verse: 1, nameKey: 'pages.quran.quickAccess.mulk', icon: 'king_bed' },
  { id: '112_1', suraId: 112, verse: 1, nameKey: 'pages.quran.quickAccess.ikhlas', icon: 'brightness_7' },
])

const audioList = ref<string[]>([])
const audioEl = ref<HTMLAudioElement | null>(null)
const nextAudioEl = ref<HTMLAudioElement | null>(null)
const isPlayingAudio = ref(false)
const currentAyahIndex = ref<number>(-1)
const currentWordIndex = ref<number>(-1)
const playbackRate = ref<number>(1)
const wordTimings = ref<Record<number, Array<{ start: number; end: number }>>>({})
const stopRequested = ref(false)

// Hover widget state
const hoverWidgetVisible = ref(false)
const hoverWidgetVerse = ref<number | null>(null)
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const hoverWidgetPosition = ref({ top: 0, left: 0 })

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

const currentSuraId = computed(() => Number(sura.value?.id || route.params.id || 0))

// Swipe detection state
const touchStartX = ref(0)
const touchEndX = ref(0)
const MIN_SWIPE_DISTANCE = 50

const viewModeOptions = computed(() => ([
  { label: t('pages.quran.modes.reader'), value: 'reader' },
  { label: t('pages.quran.modes.mushaf'), value: 'mushaf' },
  { label: t('pages.quran.modes.native') || 'Native', value: 'native' },
]))

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
      const normalized = rawString.startsWith('id_') ? rawString.slice(3) : rawString
      const [suraPart, versePart] = normalized.split('_')

      return {
        key: typeof bm === 'string' ? `${normalized}_${idx}` : bm?._id || `${normalized}_${idx}`,
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

const getVerseElementId = (verse: number | string) => `aya-${currentSuraId.value}-${verse}`

const getBookmarkId = (verse: number | string, suraId = currentSuraId.value) => `id_${suraId}_${verse}`

const isVerseSelected = (verse: number | string) => selectedBookmark.value === getBookmarkId(verse)

const isVerseBookmarked = (verse: number | string) => {
  const normalized = `${currentSuraId.value}_${verse}`
  return bookmarkEntries.value.some(entry => entry.normalized === normalized)
}

const bookmarkActionLabel = (verse: number | string) => t('pages.quran.bookmarks.add', { verse })

async function bookmarkVerse(verse: number | string) {
  if (!sura.value) return
  const normalized = `${sura.value.id}_${verse}`
  
  // Check if already bookmarked
  if (isVerseBookmarked(verse)) {
    $q.notify({ type: 'info', message: t('pages.quran.bookmarks.alreadySaved') || 'Already bookmarked' })
    return
  }
  
  try {
    await bookmarksStore.createBookmark(normalized)
    selectedBookmark.value = `id_${normalized}`
    
    // Force refresh bookmarks from store/server
    await bookmarksStore.fetchBookmarks()
    
    $q.notify({ 
      type: 'positive', 
      message: t('pages.quran.bookmarks.saved'),
      position: 'top',
      timeout: 1500
    })
  } catch (err: any) {
    console.error('[Bookmark] Failed to save:', err)
    $q.notify({ 
      type: 'negative', 
      message: err?.message || t('pages.quran.bookmarks.error'),
      position: 'top'
    })
  }
}

function removeBookmark(entry: BookmarkEntry) {
  const identifier = typeof entry.raw === 'string'
    ? entry.raw
    : entry.raw?._id || entry.raw?.bookmark || entry.normalized
  
  bookmarksStore.deleteBookmark(identifier)
  
  // Force refresh after deletion
  nextTick(() => {
    bookmarksStore.fetchBookmarks()
  })
}

async function handleBookmarkNavigate(entry: BookmarkEntry) {
  if (!entry) return
  selectedBookmark.value = `id_${entry.normalized}`
  
  const playVerseAfterLoad = async () => {
    // Wait for sura to fully load (check loading state and correct sura)
    let retries = 30 // 30 x 200ms = 6 seconds max wait
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 200))
      // Check if we're on the correct sura and audio is loaded
      if (!loading.value && 
          currentSuraId.value === entry.suraId && 
          audioList.value.length >= (entry.verse || 0)) {
        break
      }
      retries--
    }
    
    // Verify we have the correct audio list before playing
    const verseIndex = (entry.verse || 1) - 1
    if (currentSuraId.value === entry.suraId && 
        audioList.value.length > verseIndex && 
        verseIndex >= 0) {
      stopRequested.value = false
      // Scroll to verse first
      await nextTick()
      scrollToVerse(entry.verse)
      // Small delay to ensure scroll completes
      await new Promise(resolve => setTimeout(resolve, 100))
      playAyah(verseIndex)
      $q.notify({ 
        type: 'positive', 
        message: `${entry.label} - Mishary Al-Afasy`,
        icon: 'play_arrow',
        timeout: 2000
      })
    }
  }
  
  if (entry.suraId && entry.suraId !== currentSuraId.value) {
    await router.push({ path: `/quran/${entry.suraId}`, hash: `#${entry.normalized}` })
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
async function navigateToQuickAccess(qaVerse: QuickAccessVerse) {
  // Use tree for efficient lookup (preload context)
  const verseData = await quranTree.getVerse(qaVerse.suraId, qaVerse.verse)
  if (verseData) {
    console.debug(`[QuranTree] Found verse ${verseData.id}: ${verseData.text.slice(0, 50)}...`)
  }
  
  selectedBookmark.value = `id_${qaVerse.id}`
  
  const playVerseAfterLoad = async () => {
    // Wait for sura to fully load (check loading state and correct sura)
    let retries = 30 // 30 x 200ms = 6 seconds max wait
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 200))
      // Check if we're on the correct sura and audio is loaded
      if (!loading.value && 
          currentSuraId.value === qaVerse.suraId && 
          audioList.value.length >= qaVerse.verse) {
        break
      }
      retries--
    }
    
    // Verify we have the correct audio list before playing
    const verseIndex = qaVerse.verse - 1
    if (currentSuraId.value === qaVerse.suraId && 
        audioList.value.length > verseIndex && 
        verseIndex >= 0) {
      stopRequested.value = false
      // Scroll to verse first
      await nextTick()
      scrollToVerse(qaVerse.verse)
      // Small delay to ensure scroll completes
      await new Promise(resolve => setTimeout(resolve, 100))
      playAyah(verseIndex)
      $q.notify({ 
        type: 'positive', 
        message: `${t(qaVerse.nameKey)} - Mishary Al-Afasy`,
        icon: 'play_arrow',
        timeout: 2000
      })
    } else {
      console.error(`[QuickAccess] Failed to play: sura=${currentSuraId.value}, expected=${qaVerse.suraId}, audioLen=${audioList.value.length}, verseIndex=${verseIndex}`)
    }
  }
  
  if (qaVerse.suraId !== currentSuraId.value) {
    // Navigate to different sura, then play after load
    await router.push({ path: `/quran/${qaVerse.suraId}`, hash: `#${qaVerse.id}` })
    // Wait for sura to load and then play
    await playVerseAfterLoad()
  } else {
    // Same sura - scroll and play immediately
    scrollToVerse(qaVerse.verse)
    await playVerseAfterLoad()
  }
}

function scrollToVerse(verse?: number | null) {
  if (typeof window === 'undefined' || verse === undefined || verse === null) return
  const el = document.getElementById(getVerseElementId(verse))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function scrollToHash(rawHash?: string | null) {
  if (typeof window === 'undefined') return
  const hash = (rawHash || window.location.hash || '').replace(/^#/, '')
  if (!hash) return
  const normalized = hash.startsWith('id_') ? hash.slice(3) : hash
  const [suraPart, versePart] = normalized.split('_')
  if (Number(suraPart) !== currentSuraId.value) return
  selectedBookmark.value = `id_${normalized}`
  await nextTick()
  scrollToVerse(versePart ? Number(versePart) : undefined)
}

async function loadSuraById(id: number) {
  loading.value = true
  error.value = ''
  selectedBookmark.value = ''
  stopAudio()
  try {
    await q2p.init(id, locale.value || 'en')
    sura.value = q2p.GetSura?.value || null
    // Load audio from alquran.cloud (per-verse) and timings from qurancdn (word segments)
    await loadAudioAndTimings(id)
    await nextTick()
    await scrollToHash(route.hash)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sura'
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
}

/**
 * Load audio URLs and word timings from quran.com API.
 * Uses per-verse audio with synchronized word segments.
 */
async function loadAudioAndTimings(id: number) {
  audioList.value = []
  wordTimings.value = {}
  currentAyahIndex.value = -1
  
  const AUDIO_BASE_URL = 'https://verses.quran.com/'
  
  try {
    // Fetch verses with audio segments for reciter 7 (Al-Afasy)
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?audio=7&per_page=300`)
    if (!res.ok) {
      console.warn('[Quran Audio] Failed to load from quran.com, falling back to alquran.cloud')
      await loadAudioListFallback(id)
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
      if (segments.length > 0) {
        const timings = segments
          .filter((seg: number[]) => seg.length >= 4)
          .map((seg: number[]) => ({
            start: (seg[2] ?? 0) / 1000,
            end: (seg[3] ?? 0) / 1000
          }))
        if (timings.length > 0) {
          wordTimings.value[verseNum - 1] = timings
        }
      }
    })
    
    // Filter out any undefined entries
    audioList.value = audioList.value.filter(Boolean)
    
    console.debug(`[Quran Audio] Loaded ${audioList.value.length} verses with ${Object.keys(wordTimings.value).length} word timing sets for sura ${id}`)
  } catch (err) {
    console.error('[Quran Audio] Failed to load from quran.com:', err)
    await loadAudioListFallback(id)
  }
}

/**
 * Fallback audio loader using alquran.cloud API (no word timings)
 */
async function loadAudioListFallback(id: number) {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`)
    if (!res.ok) return
    const json = await res.json()
    const ayahs = json?.data?.ayahs || []
    audioList.value = ayahs.map((a: any) => a?.audio).filter(Boolean)
  } catch {
    // silent fallback; list stays empty
  }
}

function preloadNextAyah(index: number) {
  if (index < 0 || index >= audioList.value.length) {
    nextAudioEl.value = null
    return
  }
  const src = audioList.value[index]
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

    el.ontimeupdate = () => updateCurrentWord(el.currentTime)
    el.onended = () => {
      if (stopRequested.value) {
        stopAudio()
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
  stopRequested.value = false
  currentWordIndex.value = -1

  if (!audioList.value.length) {
    $q.notify({ type: 'warning', message: t('general.fetchingUpdates') || 'Loading audio…' })
    return
  }

  // Reload audio and timings if word timings are missing
  if (!Object.keys(wordTimings.value).length && currentSuraId.value) {
    await loadAudioAndTimings(Number(currentSuraId.value))
  }

  playAyah(currentAyahIndex.value >= 0 ? currentAyahIndex.value : 0)
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
}

function togglePauseResume() {
  if (!audioEl.value) return
  if (audioEl.value.paused) {
    audioEl.value.play()
    isPlayingAudio.value = true
  } else {
    audioEl.value.pause()
    isPlayingAudio.value = false
  }
}

// Hover widget functions
function onVerseMouseEnter(event: MouseEvent, verse: number) {
  if (hoverTimeout.value) clearTimeout(hoverTimeout.value)
  hoverTimeout.value = setTimeout(() => {
    // Position widget near the cursor location
    hoverWidgetPosition.value = {
      top: event.clientY,
      left: event.clientX
    }
    hoverWidgetVerse.value = verse
    hoverWidgetVisible.value = true
  }, 800) // 800ms long hover
}

function onVerseMouseLeave() {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
    hoverTimeout.value = null
  }
}

function hideHoverWidget() {
  hoverWidgetVisible.value = false
  hoverWidgetVerse.value = null
}

function restartFromVerse(verse: number) {
  hideHoverWidget()
  stopAudio()
  nextTick(() => {
    playAyah(verse - 1)
  })
}

function restartSura() {
  hideHoverWidget()
  stopAudio()
  nextTick(() => {
    playAyah(0)
  })
}

function goHome() {
  hideHoverWidget()
  stopAudio()
  router.push('/')
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleVerseDoubleClick(event: MouseEvent, verse: number) {
  stopRequested.value = false
  
  // Show hover widget at double-click location
  hoverWidgetPosition.value = {
    top: event.clientY,
    left: event.clientX
  }
  hoverWidgetVerse.value = verse
  hoverWidgetVisible.value = true
  
  // Play the specific verse
  const verseIndex = verse - 1
  if (verseIndex >= 0 && verseIndex < audioList.value.length) {
    playAyah(verseIndex)
    $q.notify({
      type: 'positive',
      message: `Playing verse ${verse}`,
      icon: 'play_arrow',
      timeout: 1500,
      position: 'top'
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
  
  const nextId = swipeDistance < 0 
    ? currentSuraId.value + 1  // Swipe left = next sura
    : currentSuraId.value - 1  // Swipe right = previous sura
  
  // Validate sura ID range (1-114)
  if (nextId >= 1 && nextId <= 114) {
    router.push(`/quran/${nextId}`)
    $q.notify({
      type: 'info',
      message: swipeDistance < 0 ? '→ Next Sura' : '← Previous Sura',
      timeout: 1000,
      position: 'top'
    })
  }
}

// TTS (Text-to-Speech) Functions
function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const voices = window.speechSynthesis.getVoices()
  // Prefer Arabic voices, fallback to any available
  const arabicVoices = voices.filter(v => v.lang.startsWith('ar'))
  availableVoices.value = arabicVoices.length ? arabicVoices : voices
  // Auto-select first Arabic voice if available
  if (!ttsVoice.value && availableVoices.value.length) {
    ttsVoice.value = availableVoices.value[0]
  }
}

function speakAyah(index: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    $q.notify({ type: 'warning', message: t('pages.quran.ttsNotSupported') || 'Text-to-speech not supported in this browser' })
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
  const text = typeof ayah === 'string' ? ayah : (ayah?.text || '')
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
    $q.notify({ type: 'warning', message: t('pages.quran.ttsNotSupported') || 'Text-to-speech not supported' })
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

function startReading() {
  if (readerMode.value === 'tts') {
    startTTS()
  } else {
    startSuraAudio()
  }
}

function stopReading() {
  if (readerMode.value === 'tts') {
    stopTTS()
  } else {
    stopAudio()
  }
}

const isReading = computed(() => readerMode.value === 'tts' ? isTTSPlaying.value : isPlayingAudio.value)

const readerModeOptions = computed(() => [
  { label: t('pages.quran.audioRecitation') || 'Audio Recitation', value: 'audio' },
  { label: t('pages.quran.nativeReader') || 'Native Reader (TTS)', value: 'tts' },
])

function updateCurrentWord(time: number) {
  const idx = currentAyahIndex.value
  if (idx < 0) return
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
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
}

function getHoverWidgetStyle() {
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
    top = Math.max(PADDING, Math.min(top, viewportHeight - WIDGET_HEIGHT - PADDING))
    left = Math.max(PADDING, Math.min(left, viewportWidth - WIDGET_WIDTH - PADDING))
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: 'translate(0, 0)'
  }
}

onMounted(async () => {
  await loadSuraById(Number(route.params.id || 1))
  try {
    await bookmarksStore.init()
  } catch {}
  
  // Load TTS voices
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices()
    // Chrome loads voices async
    window.speechSynthesis.onvoiceschanged = loadVoices
  }
})

watch(() => route.params.id, (newId) => {
  if (!newId) return
  loadSuraById(Number(newId))
})

watch(() => route.hash, (hash) => {
  if (!hash) return
  scrollToHash(hash)
})

</script>

<template>
  <div class="q-pa-md">
    <q-btn flat class="q-mb-md" to="/quran" :label="`← ${t('pages.quran.backToList')}`" />
    <div v-if="loading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <q-card v-else-if="sura" class="q-pa-md q-pb-xl sura-card">
      <div class="sura-heading">
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
            ID: {{ sura?.id }} • {{ sura?.type }} • {{ sura?.total_verses }} ayat
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
            color="white"
            unelevated
            size="sm"
            class="q-mr-sm"
            @update:model-value="stopReading"
          />
          <q-btn
            icon="play_arrow"
            color="primary"
            flat
            dense
            @click="startReading"
            :disable="readerMode === 'audio' && !audioList.length"
            :label="isReading ? t('general.pause') || 'Pause' : t('pages.quran.playRecitation') || 'Play'"
          />
          <q-btn
            icon="stop"
            color="negative"
            flat
            dense
            @click="stopReading"
            :disable="!isReading"
            :label="t('pages.quran.stopRecitation') || 'Stop'"
          />
          <!-- Audio playback rate (audio mode) -->
          <q-select
            v-if="readerMode === 'audio'"
            dense
            outlined
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
            @update:model-value="(v) => { if (audioEl) audioEl.playbackRate = v; }"
          />
          <!-- TTS rate (TTS mode) -->
          <q-select
            v-if="readerMode === 'tts'"
            dense
            outlined
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
            :label="t('pages.quran.ttsSpeed') || 'Speed'"
          />
          <!-- TTS Voice selector -->
          <q-select
            v-if="readerMode === 'tts' && availableVoices.length > 1"
            dense
            outlined
            v-model="ttsVoice"
            :options="availableVoices"
            :option-label="(v) => v?.name || 'Default'"
            style="width: 150px"
            :label="t('pages.quran.ttsVoice') || 'Voice'"
          />
          <div class="view-toggle">
            <q-btn-toggle
              v-model="layoutMode"
              :options="viewModeOptions"
              rounded
              glossy
              toggle-color="primary"
              color="white"
              text-color="grey-8"
              unelevated
              size="sm"
              class="mode-toggle-buttons"
            />
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
                <q-item-label header>{{ t('pages.quran.quickAccess.title') }}</q-item-label>
                <q-item
                  v-for="qa in quickAccessVerses"
                  :key="qa.id"
                  clickable
                  @click="navigateToQuickAccess(qa)"
                >
                  <q-item-section avatar>
                    <q-icon :name="qa.icon" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t(qa.nameKey) }}</q-item-label>
                    <q-item-label caption>{{ qa.suraId }}:{{ qa.verse }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon 
                      :name="qa.suraId === currentSuraId ? 'check_circle' : 'chevron_right'" 
                      :color="qa.suraId === currentSuraId ? 'positive' : 'grey'"
                    />
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
                  @click="handleBookmarkNavigate(entry)"
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
                    <q-btn
                      round
                      dense
                      flat
                      icon="delete"
                      @click.stop="removeBookmark(entry)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <div v-if="layoutMode === 'reader'" class="reader-layout q-mt-lg">
        <div class="arabic-block">
          <div
            v-for="a in sura?.ayat || []"
            :key="a.verse"
            :id="getVerseElementId(a.verse)"
            class="verse-row q-mb-md"
            :class="{ 'is-selected': isVerseSelected(a.verse) }"
            @dblclick="handleVerseDoubleClick($event, a.verse)"
            @mouseenter="onVerseMouseEnter($event, a.verse)"
            @mouseleave="onVerseMouseLeave"
          >
            <div class="arabic-text">
              <template v-if="wordTimings[a.verse - 1]?.length">
                <template v-for="(word, wIdx) in a.text.split(' ')" :key="`${a.verse}-${wIdx}`">
                  <span :id="`word-${a.verse}-${wIdx}`" :class="{ 'is-current-word': currentAyahIndex === (a.verse - 1) && currentWordIndex === wIdx }">{{ word }}</span>{{ ' ' }}
                </template>
              </template>
              <template v-else>
                {{ a.text }}
              </template>
            </div>
            <div class="verse-meta">
              <div class="verse-meta-bar">
                <span class="verse-num" @click="scrollToVerse(a.verse)">{{ a.verse }}</span>
                <div class="verse-actions">
                  <button
                    type="button"
                    class="bookmark-trigger"
                    :class="{ 'is-active': isVerseBookmarked(a.verse) }"
                    @click.stop="bookmarkVerse(a.verse)"
                    :aria-label="bookmarkActionLabel(a.verse)"
                  >
                    <q-icon :name="isVerseBookmarked(a.verse) ? 'star' : 'star_outline'" size="18px" />
                  </button>
                </div>
              </div>
              <div class="verse-translation" v-if="a.translation">
                {{ a.translation }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="layoutMode === 'mushaf'" class="mushaf-layout q-mt-lg">
        <div class="mushaf-page">
          <div class="page-border">
            <div class="mushaf-header">
              <div class="mushaf-title">{{ sura?.name }}</div>
              <div class="mushaf-meta">
                {{ sura?.type }} • {{ sura?.total_verses }} ayat
              </div>
            </div>
            <div class="mushaf-body">
              <div
                v-for="a in sura?.ayat || []"
                :key="`m-${a.verse}`"
                :id="getVerseElementId(a.verse)"
                class="mushaf-ayah"
                :class="{ 'is-selected': isVerseSelected(a.verse) }"
                @dblclick="handleVerseDoubleClick($event, a.verse)"
                @mouseenter="onVerseMouseEnter($event, a.verse)"
                @mouseleave="onVerseMouseLeave"
              >
                <span class="ayah-text">
                  <template v-if="wordTimings[a.verse - 1]?.length">
                    <template v-for="(word, wIdx) in a.text.split(' ')" :key="`m-${a.verse}-${wIdx}`">
                      <span :id="`word-mushaf-${a.verse}-${wIdx}`" :class="{ 'is-current-word': currentAyahIndex === (a.verse - 1) && currentWordIndex === wIdx }">{{ word }}</span>{{ ' ' }}
                    </template>
                  </template>
                  <template v-else>
                    {{ a.text }}
                  </template>
                </span>
                <div class="ayah-controls">
                  <span class="ayah-number" @click="scrollToVerse(a.verse)">۝ {{ a.verse }}</span>
                  <button
                    type="button"
                    class="bookmark-trigger mushaf-trigger"
                    :class="{ 'is-active': isVerseBookmarked(a.verse) }"
                    @click.stop="bookmarkVerse(a.verse)"
                    :aria-label="bookmarkActionLabel(a.verse)"
                  >
                    <q-icon :name="isVerseBookmarked(a.verse) ? 'star' : 'star_outline'" size="18px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="layoutMode === 'native'" class="native-layout q-mt-lg">
        <article class="native-content">
          <p
            v-for="a in sura?.ayat || []"
            :key="`n-${a.verse}`"
            :id="getVerseElementId(a.verse)"
            class="verse-paragraph"
            :class="{ 'is-selected': isVerseSelected(a.verse) }"
            @dblclick="handleVerseDoubleClick($event, a.verse)"
            @mouseenter="onVerseMouseEnter($event, a.verse)"
            @mouseleave="onVerseMouseLeave"
          >
            <span class="verse-marker">[{{ a.verse }}]</span>
            <span class="verse-text-arabic">
              <template v-if="wordTimings[a.verse - 1]?.length">
                <template v-for="(word, wIdx) in a.text.split(' ')" :key="`n-${a.verse}-${wIdx}`">
                  <span :id="`word-native-${a.verse}-${wIdx}`" :class="{ 'is-current-word': currentAyahIndex === (a.verse - 1) && currentWordIndex === wIdx }">{{ word }}</span>{{ ' ' }}
                </template>
              </template>
              <template v-else>
                {{ a.text }}
              </template>
            </span>
            <span v-if="a.translation" class="verse-translation-native">{{ a.translation }}</span>
          </p>
        </article>
      </div>

      <!-- Audio Control Hover Widget -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="hoverWidgetVisible && audioEl && currentAyahIndex >= 0"
            class="audio-hover-widget"
            :style="getHoverWidgetStyle()"
            @mouseleave="hideHoverWidget"
          >
            <div class="hover-widget-content">
              <q-btn
                round
                dense
                :icon="isPlayingAudio ? 'pause' : 'play_arrow'"
                color="primary"
                @click="togglePauseResume"
                :title="isPlayingAudio ? t('pages.quran.pause') : t('pages.quran.play')"
              />
              <q-btn
                round
                dense
                icon="replay"
                color="secondary"
                @click="restartFromVerse(hoverWidgetVerse!)"
                :title="t('pages.quran.restart') || 'Restart verse'"
              />
              <q-btn
                round
                dense
                icon="first_page"
                color="accent"
                @click="restartSura"
                :title="t('pages.quran.restartSura') || 'Restart sura'"
              />
              <q-btn
                round
                dense
                icon="arrow_upward"
                color="info"
                @click="scrollToTop"
                :title="t('pages.quran.scrollToTop') || 'Scroll to top'"
              />
              <q-btn
                round
                dense
                icon="home"
                color="grey"
                @click="goHome"
                :title="t('appShell.nav.home') || 'Home'"
              />
              <q-btn
                round
                dense
                flat
                icon="close"
                size="sm"
                @click="hideHoverWidget"
              />
            </div>
          </div>
        </Transition>
      </Teleport>
    </q-card>
  </div>
</template>

<style scoped>
.status {
  margin: 1rem 0;
}
.status.error {
  color: #b00020;
}
.sura-card {
  background: #fdfbf6;
}

.sura-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.reader-layout .arabic-block {
  font-family: "Noto Naskh Arabic", serif;
  font-size: 1.55rem;
  line-height: 2.2rem;
  direction: rtl;
  text-align: justify;
  background: #ffffff;
  padding: 24px;
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

.arabic-text {
  font-feature-settings: "rlig" 1, "liga" 1;
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
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.verse-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 28px;
  height: 28px;
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

.verse-row.is-selected .arabic-text {
  color: #000000;
  font-weight: 500;
}

.mushaf-ayah.is-selected .ayah-text {
  color: #b8860b;
  font-weight: 500;
}

.mushaf-layout {
  background: linear-gradient(135deg, #f7f2e7, #fefbf4);
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(116, 84, 40, 0.1);
}

.mushaf-page {
  background: #fffdfa;
  border-radius: 18px;
  padding: 18px;
  box-shadow: inset 0 0 0 2px rgba(115, 84, 40, 0.15);
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
  column-count: 2;
  column-gap: 28px;
  direction: rtl;
  font-family: "Noto Naskh Arabic", serif;
}

@media (max-width: 880px) {
  .mushaf-body {
    column-count: 1;
  }
}

.mushaf-ayah {
  break-inside: avoid;
  margin-bottom: 18px;
  font-size: 1.45rem;
  line-height: 2.1rem;
  text-align: justify;
  position: relative;
  padding-inline-start: 32px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.mushaf-ayah:hover {
  background: rgba(214, 185, 128, 0.15);
  border-radius: 12px;
  padding: 12px 12px 12px 44px;
}

.mushaf-ayah.is-selected {
  background: linear-gradient(135deg, rgba(243, 223, 184, 0.5), rgba(214, 185, 128, 0.4));
  border-radius: 14px;
  padding: 18px 18px 18px 48px;
  border: 2px solid #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
}

.ayah-text {
  display: block;
}

.ayah-controls {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.is-current-word {
  background: #ffc107;
  color: #000000;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s ease;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.4);
}

.audio-hover-widget {
  position: fixed;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.hover-widget-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ayah-number {
  font-size: 0.95rem;
  color: #d4af37;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s ease;
}

.ayah-number:hover {
  color: #b8860b;
}

.mushaf-trigger {
  width: 28px;
  height: 28px;
}

.native-layout {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #81c784;
}

.native-content {
  max-width: 900px;
  margin: 0 auto;
  line-height: 2;
}

.verse-paragraph {
  margin: 16px 0;
  padding: 12px;
  border-left: 4px solid #4caf50;
  padding-left: 16px;
  font-size: 1.05rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.verse-paragraph:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  transform: translateX(-4px);
}

.verse-paragraph.is-selected {
  background: rgba(255, 193, 7, 0.08);
  border-left-color: #ffc107;
  border-left-width: 6px;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
  transform: translateX(-4px);
}

.verse-marker {
  display: inline-block;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #66bb6a, #4caf50);
  margin-right: 8px;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.verse-text-arabic {
  font-family: "Noto Naskh Arabic", serif;
  direction: rtl;
  unicode-bidi: embed;
  display: block;
  margin: 8px 0;
  font-size: 1.25rem;
  line-height: 1.8;
}

.verse-translation-native {
  display: block;
  margin-top: 8px;
  color: #555;
  font-style: italic;
  font-size: 0.95rem;
}
</style>
