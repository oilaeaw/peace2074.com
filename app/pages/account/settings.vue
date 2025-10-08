<script setup lang="ts">
definePageMeta({ layout: 'q-layout', title: 'Settings' })
const { t } = useI18n()
const $q = useQuasar()

const dark = computed(() => $q.dark.isActive)
function toggleDark() {
  $q.dark.toggle()
}

function changeLang(lang: string) {
  const i18n = useI18n()
  i18n.locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ t('settings.title') || 'Settings' }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-toggle v-model="dark" label="Dark mode" @update:model-value="toggleDark" />
        <div class="q-mt-md">
          <q-btn flat label="English" @click="changeLang('en')" />
          <q-btn flat label="العربية" @click="changeLang('ar')" />
          <q-btn flat label="Deutsch" @click="changeLang('de')" />
          <q-btn flat label="Русский" @click="changeLang('ru')" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
