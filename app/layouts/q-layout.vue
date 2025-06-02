<script lang="ts" setup>
const $q = useQuasar()
// const { t } = useI18n()
useQ2P().init()
const { toggle } = $q.dark
function _toggleDark() {
  toggle()
  return $q.dark.mode
}
</script>

<template>
  <q-layout>
    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
