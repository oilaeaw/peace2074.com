<script setup lang="ts">
import { computed } from '#imports'
import { useRoute } from '#imports'
const route = useRoute()
const room = computed(() => (route.query?.room ? String(route.query.room) : ''))
</script>

<template>
  <q-page padding class="flex column h-full">
    <div class="q-pa-sm q-gutter-sm">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-toolbar-title>
          Live Chat
          <span v-if="room"> ({{ room }})</span>
        </q-toolbar-title>
      </q-toolbar>
    </div>
    <div class="q-pa-md">
      <q-banner class="bg-grey-2 text-dark rounded-borders">
        Realtime chat is disabled on this platform.
      </q-banner>
    </div>
  </q-page>
</template>

<style scoped>
.h-full { height: 100%; }
</style>
