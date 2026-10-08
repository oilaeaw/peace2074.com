<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="shazam-theater-root">
      <!-- Ambient Animated Glow Backdrop -->
      <div class="ambient-mesh ambient-mesh-1" />
      <div class="ambient-mesh ambient-mesh-2" />
      <div class="ambient-mesh ambient-mesh-3" />

      <!-- Top Header Navigation & Controls Bar -->
      <header
        class="shazam-theater-header row items-center justify-between no-wrap q-px-md q-py-sm"
      >
        <!-- Left: Shazam Branding & Surah Title -->
        <div class="row items-center gap-md no-wrap">
          <div class="shazam-badge-glow row items-center no-wrap">
            <div
              class="shazam-equalizer-bars"
              :class="{ 'is-active': isPlaying }"
            >
              <span class="bar bar-1" />
              <span class="bar bar-2" />
              <span class="bar bar-3" />
              <span class="bar bar-4" />
            </div>
            <span class="shazam-badge-text text-weight-bolder"
              >SHAZAM LYRICS</span
            >
          </div>

          <div class="header-surah-meta gt-xs">
            <div
              class="text-subtitle1 text-weight-bolder text-white row items-center no-wrap"
            >
              <span>{{ sura?.name }}</span>
              <span class="q-mx-xs text-grey-5">•</span>
              <span class="text-cyan-3">{{ sura?.e_name }}</span>
              <q-badge
                color="purple-9"
                text-color="white"
                class="q-ml-sm text-caption"
              >
                Surah {{ sura?.id }}
              </q-badge>
            </div>
            <div class="text-caption text-grey-4 row items-center no-wrap">
              <q-icon name="mic" size="14px" class="q-mr-xs text-pink-4" />
              <span>{{ reciterName }}</span>
              <span class="q-mx-xs">•</span>
              <span
                >Verse {{ currentAyahIndex + 1 }} of
                {{ sura?.total_verses }}</span
              >
            </div>
          </div>
        </div>

        <!-- Center: Layout View Switcher -->
        <div class="layout-toggle-wrap gt-sm">
          <q-btn-toggle
            v-model="activeLayout"
            dense
            rounded
            unelevated
            toggle-color="deep-purple-7"
            toggle-text-color="white"
            color="black"
            text-color="grey-5"
            no-caps
            :options="[
              { label: 'Split Theater', value: 'split', icon: 'view_column' },
              { label: 'Lyrics Focus', value: 'lyrics', icon: 'lyrics' },
              { label: 'Video Stage', value: 'video', icon: 'smart_display' },
            ]"
          />
        </div>

        <!-- Right: Actions & Close -->
        <div class="row items-center gap-sm no-wrap">
          <!-- Highlight Mode Switch -->
          <q-btn
            dense
            flat
            round
            :color="highlightMode === 'word' ? 'amber-4' : 'grey-5'"
            :icon="highlightMode === 'word' ? 'auto_awesome' : 'subject'"
            @click="
              $emit(
                'set-highlight-mode',
                highlightMode === 'word' ? 'ayah' : 'word'
              )
            "
          >
            <q-tooltip>
              {{
                highlightMode === 'word'
                  ? 'Highlight: Word-by-Word (Karaoke)'
                  : 'Highlight: Entire Ayah'
              }}
            </q-tooltip>
          </q-btn>

          <!-- Shazam Live Mic Trigger -->
          <q-btn
            unelevated
            rounded
            dense
            color="pink-7"
            icon="graphic_eq"
            class="gt-xs q-px-sm"
            @click="$emit('trigger-shazam')"
          >
            <span class="q-ml-xs text-weight-bold">Sync Mic</span>
            <q-tooltip>Listen via Microphone to Jump to Verse</q-tooltip>
          </q-btn>

          <!-- Close Modal -->
          <q-btn
            round
            dense
            flat
            icon="close"
            color="white"
            class="close-btn"
            @click="$emit('update:modelValue', false)"
          />
        </div>
      </header>

      <!-- Main Stage -->
      <main
        class="shazam-stage"
        :class="{
          'mode-split': activeLayout === 'split',
          'mode-lyrics': activeLayout === 'lyrics',
          'mode-video': activeLayout === 'video',
        }"
      >
        <!-- ── Left / Upper: Video Stage & Shazam Radar ── -->
        <section v-show="activeLayout !== 'lyrics'" class="stage-video-column">
          <div class="video-card-frame shadow-2xl">
            <!-- YouTube Official Video Player -->
            <div class="video-aspect-container">
              <iframe
                :src="videoEmbedUrl"
                title="Official Recitation Video"
                frameborder="0"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                "
                allowfullscreen
                class="video-iframe"
              />
            </div>

            <!-- Shazam Interactive Audio Radar Banner -->
            <div
              class="shazam-radar-strip row items-center justify-between q-pa-md"
            >
              <div class="row items-center gap-md">
                <div
                  class="shazam-pulse-ring"
                  :class="{ 'is-pulsing': isPlaying }"
                >
                  <q-icon name="graphic_eq" color="cyan-3" size="24px" />
                </div>
                <div>
                  <div
                    class="text-subtitle2 text-weight-bolder text-white row items-center gap-xs"
                  >
                    <span>Now Reciting Verse {{ currentAyahIndex + 1 }}</span>
                    <q-badge
                      color="cyan-9"
                      text-color="white"
                      class="text-caption"
                      >LIVE</q-badge
                    >
                  </div>
                  <div class="text-caption text-grey-4 text-truncate-1">
                    {{
                      currentAyahTranslation ||
                      'Listen, follow along with kinetic lyrics, or tap any line.'
                    }}
                  </div>
                </div>
              </div>

              <!-- Quick Jump Verse Selector -->
              <div class="row items-center gap-xs">
                <q-btn
                  round
                  flat
                  dense
                  color="grey-4"
                  icon="skip_previous"
                  :disable="currentAyahIndex <= 0"
                  @click="$emit('prev-ayah')"
                />
                <q-btn
                  round
                  unelevated
                  color="purple-6"
                  :icon="isPlaying ? 'pause' : 'play_arrow'"
                  @click="$emit('toggle-play')"
                />
                <q-btn
                  round
                  flat
                  dense
                  color="grey-4"
                  icon="skip_next"
                  :disable="currentAyahIndex >= (sura?.ayat?.length || 0) - 1"
                  @click="$emit('next-ayah')"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ── Right / Center: Synchronized Kinetic Lyrics Stream ── -->
        <section
          v-show="activeLayout !== 'video'"
          ref="lyricsViewport"
          class="stage-lyrics-column"
        >
          <!-- Bismillah Header -->
          <div
            v-if="sura?.id !== 9"
            class="bismillah-karaoke-header text-center q-my-lg"
          >
            <div class="bismillah-arabic font-amiri">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
            <div class="bismillah-trans text-caption text-grey-5 q-mt-xs">
              In the Name of Allah, the Most Compassionate, the Most Merciful
            </div>
          </div>

          <!-- Lyrics List -->
          <div class="lyrics-stream-list q-py-lg">
            <article
              v-for="(ayah, index) in sura?.ayat || []"
              :id="`shazam-lyric-verse-${ayah.verse}`"
              :key="`lyric-${ayah.verse}`"
              class="lyric-line-card"
              :class="{
                'is-active': index === currentAyahIndex,
                'is-past': index < currentAyahIndex,
                'is-future': index > currentAyahIndex,
              }"
              @click="onSelectAyah(index)"
            >
              <!-- Verse Header / Indicator -->
              <div
                class="lyric-line-top row items-center justify-between q-mb-sm"
              >
                <div class="row items-center gap-xs">
                  <span
                    class="verse-num-pill"
                    :class="{ 'is-active': index === currentAyahIndex }"
                  >
                    {{ ayah.verse }}
                  </span>
                  <span
                    v-if="index === currentAyahIndex"
                    class="live-glow-dot"
                  />
                </div>

                <div class="lyric-actions-hint text-caption">
                  <span
                    v-if="index === currentAyahIndex"
                    class="text-cyan-3 text-weight-bold"
                  >
                    {{
                      highlightMode === 'word'
                        ? 'Karaoke Word Sync'
                        : 'Active Ayah'
                    }}
                  </span>
                  <span v-else class="text-grey-6 play-hint">
                    Tap to play
                  </span>
                </div>
              </div>

              <!-- Main Arabic Text with Word-Level Glowing Karaoke -->
              <div class="lyric-arabic-text font-amiri" dir="rtl">
                <!-- If word sync is available -->
                <template v-if="getVerseWords(ayah.verse).length > 0">
                  <span
                    v-for="(word, wIdx) in getVerseWords(ayah.verse)"
                    :key="`${ayah.verse}-w-${wIdx}`"
                    class="lyric-word"
                    :class="{
                      'is-active-word': isWordActive(index, wIdx),
                      'is-passed-word': isWordPassed(index, wIdx),
                    }"
                  >
                    {{ word }}
                  </span>
                </template>
                <!-- Fallback plain text -->
                <template v-else>
                  {{ ayah.text }}
                </template>
              </div>

              <!-- Translation Subtitle -->
              <div
                v-if="ayah.translation"
                class="lyric-translation-text q-mt-sm"
              >
                {{ ayah.translation }}
              </div>
            </article>
          </div>
        </section>
      </main>

      <!-- Bottom Playback Dock -->
      <footer
        class="shazam-dock-footer row items-center justify-between no-wrap q-px-lg q-py-sm"
      >
        <!-- Left: Current Track Details -->
        <div class="row items-center gap-sm gt-xs">
          <q-avatar size="40px" square rounded class="album-thumb shadow-md">
            <img src="/logo.svg" alt="Peace2074" />
          </q-avatar>
          <div>
            <div class="text-body2 text-weight-bold text-white text-truncate-1">
              Surah {{ sura?.id }}. {{ sura?.e_name }} ({{ sura?.name }})
            </div>
            <div class="text-caption text-grey-4 text-truncate-1">
              Verse {{ currentAyahIndex + 1 }} · {{ reciterName }}
            </div>
          </div>
        </div>

        <!-- Center: Main Transport Controls -->
        <div class="row items-center gap-sm">
          <q-btn
            round
            flat
            color="grey-4"
            icon="skip_previous"
            size="md"
            :disable="currentAyahIndex <= 0"
            @click="$emit('prev-ayah')"
          >
            <q-tooltip>Previous Verse</q-tooltip>
          </q-btn>

          <q-btn
            round
            unelevated
            color="deep-purple-6"
            size="lg"
            class="dock-play-btn shadow-xl"
            :icon="isPlaying ? 'pause' : 'play_arrow'"
            @click="$emit('toggle-play')"
          >
            <q-tooltip>{{
              isPlaying ? 'Pause Recitation' : 'Play Recitation'
            }}</q-tooltip>
          </q-btn>

          <q-btn
            round
            flat
            color="grey-4"
            icon="skip_next"
            size="md"
            :disable="currentAyahIndex >= (sura?.ayat?.length || 0) - 1"
            @click="$emit('next-ayah')"
          >
            <q-tooltip>Next Verse</q-tooltip>
          </q-btn>
        </div>

        <!-- Right: Speed, Mode & Mobile View Selector -->
        <div class="row items-center gap-sm">
          <!-- Speed Menu -->
          <q-btn-dropdown
            dense
            rounded
            flat
            color="cyan-3"
            :label="`${playbackRate}x`"
            class="text-weight-bold"
            no-caps
          >
            <q-list dense class="bg-grey-10 text-white">
              <q-item
                v-for="rate in [0.75, 1, 1.25, 1.5, 2]"
                :key="rate"
                v-close-popup
                clickable
                :active="playbackRate === rate"
                active-class="text-cyan-3 text-weight-bold"
                @click="$emit('set-speed', rate)"
              >
                <q-item-section>{{ rate }}x</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Mobile Layout Mode Cycle -->
          <q-btn
            dense
            flat
            round
            color="white"
            icon="view_carousel"
            class="lt-md"
            @click="cycleMobileLayout"
          >
            <q-tooltip>Switch Video / Lyrics View</q-tooltip>
          </q-btn>
        </div>
      </footer>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface AyahItem {
  verse: number
  text: string
  translation?: string
}

