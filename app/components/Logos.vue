<script lang="ts" setup>
const imgSrc = ref('/900x900.png')
</script>

<template>
  <div flex cursor-default text-3xl font-300>
    <div flex class="q-mx-auto q-pa-md">
      <q-img mx-auto h-50 w-50 class="q-mx-auto" :src="imgSrc" :alt="appName" />
    </div>
  </div>
</template>

<style scoped>
.mx-auto {
  margin: 0 auto;
}
</style>
