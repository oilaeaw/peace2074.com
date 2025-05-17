<script setup lang="ts">
const accepted = ref(false)

onMounted(() => {
  if (localStorage.getItem('cookieAccepted') === 'true') {
    accepted.value = true
  }
})

function acceptCookies() {
  localStorage.setItem('cookieAccepted', 'true')
  accepted.value = true
}
</script>

<template>
  <div v-if="!accepted" class="cookie-consent">
    <span>
      We use cookies to improve your experience. By using our site, you accept cookies.
    </span>
    <q-btn color="primary" size="sm" @click="acceptCookies">
      Accept
    </q-btn>
  </div>
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
