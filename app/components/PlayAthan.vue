<script lang="ts" setup>
import { onMounted, ref } from '#imports'
import aFile from '~/assets/audio/Athan.mp3'

// Reactive state
const aSrc = ref<string | null>(null)
const status = ref<'checking' | 'ok' | 'missing' | 'uploaded' | 'external'>('checking')
const remoteUrl = ref('')

// Check whether the imported asset is a real audio file or a placeholder text
async function checkAsset() {
  try {
    // Try a HEAD request first to inspect content-type
    const head = await fetch(aFile, { method: 'HEAD' })
    const ct = head.headers.get('content-type') || ''
    if (ct.startsWith('audio')) {
      aSrc.value = aFile
      status.value = 'ok'
      return
    }

    // If HEAD wasn't decisive, fetch the body and look for placeholder markers
    const res = await fetch(aFile)
    const body = await res.text()
    const bodyStart = body.trim().slice(0, 80)
    // Many placeholder files begin with comment markers like // or /*
    if (res.headers.get('content-type')?.startsWith('audio')) {
      aSrc.value = aFile
      status.value = 'ok'
      return
    }
    if (
      bodyStart.startsWith('//')
      || bodyStart.startsWith('/*')
      || /placeholder/i.test(bodyStart)
    ) {
      status.value = 'missing'
      aSrc.value = null
      return
    }

    // Otherwise assume it's usable
    aSrc.value = aFile
    status.value = 'ok'
  }
  catch {
    // Network/serving issue — treat as missing
    status.value = 'missing'
    aSrc.value = null
  }
}

onMounted(() => {
  checkAsset()
})

function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file)
    return
  if (!file.type.startsWith('audio')) {
    // Basic validation
    // eslint-disable-next-line no-alert
    alert('Please upload an audio file (mp3, wav, etc.)')
    return
  }
  const url = URL.createObjectURL(file)
  aSrc.value = url
  status.value = 'uploaded'
}

function useRemote() {
  if (!remoteUrl.value)
    return
  aSrc.value = remoteUrl.value
  status.value = 'external'
}
</script>

<template>
  <div class="q-mx-auto inline-block text-center">
    <div v-if="status === 'checking'">
      Checking Athan audio…
    </div>

    <div v-else>
      <audio v-if="aSrc" controls class="inline-block">
        <source :src="aSrc" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>

      <div v-if="status === 'missing'" class="q-mt-sm">
        <p class="text-sm">
          Athan audio is not available in the app assets. You can:
        </p>
        <ul class="q-pl-md text-sm">
          <li>Upload a local audio file (plays immediately in your browser)</li>
          <li>Provide a remote URL to an MP3</li>
          <li>Restore the original file in the repo (recommended for sharing)</li>
        </ul>

        <label class="q-mt-sm block">
          Upload local audio:
          <input type="file" accept="audio/*" @change="handleUpload">
        </label>

        <div class="q-mt-sm">
          <label>Or use remote URL:</label>
          <div class="q-gutter-sm q-mt-xs">
            <input
              v-model="remoteUrl"
              placeholder="https://example.com/athan.mp3"
              class="q-pa-xs"
            >
            <button @click="useRemote">
              Use URL
            </button>
          </div>
        </div>
      </div>

      <div v-if="status === 'uploaded'" class="q-mt-sm text-sm">
        Playing uploaded file (temporary).
      </div>
      <div v-if="status === 'external'" class="q-mt-sm text-sm">
        Playing remote audio.
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}
</style>
