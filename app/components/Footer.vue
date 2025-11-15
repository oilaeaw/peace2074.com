<script setup lang="ts">
import { ref, computed } from 'vue'

const { locale, t } = useI18n()

const languages = [
  { value: 'en', label: 'English', icon: 'language' },
  { value: 'ar', label: 'العربية', icon: 'language' },
  { value: 'de', label: 'Deutsch', icon: 'language' },
  { value: 'ru', label: 'Русский', icon: 'language' }
] as const

const currentLanguage = computed(() => {
  const found = languages.find(lang => lang.value === locale.value)
  return found ?? languages[0]
})

function switchLanguage(newLocale: string) {
  locale.value = newLocale
}
</script>

<template>
  <div text="xl gray4" m-5 flex="~ gap3" justify-center items-center>
    <NuxtLink i-carbon-campsite to="/" />
    <a i-carbon-logo-github href="https://github.com/peace2074/peace2074.com" target="_blank" />
    <DarkToggle />
    
    <!-- Language Dropdown -->
    <q-btn-dropdown
      flat
      dense
      :label="currentLanguage.label"
      icon="language"
      class="language-dropdown"
    >
      <q-list>
        <q-item
          v-for="lang in languages"
          :key="lang.value"
          v-close-popup
          clickable
          :active="locale === lang.value"
          @click="switchLanguage(lang.value)"
        >
          <q-item-section avatar>
            <q-icon :name="lang.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ lang.label }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="locale === lang.value">
            <q-icon name="check" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<style scoped>
.language-dropdown {
  margin-left: 0.5rem;
}
</style>