interface SuraData {
  id: number
  name: string
  e_name: string
  total_verses: number
  ayat: AyahItem[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    sura: SuraData | null
    currentAyahIndex: number
    currentWordIndex: number
    highlightMode?: 'word' | 'ayah'
    isPlaying?: boolean
    playbackRate?: number
    reciterName?: string
    getSyncedWords?: (verseNumber: number) => string[]
  }>(),
  {
    highlightMode: 'word',
    isPlaying: false,
    playbackRate: 1,
    reciterName: 'Mishary Al-Afasy',
    getSyncedWords: () => [],
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle-play'): void
  (e: 'prev-ayah'): void
  (e: 'next-ayah'): void
  (e: 'seek-ayah', verseIndex: number): void
  (e: 'set-speed', rate: number): void
  (e: 'set-highlight-mode', mode: 'word' | 'ayah'): void
  (e: 'trigger-shazam'): void
}>()

const activeLayout = ref<'split' | 'lyrics' | 'video'>('split')
const lyricsViewport = ref<HTMLElement | null>(null)

// YouTube official playlist or surah video URL
const videoEmbedUrl = computed(() => {
  const suraId = props.sura?.id || 1
  return `https://www.youtube.com/embed/videoseries?list=PLEJ9VLBcEoKg&index=${suraId - 1}&autoplay=1&enablejsapi=1&rel=0`
})

// Current Ayah Translation for header ticker
const currentAyahTranslation = computed(() => {
  if (!props.sura?.ayat || props.currentAyahIndex < 0) return ''
  return props.sura.ayat[props.currentAyahIndex]?.translation || ''
})

function getVerseWords(verseNumber: number): string[] {
  if (props.getSyncedWords) {
    const words = props.getSyncedWords(verseNumber)
    if (words && words.length > 0) return words
  }
  const text = props.sura?.ayat?.[verseNumber - 1]?.text || ''
  return text.split(/\s+/).filter(Boolean)
}

function isWordActive(verseIndex: number, wordIndex: number): boolean {
  if (verseIndex !== props.currentAyahIndex) return false
  if (props.highlightMode === 'ayah') return true
  return wordIndex === props.currentWordIndex
}

function isWordPassed(verseIndex: number, wordIndex: number): boolean {
  if (verseIndex !== props.currentAyahIndex) return false
  if (props.highlightMode === 'ayah') return false
  return props.currentWordIndex > wordIndex
}

function onSelectAyah(index: number) {
  emit('seek-ayah', index)
}

function cycleMobileLayout() {
  if (activeLayout.value === 'split') activeLayout.value = 'lyrics'
  else if (activeLayout.value === 'lyrics') activeLayout.value = 'video'
  else activeLayout.value = 'split'
}

// Auto-scroll to center active verse smoothly
watch(
  () => props.currentAyahIndex,
  async (newIdx) => {
    if (!props.modelValue || newIdx < 0) return
    await nextTick()
    const targetEl = document.getElementById(`shazam-lyric-verse-${newIdx + 1}`)
    if (targetEl && lyricsViewport.value) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }
)

// Initial scroll when modal opens
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      const targetEl = document.getElementById(
        `shazam-lyric-verse-${props.currentAyahIndex + 1}`
      )
      if (targetEl && lyricsViewport.value) {
        targetEl.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        })
      }
    }
  }
)
</script>

