<script setup lang="ts">
import { definePageMeta, useOnline } from '#imports'
import { useUserStore } from '~/composables/user'

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
})
const { t } = useI18n()
const { savedName } = useUserStore()

definePageMeta({
  layout: 'default',
  title: 'Main Page',
})
const online = useOnline()
// onMounted(() => {
//   connect()
// })
// function send() {
//   if (input.value.trim) {
//     sendMessage(input.value)
//     input.value = ''
//   }
// }
</script>

<template>
  <q-page padding class="index-page islamic-design">
    <Logos mb-1 />
    <div v-if="online">
      <div class="header">
        <h1 class="islamic-title">
          {{ t('pages.main.title') }}
        </h1>
        <p class="islamic-subtitle">
          {{ t('pages.main.subtitle') }}
        </p>
      </div>
      <div class="links">
        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.quran.pageTitle')"
          to="/quran/1"
        >
          {{ t("pages.quran.pageTitle") }}
        </NuxtLink>
        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.quran.holynames')"
          to="/holynames"
        >
          {{ t("pages.holynames") }}
        </NuxtLink>
        <NuxtLink
          class="text-h5 q-mt-xl islamic-link block"
          :title="t('pages.miracles.pageTitle')"
          to="/miracles"
        >
          {{ t("pages.miracles.pageTitle") }}
        </NuxtLink>
      </div>
      <div class="language-buttons">
        <q-btn color="green" class="q-my-md islamic-btn" icon="en" label="English" @click="setLocale('en')" />
        <q-btn color="yellow" class="q-my-md islamic-btn" icon="ar" label="Arabic" @click="setLocale('ar')" />
      </div>
      <PlayAthan />
      <PageView class="q-mt-xl" />
    </div>
    <div v-else text-gray:80>
      {{ t('pages.main.offlineMessage') }}
    </div>
    <template #fallback>
      <div italic op50>
        <span animate-pulse>{{ t('pages.main.loading') }}</span>
        <q-skeleton :animation="true" class="fit" bordered />
      </div>
    </template>
  </q-page>
</template>

<style lang="scss">
.index-page {
  height: 100vh;
  width: 100vw;
  font-size: 0.19vw;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.islamic-design {
  background: url('/assets/patterns/islamic-pattern.svg') repeat;
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
}

.islamic-link:hover {
  background-color: #155724;
  color: #fff;
}

.language-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.islamic-btn {
  font-family: 'Amiri', serif;
  font-size: 1rem;
}
</style>
