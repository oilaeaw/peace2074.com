export async function getHolyNames() {
  const url = "/api/holynames";
  try {
    // useFetch is auto-imported (configured in project). It returns refs and supports chaining to .json()
    const { data, error } = await useFetch(url).json();
    if (error?.value) throw error.value;
    return data?.value ?? null;
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function getHolyBook() {
  const url = "/api/quran";
  try {
    const { data, error } = await useFetch(url).json();
    if (error?.value) throw error.value;
    return data?.value ?? null;
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
