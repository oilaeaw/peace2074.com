/**
 * useAthanPlayer — Multi-reciter Athan player
 *
 * Audio sources: github.com/abodehq/Athan-MP3 (open source, no CDN fees)
 * Default: Mishary Alafasy (user preference)
 *
 * Storage key: 'pref-athan-reciter' → AthanReciterId
 */

import { ref, computed, watch } from 'vue'

// ── Reciter catalogue ─────────────────────────────────────────────────────────

const GITHUB_BASE =
  'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds'

export interface AthanReciter {
  id: string
  name: string
  nameAr: string
  url: string
}

export const ATHAN_RECITERS: AthanReciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    nameAr: 'مشاري العفاسي',
    url: `${GITHUB_BASE}/Athan Mishary Alafasi.mp3`,
  },
  {
    id: 'makkah',
    name: 'Makkah (Haram)',
    nameAr: 'أذان مكة المكرمة',
    url: `${GITHUB_BASE}/Athan Makkah.mp3`,
  },
  {
    id: 'alqatami',
    name: 'Nasser Al-Qatami',
    nameAr: 'ناصر القطامي',
    url: `${GITHUB_BASE}/Athan Nasser Alqatami.mp3`,
  },
  {
    id: 'menshawy',
    name: 'Mohammad Al-Menshawy',
    nameAr: 'محمد المنشاوي',
    url: `${GITHUB_BASE}/Athan Mohammad Almenshawy.mp3`,
  },
  {
    id: 'refaat',
    name: 'Mohammad Ref3at',
    nameAr: 'محمد رفعت',
    url: `${GITHUB_BASE}/Athan Mohammad Ref3at.mp3`,
  },
  {
    id: 'zahrani',
    name: 'Mansoor Az-Zahrani',
    nameAr: 'منصور الزهراني',
    url: `${GITHUB_BASE}/Athan Mansoor Az-Zahrani.mp3`,
  },
  {
    id: 'malki',
    name: 'Hamdan Al-Malki',
    nameAr: 'حمدان الملكي',
    url: `${GITHUB_BASE}/Athan Hamdan Almalki.mp3`,
  },
  {
    id: 'deghreri',
    name: 'Hamad Deghreri',
    nameAr: 'حمد الدغريري',
    url: `${GITHUB_BASE}/Athan Hamad Deghreri.mp3`,
  },
  {
    id: 'abase6',
    name: 'Abed Al-Base6',
    nameAr: 'عبد الباسط',
    url: `${GITHUB_BASE}/Athan Abed Albase6.mp3`,
  },
  {
    id: 'nuyne3',
    name: 'Ahmad Nuyne3',
    nameAr: 'أحمد النعيمي',
    url: `${GITHUB_BASE}/Athan Ahmad Nuyne3.mp3`,
  },
  {
    id: 'arkani',
    name: 'Ibrahim Al-Arkani',
    nameAr: 'إبراهيم الأركاني',
    url: `${GITHUB_BASE}/Athan Ibrahim Al-Arkani.mp3`,
  },
  {
    id: 'hamathani',
    name: 'Majed Al-Hamathani',
    nameAr: 'ماجد الهمذاني',
    url: `${GITHUB_BASE}/Athan Majed Al-hamathani.mp3`,
  },
  {
    id: 'khatba',
    name: 'Suhaib Khatba',
    nameAr: 'صهيب خطبة',
    url: `${GITHUB_BASE}/Athan Suhaib Khatba.mp3`,
  },
  {
    id: 'chebae',
    name: 'Malek Chebae (Fajr)',
    nameAr: 'مالك شبعي (أذان الفجر)',
    url: `${GITHUB_BASE}/Athan Al-fajer - Malek chebae.mp3`,
  },
]

export type AthanReciterId = (typeof ATHAN_RECITERS)[number]['id']

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pref-athan-reciter'
const DEFAULT_RECITER_ID: AthanReciterId = 'alafasy'

