<template>
  <div class="q-pa-md" style="text-align:center;">
    <h1>Tasbeeh</h1>
    <div class="counter">
      <div class="value">{{ count }}</div>
      <button class="btn" @click="count++">+1</button>
      <button class="btn" @click="count = 0">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.counter { display: inline-flex; gap: 0.6rem; align-items: center; }
.value { font-size: 2rem; min-width: 3rem; }
.btn { padding: 0.4rem 0.8rem; border: 1px solid #e2e2e2; border-radius: 8px; background: #fff; }
</style>
