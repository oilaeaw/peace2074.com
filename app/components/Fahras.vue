<script lang="ts" setup>
const q2p = useQ2P()

const quran = q2p.GetQ
const names = q2p.FahrasP

const router = useRouter()

function navToLok(lok: number) {
  const advanced = lok + 1
  router.replace(`/quran/${advanced}`)
}
</script>

<template>
  <div>
    <ol v-if="quran" class="column q-mt-xl q-pt-lg text-center">
      <!-- <pre>{{ names }}</pre> -->
      <nuxt-link
        v-for="(item, L) in names"
        :key="item.lok"
        class="q-mx-xs cursor-pointer text-center"
        @click="navToLok(L)"
      >
        {{ item }}
      </nuxt-link>
    </ol>
    <div v-else class="q-mt-xl q-pt-lg text-center">
      <p>No data available</p>
    </div>
  </div>
</template>
