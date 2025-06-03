<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const q2p = useQ2P()
const { index } = storeToRefs(q2p)
const quran = q2p.GetQ
const names = q2p.FahrasP
const router = useRouter()
function navToLok(lok: number) {
  // Set the index in the store before navigating
  q2p.setIndex(lok)
  const advanced = lok + 1
  router.push(`/quran/${advanced}`)
}
</script>

<template>
  <div>
    <ol v-if="quran" class="column q-mt-xl q-pt-lg text-center">
      <nuxt-link
        v-for="(item, L) in names"
        :key="item.lok"
        class="q-mx-xs cursor-pointer text-center"
        :class="{ 'active-sura': index === L }"
        @click="navToLok(L)"
      >
        {{ L + 1 }}-{{ item }}
      </nuxt-link>
    </ol>
    <div v-else class="q-mt-xl q-pt-lg text-center">
      <p>No data available</p>
    </div>
  </div>
</template>

<style scoped>
.active-sura {
  /* No background! */
  color: var(--active-sura-color, #1a5e1a) !important;
  border: 2px solid var(--active-sura-border, #28ff7a);
  border-radius: 8px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(40, 167, 69, 0.08);
  outline: none;
}

.nuxt-link {
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}

:root {
  --active-sura-color: #1a5e1a;
  --active-sura-border: #28a745;
}

@media (prefers-color-scheme: dark) {
  :root {
    --active-sura-color: #eaffd6;
    --active-sura-border: #28ff7a;
  }
}
</style>
