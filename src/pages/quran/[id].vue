<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import useQ2P from '@/composables/useQ2P'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useBookmarksStore } from '@/stores/bookmarks.pinia'

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
const route = useRoute('/quran/[id]')
const router = useRouter()
const q2p = useQ2P()
const $q = useQuasar()
const bookmarksStore = useBookmarksStore()

const sura = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const selectedBookmark = ref('')
const LAYOUT_STORAGE_KEY = 'quran-view-mode'
const layoutMode = ref<'reader' | 'mushaf'>('reader')

const audioList = ref<string[]>([])
const audioEl = ref<HTMLAudioElement | null>(null)
const isPlayingAudio = ref(false)
const currentAyahIndex = ref<number>(-1)
const currentWordIndex = ref<number>(-1)
const playbackRate = ref<number>(1)
const wordTimings = ref<Record<number, Array<{ start: number; end: number }>>>({})
const stopRequested = ref(false)

if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  const storedMode = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
  if (storedMode === 'reader' || storedMode === 'mushaf') {
    layoutMode.value = storedMode
  }
}

const currentSuraId = computed(() => Number(sura.value?.id || route.params.id || 0))

const viewModeOptions = computed(() => ([
  { label: t('pages.quran.modes.reader'), value: 'reader' },
  { label: t('pages.quran.modes.mushaf'), value: 'mushaf' },
]))

