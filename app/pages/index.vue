<script setup lang="ts">
import { useOnline } from '#imports'

const { t } = useI18n()
const _myLangsStore = useMyLangsStore()
definePageMeta({
  layout: 'default',
  title: 'navigation.HomePageTitle',
  description: 'meta.home',
})

const online = useOnline()
</script>

<template>
  <q-page padding class="index-page islamic-design">
    <Logos mb-1 />
    <div v-if="online">
      <div class="links">
        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.quran.pageTitle')"
          to="/quran"
        >
          {{ t("pages.quran.pageTitle") }}
        </NuxtLink>

        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.holynames')"
          to="/holynames"
        >
          {{ t("pages.holynames") }}
        </NuxtLink>

        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('tasbeeh.title')"
          to="/tasbeeh"
        >
          {{ t("tasbeeh.title") }}
        </NuxtLink>

        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.miracles.pageTitle')"
          to="/miracles"
        >
          {{ t("pages.miracles.pageTitle") }}
        </NuxtLink>
      </div>
      <PlayAthan />
      <PageView class="q-mt-xl" />
    </div>
    <div v-else text-gray:80>
      {{ t("pages.main.offlineMessage") }}
    </div>
    <!-- Removed invalid #fallback slot on QPage; use Suspense/ClientOnly when needed -->
  </q-page>
</template>

<style lang="scss">
.index-page {
  height: 100vh;
  width: 100vw;
  /* responsive base font size for mobile/desktop */
  font-size: clamp(14px, 2.5vw, 18px);
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  display: flex;
  flex-direction: column;
  align-items: center; /* horizontal centering */
  justify-content: center; /* vertical centering */
  padding: 2rem 1rem; /* add balanced padding */
  box-sizing: border-box;
  text-align: center;
}

.islamic-design {
  background: var(--index-background, url('@assets/patterns/islamic-pattern-light.svg'));
  background-repeat: repeat;
  background-size: cover;
  color: #155724;
}

.islamic-title {
  font-family: 'Amiri', serif;
  font-size: 2.5rem;
  color: #155724;
  text-align: center;
  margin-bottom: 1rem;
}

.islamic-subtitle {
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
}

.islamic-link {
  font-family: 'Amiri', serif;
  color: #155724;
  text-decoration: none;
  border: 1px solid #155724;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  display: inline-block;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.islamic-link:hover {
  background-color: #155724;
  color: #fff;
}

.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

.index-page > div[v-if],
.index-page > div[text-gray\:80] {
  /* Ensure both online and offline states are centered */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


</style>
