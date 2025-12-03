<script lang="ts" setup>
import aFile from '@assets/audio/Athan.mp3'
</script>

<template>
  <audio :src="aFile" controls preload="auto">
    Your browser does not support the audio element.
  </audio>
</template>

<style scoped>
.text-center {
  text-align: center;
}
</style>
