<script lang="ts" setup>
const { t } = useI18n()
const imgSrc = ref("900x900.png")
const appName = computed(() => t("general.SiteTitle"))
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
      <!-- Redundant plain img for guaranteed visibility -->
  <img :src="imgSrc" :alt="appName" style="max-height:200px; width:auto; display:block; margin:12px auto 0 auto; background:#fff;" />
    </div>
  </div>
</template>

<style scoped>
.mx-auto {
  margin: 0 auto;
}
.logo-img {
  max-height: 200px; /* Make it very visible for testing */
  width: auto;
}
@media (max-width: 640px) {
  .logo-img {
    max-height: 150px;
  }
}
</style>
