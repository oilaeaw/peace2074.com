<script setup lang="ts">
import { onMounted, ref } from '#imports'

// Do not render the splash on the server — wrap it with <client-only>
// in the template to avoid SSR/client markup mismatches.
const isSplashVisible = ref(true)
const isSplashMounted = ref(true)
const logoSrc = ref('/900x900.png')
onMounted(() => {
  window.addEventListener('nuxt:app:mounted', () => {
    // Start the fade-out transition
    isSplashVisible.value = false
    // Remove the splash screen from the DOM after the transition completes
    setTimeout(() => {
      isSplashMounted.value = false
    }, 400) // This duration should match the CSS transition duration
  }, { once: true })
})

// Generate localized head metadata using nuxt-i18n v9 API (use defaults for compatibility)
const i18nHead = useLocaleHead()
useHead(() => ({
  title: appName,
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs!.lang,
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
}))
</script>

<template>
  <client-only>
    <div
      v-if="isSplashMounted"
      class="splash-screen"
      :class="{ 'fade-out': !isSplashVisible }"
    >
      <div class="splash-content">
        <q-img :src="logoSrc" alt="Logo" class="splash-logo" />
        <div class="splash-title">
          {{ appName }}
        </div>
    </div>
  </client-only>
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

.splash-screen {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: opacity 0.4s ease-in-out;
}
.splash-screen.fade-out {
  opacity: 0;
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

@media (max-width: 600px) {
  .splash-logo {
    width: 80px;
    height: 80px;
  }
  .splash-title {
    font-size: 1.25rem;
  }
}

/* make language buttons and other interactive elements easier to tap on mobile */
.language-buttons .q-btn,
.q-btn {
  min-height: 44px;
  min-width: 44px;
}
</style>
