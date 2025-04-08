<script lang="ts" setup>
import { useRouter } from '#imports'

const { $Book } = useNuxtApp()
interface ONET {
  Index: number | string
  name: string
  Location: string
  TotalVerses: number
  Verses: string[]
}
const quran: Ref<ONET[]> = ref({})

watch(
  $Book,
  (val) => {
    quran.value = val[0]
  },
  { deep: true },
)
onNuxtReady(() => {
  if ($Book) {
    quran.value = $Book
  }
})

// const names = $Book.map(v => ({ names: v.name }))
const router = useRouter()

function navToLok(lok: number) {
  const advonced = lok + 1 || 1
  router.replace(`/quran/${advonced}`)
}
</script>

<template>
  <ol v-if="$Book" class="column q-mt-xl q-pt-lg text-ceter">
    <!-- <nuxt-link
      v-for="(i, ind) in names" :key="i.names" class="text-ceter q-mx-xs cursor-pointer"
      @click="navToLok(ind)"
    >
      {{ ind + 1 }}-{{ i.names }}
    </nuxt-link> -->
  </ol>
</template>
