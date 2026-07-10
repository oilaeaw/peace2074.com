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
          <div class="yt-channel-name">{{ t('pages.social.youtube.channelName') }}</div>
          <div class="yt-channel-handle text-grey-6">{{ t('pages.social.youtube.channelHandle') }}</div>
          <div class="yt-channel-desc q-mt-sm">
            {{ t('pages.social.youtube.channelDesc') }}
          </div>
        </q-card-section>

        <q-card-section class="yt-actions row q-gutter-sm">
          <q-btn
            id="yt-community-btn"
            unelevated
            color="red"
            text-color="white"
            icon="group"
            :label="t('pages.social.youtube.communityBtn')"
            :href="youtubeChannel.communityUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="yt-btn"
          />
          <q-btn
            id="yt-subscribe-btn"
            outline
            color="red"
            icon="notifications"
            :label="t('pages.social.youtube.subscribeBtn')"
            :href="youtubeChannel.channelUrl"
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
    </section>

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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const youtubeChannel = {
  channelUrl: 'https://www.youtube.com/channel/UCiuUJUpeWXxWwDSpPKoEVbQ',
  communityUrl: 'https://www.youtube.com/channel/UCiuUJUpeWXxWwDSpPKoEVbQ/community',
}

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