<style scoped>
.shazam-theater-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(
    circle at 10% 20%,
    #17102e 0%,
    #0d0e15 50%,
    #060913 100%
  );
  color: #fff;
  position: relative;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
}

/* Ambient glow meshes */
.ambient-mesh {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  opacity: 0.35;
  z-index: 0;
}
.ambient-mesh-1 {
  width: 500px;
  height: 500px;
  background: #7928ca;
  top: -150px;
  right: -100px;
}
.ambient-mesh-2 {
  width: 600px;
  height: 600px;
  background: #0070f3;
  bottom: -200px;
  left: -150px;
}
.ambient-mesh-3 {
  width: 450px;
  height: 450px;
  background: #ff0080;
  top: 40%;
  left: 20%;
  opacity: 0.18;
}

/* Header */
.shazam-theater-header {
  height: 64px;
  background: rgba(13, 14, 21, 0.75);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
}

.shazam-badge-glow {
  background: linear-gradient(
    135deg,
    rgba(121, 40, 202, 0.4) 0%,
    rgba(0, 112, 243, 0.4) 100%
  );
  border: 1px solid rgba(0, 245, 212, 0.5);
  padding: 6px 14px;
  border-radius: 9999px;
  box-shadow: 0 0 20px rgba(121, 40, 202, 0.4);
}

