<template>
  <q-page class="chat-page">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="chat-header">
      <div class="chat-header-left">
        <div class="chat-title-row">
          <q-icon name="chat_bubble" size="22px" class="chat-title-icon" />
          <h1 class="chat-title">{{ t('pages.chat.title') }}</h1>
          <q-badge v-if="canManageChat" color="deep-orange" class="admin-badge">
            {{ t('pages.chat.live.adminBadge') }}
          </q-badge>
        </div>
        <div class="chat-status-row">
          <span class="status-dot" :class="statusDotClass" />
          <span class="status-label">{{ statusLabel }}</span>
          <span v-if="messaging.reconnectIn > 0" class="reconnect-countdown">
            · {{ t('pages.chat.live.reconnectIn', { n: messaging.reconnectIn }) }}
          </span>
        </div>
      </div>
      <div class="chat-header-right">
        <q-btn
          flat
          round
          dense
          icon="refresh"
          :loading="messaging.connecting"
          :aria-label="t('pages.chat.live.reconnect')"
          @click="manualReconnect"
        />
        <q-btn
          flat
          round
          dense
          :icon="showUsers ? 'group' : 'group_off'"
          :aria-label="t('pages.chat.live.users')"
          class="gt-sm"
          @click="showUsers = !showUsers"
        />
      </div>
    </div>

    <!-- ── Room Tabs ───────────────────────────────────────────────────── -->
    <div class="room-tabs-bar">
      <q-tabs
        v-model="currentRoom"
        dense
        no-caps
        align="left"
        class="room-tabs"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab
          v-for="room in messaging.rooms"
          :key="room"
          :name="room"
          class="room-tab"
        >
          <span class="room-tab-label">#{{ room }}</span>
        </q-tab>
        <q-tab name="__new__" icon="add" @click.prevent="showCreateRoom = true" />
      </q-tabs>
    </div>

    <!-- ── Main Chat Body ──────────────────────────────────────────────── -->
    <div class="chat-body">
      <!-- Messages column -->
      <div class="messages-column">
        <!-- Room label -->
        <div class="room-label">
          <q-icon name="tag" size="14px" />
          <span>{{ messaging.currentRoom }}</span>
          <q-space />
          <span class="online-count">
            <q-icon name="circle" size="10px" color="positive" />
            {{ messaging.users.length }} {{ t('pages.chat.live.online') }}
          </span>
        </div>

        <!-- Scrollable messages -->
        <div ref="messagesEl" class="messages-scroll" @scroll.passive="onScroll">
          <!-- Empty state -->
          <div v-if="roomMessages.length === 0" class="messages-empty">
            <q-icon name="chat_bubble_outline" size="48px" class="empty-icon" />
            <p>{{ t('pages.chat.live.emptyRoom') }}</p>
          </div>

          <!-- Message list -->
          <template v-else>
            <div
              v-for="(msg, idx) in roomMessages"
              :key="msg.id"
              class="message-row"
              :class="{
                'is-mine': isMine(msg.from),
                'is-grouped': isGrouped(idx),
              }"
            >
              <!-- Avatar (only first of group) -->
              <div v-if="!isGrouped(idx)" class="msg-avatar" :style="{ background: avatarColor(msg.author || msg.from) }">
                {{ initials(msg.author || msg.from) }}
              </div>
              <div v-else class="msg-avatar-spacer" />

              <div class="msg-content">
                <!-- Author + time (only first of group) -->
                <div v-if="!isGrouped(idx)" class="msg-meta">
                  <span class="msg-author">{{ displayAuthor(msg) }}</span>
                  <span v-if="msg.type === 'direct'" class="msg-dm-badge">DM</span>
                  <span class="msg-time">{{ formatTs(msg.ts) }}</span>
                </div>

                <!-- Bubble -->
                <div class="msg-bubble">
                  {{ msg.text }}
                </div>
              </div>
            </div>
          </template>

          <!-- Scroll anchor -->
          <div ref="scrollAnchorEl" />
        </div>

        <!-- Scroll to bottom FAB -->
        <transition name="fade-up">
          <q-btn
            v-if="showScrollBtn"
            class="scroll-to-bottom-btn"
            round
            unelevated
            color="primary"
            icon="keyboard_arrow_down"
            size="sm"
            @click="scrollToBottom(true)"
          />
        </transition>

        <!-- Input area -->
        <div class="input-area">
          <div v-if="selectedUser" class="dm-banner">
            <q-icon name="person" size="14px" />
            {{ t('pages.chat.live.dmingUser', { user: selectedUser }) }}
            <q-btn flat dense round icon="close" size="xs" @click="selectedUser = null" />
          </div>
          <div class="input-row">
            <q-input
              v-model="draft"
              class="msg-input"
              dense
              outlined
              autogrow
              :placeholder="inputPlaceholder"
              :disable="!canSend"
              @keydown.enter.exact.prevent="send"
              @keydown.enter.shift.exact="draft += '\n'"
            />
            <q-btn
              class="send-btn"
              unelevated
              round
              color="primary"
              icon="send"
              :disable="!canSend || !draft.trim()"
              @click="send"
            />
          </div>
          <div v-if="!isAuthenticated" class="login-required-hint">
            <q-icon name="lock" size="14px" />
            {{ t('pages.chat.live.loginRequiredToSend') }}
          </div>
          <div v-if="messaging.error" class="error-hint">
            <q-icon name="error_outline" size="14px" />
            {{ messaging.error }}
          </div>
        </div>
      </div>

      <!-- Users sidebar -->
      <transition name="slide-users">
        <div v-show="showUsers" class="users-sidebar">
          <div class="users-sidebar-title">
            {{ t('pages.chat.live.users') }}
            <q-badge color="primary" outline class="q-ml-xs">{{ messaging.users.length }}</q-badge>
          </div>
          <div class="users-list">
            <div
              v-for="user in messaging.users"
              :key="user"
              class="user-row"
              :class="{ 'is-selected': selectedUser === user, 'is-me': isMine(user) }"
              @click="toggleUser(user)"
            >
              <div class="user-avatar" :style="{ background: avatarColor(user) }">
                {{ initials(user) }}
              </div>
              <div class="user-info">
                <span class="user-name">{{ user }}</span>
                <span v-if="isMine(user)" class="user-you-badge">{{ t('pages.chat.live.you') }}</span>
              </div>
              <div class="user-status-dot" />
            </div>
            <div v-if="!messaging.users.length" class="users-empty">
              {{ t('pages.chat.live.noUsers') }}
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- ── Create Room Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showCreateRoom">
      <q-card class="create-room-card">
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
          <q-btn flat :label="t('general.cancel')" color="primary" v-close-popup />
          <q-btn
            unelevated
            :label="t('pages.chat.live.createRoomAction')"
            color="primary"
            :disable="!newRoomName.trim()"
            @click="createRoom"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMessagingStore } from '@/stores/messaging.pinia'
