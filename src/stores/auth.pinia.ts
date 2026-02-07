import type { UserT } from '@shared/types'
import { createMongoAbility } from '@casl/ability'
import { CaslActionE, CaslSubjectE } from '@shared/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useQuasar } from 'quasar'

// Central CASL ability instance
const ability = createMongoAbility()

export const useAuthStore = defineStore('auth', () => {
  // Quasar notifications
  const $q = useQuasar()

  // Core user state (nullable to match previous user.pinia behaviour)
  const _user = ref<any>(null)
  const isAuthenticated = computed(() => {
    const user = _user.value
    return Boolean(user && typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, 'id') && Object.keys(user).length > 0)
  })

  // Permissions and CASL ability
  const _permissions = ref<any[]>([
    { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
    { action: CaslActionE.READ, subject: CaslSubjectE.POST },
    { action: CaslActionE.CREATE, subject: CaslSubjectE.USER },
    { action: CaslActionE.READ, subject: CaslSubjectE.USER },
    { action: CaslActionE.UPDATE, subject: CaslSubjectE.USER },
    { action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN },
  ])

  // Exposed computed values  const isAuthenticated: ComputedRef<boolean> = computed(() => user !== null)
  const authenticated = computed(() => {
    const user = _user.value
    return Boolean(user && typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, 'id') && Object.keys(user).length > 0)
  })
  const permissions = computed(() => _permissions.value)

  // Friendly saved name like the previous store
  const savedName = computed(() => {
    const user = _user.value
    return user && typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, 'username') ? user.username : null
  })

  // Basic actions
  function setUserInfo(info: UserT) {
    _user.value = info
  }

  function setUser(u: any) {
    _user.value = u
    try {
      $q.notify({ message: 'User set successfully', type: 'positive' })
    }
    catch {
      // ignore if Quasar not available
    }
    // Infer permissions from user role
    try {
      if (u && u.role === 'admin') {
        _permissions.value.push({ action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN })
      }
      else if (u && u.role === 'editor') {
        _permissions.value.push({ action: CaslActionE.UPDATE, subject: CaslSubjectE.POST })
      }
    }
    catch { }
    SetAbilities()
  }

  async function logout() {
    // Call server to clear http-only auth cookie
    try {
      if (isClient)
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    }
    catch { }
    _user.value = null
    _permissions.value = [
      { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
      { action: CaslActionE.READ, subject: CaslSubjectE.POST },
      { action: CaslActionE.CREATE, subject: CaslSubjectE.USER },
      { action: CaslActionE.READ, subject: CaslSubjectE.USER },
      { action: CaslActionE.UPDATE, subject: CaslSubjectE.USER },
      { action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN },
    ]
    try {
      $q.notify({ message: 'Logged out successfully', type: 'info' })
    }
    catch { }
  }

  // WebAuthn login (guarded)
  async function login() {
    if (typeof navigator === 'undefined' || typeof navigator.credentials === 'undefined') {
      try { $q.notify({ message: 'WebAuthn not available in this environment', type: 'negative' }) }
      catch { }
      throw new Error('WebAuthn not available')
    }

    const pkco: any = (globalThis as any).publicKeyCredentialCreationOptions
    if (!pkco) {
      try { $q.notify({ message: 'No WebAuthn options available', type: 'negative' }) }
      catch { }
      throw new Error('No WebAuthn options available')
    }

    const credential = await navigator.credentials.create({ publicKey: pkco })
    if (!credential) {
      try { $q.notify({ message: 'No credential created', type: 'negative' }) }
      catch { }
      throw new Error('No credential created')
    }
    _user.value = credential
    try { $q.notify({ message: 'Login successful', type: 'positive' }) }
    catch { }
  }

  // Permission helpers
  function SetAbilities() {
    ability.update(_permissions.value)
    return _permissions.value
  }

  function setPermission(s: Record<CaslSubjectE, string>, a: CaslActionE) {
    _permissions.value.push({ subject: s, action: a })
    SetAbilities()
  }

  function resetPermistions(d: object) {
    _permissions.value = [d]
    SetAbilities()
  }

  // Initialize abilities one time
  SetAbilities()

  return {
    user: _user,
    _user,
    permissions,
    isAuthenticated,
    authenticated,
    savedName,
    setUserInfo,
    setUser,
    logout,
    login,
    setPermission,
    resetPermistions,
    SetAbilities,
    // expose ability for advanced callers
    ability,
  }
}, {
  // Auto-persist user and permissions to localStorage via uStore
  persist: {
    key: 'auth-store',
    paths: ['_user', '_permissions'],
    storage: 'local',
    encrypt: false // Could enable with: encrypt: true, salt: import.meta.env.VITE_AUTH_SALT
  }
})

// Backwards-compatible alias: some modules called `authStore()` directly
export const authStore = useAuthStore

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
