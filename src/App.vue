<script setup lang="ts">
import AppShell from '@/layouts/AppShell.vue'
import ThreeBackground from '@/components/common/ThreeBackground.vue'
</script>

<template>
  <div class="app-container">
    <ThreeBackground />
    <AppShell />
  </div>
</template>

<style lang="scss">
/* Basic app styles; remove dependency on undefined layout components */
html,
body {
  height: 100%;
}
#app {
  height: 100%;
  width: 100%;
}
.app-container {
  position: relative;
  min-height: 100%;
}
</style>
