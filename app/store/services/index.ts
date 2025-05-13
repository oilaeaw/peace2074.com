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

export async function fetchDataBookmarks() {
  try {
    const { data, error } = await useFetch('/api/bookmarks')
    if (error.value)
      throw error.value
    return data.value || []
  }
  catch (err) {
    console.error('Failed to fetch bookmarks:', err)
    throw err
  }
}

export async function saveBookmark(bm: string) {
  try {
    const { error } = await useFetch('/api/bookmarks', {
      method: 'POST',
      body: { bookmark: bm },
    })
    if (error.value)
      throw error.value
  }
  catch (err) {
    console.error('Failed to save bookmark:', err)
    throw err
  }
}

export async function deleteBookmark(bm: string) {
  try {
    const { error } = await useFetch(`/api/bookmarks/${encodeURIComponent(bm)}`, {
      method: 'DELETE',
    })
    if (error.value)
      throw error.value
  }
  catch (err) {
    console.error('Failed to delete bookmark:', err)
    throw err
  }
}
