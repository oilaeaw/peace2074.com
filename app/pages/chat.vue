<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, useRoute } from '#imports'

type ChatMsg = {
  id?: string
  text: string
  author: string
  ts?: string
  me?: boolean
}

const { socket, on, off, emit } = useSocket()

const myId = ref<string>('')
const nickname = ref<string>('guest-' + Math.random().toString(36).slice(2, 6))
const online = ref<boolean>(false)
const health = ref<string>('')
const input = ref<string>('')
const sending = ref<boolean>(false)
const messages = ref<ChatMsg[]>([])
const route = useRoute()
const room = computed(() => (route.query?.room ? String(route.query.room) : ''))

const canSend = computed(() => input.value.trim().length > 0 && !sending.value)

function pushMessage(msg: ChatMsg) {
  const me = msg.id && myId.value && msg.id === myId.value
  // Initialize from current socket state to avoid showing Offline during a race
  try { online.value = !!(socket as any)?.connected } catch {}
  fetchStatus()
  // keep last ~200 for memory
  if (messages.value.length > 200)
    messages.value.splice(0, messages.value.length - 200)
}

function send() {
  if (!canSend.value) return
  const text = input.value.trim()
  input.value = ''
  const payload = { text, author: nickname.value }
  // Optimistic append
  pushMessage({ ...payload, id: myId.value, ts: new Date().toISOString(), me: true })
  // Try socket; fallback silently if offline
  try {
    sending.value = true
    emit('chat:message', payload, () => { sending.value = false })
  }
  catch {
    sending.value = false
  }
}

async function fetchStatus() {
  try {
    const res = await $fetch('/api/socket-status')
    // Only set online from server status if we're not already connected.
    if (!online.value)
      online.value = !!(res as any)?.socketEnabled
  }
  catch {
    online.value = false
  }
}

let offConnect: any
let offDisconnect: any
let offServerId: any
let offHealth: any
let offChat: any

onMounted(() => {
  fetchStatus()
  // Wire events only on client
  offConnect = on('connect', () => {
    online.value = true
  })
  offDisconnect = on('disconnect', () => {
    online.value = false
  })
  offServerId = on<string>('server:id', (id) => {
    myId.value = id
  })
  offHealth = on<any>('health', (h) => {
    health.value = h?.timestamp || ''
  })
  offChat = on<ChatMsg>('chat:message', (msg) => {
    pushMessage(msg)
  })
})

onBeforeUnmount(() => {
  try { offConnect?.() } catch {}
  try { offDisconnect?.() } catch {}
  try { offServerId?.() } catch {}
  try { offHealth?.() } catch {}
  try { offChat?.() } catch {}
})

// Auto-scroll on new messages
const scrollRef = ref<{ setScrollPosition: (y: number, speed?: number) => void } | null>(null)
watch(messages, () => {
  requestAnimationFrame(() => {
    try {
      const el = document.querySelector('#chat-scroll .q-scrollarea__container') as HTMLElement
      if (el) el.scrollTop = el.scrollHeight
    } catch {}
  })
})
</script>

<template>
  <q-page padding class="flex column h-full">
    <div class="q-pa-sm q-gutter-sm">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-toolbar-title>
          Live Chat
          <span v-if="room"> ({{ room }})</span>
        </q-toolbar-title>
        <q-badge :color="online ? 'positive' : 'negative'" align="middle">
          {{ online ? 'Online' : 'Offline' }}
        </q-badge>
      </q-toolbar>
    </div>

    <div class="q-pa-sm column col">
      <q-scroll-area id="chat-scroll" class="rounded-borders" style="height: calc(100vh - 220px)">
        <div class="q-pa-md column items-stretch">
          <q-chat-message
            v-for="(m, i) in messages"
            :key="i + '-' + (m.ts || '')"
            :text="[m.text]"
            :name="m.me ? 'You' : m.author"
            :sent="m.me"
            :stamp="m.ts ? new Date(m.ts).toLocaleTimeString() : ''"
            :bg-color="m.me ? 'primary' : 'grey-3'"
            :text-color="m.me ? 'white' : 'dark'"
            class="q-mb-sm"
          />
        </div>
      </q-scroll-area>
    </div>

    <div class="q-pa-sm q-gutter-sm row items-center">
      <q-input
        filled
        dense
        clearable
        class="col"
        v-model="input"
        placeholder="Type a message…"
        @keyup.enter="send"
      >
        <template #prepend>
          <q-icon name="chat" />
        </template>
        <template #append>
          <q-btn :disable="!canSend" :loading="sending" unelevated color="primary" icon="send" @click="send" />
        </template>
      </q-input>
      <q-input dense standout v-model="nickname" style="width: 160px" label="Nickname" />
    </div>
  </q-page>
</template>

<style scoped>
.h-full { height: 100%; }
</style>
