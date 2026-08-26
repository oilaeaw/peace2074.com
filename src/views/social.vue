<template>
  <q-page padding class="social-page">
    <section class="social-header">
      <div class="text-h4 text-weight-bold">{{ t('pages.social.title') }}</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">
        {{ t('pages.social.subtitle') }}
      </div>
    </section>

    <!-- Official YouTube Branded Channel Property & Community Section -->
    <section class="q-mt-xl">
      <div class="section-label q-mb-md row items-center justify-between wrap">
        <div class="row items-center">
          <svg viewBox="0 0 24 24" class="yt-header-icon-svg" aria-label="YouTube">
            <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span class="text-subtitle1 text-weight-bolder q-ml-xs">
            {{ t('pages.social.youtube.sectionTitle') }}
          </span>
          <q-badge color="red" class="q-ml-sm text-weight-bold yt-badge-pill">
            <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs" />
            Official Channel
          </q-badge>
        </div>
        <div class="row items-center q-gutter-xs text-caption text-grey-6">
          <q-icon name="tv" size="18px" color="red" />
          <span class="text-weight-medium">Big TV &amp; 4K Display Ready</span>
        </div>
      </div>

      <q-card class="yt-community-card" flat bordered>
        <!-- Branded Header Banner with Official YouTube Identity -->
        <div class="yt-banner">
          <div class="yt-banner-gradient" />
          <div class="yt-banner-content">
            <div class="yt-avatar-wrapper">
              <img src="/yt_avatar.png" alt="Peace2074 Channel Avatar" class="yt-avatar-img" />
              <svg viewBox="0 0 24 24" class="yt-verified-check-svg" aria-label="Verified">
                <circle cx="12" cy="12" r="10" fill="#0070F3" />
                <path fill="#FFFFFF" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            </div>
            <div class="yt-channel-meta text-white">
              <div class="yt-channel-title text-h5 text-weight-bolder row items-center">
                {{ youtubeChannel.channelName }}
                <span class="yt-official-pill q-ml-sm">PEACE2074</span>
              </div>
              <div class="yt-channel-handle text-caption opacity-90 row items-center q-mt-xs">
                <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs text-red" />
                {{ youtubeChannel.handle }} • Official YouTube Channel
              </div>
            </div>
          </div>
        </div>

        <q-card-section class="yt-info">
          <div class="yt-channel-desc text-body2">
            {{ t('pages.social.youtube.channelDesc') }}
          </div>
        </q-card-section>

        <!-- Official YouTube Action & Subscription Bar -->
        <q-card-section class="yt-actions row items-center justify-between wrap q-gutter-sm">
          <div class="row items-center q-gutter-sm">
            <!-- Official YouTube Subscribe Button -->
            <q-btn
              id="yt-subscribe-btn"
              unelevated
              color="red"
              text-color="white"
              :href="youtubeChannel.subscribeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="yt-btn yt-btn-subscribe shadow-3"
            >
              <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs text-h6" />
              <span>{{ t('pages.social.youtube.subscribeBtn') }}</span>
              <q-tooltip>Subscribe to Peace2074 on YouTube</q-tooltip>
            </q-btn>

            <!-- Visit YouTube Community -->
            <q-btn
              id="yt-community-btn"
              outline
              color="red"
              icon="group"
              :label="t('pages.social.youtube.communityBtn')"
              :href="youtubeChannel.communityUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="yt-btn"
            />
          </div>

          <!-- Native YouTube Subscribe Widget Iframe (Google Official) -->
          <div class="yt-widget-container">
            <iframe
              title="YouTube Channel Subscribe Widget"
              :src="`https://www.youtube.com/subscribe_embed?usegapi=1&channelid=${youtubeChannel.channelId}&layout=full&count=default`"
              style="border: 0; width: 170px; height: 48px; overflow: hidden; background: transparent;"
              scrolling="no"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="yt-embed-notice row items-center justify-between wrap q-gutter-sm">
          <div class="row items-center q-gutter-xs text-caption text-grey-6">
            <q-icon name="info_outline" color="grey-6" size="18px" />
            <span>{{ t('pages.social.youtube.embedNotice') }}</span>
          </div>
          <div class="text-caption text-grey-6 font-mono row items-center">
            <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs text-red" />
            Channel ID: {{ youtubeChannel.channelId }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Embedded YouTube Channel Videos Grid -->
      <div class="yt-video-section q-mt-lg">
        <div class="yt-video-label q-mb-md row items-center justify-between">
          <div class="row items-center">
            <svg viewBox="0 0 24 24" class="yt-play-icon-svg q-mr-xs" aria-label="Play">
              <path fill="#FF0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <span class="text-subtitle1 text-weight-bold">{{ t('pages.social.youtube.latestVideos') }}</span>
          </div>
          <q-btn
            flat
            dense
            no-caps
            color="red"
            icon-right="open_in_new"
            label="Open Channel on YouTube"
            :href="youtubeChannel.channelUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>

        <!-- Dynamic YouTube Video Grid -->
        <div v-if="videos.length > 0" class="yt-video-grid">
          <q-card
            v-for="video in videos"
            :key="video.id"
            flat
            bordered
            class="yt-video-card cursor-pointer"
            @click="openVideoModal(video)"
          >
            <div class="yt-thumb-wrapper">
              <img :src="video.thumbnail" :alt="video.title" class="yt-thumb-img" loading="lazy" />
              <div class="yt-play-overlay">
                <div class="yt-play-btn">
                  <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: white;">
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                </div>
              </div>
            </div>
            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-weight-bold video-title-clamp">{{ video.title }}</div>
              <div class="row items-center justify-between q-mt-sm text-caption text-grey-6">
                <span>{{ formatDate(video.published) }}</span>
                <span class="text-red font-weight-bold row items-center">
                  Watch Video <q-icon name="arrow_forward" size="14px" class="q-ml-xs" />
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Channel Uploads Playlist Iframe Fallback -->
        <div v-else class="yt-video-wrapper">
          <iframe
            class="yt-channel-iframe"
            :src="youtubeChannel.embedPlaylistUrl"
            title="Peace2074 YouTube Channel Videos"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>

    <!-- Complete 114 Surahs Quran Directory Section (Ordered 1 to 114) -->
    <section class="q-mt-xl">
      <div class="section-label q-mb-md row items-center justify-between">
        <div class="row items-center">
          <q-icon name="menu_book" color="primary" size="24px" class="q-mr-xs" />
          <span class="text-subtitle1 text-weight-bold">
            All 114 Surahs in Order (1 to 114)
          </span>
          <q-badge color="primary" class="q-ml-sm text-weight-bold" style="padding: 3px 8px; border-radius: 10px;">
            Complete Quran (114 Surahs)
          </q-badge>
        </div>
        <div class="text-caption text-grey-6 font-mono">
          Showing {{ filteredSurahs.length }} / 114
        </div>
      </div>

      <!-- Reciter & Search Filter Bar -->
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-select
          v-model="selectedReciterId"
          dense
          outlined
          emit-value
          map-options
          options-dense
          color="primary"
          class="bg-white rounded-borders col-12 col-sm-4"
          :options="reciterSelectOptions"
          label="Default Reciter (القارئ)"
        >
          <template #prepend>
            <q-icon name="mic" color="primary" />
          </template>
        </q-select>

        <q-input
          v-model="surahSearch"
          dense
          outlined
          placeholder="Search Surah by name or number (1 to 114)..."
          clearable
          color="primary"
          class="bg-white rounded-borders col-12 col-sm"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn-toggle
          v-model="surahTypeFilter"
          dense
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="dark"
          class="col-12 col-sm-auto"
          :options="[
            { label: 'All (114)', value: 'all' },
            { label: 'Meccan (86)', value: 'meccan' },
            { label: 'Medinan (28)', value: 'medinan' },
          ]"
        />
      </div>

      <!-- 114 Surahs Grid -->
      <div class="surah-grid">
        <q-card
          v-for="sura in filteredSurahs"
          :key="sura.id"
          flat
          bordered
          class="surah-card"
        >
          <q-card-section class="q-pa-sm row items-center justify-between no-wrap">
            <div class="row items-center q-gutter-sm">
              <div class="surah-badge">
                {{ sura.id }}
              </div>
              <div>
                <div class="text-subtitle2 text-weight-bold row items-center">
                  {{ sura.transliteration }}
                  <span class="text-caption text-grey-6 q-ml-xs">({{ sura.translation }})</span>
                  <q-badge v-if="hasChannelVideo(sura)" color="red" class="q-ml-xs" style="font-size: 0.65rem; padding: 2px 6px;">
                    <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs" />
                    Video
                  </q-badge>
                </div>
                <div class="text-caption text-grey-6">
                  {{ sura.type === 'meccan' ? 'Meccan' : 'Medinan' }} • {{ sura.total_verses }} Verses
                </div>
              </div>
            </div>
            <div class="text-h6 font-arabic text-primary text-weight-bolder">
              {{ sura.name }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="between" class="q-px-sm q-py-xs">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="play_circle"
              label="Play & Read"
              :to="`/quran/${sura.id}?autoplay=true`"
            />
            <q-btn
              flat
              dense
              no-caps
              color="red"
              @click="openSurahVideoModal(sura)"
            >
              <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs text-red" />
              <span>Watch Video</span>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </section>

    <!-- Video Modal Player Dialog -->
    <q-dialog v-model="showPlayerModal" :maximized="isTvMode">
      <q-card
        :style="isTvMode
          ? 'width: 100vw; height: 100vh; background: #000; color: white; border-radius: 0; display: flex; flex-direction: column; justify-between;'
          : 'width: 840px; max-width: 95vw; background: #0f172a; color: white; border-radius: 20px;'"
      >
        <q-card-section class="row items-center justify-between q-pb-none wrap q-gutter-xs">
          <div class="text-subtitle1 text-weight-bold text-ellipsis row items-center" style="max-width: 60%;">
            <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs text-red text-h6" />
            {{ activeVideo?.title }}
          </div>

          <div class="row items-center q-gutter-xs">
            <q-select
              v-if="activeSurah"
              v-model="modalSurahJumpId"
              dense
              outlined
              dark
              emit-value
              map-options
              options-dense
              color="red"
              style="width: 150px; font-size: 0.8rem;"
              :options="surahJumpOptions"
              label="Jump to Surah"
              @update:model-value="onSurahJump"
            />

            <!-- Big TV Mode Toggle -->
            <q-btn
              flat
              round
              dense
              color="red"
              :icon="isTvMode ? 'fullscreen_exit' : 'tv'"
              @click="isTvMode = !isTvMode"
            >
              <q-tooltip>{{ isTvMode ? 'Exit Big TV Mode' : 'Big TV Mode' }}</q-tooltip>
            </q-btn>

            <q-btn icon="close" flat round dense v-close-popup color="white" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="yt-video-wrapper" style="border-radius: 14px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
            <iframe
              v-if="activeVideo"
              class="yt-channel-iframe"
              :src="activeVideo.embedUrl"
              :title="activeVideo.title"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <!-- Multi-Reciter Selector Bar for Surahs -->
          <div v-if="activeSurah" class="q-mt-sm q-pa-xs rounded-borders" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
            <div class="row items-center justify-between q-px-xs q-mb-xs">
              <div class="text-caption text-grey-4 text-weight-bold row items-center">
                <q-icon name="mic" color="red" class="q-mr-xs" size="16px" />
                <span>Quran Reciter:</span>
              </div>
              <div class="text-caption text-red text-weight-bold font-arabic">
                {{ selectedReciter.nameAr }}
              </div>
            </div>
            <div class="row items-center q-gutter-xs wrap">
              <q-chip
                v-for="r in reciterList"
                :key="r.id"
                clickable
                dense
                size="sm"
                :color="selectedReciter.id === r.id ? 'red' : 'grey-9'"
                text-color="white"
                class="text-weight-bold"
                @click="changeReciterForSurah(r)"
              >
                <q-avatar v-if="selectedReciter.id === r.id" icon="check" color="white" text-color="red" size="16px" />
                {{ r.name }}
              </q-chip>
            </div>
          </div>

          <div v-if="activeVideo?.description" class="q-mt-md text-caption text-grey-3 video-desc-scroll" style="max-height: 90px; overflow-y: auto; line-height: 1.5; white-space: pre-line;">
            {{ activeVideo.description }}
          </div>
          <div class="row items-center justify-between q-mt-md wrap q-gutter-sm">
            <div v-if="activeSurah" class="row items-center q-gutter-xs">
              <q-btn
                outline
                dense
                no-caps
                color="white"
                icon="chevron_left"
                :disabled="activeSurah.id <= 1"
                @click="playPrevSurah"
              >
                <span class="q-mx-xs">Prev Surah</span>
                <q-badge color="grey-8" text-color="white" style="font-size: 0.65rem;">← Key</q-badge>
              </q-btn>
              <q-btn
                outline
                dense
                no-caps
                color="white"
                :disabled="activeSurah.id >= 114"
                @click="playNextSurah"
              >
                <span class="q-mx-xs">Next Surah</span>
                <q-badge color="grey-8" text-color="white" style="font-size: 0.65rem;">→ Key</q-badge>
                <q-icon name="chevron_right" class="q-ml-xs" />
              </q-btn>
            </div>
            <div v-else class="text-caption text-grey-4">{{ formatDate(activeVideo?.published) }}</div>

            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                color="red"
                :href="youtubeChannel.subscribeUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <font-awesome-icon :icon="['fab', 'youtube']" class="q-mr-xs" />
                <span>Subscribe</span>
              </q-btn>
              <q-btn
                outline
                color="white"
                icon="open_in_new"
                label="Watch on YouTube"
                :href="activeVideo?.url"
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- TikTok Videos Section -->
    <section class="q-mt-xl">
      <div class="section-label q-mb-md row items-center">
        <font-awesome-icon :icon="['fab', 'tiktok']" class="q-mr-xs text-h6 text-pink-6" />
        <span class="text-subtitle1 text-weight-bold">
          {{ t('pages.social.featuredVideos') }}
        </span>
      </div>

      <div class="video-grid">
        <q-card
          v-for="(video, index) in tiktokSlots"
          :key="video.videoId"
          flat
          bordered
          class="video-card"
        >
          <div class="video-frame">
            <iframe
              v-if="video.embedUrl"
              :src="video.embedUrl"
              :title="`TikTok video ${index + 1} from ${video.creator}`"
              class="video-iframe"
              allowfullscreen
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
            />

            <div
              v-else
              class="video-placeholder"
              :aria-label="`TikTok slot ${index + 1}`"
            >
              <font-awesome-icon :icon="['fab', 'tiktok']" class="text-h2 text-grey-5" />
              <div class="slot-index">#{{ index + 1 }}</div>
            </div>
          </div>

          <q-card-section class="video-meta">
            <div class="text-caption text-grey-6">{{ video.creator }}</div>
          </q-card-section>

          <q-card-actions v-if="video.watchUrl" align="right">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="open_in_new"
              :aria-label="`Open TikTok video ${index + 1}`"
              :href="video.watchUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
          </q-card-actions>
        </q-card>
      </div>
    </section>

    <section class="q-mt-xl">
      <q-banner rounded class="legal-banner">
        <template #avatar>
          <q-icon name="gavel" color="primary" />
        </template>

        <div class="text-subtitle2 text-weight-bold">
          {{ t('pages.social.legalTitle') }}
        </div>
        <div class="q-mt-xs">
          {{ t('pages.social.legalOwnership') }}
        </div>
        <div class="q-mt-sm text-caption">
          {{ t('pages.social.legalPrivacy') }}
        </div>
      </q-banner>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import chaptersEn from '@/shared/data/chapters/en.json'

interface VideoItem {
  id: string
  title: string
  url: string
  embedUrl: string
  published: string
  thumbnail: string
  description: string
}

interface ChapterItem {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

const { t } = useI18n()

const CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`

const youtubeChannel = {
  channelId: CHANNEL_ID,
  channelName: 'Peace2074',
  handle: '@Peace2074',
  channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}`,
  subscribeUrl: `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`,
  communityUrl: `https://www.youtube.com/channel/${CHANNEL_ID}/community`,
  embedPlaylistUrl: `https://www.youtube.com/embed?listType=playlist&list=${UPLOADS_PLAYLIST_ID}&rel=0`,
}

const videos = ref<VideoItem[]>([])
const showPlayerModal = ref(false)
const isTvMode = ref(false)
const activeVideo = ref<VideoItem | null>(null)
const surahSearch = ref('')
const surahTypeFilter = ref<'all' | 'meccan' | 'medinan'>('all')

const allSurahs = chaptersEn as ChapterItem[]

interface ReciterInfo {
  id: string
  name: string
  nameAr: string
}

const reciterList: ReciterInfo[] = [
  { id: 'alafasy', name: 'Mishary Alafasy', nameAr: 'مشاري العفاسي' },
  { id: 'abdulbasit', name: 'Abdul Basit', nameAr: 'عبد الباسط عبد الصمد' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي' },
  { id: 'muaiqly', name: 'Maher Al-Muaiqly', nameAr: 'ماهر المعيقلي' },
  { id: 'shatri', name: 'Abu Bakr Al-Shatri', nameAr: 'أبو بكر الشاطري' },
]

const RECITER_STORAGE_KEY = 'pref-social-reciter'
const savedReciterId = typeof localStorage !== 'undefined' ? localStorage.getItem(RECITER_STORAGE_KEY) : null
const initialReciterId = savedReciterId && reciterList.some(r => r.id === savedReciterId) ? savedReciterId : 'alafasy'

const activeSurah = ref<ChapterItem | null>(null)
const selectedReciterId = ref<string>(initialReciterId)
const selectedReciter = ref<ReciterInfo>(reciterList.find(r => r.id === initialReciterId) || reciterList[0])

const reciterSelectOptions = computed(() => {
  return reciterList.map((r) => ({
    label: `${r.name} (${r.nameAr})`,
    value: r.id,
  }))
})

watch(selectedReciterId, (newId) => {
  const found = reciterList.find((r) => r.id === newId)
  if (found) {
    selectedReciter.value = found
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(RECITER_STORAGE_KEY, newId)
    }
  }
})

function playNextSurah() {
  if (!activeSurah.value) return
  const nextId = activeSurah.value.id + 1
  if (nextId <= 114) {
    const nextSurah = allSurahs.find((s) => s.id === nextId)
    if (nextSurah) {
      openSurahVideoModal(nextSurah)
    }
  }
}

function playPrevSurah() {
  if (!activeSurah.value) return
  const prevId = activeSurah.value.id - 1
  if (prevId >= 1) {
    const prevSurah = allSurahs.find((s) => s.id === prevId)
    if (prevSurah) {
      openSurahVideoModal(prevSurah)
    }
  }
}

const filteredSurahs = computed(() => {
  let list = allSurahs

  if (surahTypeFilter.value !== 'all') {
    list = list.filter((sura: ChapterItem) => sura.type === surahTypeFilter.value)
  }

  if (!surahSearch.value || !surahSearch.value.trim()) {
    return list
  }
  const q = surahSearch.value.trim().toLowerCase()
  return list.filter((sura: ChapterItem) => {
    return (
      String(sura.id) === q ||
      sura.transliteration.toLowerCase().includes(q) ||
      sura.translation.toLowerCase().includes(q) ||
      sura.name.includes(q)
    )
  })
})

function getChannelVideo(sura: ChapterItem): VideoItem | null {
  if (!videos.value || videos.value.length === 0) return null
  const transLower = sura.transliteration.toLowerCase()
  const suraIdStr = String(sura.id)
  return (
    videos.value.find((v) => {
      const titleLower = v.title.toLowerCase()
      return (
        titleLower.includes(transLower) ||
        titleLower.includes(`surah ${suraIdStr}`) ||
        titleLower.includes(`sura ${suraIdStr}`) ||
        titleLower.includes(`surah #${suraIdStr}`)
      )
    }) || null
  )
}

function hasChannelVideo(sura: ChapterItem): boolean {
  return Boolean(getChannelVideo(sura))
}

function changeReciterForSurah(reciter: ReciterInfo) {
  selectedReciter.value = reciter
  selectedReciterId.value = reciter.id
  if (!activeSurah.value) return

  const sura = activeSurah.value
  activeVideo.value = {
    id: `sura-${sura.id}-${reciter.id}`,
    title: `Surah ${sura.id}. ${sura.transliteration} (${sura.name}) — Recited by ${reciter.name} (${reciter.nameAr})`,
    url: `https://www.youtube.com/results?search_query=Surah+${encodeURIComponent(sura.transliteration)}+${encodeURIComponent(reciter.name)}+Peace2074`,
    embedUrl: `https://www.youtube.com/embed?listType=playlist&list=${UPLOADS_PLAYLIST_ID}&rel=0`,
    published: new Date().toISOString(),
    thumbnail: `https://i.ytimg.com/vi/surah-${sura.id}/hqdefault.jpg`,
    description: `Recitation of Surah ${sura.transliteration} (${sura.name}) by Sheikh ${reciter.name} (${reciter.nameAr}). Chapter ${sura.id} of the Holy Quran (${sura.total_verses} verses, ${sura.type === 'meccan' ? 'Meccan' : 'Medinan'}). Featured on Peace2074.`,
  }
}

function openVideoModal(video: VideoItem) {
  activeSurah.value = null
  activeVideo.value = video
  showPlayerModal.value = true
}

const modalSurahJumpId = ref<number | null>(null)

const surahJumpOptions = computed(() => {
  return allSurahs.map((s) => ({
    label: `${s.id}. ${s.transliteration}`,
    value: s.id,
  }))
})

function onSurahJump(id: number) {
  const found = allSurahs.find((s) => s.id === id)
  if (found) {
    openSurahVideoModal(found)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!showPlayerModal.value || !activeSurah.value) return
  if (e.key === 'ArrowRight') {
    playNextSurah()
  } else if (e.key === 'ArrowLeft') {
    playPrevSurah()
  }
}

function openSurahVideoModal(sura: ChapterItem) {
  activeSurah.value = sura
  modalSurahJumpId.value = sura.id
  const matched = getChannelVideo(sura)

  if (matched) {
    activeVideo.value = matched
  } else {
    changeReciterForSurah(selectedReciter.value)
  }

  showPlayerModal.value = true
}

function formatDate(isoString?: string) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    const res = await fetch('/api/youtube/videos')
    if (res.ok) {
      const data = await res.json()
      if (data?.ok && Array.isArray(data.videos) && data.videos.length > 0) {
        videos.value = data.videos
      }
    }
  } catch (err) {
    console.warn('[Social] Failed to fetch YouTube videos:', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const tiktokSlots = [
  {
    videoId: '7614273496935386390',
    creator: '@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7614273496935386390',
    watchUrl: 'https://www.tiktok.com/@abdullvocals/video/7614273496935386390',
  },
  {
    videoId: '7604807153408331030',
    creator: '@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7604807153408331030',
    watchUrl: 'https://www.tiktok.com/@abdullvocals/video/7604807153408331030',
  },
  {
    videoId: '7617605509402725655',
    creator: '@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7617605509402725655',
    watchUrl: 'https://www.tiktok.com/@abdullvocals/video/7617605509402725655',
  },
]
</script>

<style scoped>
.social-page {
  max-width: 960px;
  margin: 0 auto;
}

.social-header {
  text-align: center;
}

.section-label {
  display: flex;
  align-items: center;
}

.yt-header-icon-svg {
  width: 28px;
  height: 28px;
}

.yt-play-icon-svg {
  width: 24px;
  height: 24px;
}

.yt-badge-pill {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* ── Branded YouTube Channel Card ── */
.yt-community-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(255, 0, 0, 0.08);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.yt-community-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 44px rgba(255, 0, 0, 0.16);
}

.yt-banner {
  position: relative;
  height: 180px;
  background: url('/yt_banner.png') center/cover no-repeat, linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #881337 100%);
  display: flex;
  align-items: flex-end;
  padding: 20px 24px;
  overflow: hidden;
}

.yt-banner-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 85% 15%, rgba(255, 0, 0, 0.4) 0%, transparent 65%);
  pointer-events: none;
}

