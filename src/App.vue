<script setup lang="ts">
</script>

<template>
  <AppShell />
</template>

<script setup lang="ts">
import AppShell from '@/layouts/AppShell.vue'
</script>

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
</style>
