<script lang="ts" setup>
const q2p = useQ2P()

const quran = q2p.GetQ

watch(
  q2p,
  (val) => {
    quran.value = val
  },
  { deep: true },
)
onNuxtReady(() => {
  if (q2p) {
    quran.value = q2p.GetQ
  }
})

const names = q2p.IdexNames
const router = useRouter()

function navToLok(lok: number) {
  const advonced = lok + 1 || 1
  router.replace(`/quran/${advonced}`)
}
</script>

<template>
  <ol v-if="!!names" class="column q-mt-xl q-pt-lg text-ceter">
    <nuxt-link
      v-for="(i, ind) in names" :key="i.names" class="text-ceter q-mx-xs cursor-pointer"
      @click="navToLok(ind)"
    >
      {{ ind + 1 }}-{{ i.names }}
    </nuxt-link>
  </ol>
  <q-skeleton v-else type="QInput" class="fit" />
</template>
