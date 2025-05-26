import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const $q = useQuasar()

  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    $q.notify({ message: 'Logging in...', type: 'info' })
    try {
      const response = await $hapi.authenticate({
        strategy: 'local',
        email,
        password,
      })

      // Use the user directly if it's in the response
      user.value = response.user
      return user.value
    }
    catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await $hapi.logout()
    }
    finally {
      user.value = null
    }
  }

  async function checkAuth() {
    try {
      const response = await $hapi.reAuthenticate()
      user.value = response.user
    }
    catch (error) {
      console.warn('User not authenticated:', error)
      user.value = null
    }
  }

  function setUser(u: any) {
    user.value = u
  }

  const savedName = computed(() => {
    if (!user.value)
      return ''
    // Prefer full name if available, then email, then id
    if (user.value.first_name || user.value.last_name) {
      return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
    }
    return user.value.name || user.value.email || user.value.id || user.value._id || ''
  })

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    setUser,
    savedName,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
