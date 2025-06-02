// import hello from 'hellojs'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const authStore = defineStore('userStore', () => {
  // const { hello } = useNuxtApp()
  const $q = useQuasar()

  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  function setUser(u: any) {
    user.value = u
    $q.notify({ message: 'User set successfully', type: 'positive' })
  }

  async function logout() {
    user.value = null
    $q.notify({ message: 'Logged out successfully', type: 'info' })
    // Remove persisted user data from localStorage
    if (isClient) {
      localStorage.removeItem('user')
      localStorage.removeItem('pinia_user')
      localStorage.removeItem('pinia') // If using default key
    }
  }

  async function checkAuth() {
    // Optionally, you can implement a real check with your backend or JWT
    // For now, just check if user is set
    return isAuthenticated.value
  }

  const savedName = computed(() => {
    if (!user.value)
      return ''
    // Prefer full name if available, then email, then id
    if (user.value.user.first_name || user.value.user.last_name) {
      return `${user.value.user.first_name || ''} ${user.value.user.last_name || ''}`.trim()
    }
    return user.value.name || user.value.email || user.value.token || user.value._id || ''
  })

  // Login navigator.create a login function that calls your backend API
  async function login() {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })
    if (!credential) {
      $q.notify({ message: 'No credential created', type: 'negative' })
      throw new Error('No credential created')
    }
    user.value = credential
    $q.notify({ message: 'Login successful', type: 'positive' })
    // Here you would typically send the credential to your backend for verification
    // and to create a session. For now, we just set it in the store.
  }
  // const init = async () => {
  //   hello.init({
  //     client_id: 'your-client-id',
  //     redirect_uri: 'https://your-redirect-uri.com',
  //     scope: 'openid profile email',
  //   })
  // }
  // init()
  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    setUser,
    savedName,
  }
}, {
  persist: true,
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(authStore, import.meta.hot))
