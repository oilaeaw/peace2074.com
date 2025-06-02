<script lang="ts" setup>
const nuxtApp = useNuxtApp()
interface HolyNameI {
  name: string
  text: string
}
const { $HolyNames } = nuxtApp
const holynames: HolyNameI[] = $HolyNames as HolyNameI[]

definePageMeta({
  layout: 'default',
  title: 'Holy Names  ',
})
</script>

<template>
  <QPage padding class="holynames-page fit rtl">
    <Glory
      v-for="one in holynames" :key="one.text" class="glory" :name="one
        .name" :text="one.text"
    >
      {{ one.name }}
    </Glory>
  </QPage>
</template>

<style lang="scss" scoped>
.glory {
  font: calc(4 * var(--vw));
}
</style>
