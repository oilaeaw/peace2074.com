<script setup lang="ts">
import { onMounted, ref } from '#imports'

// Avoid rendering cookie consent on the server so we don't access
// localStorage during SSR or render content that differs on the client.
const accepted = ref<boolean | null>(null)

import useCore from '@app/composables/useCore'

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  }
  catch {
    return null
  }
}

function writeCookie(name: string, value: string, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '')
  }
  catch {}
}

onMounted(async () => {
  // Prefer a durable first-party cookie (1 year), fallback to core storage
  const cookie = readCookie('cookieAccepted')
  if (cookie === '1' || cookie === 'true') {
    accepted.value = true
    try { void useCore().set('cookieAccepted', 'true') } catch {}
    return
  }

  try {
    const v = await useCore().get('cookieAccepted')
    accepted.value = v === 'true' || v === true
  }
  catch {
    accepted.value = false
  }
})

function acceptCookies() {
  try { void useCore().set('cookieAccepted', 'true') } catch {}
  writeCookie('cookieAccepted', '1', 365)
  accepted.value = true
}
</script>

<template>
  <client-only>
    <div v-if="accepted === false" class="cookie-consent">
      <span>
        We use cookies to improve your experience. By using our site, you accept cookies.
      </span>
      <q-btn color="primary" size="sm" @click="acceptCookies">
        Accept
      </q-btn>
    </div>
  </client-only>
</template>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 48px;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 400px;
  background: var(--cookie-bg, #222);
  color: var(--cookie-text, #fff);
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  transition:
    background 0.3s,
    color 0.3s;
}
:root {
  --cookie-bg: #f5f5f5;
  --cookie-text: #222;
}
.dark .cookie-consent {
  --cookie-bg: #222;
  --cookie-text: #fff;
}
</style>
