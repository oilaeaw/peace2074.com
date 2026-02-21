<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const tabs = computed(() => [
  {
    name: 'visual',
    label: t('pages.miracles.visualTab'),
    to: '/miracles',
  },
  {
    name: 'linguistic',
    label: t('pages.miracles.linguisticTab'),
    to: '/miracles/patterns',
  },
])

const activeTab = computed(() => {
  if (route.path === '/miracles/patterns') return 'linguistic'
  return 'visual'
})
</script>

<template>
  <q-tabs
    :model-value="activeTab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="center"
    narrow-indicator
  >
    <q-route-tab
      v-for="tab in tabs"
      :key="tab.name"
      :name="tab.name"
      :label="tab.label"
      :to="tab.to"
      exact
    />
  </q-tabs>
  <q-separator />
</template>
