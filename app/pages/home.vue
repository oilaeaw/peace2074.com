<script setup lang="ts">
import { useOnline } from '#imports'

const { t } = useI18n()
definePageMeta({
  layout: 'default',
  title: 'Main Page',
})
const online = useOnline()
</script>

<template>
  <q-page padding class="index-page">
    <ClientOnly>
      <Suspense>
        <div v-if="online">
          <NuxtLink
            class="q-mt-xl text-h5 block"
            :title="t('pages.quran.pageTitle')"
            to="/quran"
          >
            {{ t("pages.quran.pageTitle") }}
          </NuxtLink>

          <PageView class="q-mt-xl" />
        </div>
        <div v-else text-gray:80>
          You're offline
        </div>
        <template #fallback>
          <div italic op50>
            <span animate-pulse>Loading...</span>
            <q-skeleton animation="true" bordered />
          </div>
        </template>
      </Suspense>
      <template #fallback>
        <div op50>
          <span animate-pulse>...</span>
        </div>
      </template>
    </ClientOnly>
  </q-page>
</template>

<style lang="scss">
.index-page {
  height: 100--vh;
  width: 100--vw;
  font-size: 0.19--vw;
}
</style>
