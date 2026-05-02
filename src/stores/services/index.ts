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

type KimiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type KimiPayload = {
  messages: KimiMessage[];
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

const env = (import.meta as any)?.env || {};
const DEFAULT_MOBILE_API_BASE = "https://peace2074.com/api";

function normalizeBaseUrl(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\/$/, "") : "";
}

function isMobileAppProtocol(protocol: string) {
  return protocol === "capacitor:" || protocol === "ionic:" || protocol === "app:";
}

function computeNitroBase() {
  const configured = normalizeBaseUrl(env.VITE_NITRO_BASE);

  if (typeof window === "undefined") {
    return "/api";
  }

  const { protocol } = window.location;

  if (isMobileAppProtocol(protocol)) {
    return configured || DEFAULT_MOBILE_API_BASE;
  }

  return "/api";
}

const NITRO_BASE = computeNitroBase();

if (typeof window !== "undefined") {
  if (NITRO_BASE) {
    console.debug("[Kimi] targeting", NITRO_BASE);
  } else {
    console.warn("[Kimi] NITRO_BASE missing; falling back to same-origin requests");
  }
}

export function resolveNitroUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return NITRO_BASE ? `${NITRO_BASE}${normalized}` : normalized;
}

export async function sendKimiChat(payload: KimiPayload) {
  if (!payload?.messages?.length) {
    throw new Error("Kimi payload requires at least one message");
  }
  try {
    const res = await fetch(resolveNitroUrl("/kimi"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errPayload = await res.json().catch(() => ({}));
      // Extract message from error object to avoid "[object Object]"
      const errorMessage =
        errPayload?.error?.message ||
        errPayload?.error?.data ||
        errPayload?.statusMessage ||
        (typeof errPayload?.error === 'string' ? errPayload.error : null) ||
        `Kimi request failed (${res.status})`;
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (e) {
    console.warn("Kimi request failed", e);
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

// Reader Stats API
export async function recordReaderStat(sura: number) {
  try {
    const res = await fetch(resolveNitroUrl("/reader-stats"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sura }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Failed to record stat (${res.status})`);
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to record reader stat", e);
    return { ok: false, error: String(e) };
  }
}

export async function fetchReaderStats() {
  try {
    const res = await fetch(resolveNitroUrl("/reader-stats"), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch reader stats: ${res.status}`);
      return { ok: false, stats: [] };
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to fetch reader stats", e);
    return { ok: false, stats: [] };
  }
}

export async function fetchReaderAnalytics() {
  try {
    const res = await fetch(resolveNitroUrl("/reader-stats?analytics=true"), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch reader analytics: ${res.status}`);
      return { ok: false, analytics: null };
    }

    return res.json();
  } catch (e) {
    console.warn("Failed to fetch reader analytics", e);
    return { ok: false, analytics: null };
  }
}

// Blog Likes API
export async function fetchBlogLikes() {
  try {
    const res = await fetch(resolveNitroUrl("/blog/likes"), {
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
    console.warn("Failed to fetch blog likes", e);
    return { ok: false, likeCounts: {}, userLiked: [] };
  }
}

export async function toggleBlogLike(slug: string) {
  try {
    const res = await fetch(resolveNitroUrl("/blog/likes"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
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
    console.warn("Failed to toggle blog like", e);
    throw e;
  }
}

