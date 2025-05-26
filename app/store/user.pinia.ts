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

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    setUser,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
