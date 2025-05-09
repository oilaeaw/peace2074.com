<script lang="ts" setup>
const aSrc = ref('assets/audio/Athan.mp3')
</script>

<template>
  <div class="q-mx-auto text-ceter inline-block">
    <audio controls class="inline-block">
      <source :src="aSrc" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>
</template>

<style>

</style>
