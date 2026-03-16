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
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'

function computeNitroBase() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const configured = env.VITE_NITRO_BASE

    // Explicit override always wins (useful for mobile builds)
    if (configured && typeof configured === 'string') {
      return configured.replace(/\/$/, '')
    }

    // Capacitor/Ionic runtime is not same-origin with Netlify functions
    if (protocol === 'capacitor:' || protocol === 'ionic:' || protocol === 'app:') {
      return DEFAULT_MOBILE_API_BASE
    }

    // Local dev: check for override, otherwise use local Nitro
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
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

export async function fetchDeployLikes() {
  try {
    const res = await fetch(resolveNitroUrl("/deploys/likes"), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to fetch likes (${res.status})`);
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to fetch deploy likes", e);
    return { ok: false, likeCounts: {}, userLiked: [] };
  }
}

export async function sendDeployLike(version: string) {
  try {
    const res = await fetch(resolveNitroUrl("/deploys/likes"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      // Check if auth is required
      if (res.status === 401 || data?.authRequired) {
        return { ok: false, authRequired: true, error: data?.error };
      }

      throw new Error(data?.error || `Failed to toggle like (${res.status})`);
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to toggle deploy like", e);
    throw e;
  }
}

// Quran Progress API
export async function fetchQuranProgress() {
  try {
    const res = await fetch(resolveNitroUrl("/quran/progress"), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch quran progress: ${res.status}`);
      return { ok: false, completedSuras: [] };
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to fetch quran progress", e);
    return { ok: false, completedSuras: [] };
  }
}

export async function saveQuranProgress(completedSuras: number[]) {
  try {
    const res = await fetch(resolveNitroUrl("/quran/progress"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedSuras }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      // Check if auth is required
      if (res.status === 401 || data?.authRequired) {
        return { ok: false, authRequired: true };
      }

      throw new Error(data?.error || `Failed to save progress (${res.status})`);
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to save quran progress", e);
    return { ok: false, error: String(e) };
  }
}

// Changelog API
export async function fetchChangelog() {
  try {
    const res = await fetch(resolveNitroUrl("/changelog"), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch changelog: ${res.status}`);
      return { ok: false, deploys: [] };
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to fetch changelog", e);
    return { ok: false, deploys: [] };
  }
}

