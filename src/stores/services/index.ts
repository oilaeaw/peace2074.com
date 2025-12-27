import { useFetch } from '@vueuse/core';

import et from '~/.env'
type ENV = typeof et

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

const env = (import.meta as any)?.env || {}
const DEFAULT_NITRO_PORT = 3000

function computeNitroBase() {
  const configured = env.VITE_QURAN_API_BASE || env.viteQuranApiBase
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:${DEFAULT_NITRO_PORT}`.replace(/\/$/, '')
  }
  return ''
}

const NITRO_BASE = computeNitroBase()

if (typeof window !== 'undefined') {
  if (NITRO_BASE) {
    console.debug('[DeepSeek] targeting', NITRO_BASE)
  } else {
    console.warn('[DeepSeek] VITE_QURAN_API_BASE missing; falling back to same-origin requests')
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
