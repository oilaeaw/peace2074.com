<template>
  <q-page padding class="social-page">
    <section class="social-header">
      <div class="text-h4 text-weight-bold">{{ t('pages.social.title') }}</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">
        {{ t('pages.social.subtitle') }}
      </div>
    </section>

    <section class="video-grid q-mt-xl">
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
}
</style>
