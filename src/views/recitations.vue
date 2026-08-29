<template>
  <q-page class="recitations-page">
    <div class="container">
      <!-- Header Banner -->
      <div class="header-banner">
        <div class="badge">
          <q-icon name="smart_display" size="18px" />
          <span>YouTube Official Channel · 114 Surahs</span>
        </div>
        <h1 class="page-title">{{ t('pages.recitations.title') || 'Quran YouTube Recitations' }}</h1>
        <p class="page-subtitle">
          Watch, listen, and follow along with word-by-word synchronized Uthmani Quran text & translations.
        </p>
      </div>

      <!-- Main Player & Recitation Section -->
      <div class="player-grid">
        <!-- Main YouTube Player & Synchronized Text Card -->
        <div class="player-column">
          <q-card flat class="video-card">
            <div class="video-aspect">
              <iframe
                :src="activeYoutubeEmbedUrl"
                title="Quran Recitation HD Video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <div class="video-info q-pa-md">
              <div class="row items-center justify-between no-wrap">
                <div>
                  <h2 class="sura-heading text-weight-bold">
                    Surah {{ activeSuraId }}: {{ currentSuraData?.e_name }} ({{ currentSuraData?.name }})
                  </h2>
                  <div class="sura-meta text-caption text-grey-7">
                    {{ currentSuraData?.total_verses || currentSuraData?.ayat?.length || 0 }} Verses · Reciter Sheikh Mishary Alafasy
                  </div>
                </div>

                <div class="row gap-sm items-center">
                  <q-btn
                    flat
                    round
                    color="primary"
                    :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                    @click="$q.dark.toggle()"
                  >
                    <q-tooltip>Toggle Theme</q-tooltip>
                  </q-btn>
                  <q-btn
                    unelevated
                    color="primary"
                    icon="open_in_new"
                    label="Open on YouTube"
                    :href="activeYoutubeDirectUrl"
                    target="_blank"
                    no-caps
                  />
                </div>
              </div>
            </div>
          </q-card>

          <!-- Interactive Verse Follow-Along Reader -->
          <q-card flat class="verses-card q-mt-md">
            <div class="card-header q-pa-md row items-center justify-between">
              <div class="row items-center gap-sm">
                <q-icon name="menu_book" size="22px" color="primary" />
                <span class="text-subtitle1 text-weight-bold">Synchronized Verse Reader</span>
              </div>
              <div class="row items-center gap-xs">
                <q-btn
                  flat
                  dense
                  no-caps
                  :color="readerMode === 'card' ? 'primary' : 'grey-7'"
                  label="Cards"
                  icon="view_agenda"
                  @click="readerMode = 'card'"
                />
                <q-btn
                  flat
                  dense
                  no-caps
                  :color="readerMode === 'mushaf' ? 'primary' : 'grey-7'"
                  label="Mushaf"
                  icon="auto_stories"
                  @click="readerMode = 'mushaf'"
                />
              </div>
            </div>

            <q-separator />

            <div class="q-pa-md verses-scroll" :class="{ 'mushaf-flow': readerMode === 'mushaf' }">
              <div v-if="readerMode === 'card'" class="verse-cards-list">
                <div
                  v-for="(aya, idx) in currentSuraData?.ayat || []"
                  :key="idx"
                  class="verse-card-item q-pa-md q-mb-sm"
                  :class="{ 'active-verse': activeVerseIndex === idx }"
                  @click="activeVerseIndex = idx"
                >
                  <div class="row items-center justify-between q-mb-sm">
                    <span class="verse-badge">Verse {{ idx + 1 }}</span>
                    <q-btn flat round dense icon="bookmark_border" size="sm" />
                  </div>
                  <div class="arabic-text text-right font-amiri text-h5 q-mb-xs">
                    {{ aya.text }}
                  </div>
                  <div class="translation-text text-body2 text-grey-8">
                    {{ aya.translation || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' }}
                  </div>
                </div>
              </div>

              <!-- Mushaf Layout -->
              <div v-else class="mushaf-paragraph font-amiri text-h5 dir-rtl text-justify">
                <span
                  v-for="(aya, idx) in currentSuraData?.ayat || []"
                  :key="idx"
                  class="aya-inline"
                  :class="{ 'active-verse-inline': activeVerseIndex === idx }"
                  @click="activeVerseIndex = idx"
                >
                  {{ aya.text }}
                  <span class="verse-num">({{ idx + 1 }})</span>
                </span>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Sidebar: Surah Selector & Search (1 to 114) -->
        <div class="sidebar-column">
          <q-card flat class="surah-list-card">
            <div class="q-pa-md border-bottom">
              <q-input
                v-model="searchQuery"
                dense
                outlined
                clearable
                placeholder="Search Surah 1-114..."
                class="search-input"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <q-scroll-area style="height: 640px;">
              <q-list separator class="surah-list">
                <q-item
                  v-for="suraItem in filteredSurahList"
                  :key="suraItem.id"
                  clickable
                  v-ripple
                  :active="activeSuraId === suraItem.id"
                  active-class="active-sura-item"
                  @click="selectSurah(suraItem.id)"
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="32px">
                      {{ suraItem.id }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ suraItem.e_name }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ suraItem.total_verses || suraItem.ayat?.length || 0 }} Verses
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <span class="arabic-name font-amiri text-subtitle1">
                      {{ suraItem.name }}
                    </span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card>

          <!-- Quick Navigation Link Card -->
          <q-card flat class="quick-card q-mt-md q-pa-md">
            <div class="row items-center gap-sm q-mb-sm">
              <q-icon name="playlist_play" size="24px" color="primary" />
              <span class="text-subtitle2 text-weight-bold">YouTube Official Playlist</span>
            </div>
            <p class="text-caption text-grey-7 q-mb-md">
              Watch all 114 Surahs directly on YouTube or continue listening inside Peace2074.
            </p>
            <q-btn
              block
              color="secondary"
              icon="video_library"
              label="Open Full 114 Playlist"
              href="https://www.youtube.com/playlist?list=PLEJ9VLBcEoKg"
              target="_blank"
              no-caps
              class="full-width"
            />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useQ2P from '@/composables/useQ2P'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const q2p = useQ2P()

