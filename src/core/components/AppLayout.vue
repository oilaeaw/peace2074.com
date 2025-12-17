<script setup lang="ts">
import { layoutKey, type ILayout } from "@/core/models";

const $layout = inject<ILayout>(layoutKey) as ILayout;
</script>

<template>
  <div class="app-layout">
    <AppHeader class="bg-primary text-white" />
    <AppDrawer v-model="$layout.leftDrawer.isVisible" class="bg-secondary" />
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  position: relative;
  width: 100%;
  min-height: 100%;
}
</style>