function readStoredReciterId(): AthanReciterId {
  if (typeof window === 'undefined') return DEFAULT_RECITER_ID
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return ATHAN_RECITERS.some((r) => r.id === stored)
    ? (stored as AthanReciterId)
    : DEFAULT_RECITER_ID
}

function persistReciterId(id: AthanReciterId) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, id)
  }
}

// ── Singleton audio state ─────────────────────────────────────────────────────

const isClient = typeof Audio !== 'undefined'

const selectedReciterId = ref<AthanReciterId>(readStoredReciterId())
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const loadError = ref<string | null>(null)

let audio: HTMLAudioElement | null = null

function buildAudio(url: string): HTMLAudioElement {
  const a = new Audio()
  a.preload = 'none' // lazy load — only fetch when user plays

  a.addEventListener('loadedmetadata', () => {
    duration.value = a.duration || 0
    isLoading.value = false
  })
  a.addEventListener('timeupdate', () => {
    currentTime.value = a.currentTime || 0
  })
  a.addEventListener('play', () => {
    isPlaying.value = true
    isLoading.value = false
    loadError.value = null
    trackAthan('play')
  })
  a.addEventListener('pause', () => {
    if (a.ended) return
    isPlaying.value = false
    trackAthan('pause')
  })
  a.addEventListener('ended', () => {
    isPlaying.value = false
    currentTime.value = 0
    trackAthan('completed')
  })
  a.addEventListener('waiting', () => {
    isLoading.value = true
  })
  a.addEventListener('canplay', () => {
    isLoading.value = false
  })
  a.addEventListener('error', () => {
    isPlaying.value = false
    isLoading.value = false
    loadError.value = `Failed to load athan from this source. Try another reciter.`
  })

  a.src = url
  return a
}

function getOrCreateAudio(): HTMLAudioElement | null {
  if (!isClient) return null

  const reciter = ATHAN_RECITERS.find((r) => r.id === selectedReciterId.value)
  if (!reciter) return null

  if (!audio) {
    audio = buildAudio(reciter.url)
  }

  return audio
}

function trackAthan(action: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'athan_interaction', {
      action,
      reciter: selectedReciterId.value,
      seconds_played: Math.round(currentTime.value),
      completion_percent:
        duration.value > 0
          ? Math.round((currentTime.value / duration.value) * 100)
          : 0,
      page_path: window.location.pathname,
    })
  }
}

// ── Player controls ───────────────────────────────────────────────────────────

function play() {
  const a = getOrCreateAudio()
  if (!a) return
  isLoading.value = true
  loadError.value = null
  a.currentTime = 0
  void a.play().catch((err) => {
    isLoading.value = false
    loadError.value = String(err)
  })
}

function pause() {
  if (!audio) return
  audio.pause()
}

function stop() {
  if (!audio) return
  trackAthan('stop')
  audio.pause()
  audio.currentTime = 0
  isPlaying.value = false
}

function toggle() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

/**
 * Change the active reciter. Stops current playback and resets the audio element.
 */
function setReciter(id: AthanReciterId) {
  if (id === selectedReciterId.value) return

  // Stop and discard current audio
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }

  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  loadError.value = null

  selectedReciterId.value = id
  persistReciterId(id)
}

// ── Composable export ─────────────────────────────────────────────────────────

export function useAthanPlayer() {
  const selectedReciter = computed(
    () => ATHAN_RECITERS.find((r) => r.id === selectedReciterId.value) ?? ATHAN_RECITERS[0]
  )

  return {
    // Controls
    play,
    pause,
    stop,
    toggle,
    setReciter,

    // State
    isPlaying,
    isLoading,
    currentTime,
    duration,
    loadError,

    // Reciter selection
    selectedReciterId,
    selectedReciter,
    reciters: ATHAN_RECITERS,
  }
}

export default useAthanPlayer
