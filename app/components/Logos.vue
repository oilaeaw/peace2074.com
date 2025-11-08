<script lang="ts" setup>
const imgSrc = ref("900x900.png");
</script>

<template>
  <div flex cursor-default text-3xl font-300>
    <div flex class="q-mx-auto q-pa-sm">
      <q-img
        class="q-mx-auto logo-img"
        :src="imgSrc"
        :alt="appName"
        fit="contain"
        no-spinner
      />
    </div>
  </div>
</template>

<style scoped>
.mx-auto {
  margin: 0 auto;
}
.logo-img {
  max-height: 56px; /* smaller logo height */
  width: auto;
}
@media (max-width: 640px) {
  .logo-img {
    max-height: 48px;
  }
}
</style>
