<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { appName } from './constants/index'

const showSplash = ref(true)

onMounted(() => {
  window.addEventListener('nuxt:app:mounted', () => {
    showSplash.value = false
  })
  setTimeout(() => {
    showSplash.value = false
  }, 1500)
})

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
  <div v-if="showSplash" class="splash-screen">
    <div class="splash-content">
      <img src="/900x900.png" alt="Logo" class="splash-logo">
      <div class="splash-title">
        {{ appName }}
      </div>
    </div>
  </div>
  <VitePwaManifest />
  <NuxtLayout v-show="!showSplash">
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

.splash-screen {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: opacity 0.4s;
}
.splash-content {
  text-align: center;
}
.splash-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}
.splash-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a7f37;
}
</style>
