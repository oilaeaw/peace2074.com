<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import PlainLayout from '@/layouts/plain.vue'
import ThreeBackground from '@/components/common/ThreeBackground.vue'

const route = useRoute()

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
    <ThreeBackground />
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
</style>