import { useAuthStore } from '@/stores/auth.pinia'
import { CaslSubjectE, CaslActionE } from '@shared/types'

const { t } = useI18n()
const $q = useQuasar()
const messaging = useMessagingStore()
const authStore = useAuthStore()

// ── UI state ──────────────────────────────────────────────────────────────────

const draft = ref('')
const selectedUser = ref<string | null>(null)
const showCreateRoom = ref(false)
const newRoomName = ref('')
const showUsers = ref(true)
const showScrollBtn = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const scrollAnchorEl = ref<HTMLElement | null>(null)

// ── Auth ──────────────────────────────────────────────────────────────────────

const isAuthenticated = computed(() => authStore.isAuthenticated)

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
  if (email.includes('@')) return email.split('@')[0]!
  return String(user.id || '').trim()
})

// ── Permissions ───────────────────────────────────────────────────────────────

const canSend = computed(() => isAuthenticated.value && messaging.connected)

const canManageChat = computed(() => {
  try {
    return authStore.ability?.can(CaslActionE.MANAGE, CaslSubjectE.CHAT)
  } catch {
    return false
  }
})

// ── Status ────────────────────────────────────────────────────────────────────

const statusDotClass = computed(() => {
  if (messaging.connected) return 'dot-connected'
  if (messaging.connecting || messaging.reconnectIn > 0) return 'dot-connecting'
  return 'dot-disconnected'
})

const statusLabel = computed(() => {
  if (messaging.connected) return t('pages.chat.live.connected')
  if (messaging.connecting) return t('pages.chat.live.connecting')
  return t('pages.chat.live.disconnected')
})

// ── Rooms ─────────────────────────────────────────────────────────────────────

const currentRoom = computed({
  get: () => messaging.currentRoom,
  set: (val) => { if (val !== '__new__') messaging.joinRoom(val) },
})

