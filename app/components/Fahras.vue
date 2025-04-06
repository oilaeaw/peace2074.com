<script lang="ts" setup>
import { useRouter } from '#imports'

interface ONET {
  Index: number | string
  name: string
  Location: string
  TotalVerses: number
  Verses: string[]
}
const { $Book } = useNuxtApp()
const Quran: ONET[] = $Book as ONET[]
const names = ref(Quran).value.map(v => ({ names: v.name }))
const router = useRouter()

function navToLok(lok: number) {
  const advonced = lok + 1 || 1
  router.replace(`/quran/${advonced}`)
}
</script>

<template>
  <ol class="column q-mt-xl q-pt-lg">
    <nuxt-link
      v-for="(i, ind) in names" :key="i.names" class="cursor-pointer"
      @click="navToLok(ind)"
    >
      {{ ind + 1 }}-{{ i.names }}
    </nuxt-link>
  </ol>
</template>
