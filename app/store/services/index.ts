import { useFetch } from 'nuxt/app'

export async function getHolyNames() {
  const { data, error, clear } = useFetch('/api/holynames')
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}

export async function getHolyBook() {
  const { data, error, clear } = useFetch('/api/quran')
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}

export async function getBookmarks() {
  const { data, error, clear } = useFetch('/api/bookmarks', { credentials: 'include' })
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}

export async function createBookmark({ bookmark }: { bookmark: string }) {
  const { data, error, clear } = useFetch('/api/bookmarks', {
    method: 'POST',
    body: { bookmark },
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}

export async function updateBookmark(id: string, bookmark: string) {
  const { data, error, clear } = useFetch(`/api/bookmarks/${id}`, {
    method: 'PUT',
    body: { bookmark },
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}

export async function deleteBookmark(id: string) {
  const { data, error, clear } = useFetch(`/api/bookmarks/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (error) {
    console.warn(error)
    clear()
  }
  return data
}
