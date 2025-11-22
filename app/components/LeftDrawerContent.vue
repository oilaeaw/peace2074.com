<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQ2P } from '~/store/q2p.pinia'

const q2p = useQ2P()
// Using top-level await makes this an async setup component
await q2p.init()

const { Index: activeSuraIndex } = storeToRefs(q2p)
const quranData = computed(() => q2p.Book)
const suraNames = computed(() => q2p.suraList.map((v: any) => v.name))

function handleSuraClick(index: number) {
  q2p.setIndex(index + 1)
  navigateTo(`/quran/${index + 1}`)
}
</script>

<template>
  <q-list bordered class="q-pa-lg text-green-9">
    <Fahras
      :items="suraNames"
      :active-index="activeSuraIndex"
      :has-data="!!quranData"
      @item-click="handleSuraClick"
    />
  </q-list>
</template>