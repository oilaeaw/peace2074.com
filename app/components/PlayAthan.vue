<script lang="ts" setup>
import Plugin from '@quasar/quasar-ui-qmediaplayer/src/QMediaPlayer'

const app = useNuxtApp()

app.vueApp.use(Plugin)

const source = {
  src: '/assets/audio/Athan.mp3',
}
</script>

<template>
  <div class="q-my-md">
    <QMediaPlayer
      label="Athan"
      type="audio/mp3"
      mute="false"
      :sources="source"
    />
  </div>
</template>

<style>

</style>
