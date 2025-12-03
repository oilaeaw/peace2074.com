<script lang="ts" setup>
const props = defineProps<{
  name: string
  text: string
}>()
</script>

<template>
  <div class="gi">
    <q-btn
      :label="props.name" :value="props.name" size="19%vh" show-value rounded :thickness="0" color="green-3"
    >
      <q-tooltip>{{ props.text }}</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped lang="scss">
.gi {
  display: flex;
}
</style>
