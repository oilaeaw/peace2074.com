<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// definePageMeta removed — main.ts handles titles
const online = useOnline()
</script>

<template>
  <q-page class="index-page page-width">
    <div class="content-center text-center">
      <Suspense>
        <div v-if="online">
          <Logos mb-1 />
          <RouterLink
            class="q-mt-md text-h5 block"
            :title="t('pages.quran.pageTitle')"
            to="/quran"
          >
            {{ t("pages.quran.pageTitle") }}
          </RouterLink>

           <PageView class="q-mt-md w-full" />
        </div>
        <div v-else text-gray:80>
          You're offline
        </div>
        <template #fallback>
          <div italic op50>
            <span animate-pulse>Loading...</span>
            <q-skeleton animation="pulse" bordered />
          </div>
        </template>
      </Suspense>
    </Suspense>
    </div>
  </q-page>
</template>

<style lang="scss">
.index-page {
  min-height: 100dvh; /* account for mobile browser UI */
  width: 100%;
  font-size: 0.19vw;
  margin: 0;
  padding: 0; /* remove side padding so left/right are exactly equal */
  box-sizing: border-box;
  display: flex; /* allow inner container to center vertically */
}

.content-center {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* center vertically */
}
</style>
