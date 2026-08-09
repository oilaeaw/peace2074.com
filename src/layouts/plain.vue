<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const route = useRoute()
const $q = useQuasar()

const pageTitle = computed(() => {
  return route.meta.title || t('appShell.title')
})

const isDarkMode = computed(() => $q.dark.isActive)

const isHeaderVisible = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function onMouseMove(e: MouseEvent) {
  if (e.clientY < 72) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
    isHeaderVisible.value = true
  } else if (isHeaderVisible.value) {
    if (!hideTimer) {
      hideTimer = setTimeout(() => {
        isHeaderVisible.value = false
        hideTimer = null
      }, 800)
    }
  }
}

function onHeaderEnter() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  isHeaderVisible.value = true
}

function onHeaderLeave() {
  hideTimer = setTimeout(() => {
    isHeaderVisible.value = false
    hideTimer = null
  }, 600)
}
</script>

<template>
  <div class="plain-container" :class="{ 'plain-container--dark': isDarkMode }" @mousemove="onMouseMove">
    <!-- Invisible hover trigger zone -->
    <div class="plain-header-trigger" @mouseenter="onHeaderEnter" />

    <header
      class="plain-header"
      :class="{ 'plain-header--dark': isDarkMode, 'plain-header--visible': isHeaderVisible }"
      @mouseenter="onHeaderEnter"
      @mouseleave="onHeaderLeave"
    >
      <nav class="plain-nav">
        <a
          :href="route.path.startsWith('/quran/') ? '/quran' : '/'"
          class="plain-link"
          :class="{ 'plain-link--dark': isDarkMode }"
          >← {{ t('button.back') }}</a
        >
        <h1 class="plain-title" :class="{ 'plain-title--dark': isDarkMode }">
          {{ pageTitle }}
        </h1>
        <a
          href="/"
          class="plain-link"
          :class="{ 'plain-link--dark': isDarkMode }"
          >{{ t('appShell.nav.home') }}</a
        >
      </nav>
    </header>
    <main class="plain-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.plain-container {
  max-width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background:
    radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

.plain-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  transform: translateY(-105%);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease;
}

.plain-header--visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

/* Invisible hover trigger zone at the very top of the viewport */
.plain-header-trigger {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 99;
  pointer-events: auto;
  background: transparent;
}

.plain-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 8px;
  min-width: 0;
}

.plain-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plain-link {
  color: #0f766e;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 999px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.plain-link:hover {
  text-decoration: none;
  background: rgba(15, 118, 110, 0.12);
}

.plain-main {
  margin: 0 auto;
  padding: 0 1rem 2rem;
  line-height: 1.8;
}

.plain-container--dark {
  background: #000;
  color: #f3f4f6;
}

.plain-header--dark {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background: rgba(3, 7, 18, 0.94);
}

.plain-title--dark {
  color: #f9fafb;
}

.plain-link--dark {
  color: #5eead4;
}

.plain-link--dark:hover {
  background: rgba(94, 234, 212, 0.12);
}

:global(body.body--dark) .plain-container {
  background: #000;
  color: #f3f4f6;
}

:global(body.body--dark) .plain-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  background: rgba(3, 7, 18, 0.92);
}

:global(body.body--dark) .plain-container .plain-header {
  background: rgba(3, 7, 18, 0.92) !important;
}

:global(body.body--dark) .plain-title {
  color: #f9fafb;
}

:global(body.body--dark) .plain-link {
  color: #5eead4;
}

:global(body.body--dark) .plain-link:hover {
  background: rgba(94, 234, 212, 0.12);
}

@media (max-width: 480px) {
  .plain-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .plain-title {
    order: 3;
    width: 100%;
    text-align: center;
    font-size: 1rem;
  }

  .plain-link {
    padding: 0.35rem;
  }

  .plain-main {
    padding: 0 0.75rem 1rem;
  }
}
</style>