const activeSuraId = ref<number>(1)
const searchQuery = ref<string>('')
const activeVerseIndex = ref<number>(0)
const readerMode = ref<'card' | 'mushaf'>('card')

const YOUTUBE_CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'
const YOUTUBE_PLAYLIST_ID = 'PLEJ9VLBcEoKg'

// Surah metadata list 1 to 114
const allSurahs = computed(() => q2p.GetQ.value || [])

const filteredSurahList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return allSurahs.value

  return allSurahs.value.filter((s: any) => {
    const idMatch = String(s.id).includes(query)
    const nameEnMatch = (s.e_name || '').toLowerCase().includes(query)
    const nameArMatch = (s.name || '').includes(query)
    return idMatch || nameEnMatch || nameArMatch
  })
})

const currentSuraData = computed(() => {
  return allSurahs.value.find((s: any) => s.id === activeSuraId.value) || allSurahs.value[0]
})

const activeYoutubeEmbedUrl = computed(() => {
  return `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_PLAYLIST_ID}&index=${activeSuraId.value - 1}&autoplay=1`
})

const activeYoutubeDirectUrl = computed(() => {
  return `https://www.youtube.com/watch?v=videoseries&list=${YOUTUBE_PLAYLIST_ID}&index=${activeSuraId.value - 1}`
})

function selectSurah(id: number) {
  activeSuraId.value = id
  activeVerseIndex.value = 0
  router.replace({ query: { ...route.query, surah: String(id) } })
}

onMounted(() => {
  q2p.init(1)
  const querySurah = Number(route.query.surah || route.query.id || 1)
  if (querySurah >= 1 && querySurah <= 114) {
    activeSuraId.value = querySurah
  }
})

watch(() => route.query.surah, (newVal) => {
  const num = Number(newVal)
  if (num >= 1 && num <= 114) {
    activeSuraId.value = num
  }
})
</script>

<style scoped lang="scss">
.recitations-page {
  min-height: 100dvh;
  padding: 24px 16px 80px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 48%, #f8fbff 100%);
  color: #0f172a;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
}

.header-banner {
  margin-bottom: 24px;
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.page-title {
  margin: 0 0 8px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0 auto;
  max-width: 680px;
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
}

.player-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

@media (max-width: 960px) {
  .player-grid {
    grid-template-columns: 1fr;
  }
}

.video-card, .verses-card, .surah-list-card, .quick-card {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.video-aspect {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.verses-scroll {
  max-height: 480px;
  overflow-y: auto;
}

.verse-card-item {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(248, 250, 252, 0.8);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(37, 99, 235, 0.4);
    background: rgba(239, 246, 255, 0.9);
  }

  &.active-verse {
    border-color: #2563eb;
    background: rgba(239, 246, 255, 1);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }
}

.verse-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.1);
}

.font-amiri {
  font-family: 'Amiri', 'Scheherazade', serif;
  line-height: 2.2;
}

.mushaf-flow {
  line-height: 2.6;
}

.aya-inline {
  display: inline;
  margin: 0 4px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;

  &.active-verse-inline {
    background: rgba(254, 240, 138, 0.9);
    color: #000;
  }
}

.verse-num {
  font-size: 0.85rem;
  color: #b45309;
  font-weight: bold;
}

.border-bottom {
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.active-sura-item {
  background: rgba(37, 99, 235, 0.1) !important;
  color: #2563eb !important;
}

.arabic-name {
  font-weight: 700;
  color: #1e293b;
}

/* ── Dark Mode Styling ── */
:global(body.body--dark) .recitations-page {
  background: linear-gradient(180deg, #020617 0%, #091325 48%, #020617 100%);
  color: #f8fafc;
}

:global(body.body--dark) .badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

:global(body.body--dark) .page-subtitle {
  color: #94a3b8;
}

:global(body.body--dark) .video-card,
:global(body.body--dark) .verses-card,
:global(body.body--dark) .surah-list-card,
:global(body.body--dark) .quick-card {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.15);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

:global(body.body--dark) .verse-card-item {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(148, 163, 184, 0.1);

  &:hover {
    background: rgba(30, 41, 59, 0.9);
  }

  &.active-verse {
    background: rgba(30, 58, 138, 0.4);
    border-color: #3b82f6;
  }
}

:global(body.body--dark) .translation-text {
  color: #cbd5e1 !important;
}

:global(body.body--dark) .arabic-name {
  color: #f8fafc;
}
</style>
