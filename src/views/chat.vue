<template>
  <q-page padding class="chat-page">
    <section class="hero">
      <h1>{{ t('pages.chat.title') }}</h1>
      <p class="subtitle">{{ t('pages.chat.subtitle') }}</p>
      <p v-if="isAuthenticated" class="logged-user q-mt-xs">
        {{ loggedInLabel }}
      </p>
      <q-banner
        class="q-mt-sm"
        dense
        rounded
        color="primary"
        text-color="white"
      >
        {{ t('pages.chat.banner') }}
      </q-banner>
      <div class="hero-actions q-mt-md">
        <q-btn
          color="primary"
          unelevated
          :label="t('pages.chat.ctaChat')"
          to="/chat"
        />
        <q-btn
          flat
          color="primary"
          :label="t('pages.chat.ctaSupport')"
          to="/support"
          class="q-ml-sm"
        />
      </div>
    </section>

    <q-card class="q-mt-xl live-chat chat-surface">
      <q-card-section class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">{{ t('pages.chat.live.title') }}</div>
          <q-badge v-if="canManageChat" color="orange" outline>{{
            t('pages.chat.live.adminBadge')
          }}</q-badge>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-badge :color="statusColor" outline>{{ statusLabel }}</q-badge>
          <q-btn
            dense
            flat
            icon="refresh"
            @click="refresh"
            :disable="messaging.connecting"
            :aria-label="t('pages.chat.live.reconnect')"
          />
        </div>
      </q-card-section>
      <q-separator />

      <!-- Room Tabs -->
      <q-tabs
        v-model="currentRoom"
        dense
        align="left"
        class="chat-tabs"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab
          v-for="room in messaging.rooms"
          :key="room"
          :name="room"
          :label="room"
        />
        <q-tab name="__new__" icon="add" @click="showCreateRoom = true" />
      </q-tabs>
      <q-separator />

      <q-card-section class="row chat-panel">
        <div class="col-12 col-md-8 chat-messages">
          <div class="room-header q-pa-sm">
            <div class="text-subtitle2">#{{ currentRoom }}</div>
          </div>
          <q-scroll-area style="height: 300px">
            <q-list separator>
              <q-item v-for="msg in roomMessages" :key="msg.id">
                <q-item-section avatar>
                  <q-chip
                    dense
                    :color="msg.type === 'direct' ? 'secondary' : 'primary'"
                    text-color="white"
                  >
                    {{ msg.from || t('pages.chat.live.anon') }}
                  </q-chip>
                </q-item-section>
                <q-item-section>
                  <div class="row items-center justify-between">
                    <div class="text-body1">{{ displayText(msg) }}</div>
                    <div class="text-caption chat-meta">
                      {{ formatTs(msg.ts) }}
                    </div>
                  </div>
                  <div class="text-caption chat-meta-secondary">
                    {{ messageTypeLabel(msg.type) }}
                    <span v-if="msg.to"> → {{ msg.to }}</span>
                    <span v-if="msg.room"> · {{ msg.room }}</span>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>

        <div class="col-12 col-md-4 chat-users">
          <div class="text-subtitle2 q-mb-sm">
            {{ t('pages.chat.live.users') }}
          </div>
          <q-list bordered class="rounded-borders chat-user-list">
            <q-item
              v-for="user in messaging.users"
              :key="user"
              clickable
              v-ripple
              @click="toggleUser(user)"
              :active="selectedUser === user"
            >
              <q-item-section>{{ user }}</q-item-section>
              <q-item-section side v-if="me === user">
                <q-badge color="positive" outline>{{
                  t('pages.chat.live.you')
                }}</q-badge>
              </q-item-section>
              <q-item-section side v-else-if="selectedUser === user">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
            <q-item v-if="!messaging.users.length">
              <q-item-section class="chat-empty">{{
                t('pages.chat.live.noUsers')
              }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="between" class="row no-wrap q-gutter-sm">
        <div class="col">
          <q-input
            v-model="draft"
            dense
            outlined
            :label="inputPlaceholder"
            @keyup.enter="send"
            :disable="!canReadChat"
          />
        </div>
        <q-btn
          color="primary"
          unelevated
          :label="
            selectedUser
              ? t('pages.chat.live.sendDirect')
              : t('pages.chat.live.send')
          "
          @click="send"
          :disable="!messaging.connected || !canReadChat"
        />
      </q-card-actions>
      <q-banner
        v-if="!canReadChat"
        class="q-mt-sm chat-warning-banner"
        rounded
        dense
        color="warning"
        :text-color="isDark ? 'white' : 'dark'"
      >
        <q-icon name="warning" class="q-mr-sm" />
        {{ t('pages.chat.live.loginRequiredToSend') }}
      </q-banner>
      <q-banner
        v-if="messaging.error"
        class="q-mt-sm"
        rounded
        dense
        color="negative"
        text-color="white"
      >
        {{ messaging.error }}
      </q-banner>
    </q-card>

    <!-- Create Room Dialog -->
    <q-dialog v-model="showCreateRoom">
      <q-card class="chat-dialog-card" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ t('pages.chat.live.createRoomTitle') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="newRoomName"
            dense
            outlined
            :label="t('pages.chat.live.roomNameLabel')"
            autofocus
            @keyup.enter="createRoom"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('general.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            unelevated
            :label="t('pages.chat.live.createRoomAction')"
            color="primary"
            @click="createRoom"
            :disable="!newRoomName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="content-grid q-gutter-md q-mt-lg">
      <q-card class="chat-info-card">
        <q-card-section>
          <div class="text-h6">{{ t('pages.chat.communityTitle') }}</div>
          <div class="text-body2 q-mt-xs">
            {{ t('pages.chat.communityBody') }}
          </div>
        </q-card-section>
      </q-card>

      <q-card class="chat-info-card">
        <q-card-section>
          <div class="text-h6">{{ t('pages.chat.devTitle') }}</div>
          <div class="text-body2 q-mt-xs">{{ t('pages.chat.devBody') }}</div>
        </q-card-section>
      </q-card>

      <q-card class="chat-info-card">
        <q-card-section>
          <div class="text-h6">{{ t('pages.chat.todoTitle') }}</div>
          <div class="text-body2 q-mt-xs">{{ t('pages.chat.todoBody') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMessagingStore } from '@/stores/messaging.pinia'
import { useAuthStore } from '@/stores/auth.pinia'
import { CaslSubjectE, CaslActionE } from '@shared/types'

const { t } = useI18n()
const $q = useQuasar()
const messaging = useMessagingStore()
const authStore = useAuthStore()
const draft = ref('')
const selectedUser = ref<string | null>(null)
const showCreateRoom = ref(false)
const newRoomName = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isDark = computed(() => $q.dark.isActive)

const loggedInName = computed(() => {
  const user = authStore._user as any
  if (!user || typeof user !== 'object') return ''

  const first = String(user.first_name || '').trim()
  const last = String(user.last_name || '').trim()
  const full = `${first} ${last}`.trim()
  if (full) return full

  const username = String(user.username || '').trim()
  if (username) return username

  const name = String(user.name || '').trim()
  if (name) return name

  const email = String(user.email || '').trim()
  if (email.includes('@')) return email.split('@')[0]

  return String(user.id || '').trim()
})

const loggedInLabel = computed(() => {
  const name = loggedInName.value
  if (!name) return String(t('welcome_guest') || '')
  return String(t('welcome_back', { name }) || name)
})

const currentRoom = computed({
  get: () => messaging.currentRoom,
  set: (val) => {
    if (val !== '__new__') {
      messaging.joinRoom(val)
    }
  },
})

const roomMessages = computed(() => messaging.roomMessages)
const messages = computed(() => messaging.messages)
const me = computed(() => messaging.me)

// CASL permission checks
const canReadChat = computed(() => {
  return isAuthenticated.value
})

const canManageChat = computed(() => {
  try {
    return authStore.ability?.can(CaslActionE.MANAGE, CaslSubjectE.CHAT)
  } catch {
    return false
  }
})

const isAdmin = computed(() => authStore._user?.role === 'admin')

const statusLabel = computed(() => {
  if (messaging.connected) return t('pages.chat.live.connected')
  if (messaging.connecting) return t('pages.chat.live.connecting')
  return t('pages.chat.live.disconnected')
})

const statusColor = computed(() => {
  if (messaging.connected) return 'positive'
  if (messaging.connecting) return 'warning'
  return 'negative'
})

const inputPlaceholder = computed(() => {
  if (selectedUser.value) return t('pages.chat.live.directMessage')
  return t('pages.chat.live.messageToRoom', { room: currentRoom.value })
})

function createRoom() {
  const name = newRoomName.value.trim()
  if (!name) return
  messaging.createRoom(name)
  newRoomName.value = ''
  showCreateRoom.value = false
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  if (selectedUser.value) {
    messaging.sendDirect(text, selectedUser.value)
  } else {
    messaging.sendBroadcast(text)
  }
  draft.value = ''
}

function toggleUser(user: string) {
  selectedUser.value = selectedUser.value === user ? null : user
}

function refresh() {
  messaging.disconnect()
  messaging.connect()
}

function displayText(msg: any) {
  if (msg?.text) return msg.text
  if (typeof msg?.payload === 'string') return msg.payload
  if (msg?.payload) return JSON.stringify(msg.payload)
  return ''
}

function messageTypeLabel(type: string) {
  if (type === 'direct') return String(t('pages.chat.live.directMessage'))
  if (type === 'broadcast') return String(t('pages.chat.live.broadcastMessage'))
  return type
}

function formatTs(ts: number) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString()
  } catch {
    return ''
  }
}

onMounted(() => {
  messaging.connect()
})

onBeforeUnmount(() => {
  messaging.disconnect()
})
</script>

<style scoped>
.chat-page {
  max-width: 900px;
  margin: 0 auto;
}

.chat-surface,
.chat-info-card,
.chat-dialog-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.hero {
  text-align: center;
}

.subtitle {
  color: #475569;
  margin-top: 6px;
}

.logged-user {
  color: #334155;
  font-weight: 500;
}

.chat-tabs {
  color: #64748b;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.live-chat {
  border: 1px solid #e2e8f0;
}

.chat-panel {
  gap: 16px;
}

.chat-messages .q-list {
  background: #f8fafc;
}

.room-header {
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.chat-users {
  min-width: 220px;
}

.chat-user-list {
  background: #f8fafc;
}

.chat-meta {
  color: #64748b;
}

.chat-meta-secondary,
.chat-empty {
  color: #475569;
}

.chat-warning-banner {
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-actions .q-btn {
    width: 100%;
  }
  .chat-panel {
    flex-direction: column;
  }
}

/* Landscape Optimizations */
@media (orientation: landscape) and (max-height: 500px) {
  /* Compact header for more message space */
  .hero {
    padding: 12px 0;
  }

  .hero h1 {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 0.85rem;
    margin-top: 2px;
  }

  .hero-actions {
    margin-top: 8px;
  }

  /* Taller message area */
  .chat-messages .q-scroll-area {
    height: 250px !important;
  }

  /* Single row layout for better keyboard handling */
  .chat-panel {
    gap: 8px;
  }
}

@media (orientation: landscape) and (min-width: 768px) {
  /* Side-by-side messages and users */
  .chat-panel {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 16px;
  }

  .chat-messages {
    grid-column: 1;
  }

  .chat-users {
    grid-column: 2;
  }

  /* Taller scroll area for desktop landscape */
  .chat-messages .q-scroll-area {
    height: 400px !important;
  }
}

:global(body.body--dark) .chat-page {
  color: #fff;
}

:global(body.body--dark) .chat-page .chat-surface,
:global(body.body--dark) .chat-page .chat-info-card,
:global(body.body--dark) .chat-page .chat-dialog-card {
  background: rgba(5, 5, 5, 0.96);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  color: #fff;
}

:global(body.body--dark) .chat-page .subtitle,
:global(body.body--dark) .chat-page .logged-user,
:global(body.body--dark) .chat-page .chat-tabs,
:global(body.body--dark) .chat-page .chat-meta,
:global(body.body--dark) .chat-page .chat-meta-secondary,
:global(body.body--dark) .chat-page .chat-empty {
  color: rgba(255, 255, 255, 0.76) !important;
}

:global(body.body--dark) .chat-page .chat-messages .q-list,
:global(body.body--dark) .chat-page .chat-user-list,
:global(body.body--dark) .chat-page .room-header {
  background: rgba(255, 255, 255, 0.04);
}

:global(body.body--dark) .chat-page .room-header,
:global(body.body--dark) .chat-page .live-chat,
:global(body.body--dark) .chat-page .chat-user-list {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(body.body--dark) .chat-page .chat-warning-banner {
  border-color: rgba(245, 158, 11, 0.32);
}

:global(body.body--dark) .chat-page :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
}

:global(body.body--dark) .chat-page :deep(.q-field__native),
:global(body.body--dark) .chat-page :deep(.q-field__input),
:global(body.body--dark) .chat-page :deep(.q-field__label),
:global(body.body--dark) .chat-page :deep(.q-tab__label),
:global(body.body--dark) .chat-page :deep(.q-item__label),
:global(body.body--dark) .chat-page :deep(.q-item__label--caption) {
  color: inherit;
}
</style>
