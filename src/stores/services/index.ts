import { useFetch } from "@vueuse/core";

export async function getHolyNames() {
  const url = "/api/holynames";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function getHolyBook() {
  const url = "/api/quran";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function getBookmarks() {
  try {
    const res = await fetch("/api/bookmarks", { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function createBookmark({ bookmark }: { bookmark: string }) {
  try {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ bookmark }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function updateBookmark(id: string, bookmark: string) {
  try {
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ bookmark }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function deleteBookmark(id: string) {
  try {
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(e);
    return null;
  }
}

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekPayload = {
  messages: DeepSeekMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

type ContactPayload = {
  name: string;
  email: string;
  project: string;
  message: string;
};

const env = (import.meta as any)?.env || {}
const DEFAULT_NITRO_PORT = 3000

function computeNitroBase() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location

    // Local dev: check for override, otherwise use local Nitro
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const configured = env.VITE_NITRO_BASE
      if (configured && typeof configured === 'string') {
        return configured.replace(/\/$/, '')
      }
      return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`.replace(/\/$/, '')
    }

    // Production: always use /api prefix for Netlify Functions routing
    return '/api'
  }

  // SSR/default fallback: /api
  return '/api'
}

const NITRO_BASE = computeNitroBase();

if (typeof window !== "undefined") {
  if (NITRO_BASE) {
    console.debug("[DeepSeek] targeting", NITRO_BASE);
  } else {
    console.warn('[DeepSeek] NITRO_BASE missing; falling back to same-origin requests')
  }
}

function resolveNitroUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return NITRO_BASE ? `${NITRO_BASE}${normalized}` : normalized;
}

export async function sendDeepSeekChat(payload: DeepSeekPayload) {
  if (!payload?.messages?.length) {
    throw new Error("DeepSeek payload requires at least one message");
  }
  try {
    const res = await fetch(resolveNitroUrl("/deepseek"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errPayload = await res.json().catch(() => ({}));
      throw new Error(errPayload?.error || `DeepSeek request failed (${res.status})`);
    }
    return await res.json();
  } catch (e) {
    console.warn("DeepSeek request failed", e);
    throw e;
  }
}

export async function sendContactMessage(payload: ContactPayload) {
  const trimmed = {
    name: payload?.name?.trim() || "",
    email: payload?.email?.trim() || "",
    project: payload?.project?.trim() || "General",
    message: payload?.message?.trim() || "",
  };

  if (!trimmed.name || !trimmed.email || !trimmed.message) {
    throw new Error("Contact form is missing required fields");
  }

  const res = await fetch(resolveNitroUrl("/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trimmed),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.statusMessage || data?.error || `Contact failed (${res.status})`);
  }

  return res.json();
}
