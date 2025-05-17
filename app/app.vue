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

const drawer = ref(false)
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <q-btn icon="menu" class="z-top fixed right-2 top-2" color="primary" round size="md" @click="drawer = true" />
    <InfoDrawer v-model:drawer="drawer" />
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

html.dark {
  background: #222;
  color: white;
}
</style>
