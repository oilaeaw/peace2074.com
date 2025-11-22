<script lang="ts" setup>
import { useQ2P } from '~/store/q2p.pinia'
const { t } = useI18n()

const $q = useQuasar()
useQ2P().init()
const { toggle } = $q.dark
const header = ref(true)
function _toggleDark() {
  toggle()
  return $q.dark.mode
}
</script>

<template>
  <q-layout>
    <q-header v-model="header" reveal elevated bordered>
      <q-toolbar class="bg-green-9 text-white">
        <q-btn flat round dense icon="assignment_ind" />
        <q-toolbar-title>
          <NuxtLink to="/">
            {{ t("general.SiteTitle") }}-{{ t("auth") }}
          </NuxtLink>
        </q-toolbar-title>
        <q-btn flat round dense icon="apps" class="q-mr-xs" />
        <q-btn flat round dense icon="more_vert" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