const roomMessages = computed(() => messaging.roomMessages)

// ── Scroll ────────────────────────────────────────────────────────────────────

let isAtBottom = true

function onScroll(): void {
  const el = messagesEl.value
  if (!el) return
  const threshold = 120
  isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  showScrollBtn.value = !isAtBottom
}

async function scrollToBottom(force = false): Promise<void> {
  if (!force && !isAtBottom) return
  await nextTick()
  scrollAnchorEl.value?.scrollIntoView({ behavior: force ? 'smooth' : 'instant' })
}

watch(roomMessages, () => scrollToBottom(), { flush: 'post' })

// ── Message display helpers ───────────────────────────────────────────────────

const me = computed(() => messaging.me)

function isMine(fromId: string): boolean {
  return !!me.value && fromId === me.value
}

function displayAuthor(msg: { from: string; author?: string }): string {
  if (isMine(msg.from)) return t('pages.chat.live.you')
  return msg.author || msg.from
}

function isGrouped(idx: number): boolean {
  if (idx === 0) return false
  const curr = roomMessages.value[idx]
  const prev = roomMessages.value[idx - 1]
  if (!curr || !prev) return false
  return curr.from === prev.from && (curr.ts - prev.ts) < 60_000
}

const inputPlaceholder = computed(() => {
  if (!isAuthenticated.value) return t('pages.chat.live.loginRequiredToSend')
  if (selectedUser.value) return t('pages.chat.live.directMessage')
  return t('pages.chat.live.messageToRoom', { room: messaging.currentRoom })
})

// ── Avatars ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
]

function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]!
}

