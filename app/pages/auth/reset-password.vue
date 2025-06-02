<script lang="ts" setup>
const athCode = ref('')
</script>

<template>
  <q-page :style-fn="myTweak" padding>
    <q-input v-model="athCode" type="text" label="Verify Code" />
  </q-page>
</template>

<style>

</style>
