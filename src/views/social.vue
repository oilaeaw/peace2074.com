<template>
  <q-page padding class="social-page">
    <section class="social-header">
      <div class="text-h4 text-weight-bold">{{ t('pages.social.title') }}</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">
        {{ t('pages.social.subtitle') }}
      </div>
    </section>

    <!-- YouTube Community Section -->
    <section class="q-mt-xl">
      <div class="section-label q-mb-md">
        <q-icon name="smart_display" color="red" size="22px" class="q-mr-xs" />
        <span class="text-subtitle1 text-weight-bold">
          {{ t('pages.social.youtube.sectionTitle') }}
        </span>
      </div>

      <q-card class="yt-community-card" flat bordered>
        <div class="yt-banner" aria-hidden="true">
          <div class="yt-banner-gradient" />
          <div class="yt-banner-icon">
            <svg viewBox="0 0 48 48" class="yt-logo-svg" aria-label="YouTube" role="img">
              <rect width="48" height="48" rx="10" fill="#FF0000" />
              <polygon points="19,14 38,24 19,34" fill="white" />
            </svg>
          </div>
        </div>

        <q-card-section class="yt-info">
          <div class="yt-channel-name">{{ youtubeChannel.channelName }}</div>
          <div class="yt-channel-handle text-grey-6">{{ youtubeChannel.handle }}</div>
          <div class="yt-channel-desc q-mt-sm">
            {{ t('pages.social.youtube.channelDesc') }}
          </div>
        </q-card-section>

        <q-card-section class="yt-actions row q-gutter-sm">
          <q-btn
            id="yt-subscribe-btn"
            unelevated
            color="red"
            text-color="white"
            icon="subscriptions"
            :label="t('pages.social.youtube.subscribeBtn')"
            :href="youtubeChannel.subscribeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="yt-btn"
          />
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
        </q-card-section>

        <q-separator />

        <q-card-section class="yt-embed-notice row items-center q-gutter-sm">
          <q-icon name="info_outline" color="grey-6" size="18px" />
          <span class="text-caption text-grey-6">
            {{ t('pages.social.youtube.embedNotice') }}
          </span>
        </q-card-section>
      </q-card>

      <!-- Embedded YouTube Channel Videos -->
      <div class="yt-video-section q-mt-lg">
        <div class="yt-video-label q-mb-sm row items-center justify-between">
          <div class="row items-center">
            <q-icon name="play_circle" color="red" size="20px" class="q-mr-xs" />
            <span class="text-subtitle2 text-weight-bold">{{ t('pages.social.youtube.latestVideos') }}</span>
          </div>
          <q-btn
            flat
            dense
            no-caps
            color="red"
            icon-right="open_in_new"
            label="Watch on YouTube"
            :href="youtubeChannel.channelUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>

        <!-- Dynamic YouTube Video Grid if videos are fetched -->
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
                <q-icon name="play_arrow" size="36px" color="white" />
              </div>
            </div>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2 text-weight-bold video-title-clamp">{{ video.title }}</div>
              <div class="text-caption text-grey-6 q-mt-xs">{{ formatDate(video.published) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Channel Playlist Player Fallback -->
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

    <!-- Video Modal Player -->
    <q-dialog v-model="showPlayerModal">
      <q-card style="width: 800px; max-width: 95vw; background: #0f172a; color: white; border-radius: 16px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold text-ellipsis" style="max-width: 85%;">
            {{ activeVideo?.title }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="yt-video-wrapper" style="border-radius: 12px; overflow: hidden;">
            <iframe
              v-if="activeVideo"
              class="yt-channel-iframe"
              :src="activeVideo.embedUrl"
              :title="activeVideo.title"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <div class="row items-center justify-between q-mt-md">
            <div class="text-caption text-grey-4">{{ formatDate(activeVideo?.published) }}</div>
            <q-btn
              unelevated
              color="red"
              icon="open_in_new"
              label="Open on YouTube"
              :href="activeVideo?.url"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- TikTok Videos Section -->
    <section class="q-mt-xl">
      <div class="section-label q-mb-md">
        <q-icon name="music_note" color="pink-6" size="22px" class="q-mr-xs" />
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
              <q-icon name="smart_display" size="44px" color="grey-5" />
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface VideoItem {
  id: string
  title: string
  url: string
  embedUrl: string
  published: string
  thumbnail: string
  description: string
}

const { t } = useI18n()

const CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`

const youtubeChannel = {
  channelName: 'Peace2074',
  handle: '@Peace2074',
  channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}`,
  subscribeUrl: `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`,
  communityUrl: `https://www.youtube.com/channel/${CHANNEL_ID}/community`,
  embedPlaylistUrl: `https://www.youtube.com/embed?listType=playlist&list=${UPLOADS_PLAYLIST_ID}&rel=0`,
}

const videos = ref<VideoItem[]>([])
const showPlayerModal = ref(false)
const activeVideo = ref<VideoItem | null>(null)

function openVideoModal(video: VideoItem) {
  activeVideo.value = video
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
    embedUrl: 'https://www.tiktok.com/@abdullvocals/video/7604807153408331030',
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
  gap: 4px;
}

/* ── YouTube Community Card ── */
.yt-community-card {
  border-radius: 18px;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.yt-community-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(255, 0, 0, 0.12);
}

.yt-banner {
  position: relative;
  height: 140px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.yt-banner-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(255,0,0,0.18) 0%, transparent 70%);
  pointer-events: none;
}

.yt-banner-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 24px rgba(255,0,0,0.5));
  animation: ytPulse 3s ease-in-out infinite;
}

.yt-logo-svg {
  width: 72px;
  height: 72px;
}

@keyframes ytPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.yt-info {
  padding: 16px 20px 8px;
}

.yt-channel-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: inherit;
  line-height: 1.3;
}

.yt-channel-handle {
  font-size: 0.85rem;
  margin-top: 2px;
}

.yt-channel-desc {
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.82;
}

.yt-actions {
  padding: 8px 20px 16px;
}

.yt-btn {
  border-radius: 24px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.yt-embed-notice {
  padding: 10px 20px;
}

.yt-video-section {
  width: 100%;
}

.yt-video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.yt-video-card {
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.yt-video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.yt-thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}

.yt-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.yt-video-card:hover .yt-thumb-img {
  transform: scale(1.05);
}

.yt-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.yt-video-card:hover .yt-play-overlay {
  opacity: 1;
  background: rgba(220, 38, 38, 0.5);
}

.video-title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .video-grid {
    grid-template-columns: 1fr;
  }

  .yt-actions {
    flex-direction: column;
  }

  .yt-btn {
    width: 100%;
  }
}
</style>