.shazam-badge-text {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #fff 0%, #00f5d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Equalizer Bars Animation */
.shazam-equalizer-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 14px;
  margin-right: 8px;
}
.shazam-equalizer-bars .bar {
  width: 3px;
  background: #00f5d4;
  border-radius: 2px;
  height: 4px;
  transition: height 0.2s ease;
}
.shazam-equalizer-bars.is-active .bar-1 {
  animation: eqBounce 0.8s infinite ease-in-out alternate;
}
.shazam-equalizer-bars.is-active .bar-2 {
  animation: eqBounce 1.1s infinite 0.2s ease-in-out alternate;
}
.shazam-equalizer-bars.is-active .bar-3 {
  animation: eqBounce 0.7s infinite 0.4s ease-in-out alternate;
}
.shazam-equalizer-bars.is-active .bar-4 {
  animation: eqBounce 1s infinite 0.1s ease-in-out alternate;
}

@keyframes eqBounce {
  0% {
    height: 3px;
  }
  100% {
    height: 14px;
  }
}

/* Stage Layout */
.shazam-stage {
  flex: 1;
  display: grid;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.mode-split {
  grid-template-columns: 1fr 1fr;
}
.mode-lyrics {
  grid-template-columns: 1fr;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
.mode-video {
  grid-template-columns: 1fr;
}

@media (max-width: 960px) {
  .mode-split {
    grid-template-columns: 1fr;
    grid-template-rows: 240px 1fr;
  }
}

/* Video Column */
.stage-video-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
}

.video-card-frame {
  width: 100%;
  max-width: 640px;
  background: rgba(18, 19, 30, 0.85);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  backdrop-filter: blur(24px);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(121, 40, 202, 0.2);
}

.video-aspect-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  background: #000;
}
.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.shazam-radar-strip {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.shazam-pulse-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 245, 212, 0.12);
  border: 1px solid rgba(0, 245, 212, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.shazam-pulse-ring.is-pulsing {
  animation: pulseRadar 2s infinite ease-out;
}
@keyframes pulseRadar {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 245, 212, 0.6);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(0, 245, 212, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 245, 212, 0);
  }
}

