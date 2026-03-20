<script setup lang="ts">
import { computed, ref, watch, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import PlainLayout from '@/layouts/plain.vue'

const ThreeBackground = defineAsyncComponent(() => import('@/components/common/ThreeBackground.vue'))

const route = useRoute()
const showBackground = ref(false)
const showSplash = ref(true)
const MIN_SPLASH_MS = 500
const MAX_SPLASH_MS = 2600

// Detect Safari browser
const isSafari = computed(() => {
  if (typeof window === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
})

// Use plain layout for Safari on Quran pages (better for Reader Mode)
const isQuranPage = computed(() => {
  return route.path.startsWith('/quran/') && route.params.id
})

// Check for user preference override (can be set in settings/preferences)
const layoutPreference = ref<'auto' | 'plain' | 'full'>('auto')

// Load preference from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('layout-preference')
  if (stored === 'plain' || stored === 'full' || stored === 'auto') {
    layoutPreference.value = stored
  }
}

// Save preference when it changes
watch(layoutPreference, (newPref) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('layout-preference', newPref)
  }
})

const usePlainLayout = computed(() => {
  // User preference override
  if (layoutPreference.value === 'plain') return true
  if (layoutPreference.value === 'full') return false
  
  // Auto: Use plain layout for all Quran detail pages (better for Reader Mode)
  return isQuranPage.value
})

const CurrentLayout = computed(() => {
  return usePlainLayout.value ? PlainLayout : AppShell
})

function waitForInitialPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function waitForFontsReady(timeoutMs = 1400): Promise<void> {
  const fonts = (document as any)?.fonts
  if (!fonts?.ready) return Promise.resolve()

  return Promise.race([
    fonts.ready.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}

onMounted(async () => {
  const splashStartedAt = performance.now()

  await Promise.race([
    Promise.all([waitForInitialPaint(), waitForFontsReady()]),
    new Promise<void>((resolve) => setTimeout(resolve, MAX_SPLASH_MS)),
  ])

  const elapsed = performance.now() - splashStartedAt
  const remaining = Math.max(0, MIN_SPLASH_MS - elapsed)
  setTimeout(() => {
    showSplash.value = false
  }, remaining)

  const idle = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined
  if (typeof idle === 'function') {
    idle(() => {
      showBackground.value = true
    })
    return
  }
  setTimeout(() => {
    showBackground.value = true
  }, 1200)
})

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).__debugLayout = {
    isSafari,
    isQuranPage,
    usePlainLayout,
    layoutPreference
  }
}
</script>

<template>
  <div class="app-container">
    <Transition name="splash-fade">
      <div v-if="showSplash" class="app-splash" role="status" aria-live="polite">
        <div class="app-splash__inner">
          <img src="/logo.svg" alt="PEACE2074" class="app-splash__logo" />
          <div class="app-splash__title">PEACE2074</div>
          <div class="app-splash__loader" aria-hidden="true"></div>
        </div>
      </div>
    </Transition>
    <ThreeBackground v-if="showBackground" />
    <component :is="CurrentLayout" />
  </div>
</template>

<style lang="scss">
/* Basic app styles; remove dependency on undefined layout components */
html,
body {
  height: 100%;
}
#app {
  height: 100%;
  width: 100%;
}
.app-container {
  position: relative;
  min-height: 100%;
}

.app-splash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #1f2937, #0b1120 62%);
}

.app-splash__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #ffffff;
}

.app-splash__logo {
  width: 74px;
  height: 74px;
  object-fit: contain;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.25));
}

.app-splash__title {
  font-size: 1rem;
  letter-spacing: 0.16em;
  font-weight: 700;
  opacity: 0.95;
}

.app-splash__loader {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  animation: splash-spin 0.85s linear infinite;
}

@keyframes splash-spin {
  to {
    transform: rotate(360deg);
  }
}

.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.35s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}
</style>
