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
  <q-page padding class="index-page">
    <Logos mb-6 />
    <div v-if="online">
      <nuxt-link
        v-for="availableLocale in availableLocales"
        :key="availableLocale.code"
        :to="switchLocalePath(locales.value[1].code)"
      >
        {{ locale }}
      </nuxt-link>
      <hr>
      <q-btn color="primary" icon="home" :label="t('button.home')" to="/home" />
      <q-btn color="primary" icon="en" label="English" @click="setLocale('en')" />
      <q-btn color="primary" icon="en" label="Arabic" @click="setLocale('ar')" />
      <PageView class="q-mt-xl" />
    </div>
    <div v-else text-gray:80>
      You're offline
    </div>
    <template #fallback>
      <div italic op50>
        <span animate-pulse>Loading...</span>
        <q-skeleton :animation="true" class="fit" bordered />
      </div>
    </template>
  </q-page>
</template>

<style lang="scss">
.index-page {
  height: 100--vh;
  width: 100--vw;
  font-size: 0.19--vw;
}
</style>
