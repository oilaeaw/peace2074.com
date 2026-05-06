<template>
  <q-page padding class="social-page">
    <section class="hero q-mb-xl text-center">
      <div class="text-h4 text-weight-bold">{{ t('pages.social.title') }}</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">
        {{ t('pages.social.subtitle') }}
      </div>
    </section>

    <!-- Follow us -->
    <div class="section-label text-overline text-grey-5 q-mb-sm">
      {{ t('pages.social.followUs') }}
    </div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="handle in handles"
        :key="handle.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
          class="social-card"
          :class="`social-card--${handle.id}`"
        >
          <q-card-section class="row items-center q-gutter-md">
            <q-avatar :color="handle.color" text-color="white" size="48px">
              <q-icon :name="handle.icon" size="26px" />
            </q-avatar>
            <div class="col">
              <div class="text-weight-bold">{{ handle.label }}</div>
              <div class="text-caption text-grey-6">{{ handle.handle }}</div>
            </div>
            <q-btn
              flat
              round
              icon="open_in_new"
              :href="handle.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`Open ${handle.label}`"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Featured Videos -->
    <div class="section-label text-overline text-grey-5 q-mb-xs">
      {{ t('pages.social.featuredVideos') }}
    </div>
    <div class="text-caption text-grey-6 q-mb-md">
      {{ t('pages.social.featuredVideosSubtitle') }}
    </div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="video in featuredVideos"
        :key="video.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat bordered>
          <q-video :src="video.embedUrl" :ratio="9 / 16" :title="video.title" />
          <q-card-section class="q-pt-sm q-pb-xs">
            <div class="text-body2 text-weight-medium">{{ video.title }}</div>
            <div class="row items-center q-mt-xs q-gutter-xs">
              <q-icon name="music_note" size="14px" color="grey-6" />
              <a
                :href="video.artistUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-caption text-primary"
                >{{ video.artist }}</a
              >
              <span class="text-caption text-grey-5">{{
                video.artistHandle
              }}</span>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-py-xs">
            <div class="row items-center justify-between">
              <span class="text-caption text-grey-5">
                © {{ video.artist }} — all rights reserved. Embedded via TikTok
                official embed.
              </span>
              <a
                :href="`https://www.tiktok.com/@${video.artistHandle.replace('@', '')}/video/${video.id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-caption text-grey-6 row items-center q-gutter-xs"
              >
                <q-icon name="open_in_new" size="12px" />
                <span>Watch on TikTok</span>
              </a>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Share a verse -->
    <div class="section-label text-overline text-grey-5 q-mb-sm">
      {{ t('pages.social.shareVerse') }}
    </div>
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="selectedSura"
              :options="suraOptions"
              :label="t('pages.social.selectSura')"
              emit-value
              map-options
              filled
              dense
              use-input
              input-debounce="200"
              @filter="filterSuras"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="selectedAyah"
              type="number"
              :label="t('pages.social.selectAyah')"
              filled
              dense
              min="1"
            />
          </div>
          <div class="col-12 col-sm-4 row items-center">
            <q-btn
              color="primary"
              icon="search"
              :label="t('pages.social.loadVerse')"
              :loading="loadingVerse"
              @click="loadVerse"
              class="full-width"
            />
          </div>
        </div>

        <!-- Verse preview card -->
        <div v-if="verseCard" class="verse-preview-wrap q-mt-md">
          <div ref="verseCardRef" class="verse-card">
            <div class="verse-card__logo">PEACE2074</div>
            <div class="verse-card__arabic" dir="rtl">
              {{ verseCard.arabic }}
            </div>
            <div class="verse-card__translation">
              {{ verseCard.translation }}
            </div>
            <div class="verse-card__ref">{{ verseCard.ref }}</div>
          </div>

          <div class="row q-gutter-sm q-mt-md justify-center">
            <q-btn
              v-for="platform in sharePlatforms"
              :key="platform.id"
              :color="platform.color"
              :icon="platform.icon"
              :label="platform.label"
              rounded
              no-caps
              @click="shareToplatform(platform)"
            />
            <q-btn
              flat
              icon="copy_all"
              :label="t('pages.social.copyText')"
              @click="copyVerseText"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, copyToClipboard } from 'quasar'
import { resolveNitroUrl } from '@/stores/services'

const { t, locale } = useI18n()
const $q = useQuasar()
// ── Featured Videos ─────────────────────────────────────────────────────────
const featuredVideos = [
  {
    id: '7614273496935386390',
    title: '🚦🌹 Come to Islam',
    artist: 'Abdull Vocals',
    artistHandle: '@abdullvocals',
    artistUrl: 'https://www.tiktok.com/@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7614273496935386390',
  },
  {
    id: '7604807153408331030',
    title: '🌹🕋 Alhamdulillah',
    artist: 'Abdull Vocals',
    artistHandle: '@abdullvocals',
    artistUrl: 'https://www.tiktok.com/@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7604807153408331030',
  },
  {
    id: '7617605509402725655',
    title: '🌹 Hijab Nasheed',
    artist: 'Abdull Vocals',
    artistHandle: '@abdullvocals',
    artistUrl: 'https://www.tiktok.com/@abdullvocals',
    embedUrl: 'https://www.tiktok.com/embed/v2/7617605509402725655',
  },
]
// ── Social handles ──────────────────────────────────────────────────────────
const handles = [
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@peace2074',
    icon: 'play_circle',
    color: 'dark',
    url: 'https://www.tiktok.com/@peace2074',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@peace2074',
    icon: 'photo_camera',
    color: 'pink-8',
    url: 'https://www.instagram.com/peace2074',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    handle: '@peace2074',
    icon: 'tag',
    color: 'blue-grey-9',
    url: 'https://x.com/peace2074',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: 'peace2074',
    icon: 'smart_display',
    color: 'red',
    url: 'https://www.youtube.com/@peace2074',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'peace2074',
    icon: 'groups',
    color: 'blue-8',
    url: 'https://www.facebook.com/peace2074',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: 'rip-fullybaked',
    icon: 'code',
    color: 'grey-9',
    url: 'https://github.com/rip-fullybaked',
  },
]

