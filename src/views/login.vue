<script setup lang="ts">
import { ref } from "vue";

const mode = ref<'otp' | 'magic'>("otp");
const email = ref("");
const code = ref("");
const status = ref("");
const error = ref("");
const loading = ref(false);
const me = ref<any>(null);
const debugCode = ref("");
const debugLink = ref("");

const runtimeBase = (typeof window !== "undefined" && window.location?.origin)
  ? window.location.origin.replace(/\/$/, "")
  : "http://localhost:3000";

async function callApi(paths: string | string[], options: RequestInit = {}) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  let lastErr: unknown = null;

  for (const path of candidates) {
    try {
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
    } catch (e) {
      lastErr = e;
      // try next candidate
    }
  }

  throw lastErr || new Error("All endpoints failed");
}

function resetMessages() {
  status.value = "";
  error.value = "";
  debugCode.value = "";
  debugLink.value = "";
}

async function sendOtp() {
  if (!email.value) return;
  loading.value = true;
  resetMessages();
  try {
    const data = await callApi([
      `/auth/request-otp`,
      `/api/auth/request-otp`,
      `${runtimeBase}/auth/request-otp`,
      `${runtimeBase}/api/auth/request-otp`,
    ], {
      method: "POST",
      body: JSON.stringify({ email: email.value }),
    });
    if (data?.error) throw new Error(data.error);
    status.value = "Code sent";
    if (data?.debugCode) {
      debugCode.value = data.debugCode;
      code.value = data.debugCode;
    }
  } catch (e: any) {
    error.value = e?.message || "Could not send code";
  } finally {
    loading.value = false;
  }
}

async function verifyOtp() {
  if (!email.value || !code.value) return;
  loading.value = true;
  resetMessages();
  try {
    const data = await callApi([
      `/auth/verify-otp`,
      `/api/auth/verify-otp`,
      `${runtimeBase}/auth/verify-otp`,
      `${runtimeBase}/api/auth/verify-otp`,
    ], {
      method: "POST",
      body: JSON.stringify({ email: email.value, code: code.value }),
    });
    status.value = "Logged in";
    me.value = data?.user || null;
  } catch (e: any) {
    error.value = e?.message || "Login failed";
  } finally {
    loading.value = false;
  }
}

async function sendMagicLink() {
  if (!email.value) return;
  loading.value = true;
  resetMessages();
  try {
    const data = await callApi([
      `/auth/request-magic-link`,
      `/api/auth/request-magic-link`,
      `${runtimeBase}/auth/request-magic-link`,
      `${runtimeBase}/api/auth/request-magic-link`,
    ], {
      method: "POST",
      body: JSON.stringify({ email: email.value }),
    });
    if (data?.error) throw new Error(data.error);
    status.value = "Magic link sent";
    if (data?.debugLink) {
      debugLink.value = data.debugLink;
    }
  } catch (e: any) {
    error.value = e?.message || "Could not send link";
  } finally {
    loading.value = false;
  }
}

async function fetchMe() {
  loading.value = true;
  resetMessages();
  try {
    const data = await callApi([
      `/auth/me`,
      `/api/auth/me`,
      `${runtimeBase}/auth/me`,
      `${runtimeBase}/api/auth/me`,
    ]);
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
  resetMessages();
  try {
    await callApi([
      `/auth/logout`,
      `/api/auth/logout`,
      `${runtimeBase}/auth/logout`,
      `${runtimeBase}/api/auth/logout`,
    ], { method: "POST" });
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
      <div class="text-h6">Access</div>

      <q-btn-toggle
        v-model="mode"
        :options="[
          { label: 'One-time code', value: 'otp' },
          { label: 'Magic link', value: 'magic' },
        ]"
        color="primary"
        text-color="white"
        rounded
        unelevated
        spread
      />

      <q-input
        v-model="email"
        type="email"
        label="Email"
        autocomplete="email"
        outlined
      />

      <template v-if="mode === 'otp'">
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            unelevated
            :loading="loading"
            :disable="!email"
            label="Send code"
            @click="sendOtp"
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
        <q-input
          v-model="code"
          type="text"
          label="Enter code"
          outlined
        />
        <q-btn
          color="primary"
          unelevated
          :loading="loading"
          :disable="!email || !code"
          label="Verify & login"
          @click="verifyOtp"
        />
        <q-banner v-if="debugCode" class="bg-grey-2 text-body2" rounded dense>
          Dev code: {{ debugCode }}
        </q-banner>
      </template>

      <template v-else>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            unelevated
            :loading="loading"
            :disable="!email"
            label="Send magic link"
            @click="sendMagicLink"
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
        <q-banner v-if="debugLink" class="bg-grey-2 text-body2" rounded dense>
          Dev link: <a :href="debugLink">{{ debugLink }}</a>
        </q-banner>
        <q-banner class="bg-grey-1 text-body2" rounded dense>
          We sent a link to your email. If you can’t click it, copy the dev link above.
        </q-banner>
      </template>

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