/* Lyrics Column */
.stage-lyrics-column {
  overflow-y: auto;
  padding: 32px 36px 120px 36px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
.stage-lyrics-column::-webkit-scrollbar {
  width: 6px;
}
.stage-lyrics-column::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.bismillah-arabic {
  font-size: 2.2rem;
  color: #00f5d4;
  text-shadow: 0 0 25px rgba(0, 245, 212, 0.4);
}

/* Lyric Line Cards */
.lyric-line-card {
  padding: 24px 28px;
  margin-bottom: 24px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.lyric-line-card.is-future {
  opacity: 0.45;
  filter: blur(0.2px);
}
.lyric-line-card.is-future:hover {
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.05);
}

.lyric-line-card.is-past {
  opacity: 0.55;
}
.lyric-line-card.is-past:hover {
  opacity: 0.85;
}

.lyric-line-card.is-active {
  opacity: 1;
  background: linear-gradient(
    135deg,
    rgba(121, 40, 202, 0.18) 0%,
    rgba(0, 112, 243, 0.15) 100%
  );
  border: 1px solid rgba(0, 245, 212, 0.45);
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 245, 212, 0.15);
  transform: scale(1.02);
}

.verse-num-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
}
.verse-num-pill.is-active {
  background: #00f5d4;
  color: #0d0e15;
}

.live-glow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff0080;
  box-shadow: 0 0 8px #ff0080;
  animation: dotPulse 1.2s infinite alternate;
}
@keyframes dotPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.3);
    opacity: 1;
  }
}

/* Arabic Kinetic Typography */
.lyric-arabic-text {
  font-size: 2.1rem;
  line-height: 2.3;
  color: #f0f0f5;
  text-align: right;
  direction: rtl;
  user-select: none;
}
.is-active .lyric-arabic-text {
  color: #ffffff;
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.3);
}

/* Word-by-Word Karaoke Glowing Highlight */
.lyric-word {
  display: inline-block;
  padding: 0 3px;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.lyric-word.is-active-word {
  background: linear-gradient(135deg, #ffd700 0%, #00f5d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  transform: scale(1.14);
  text-shadow: 0 0 24px rgba(0, 245, 212, 0.9);
}

.lyric-word.is-passed-word {
  color: rgba(255, 255, 255, 0.85);
}

.lyric-translation-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}
.is-active .lyric-translation-text {
  color: #00f5d4;
  font-weight: 500;
  text-shadow: 0 0 12px rgba(0, 245, 212, 0.3);
}

/* Dock Footer */
.shazam-dock-footer {
  height: 80px;
  background: rgba(13, 14, 21, 0.88);
  backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
}

.dock-play-btn {
  background: linear-gradient(135deg, #7928ca 0%, #0070f3 100%);
  box-shadow: 0 0 24px rgba(121, 40, 202, 0.5);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.dock-play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 32px rgba(0, 245, 212, 0.6);
}

.album-thumb {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
