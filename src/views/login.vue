<script setup lang="ts">
import { ref } from "vue";

const env = (import.meta as any)?.env || {};
const DEFAULT_NITRO_PORT = 3000;
const PROD_FALLBACK = "https://api.waelio.com";
const NITRO_PREFIX = (env.VITE_NITRO_PREFIX || "").replace(/\/+$/, "");
const DEV_FALLBACKS = [
  `http://localhost:${DEFAULT_NITRO_PORT}`,
  `http://127.0.0.1:${DEFAULT_NITRO_PORT}`,
];

function computeNitroBase() {
  const configured = env.VITE_NITRO_BASE;
  if (configured && typeof configured === "string") {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocal) {
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`.replace(/\/$/, "");
    }
    // In production, default to the public API host if not provided explicitly
    return PROD_FALLBACK;
  }

  return "";
}

const NITRO_BASE = computeNitroBase();

const mode = ref<'otp' | 'magic'>("otp");
const email = ref("");
const code = ref("");
const status = ref("");
const error = ref("");
const loading = ref(false);
const me = ref<any>(null);
const debugCode = ref("");
const debugLink = ref("");

function resolveUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withPrefix = NITRO_PREFIX ? `${NITRO_PREFIX}${normalized}` : normalized;
  if (NITRO_BASE) return `${NITRO_BASE}${withPrefix}`;
  return withPrefix;
}

async function callApi(paths: string | string[], options: RequestInit = {}) {
  const inputPaths = Array.isArray(paths) ? paths : [paths];
  const candidates: string[] = [];

  for (const p of inputPaths) {
    const resolved = resolveUrl(p);
    if (!candidates.includes(resolved)) candidates.push(resolved);

    // Only add same-origin raw fallback if no explicit Nitro base is set
    if (!NITRO_BASE && resolved !== p && !p.startsWith("http") && !candidates.includes(p)) {
      candidates.push(p);
    }
  }

  // Dev safety net: if no explicit Nitro base is set, also try localhost dev ports
  if (!NITRO_BASE && (typeof window === "undefined" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    for (const base of DEV_FALLBACKS) {
      for (const p of inputPaths) {
        if (p.startsWith("http")) continue;
        const normalized = p.startsWith("/") ? p : `/${p}`;
        const candidate = `${base}${normalized}`;
        if (!candidates.includes(candidate)) candidates.push(candidate);
      }
    }
  }

  let lastErr: unknown = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.statusMessage || data?.error || `HTTP ${res.status}`);
        }
        const text = await res.text();
        const snippet = text.slice(0, 120).replace(/\s+/g, " ");
        if (snippet.toLowerCase().startsWith("<!doctype")) {
          throw new Error(`Received HTML from ${url} — is the Nitro API running on ${NITRO_BASE || 'your API host'}?`);
        }
        throw new Error(`Request failed (${res.status}); response: ${snippet}`);
      }

      if (contentType.includes("application/json")) {
        return res.json();
      }

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        const snippet = text.slice(0, 120).replace(/\s+/g, " ");
        throw new Error(`Expected JSON from ${url} but got: ${snippet}`);
      }
    } catch (e: any) {
      const message = e?.message || String(e);
      lastErr = new Error(`Failed to reach ${url}: ${message}`);
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