const bookmarkEntries = computed<BookmarkEntry[]>(() => {
  const rows = (bookmarksStore.bookmarks || []) as any[]
  return rows
    .map<BookmarkEntry | null>((bm: any, idx: number) => {
      const rawString = typeof bm === 'string' ? bm : bm?.bookmark || ''
      if (!rawString) return null
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
  try {
    await bookmarksStore.createBookmark(normalized)
    selectedBookmark.value = `id_${normalized}`
    $q.notify({ type: 'positive', message: t('pages.quran.bookmarks.saved') })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err?.message || t('pages.quran.bookmarks.error') })
  }
}

function removeBookmark(entry: BookmarkEntry) {
  const identifier = typeof entry.raw === 'string'
    ? entry.raw
    : entry.raw?._id || entry.raw?.bookmark || entry.normalized
  bookmarksStore.deleteBookmark(identifier)
}

async function handleBookmarkNavigate(entry: BookmarkEntry) {
  if (!entry) return
  selectedBookmark.value = `id_${entry.normalized}`
  if (entry.suraId && entry.suraId !== currentSuraId.value) {
    await router.push({ path: `/quran/${entry.suraId}`, hash: `#${entry.normalized}` })
    return
  }
  if (entry.verse) {
    scrollToVerse(entry.verse)
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
    await loadAudioList(id)
    await loadWordTimings(id)
    await nextTick()
    await scrollToHash(route.hash)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sura'
    $q.notify({ type: 'negative', message: error.value })
  } finally {
    loading.value = false
  }
}

async function loadWordTimings(id: number) {
  wordTimings.value = {}
  try {
    const res = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${id}?segments=true`)
    if (!res.ok) return
    const json = await res.json()
    const files = json?.audio_files || []
    files.forEach((file: any) => {
      const verseKey: string = file?.verse_key || ''
      const segments: number[][] = file?.segments || []
      const [suraId, ayahId] = verseKey.split(':').map((n: string) => Number(n))
      if (!suraId || !ayahId) return
      const timings = segments.map((seg) => {
        const start = (seg?.[1] ?? 0) / 1000
        const end = (seg?.[2] ?? 0) / 1000
        return { start, end }
      })
      if (!wordTimings.value[ayahId - 1]) wordTimings.value[ayahId - 1] = timings
    })
  } catch {
    // silent fallback
  }
}

async function loadAudioList(id: number) {
  audioList.value = []
  currentAyahIndex.value = -1
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
    const src = audioList.value[index]
    const el = new Audio(src)
    el.playbackRate = playbackRate.value
    audioEl.value = el
    currentAyahIndex.value = index
    isPlayingAudio.value = true
    currentWordIndex.value = -1
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

function startSuraAudio() {
  stopRequested.value = false
  if (!audioList.value.length) {
    $q.notify({ type: 'warning', message: t('general.fetchingUpdates') || 'Loading audio…' })
    return
  }
  playAyah(0)
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
  isPlayingAudio.value = false
  currentAyahIndex.value = -1
  currentWordIndex.value = -1
}

function updateCurrentWord(time: number) {
  const idx = currentAyahIndex.value
  if (idx < 0) return
  const timings = wordTimings.value[idx] || []
  if (!timings.length) return
  const found = timings.findIndex((seg) => time >= seg.start && time <= seg.end)
  currentWordIndex.value = found
}

onMounted(async () => {
  await loadSuraById(Number(route.params.id || 1))
  try {
    await bookmarksStore.init()
  } catch {}
})

watch(() => route.params.id, (newId) => {
  if (!newId) return
  loadSuraById(Number(newId))
})

watch(() => route.hash, (hash) => {
  if (!hash) return
  scrollToHash(hash)
})

watch(layoutMode, (mode) => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, mode)
  } catch {}
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
          <div class="text-h5">{{ sura?.e_name }} — {{ sura?.name }}</div>
          <div class="text-caption q-mt-xs">
            ID: {{ sura?.id }} • {{ sura?.type }} • {{ sura?.total_verses }} ayat
          </div>
        </div>
        <div class="heading-actions">
          <q-btn
            icon="play_arrow"
            color="primary"
            flat
            dense
            @click="startSuraAudio"
            :disable="!audioList.length"
            :label="isPlayingAudio ? t('general.pause') || 'Pause' : t('pages.quran.playRecitation') || 'Play recitation'"
          />
          <q-btn
            icon="stop"
            color="negative"
            flat
            dense
            @click="stopAudio"
            :disable="!isPlayingAudio"
            :label="t('pages.quran.stopRecitation') || 'Stop recitation'"
          />
          <q-select
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
          <div class="view-toggle">
            <q-btn-toggle
              v-model="layoutMode"
              :options="viewModeOptions"
              rounded
              glossy
              toggle-color="primary"
              color="white"
              unelevated
              size="sm"
            />
          </div>
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
          >
            <div class="arabic-text">
              <template v-if="wordTimings[a.verse - 1]?.length">
                <span
                  v-for="(word, wIdx) in a.text.split(' ')"
                  :key="`${a.verse}-${wIdx}`"
                  :class="{ 'is-current-word': currentAyahIndex === (a.verse - 1) && currentWordIndex === wIdx }"
                >
                  {{ word }}
                </span>
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
                    <q-icon :name="isVerseBookmarked(a.verse) ? 'bookmark' : 'bookmark_add'" size="16px" />
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

      <div v-else class="mushaf-layout q-mt-lg">
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
              >
                <span class="ayah-text">{{ a.text }}</span>
                <div class="ayah-controls">
                  <span class="ayah-number" @click="scrollToVerse(a.verse)">۝ {{ a.verse }}</span>
                  <button
                    type="button"
                    class="bookmark-trigger mushaf-trigger"
                    :class="{ 'is-active': isVerseBookmarked(a.verse) }"
                    @click.stop="bookmarkVerse(a.verse)"
                    :aria-label="bookmarkActionLabel(a.verse)"
                  >
                    <q-icon :name="isVerseBookmarked(a.verse) ? 'bookmark' : 'bookmark_add'" size="16px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
}

.verse-row {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.verse-row:last-child {
  border-bottom: none;
}

.verse-row.is-selected {
  background: rgba(243, 223, 184, 0.25);
  border-radius: 16px;
  padding: 12px;
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
  background: #f3dfb8;
  border: 1px solid #caa14b;
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
  color: #b98a36;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s ease, color 0.2s ease;
}

.bookmark-trigger:hover {
  background: rgba(185, 138, 54, 0.18);
}

.bookmark-trigger.is-active {
  color: #7c4a00;
}

.verse-row.is-selected .arabic-text,
.mushaf-ayah.is-selected .ayah-text {
  color: #704012;
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
}

.mushaf-ayah.is-selected {
  background: rgba(243, 223, 184, 0.35);
  border-radius: 14px;
  padding: 18px 18px 18px 48px;
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
  background: rgba(185, 138, 54, 0.25);
  padding: 0 4px;
  border-radius: 6px;
}

.ayah-number {
  font-size: 0.95rem;
  color: #7c6142;
  cursor: pointer;
}

.mushaf-trigger {
  width: 28px;
  height: 28px;
}
</style>
