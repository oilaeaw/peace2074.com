<script lang="ts" setup>
import { useRouter } from '#imports'

// const { $holybook } = useNuxtApp()
// interface ONET {
//   Index: number | string
//   name: string
//   Location: string
//   TotalVerses: number
//   Verses: string[]
// }
// const quran: Ref<ONET[]> = ref($holybook)

// watch(
//   $holybook,
//   (val) => {
//     quran.value = val[0]
//   },
//   { deep: true },
// )
// onNuxtReady(() => {
//   if ($holybook) {
//     quran.value = $holybook
//   }
// })

// const names = $holybook.map(v => ({ names: v.name }))
// const router = useRouter()

function navToLok(lok: number) {
  const advonced = lok + 1 || 1
  router.replace(`/quran/${advonced}`)
}
</script>

<template>
  <!-- <ol v-if="$holybook" class="column q-mt-xl q-pt-lg text-ceter">
    <nuxt-link
      v-for="(i, ind) in names" :key="i.names" class="text-ceter q-mx-xs cursor-pointer"
      @click="navToLok(ind)"
    >
      {{ ind + 1 }}-{{ i.names }}
    </nuxt-link> -->
  <!-- </ol> -->
  <q-skeleton type="QInput" class="fit" />
</template>
