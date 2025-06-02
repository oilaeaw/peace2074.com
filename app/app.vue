<script setup lang="ts">
import { appName } from './constants/index'

const i18nHead = useLocaleHead('./locals', { seo: { canonicalQueries: ['ar', 'en'] } })
useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs!.lang,
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
}))
useHead({
  title: appName,
})
definePageMeta({
  layout: 'default',
  title: 'Main Page',
})
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
    <CookieConsent />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
