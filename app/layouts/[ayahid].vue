<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQ2P } from '~/store/q2p.pinia'

const { t } = useI18n()
const route = useRoute()
const store = useQ2P()

// Ensure Quran data is available before rendering
if (!store.Book || store.Book.length === 0) {
  await store.init()
}

const suraId = computed(() => Number(route.params.suraid))
const ayahId = computed(() => Number(route.params.ayahid))

const sura = computed(() => {
  if (!store.Book) return null
  return store.Book.find((s: any) => s.id === suraId.value) || null
})

const ayah = computed(() => {
  if (!sura.value || !sura.value.ayat) return null
  // Ayah ID is 1-based, array is 0-based
  const ayahData = sura.value.ayat[ayahId.value - 1]
  if (!ayahData) return null

  // Normalize ayah text, which can be a string or an object
  const text = typeof ayahData === 'string' ? ayahData : ayahData.text
  // Translation is not present in the current data shape; leave empty string.
  const translation = ''

  return { text, translation }
})

const pageTitle = computed(() => {
  if (!sura.value) return t('notfound')
  return `${t('pages.quran.sura.name')} ${sura.value.name} (${sura.value.e_name}), Ayah ${ayahId.value}`
})

const pageDescription = computed(() => {
  if (!ayah.value) return t('meta.quran')
  // Create a concise description from the verse text
  const verseSnippet = ayah.value.text.substring(0, 150)
  return `${t('pages.quran.pageTitle')} - ${sura.value?.name} ${suraId.value}:${ayahId.value} - "${verseSnippet}..."`
})

const canonicalUrl = computed(() => `https://peace2074.com/quran/${suraId.value}/${ayahId.value}`)

// --- SEO Meta Tags ---
useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  ogType: 'article',
  ogSiteName: t('general.SiteTitle'),
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})

// --- Structured Data (JSON-LD) ---
useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      // Cast to any to avoid overly strict typing on script objects
      ...( {
        children: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl.value,
        },
        'headline': pageTitle.value,
        'description': pageDescription.value,
        'author': {
          '@type': 'Organization',
          'name': t('general.SiteTitle'),
        },
        'publisher': {
          '@type': 'Organization',
          'name': t('general.SiteTitle'),
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://peace2074.com/900x900.png',
          },
        },
        'articleBody': ayah.value?.text,
      }))
      } as any ),
    },
  ],
})
</script>

<template>
  <q-page padding class="islamic-design">
    <div v-if="sura && ayah" class="quran-ayah-view">
      <h1 class="text-h4 q-mb-md">{{ pageTitle }}</h1>
      <p class="text-body1 arabic-text q-my-lg">{{ ayah.text }}</p>
      <p v-if="ayah.translation" class="text-body2 translation-text">
        <em>{{ ayah.translation }}</em>
      </p>
      <!-- Add navigation to next/previous Ayah here -->
    </div>
    <div v-else>
      <h1 class="text-h4">{{ t('notfound') }}</h1>
      <p>{{ t('pages.quran.notfoundDetail') }}</p>
      <q-btn to="/quran" :label="t('button.back')" color="primary" />
    </div>
  </q-page>
</template>

<style scoped>
.arabic-text {
  font-family: 'Amiri', serif;
  font-size: 2rem;
  direction: rtl;
  line-height: 2.5;
}
.translation-text {
  font-style: italic;
  color: #555;
}
.dark .translation-text {
  color: #bbb;
}
</style>