function initials(id: string): string {
  const parts = id.trim().split(/[\s\-_]+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return id.slice(0, 2).toUpperCase()
}

// ── Timestamps ────────────────────────────────────────────────────────────────

function formatTs(ts: number): string {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    if (diffMs < 60_000) return 'just now'
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

function send(): void {
  const text = draft.value.trim()
  if (!text || !canSend.value) return
  if (selectedUser.value) {
    messaging.sendDirect(text, selectedUser.value)
  } else {
    messaging.sendBroadcast(text)
  }
  draft.value = ''
}

function toggleUser(user: string): void {
  if (isMine(user)) return
  selectedUser.value = selectedUser.value === user ? null : user
}

function manualReconnect(): void {
  messaging.manualReconnect()
}

function createRoom(): void {
  const name = newRoomName.value.trim()
  if (!name) return
  messaging.createRoom(name)
  newRoomName.value = ''
  showCreateRoom.value = false
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  // Tell the store the user's display name so messages show their real name
  if (loggedInName.value) messaging.setDisplayName(loggedInName.value)
  messaging.connect()
  nextTick(() => scrollToBottom(true))
})

watch(loggedInName, (name) => {
  if (name) messaging.setDisplayName(name)
})

onBeforeUnmount(() => {
  messaging.disconnect(true)
})
</script>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────────────── */
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.chat-header-left { display: flex; flex-direction: column; gap: 4px; }
.chat-header-right { display: flex; gap: 4px; }
.chat-title-row { display: flex; align-items: center; gap: 8px; }
.chat-title { font-size: 1.15rem; font-weight: 700; margin: 0; }
.chat-title-icon { opacity: 0.8; }
.admin-badge { font-size: 0.65rem; }

.chat-status-row { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; opacity: 0.75; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0;
}
.dot-connected { background: #22c55e; box-shadow: 0 0 6px #22c55e80; animation: pulse-green 2s infinite; }
.dot-connecting { background: #f59e0b; animation: pulse-amber 1s infinite; }
.dot-disconnected { background: #ef4444; }
.reconnect-countdown { font-size: 0.75rem; color: #f59e0b; }

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 4px #22c55e80; }
  50% { box-shadow: 0 0 10px #22c55eb0; }
}
@keyframes pulse-amber {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.room-tabs-bar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  padding: 0 8px;
}
.room-tab-label { font-size: 0.82rem; }

/* ── Body ─────────────────────────────────────────────────────────────────── */
.chat-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Messages column ──────────────────────────────────────────────────────── */
.messages-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.room-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  font-size: 0.78rem;
  opacity: 0.6;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.online-count { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; }

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scroll-behavior: smooth;
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
.messages-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 8px;
  opacity: 0.4;
  padding: 40px 0;
  text-align: center;
}
.empty-icon { opacity: 0.5; }

/* ── Message row ──────────────────────────────────────────────────────────── */
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 1px 0;
}
.message-row.is-mine { flex-direction: row-reverse; }
.message-row.is-grouped { padding-top: 1px; }

.msg-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  text-transform: uppercase;
}
.msg-avatar-spacer { width: 32px; flex-shrink: 0; }

.msg-content { display: flex; flex-direction: column; max-width: 70%; }
.message-row.is-mine .msg-content { align-items: flex-end; }

.msg-meta {
  display: flex; align-items: baseline; gap: 6px;
  margin-bottom: 2px;
  padding: 0 4px;
}
.msg-author { font-size: 0.78rem; font-weight: 600; }
.msg-time { font-size: 0.7rem; opacity: 0.55; }
.msg-dm-badge {
  font-size: 0.62rem; padding: 1px 4px;
  background: #8b5cf620; color: #8b5cf6;
  border-radius: 3px; font-weight: 700;
}

.msg-bubble {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.45;
  word-break: break-word;
  background: var(--bubble-other-bg);
  color: var(--bubble-other-text);
  border-bottom-left-radius: 4px;
  max-width: 100%;
}
.message-row.is-mine .msg-bubble {
  background: var(--bubble-mine-bg);
  color: var(--bubble-mine-text);
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 16px;
}
.message-row.is-grouped:not(.is-mine) .msg-bubble { border-top-left-radius: 4px; }
.message-row.is-grouped.is-mine .msg-bubble { border-top-right-radius: 4px; }

/* ── Scroll to bottom ─────────────────────────────────────────────────────── */
.scroll-to-bottom-btn {
  position: absolute;
  bottom: 80px; right: 16px;
  z-index: 10;
  box-shadow: 0 4px 16px #0004;
}
.fade-up-enter-active, .fade-up-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(8px); }

/* ── Input area ───────────────────────────────────────────────────────────── */
.input-area {
  flex-shrink: 0;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dm-banner {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; padding: 4px 8px;
  background: #8b5cf615; border-radius: 6px; color: #8b5cf6;
  border: 1px solid #8b5cf630;
}
.input-row { display: flex; gap: 8px; align-items: flex-end; }
.msg-input { flex: 1; }
.send-btn { flex-shrink: 0; }
.login-required-hint, .error-hint {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.76rem; opacity: 0.65;
}
.error-hint { color: #ef4444; opacity: 1; }

/* ── Users sidebar ────────────────────────────────────────────────────────── */
.users-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.slide-users-enter-active, .slide-users-leave-active { transition: width 0.25s ease, opacity 0.2s; }
.slide-users-enter-from, .slide-users-leave-to { width: 0; opacity: 0; }

.users-sidebar-title {
  padding: 12px 14px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}
.users-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 6px;
  margin: 1px 6px;
  transition: background 0.15s;
}
.user-row:hover { background: var(--hover-bg); }
.user-row.is-selected { background: #6366f115; }
.user-row.is-me { cursor: default; }
.user-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.user-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.user-name { font-size: 0.82rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-you-badge { font-size: 0.65rem; color: #22c55e; font-weight: 600; }
.user-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
.users-empty { padding: 16px 14px; font-size: 0.8rem; opacity: 0.4; text-align: center; }

/* ── Create room dialog ───────────────────────────────────────────────────── */
.create-room-card { min-width: 320px; }

/* ── CSS Variables ────────────────────────────────────────────────────────── */
:root {
  --border-color: rgba(0, 0, 0, 0.1);
  --bubble-other-bg: #f1f5f9;
  --bubble-other-text: #1e293b;
  --bubble-mine-bg: #6366f1;
  --bubble-mine-text: #ffffff;
  --hover-bg: rgba(0, 0, 0, 0.04);
}

/* ── Dark mode overrides ──────────────────────────────────────────────────── */
:global(body.body--dark) .chat-page {
  --border-color: rgba(255, 255, 255, 0.08);
  --bubble-other-bg: rgba(255, 255, 255, 0.07);
  --bubble-other-text: #e2e8f0;
  --bubble-mine-bg: #6366f1;
  --bubble-mine-text: #ffffff;
  --hover-bg: rgba(255, 255, 255, 0.06);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .users-sidebar { display: none; }
  .msg-content { max-width: 85%; }
  .chat-header { padding: 10px 14px 8px; }
}
</style>
