<script setup lang="ts">
import { ref } from "vue";

const passcode = ref("");
const status = ref("");
const error = ref("");
const loading = ref(false);
const me = ref<any>(null);

async function callApi(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.statusMessage || data?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function login() {
  if (!passcode.value) return;
  loading.value = true;
  status.value = "";
  error.value = "";
  me.value = null;
  try {
    const data = await callApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ passcode: passcode.value }),
    });
    status.value = "Logged in";
    me.value = data?.user || null;
  } catch (e: any) {
    error.value = e?.message || "Login failed";
  } finally {
    loading.value = false;
  }
}

async function fetchMe() {
  loading.value = true;
  status.value = "";
  error.value = "";
  try {
    const data = await callApi("/api/auth/me");
    status.value = "Session valid";
    me.value = data?.user || null;
  } catch (e: any) {
    error.value = e?.message || "Not authenticated";
    me.value = null;
  } finally {
    loading.value = false;
  }
}

async function logout() {
  loading.value = true;
  status.value = "";
  error.value = "";
  try {
    await callApi("/api/auth/logout", { method: "POST" });
    status.value = "Logged out";
    me.value = null;
  } catch (e: any) {
    error.value = e?.message || "Logout failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <q-page padding class="login-page">
    <q-card class="login-card q-pa-lg q-gutter-md">
      <div class="text-h6">Passcode Login</div>
      <q-input
        v-model="passcode"
        type="password"
        label="Passcode"
        autocomplete="current-password"
        outlined
      />
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          :loading="loading"
          :disable="!passcode"
          label="Login"
          @click="login"
        />
        <q-btn
          flat
          color="primary"
          :loading="loading"
          label="Check session"
          @click="fetchMe"
        />
        <q-btn flat color="negative" :loading="loading" label="Logout" @click="logout" />
      </div>

      <q-banner v-if="status" class="bg-positive text-white" rounded dense>{{
        status
      }}</q-banner>
      <q-banner v-if="error" class="bg-negative text-white" rounded dense>{{
        error
      }}</q-banner>

      <div v-if="me" class="q-mt-md">
        <div class="text-subtitle2">Current user</div>
        <pre class="user-block">{{ JSON.stringify(me, null, 2) }}</pre>
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.login-page {
  max-width: 520px;
  margin: 0 auto;
}
.login-card {
  border: 1px solid #e2e8f0;
}
.user-block {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  overflow-x: auto;
}
</style>
