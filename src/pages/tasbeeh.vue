<template>
  <div class="q-pa-md" style="text-align:center;">
    <h1>{{ t('tasbeeh.title') }}</h1>
    <p class="subtitle">{{ t('tasbeeh.subtitle') }}</p>
    <div class="counter">
      <div class="value">{{ count }}</div>
      <button class="btn primary" @click="count++">{{ t('tasbeeh.tapToCount') }}</button>
      <button class="btn" @click="count = 0">{{ t('tasbeeh.reset') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const count = ref(0)
const { t } = useI18n()
</script>

<style scoped>
.counter { display: inline-flex; gap: 0.6rem; align-items: center; }
.value { font-size: 2rem; min-width: 3rem; }
.subtitle { margin-top: 0.25rem; margin-bottom: 1rem; color: #6c757d; }
.btn { padding: 0.4rem 0.8rem; border: 1px solid #e2e2e2; border-radius: 8px; background: #fff; cursor: pointer; }
.btn.primary { background: #155724; color: #fff; border-color: #155724; }
</style>
