import { watch } from '#imports'
import { useAuthStore } from '~/store/auth.pinia'
import { useBookmarksStore } from '~/store/bookmarks.pinia'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const bookmarks = useBookmarksStore()

  async function initBookmarks() {
    try {
      await bookmarks.init()
    }
    catch {
      // ignore errors during init
    }
  }

  // Fetch current user from server endpoint which reads httpOnly cookie
  if (import.meta.client) {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(async (data) => {
        if (data?.user)
          auth.setUserInfo(data.user)
        // initialize bookmarks for either signed-in user or guest
        await initBookmarks()
      })
      .catch(() => {
        // initialize guest bookmarks even if /me fails
        initBookmarks()
      })

    // Watch for auth.user changes (login/logout) and refresh bookmarks
    watch(() => auth.user, () => {
      initBookmarks()
    })
  }
})