.yt-banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
}

.yt-avatar-wrapper {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  padding: 4px;
  background: #ffffff;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
}

.yt-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.yt-verified-check-svg {
  position: absolute;
  bottom: 0;
  right: -2px;
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.yt-official-pill {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 9px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.yt-info {
  padding: 18px 24px 8px;
}

.yt-channel-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.88;
}

.yt-actions {
  padding: 12px 24px 20px;
}

.yt-btn {
  border-radius: 24px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 8px 22px;
}

.yt-btn-subscribe {
  background: #FF0000 !important;
  animation: ytGlow 3s infinite ease-in-out;
}

.yt-btn-subscribe:hover {
  background: #CC0000 !important;
}

@keyframes ytGlow {
  0%, 100% { box-shadow: 0 0 14px rgba(255, 0, 0, 0.45); }
  50% { box-shadow: 0 0 28px rgba(255, 0, 0, 0.85); }
}

.yt-widget-container {
  display: flex;
  align-items: center;
}

.yt-embed-notice {
  padding: 12px 24px;
}

.yt-video-section {
  width: 100%;
}

.yt-video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.yt-video-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.yt-video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(255, 0, 0, 0.15);
}

.yt-thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0f172a;
  overflow: hidden;
}

.yt-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.yt-video-card:hover .yt-thumb-img {
  transform: scale(1.06);
}

.yt-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.yt-play-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 0, 0, 0.5);
  transition: transform 0.2s ease;
}

.yt-video-card:hover .yt-play-btn {
  transform: scale(1.15);
  background: #FF0000;
}

.video-title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.yt-video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
}

.yt-channel-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* ── 114 Surahs Section ── */
.surah-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.surah-card {
  border-radius: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.surah-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.surah-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.font-arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', serif;
}

/* ── TikTok Videos ── */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.video-card {
  overflow: hidden;
  border-radius: 18px;
}

.video-meta {
  padding-bottom: 0;
}

.legal-banner {
  background: #eff6ff;
  color: #1e3a8a;
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.video-frame {
  aspect-ratio: 9 / 16;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #cbd5e1;
}

.slot-index {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

@media (max-width: 640px) {
  .video-grid, .surah-grid {
    grid-template-columns: 1fr;
  }

  .yt-banner {
    height: 180px;
  }

  .yt-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .yt-btn {
    width: 100%;
  }

  .yt-widget-container {
    justify-content: center;
  }
}
</style>
