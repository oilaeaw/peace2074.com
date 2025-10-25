<script lang="ts" setup>
import { computed } from '#imports'
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()

const tab = computed<string>({
  get() {
    const p = route.path || ''
    return p.startsWith('/miracles2') ? 'm2' : 'm1'
  },
  set(v) {
    if (v === 'm2') router.push('/miracles2')
    else router.push('/miracles')
  },
})
</script>

<template>
  <div class="row items-center justify-end q-mb-sm">
    <q-tabs v-model="tab" shrink stretch>
      <q-tab name="m1" label="Miracles" />
      <q-tab name="m2" label="Miracles²" />
    </q-tabs>
  </div>
</template>
