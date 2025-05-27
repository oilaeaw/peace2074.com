import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const $q = useQuasar()

  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  function setUser(u: any) {
    user.value = u
  }

  async function logout() {
    user.value = null
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
      throw new Error('No credential created')
    }
    user.value = credential
    // Here you would typically send the credential to your backend for verification
    // and to create a session. For now, we just set it in the store.
  }

  // Fetch a challenge from the backend for WebAuthn
  async function getWebAuthnChallenge() {
    const res = await fetch('/api/webauthn-challenge', {
      credentials: 'include', // Ensure session cookie is sent
    })
    if (!res.ok)
      throw new Error('Failed to get challenge')
    const data = await res.json()
    return data.challenge
  }

  // Convert base64url to Uint8Array
  function base64urlToUint8Array(base64url: string): Uint8Array {
    if (!base64url || typeof base64url !== 'string') {
      throw new Error(`base64urlToUint8Array: input is empty or not a string: ${String(base64url)}`)
    }
    // Validate base64url characters
    if (!/^[\w\-]+$/.test(base64url)) {
      throw new Error(`base64urlToUint8Array: input contains invalid base64url characters: ${base64url}`)
    }
    // Replace non-url compatible chars with base64 standard chars
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    // Pad with '=' to make length a multiple of 4
    while (base64.length % 4) {
      base64 += '='
    }
    try {
      const str = atob(base64)
      return Uint8Array.from([...str].map(c => c.charCodeAt(0)))
    }
    catch (e) {
      console.error('base64urlToUint8Array failed for input:', base64url)
      throw new Error(`base64urlToUint8Array: atob failed for input: ${base64url}`)
    }
  }

  // WebAuthn registration (create credential)
  async function webauthnRegister({ userId, email, displayName }: { userId: string, email: string, displayName: string }) {
    // 1. Get challenge from backend
    const challenge = await getWebAuthnChallenge()
    // 2. Build publicKey options
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: base64urlToUint8Array(challenge),
      rp: {
        name: 'Waelio Security',
        id: window.location.hostname, // Use current domain for RP ID
      },
      user: {
        id: base64urlToUint8Array(
          // If userId is not base64url, encode it
          /^[\w\-]+$/.test(userId) ? userId : btoa(userId).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
        ),
        name: email,
        displayName,
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
      },
      timeout: 60000,
      attestation: 'direct',
    }
    // 3. Create credential
    const credential = await navigator.credentials.create({ publicKey })
    if (!credential)
      throw new Error('No credential created')
    // 4. Send credential to backend for verification/registration
    const res = await fetch('/api/webauthn-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Ensure session cookie is sent
      body: JSON.stringify(credential),
    })
    if (!res.ok)
      throw new Error('WebAuthn registration failed')
    const result = await res.json()
    if (!result.success)
      throw new Error(result.error || 'WebAuthn registration failed')
    // 5. Optionally, update user state or notify success
    return result
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    setUser,
    savedName,
    webauthnRegister,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