// ── Share platforms ──────────────────────────────────────────────────────────
const sharePlatforms = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'chat',
    color: 'green-8',
    scheme: 'whatsapp',
  },
  {
    id: 'twitter',
    label: 'X',
    icon: 'tag',
    color: 'blue-grey-9',
    scheme: 'twitter',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: 'send',
    color: 'blue-6',
    scheme: 'telegram',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'groups',
    color: 'blue-8',
    scheme: 'facebook',
  },
]

// ── Sura picker ──────────────────────────────────────────────────────────────
type SuraOption = { label: string; value: number }
const allSuras = ref<SuraOption[]>([])
const suraOptions = ref<SuraOption[]>([])
const selectedSura = ref<number>(1)
const selectedAyah = ref<number>(1)

function filterSuras(val: string, update: (fn: () => void) => void) {
  update(() => {
    const q = val.toLowerCase()
    suraOptions.value = q
      ? allSuras.value.filter((s) => s.label.toLowerCase().includes(q))
      : allSuras.value
  })
}

// ── Verse card ───────────────────────────────────────────────────────────────
type VerseCard = {
  arabic: string
  translation: string
  ref: string
  text: string
}
const verseCard = ref<VerseCard | null>(null)
const loadingVerse = ref(false)
const verseCardRef = ref<HTMLElement | null>(null)

async function loadVerse() {
  if (!selectedSura.value || !selectedAyah.value) return
  loadingVerse.value = true
  try {
    const res = await fetch(
      `${resolveNitroUrl('/quran')}/${selectedSura.value}?locale=${locale.value}`,
      { credentials: 'include' }
    )
    const data = await res.json()
    const ayat: { verse_no: number; arabic: string; translation?: string }[] =
      data?.ayat ?? []
    const ayah = ayat.find((a) => a.verse_no === Number(selectedAyah.value))
    if (!ayah) {
      $q.notify({ type: 'warning', message: t('pages.social.verseNotFound') })
      return
    }
    const ref = `${data.name} ${selectedSura.value}:${selectedAyah.value}`
    verseCard.value = {
      arabic: ayah.arabic,
      translation: ayah.translation || '',
      ref,
      text: `${ayah.arabic}\n${ayah.translation || ''}\n— ${ref}\npeace2074.com`,
    }
  } catch {
    $q.notify({ type: 'negative', message: t('pages.social.loadError') })
  } finally {
    loadingVerse.value = false
  }
}

function shareToplatform(platform: (typeof sharePlatforms)[number]) {
  if (!verseCard.value) return
  const text = encodeURIComponent(verseCard.value.text)
  const url = encodeURIComponent('https://peace2074.com')
  const links: Record<string, string> = {
    whatsapp: `https://wa.me/?text=${text}`,
    twitter: `https://x.com/intent/tweet?text=${text}&url=${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
  }
  window.open(links[platform.scheme] || '#', '_blank', 'noopener,noreferrer')
}

async function copyVerseText() {
  if (!verseCard.value) return
  try {
    await copyToClipboard(verseCard.value.text)
    $q.notify({
      type: 'positive',
      message: t('pages.social.copied'),
      icon: 'check',
    })
  } catch {
    $q.notify({ type: 'negative', message: t('pages.social.copyError') })
  }
}

onMounted(async () => {
  // Build sura list from bundled data
  try {
    const mod = await import('@shared/data/chapters/en.json')
    const suras: { id: number; name: string; transliteration: string }[] =
      (mod as any)?.default ?? (mod as any) ?? []
    allSuras.value = suras.map((s) => ({
      label: `${s.id}. ${s.transliteration} (${s.name})`,
      value: s.id,
    }))
    suraOptions.value = allSuras.value
  } catch {
    // fallback: plain numbered list
    allSuras.value = Array.from({ length: 114 }, (_, i) => ({
      label: `Surah ${i + 1}`,
      value: i + 1,
    }))
    suraOptions.value = allSuras.value
  }
})
</script>

<style scoped lang="scss">
.social-page {
  max-width: 860px;
  margin: 0 auto;
}

.section-label {
  letter-spacing: 0.1em;
}

.social-card {
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.verse-preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verse-card {
  width: 100%;
  max-width: 520px;
  background: linear-gradient(135deg, #1f2937 0%, #0b1120 100%);
  color: #fff;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;

  &__logo {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    opacity: 0.5;
    margin-bottom: 1.2rem;
  }

  &__arabic {
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-family: 'Amiri', 'Scheherazade New', serif;
    margin-bottom: 1rem;
  }

  &__translation {
    font-size: 0.95rem;
    opacity: 0.85;
    font-style: italic;
    margin-bottom: 0.8rem;
    line-height: 1.6;
  }

  &__ref {
    font-size: 0.8rem;
    opacity: 0.55;
    letter-spacing: 0.05em;
  }
}
</style>
