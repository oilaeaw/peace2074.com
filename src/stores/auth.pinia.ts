import type { UserT } from '@shared/types'
import { createMongoAbility } from '@casl/ability'
import { CaslActionE, CaslSubjectE } from '@shared/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useQuasar } from 'quasar'

const isClient = typeof window !== 'undefined'
const env = (import.meta as any)?.env || {}
const DEFAULT_NITRO_PORT = 3000
const DEFAULT_MOBILE_API_BASE = 'https://peace2074.com/api'
const NATIVE_PROTOCOLS = new Set(['capacitor:', 'ionic:', 'app:'])
const NATIVE_AUTH_TIMEOUT_MS = 10000
const WEB_AUTH_TIMEOUT_MS = 6000

function isNativeRuntime() {
  if (typeof window === 'undefined') {
    return false
  }

  return NATIVE_PROTOCOLS.has(String(window.location.protocol || ''))
}

function computeNitroBase() {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const configured = env.VITE_NITRO_BASE

    if (configured && typeof configured === 'string') {
      return configured.replace(/\/$/, '')
    }

    if (NATIVE_PROTOCOLS.has(protocol)) {
      return DEFAULT_MOBILE_API_BASE
    }

    // In browser context (including dev), use relative /api so the Vite proxy
    // handles routing to the Nitro server regardless of the bound hostname.
    return '/api'
  }

  return '/api'
}

function resolveNitroUrl(path: string) {
  const base = computeNitroBase()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

type PermissionRule = {
  action: string
  subject: string
}

// Central CASL ability instance
const ability = createMongoAbility()

const GUEST_PERMISSIONS = [
  { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
  { action: CaslActionE.READ, subject: CaslSubjectE.POST },
]

const DEFAULT_USER_PERMISSIONS = [
  { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
  { action: CaslActionE.READ, subject: CaslSubjectE.POST },
  { action: CaslActionE.CREATE, subject: CaslSubjectE.USER },
  { action: CaslActionE.READ, subject: CaslSubjectE.USER },
  { action: CaslActionE.UPDATE, subject: CaslSubjectE.USER },
  { action: CaslActionE.READ, subject: CaslSubjectE.CHAT },
]

const ADMIN_EXTRA_PERMISSIONS = [
  { action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN },
  { action: CaslActionE.MANAGE, subject: CaslSubjectE.CHAT },
]

const EDITOR_EXTRA_PERMISSIONS = [
  { action: CaslActionE.UPDATE, subject: CaslSubjectE.POST },
]

function clonePermissions(permissions: PermissionRule[]) {
  return permissions.map((permission) => ({ ...permission }))
}

function dedupePermissions(permissions: PermissionRule[]) {
  const seen = new Set<string>()

  return permissions.filter((permission) => {
    const key = `${permission.action}:${permission.subject}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function isPermissionRule(permission: unknown): permission is PermissionRule {
  if (!permission || typeof permission !== 'object') {
    return false
  }

  const candidate = permission as PermissionRule
  return typeof candidate.action === 'string' && typeof candidate.subject === 'string'
}

function createGuestPermissions() {
  return clonePermissions(GUEST_PERMISSIONS)
}

function createRoleFallbackPermissions(role?: string) {
  const permissions = clonePermissions(DEFAULT_USER_PERMISSIONS)

  if (role === 'admin') {
    permissions.push(...clonePermissions(ADMIN_EXTRA_PERMISSIONS))
  } else if (role === 'editor') {
    permissions.push(...clonePermissions(EDITOR_EXTRA_PERMISSIONS))
  }

  return dedupePermissions(permissions)
}

function createPermissionsForUser(user: any) {
  if (!user) {
    return createGuestPermissions()
  }

  const storedPermissions = Array.isArray(user.permissions)
    ? user.permissions.filter(isPermissionRule).map((permission: PermissionRule) => ({ ...permission }))
    : []

  return dedupePermissions([
    ...createRoleFallbackPermissions(user.role),
    ...storedPermissions,
  ])
}

export const useAuthStore = defineStore('auth', () => {
  // Quasar notifications
  const $q = useQuasar()

  // Core user state (nullable to match previous user.pinia behaviour)
  const _user = ref<any>(null)
  const isAuthenticated = computed(() => {
    const user = _user.value
    return Boolean(user && typeof user === 'object' && Object.prototype.hasOwnProperty.call(user, 'id') && Object.keys(user).length > 0)
  })

  const hydrated = ref(false)
  let hydratePromise: Promise<any | null> | null = null

  // Permissions and CASL ability
  const _permissions = ref<any[]>(createGuestPermissions())

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
    setUser(info, { notify: false })
  }

  function clearUserState(options: { notify?: boolean } = {}) {
    _user.value = null
    _permissions.value = createGuestPermissions()
    SetAbilities()

    if (options.notify === false) return

    try {
      $q.notify({ message: 'Logged out successfully', type: 'info' })
    }
    catch {
      // ignore if Quasar not available
    }
  }

  function setUser(u: any, options: { notify?: boolean } = {}) {
    if (!u) {
      clearUserState(options)
      return
    }

    _user.value = u
    _permissions.value = createPermissionsForUser(u)
    hydrated.value = true
    SetAbilities()

    if (options.notify === false) return

    try {
      $q.notify({ message: 'User set successfully', type: 'positive' })
    }
    catch {
      // ignore if Quasar not available
    }
  }

  async function hydrateSession(force = false) {
    if (!isClient) {
      hydrated.value = true
      return _user.value
    }

    if (!force && hydratePromise) {
      return hydratePromise
    }

    if (!force && hydrated.value) {
      return _user.value
    }

    hydratePromise = (async () => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const controller =
        typeof AbortController !== 'undefined'
          ? new AbortController()
          : null

      try {
        timeoutId = setTimeout(() => {
          controller?.abort()
        }, isNativeRuntime() ? NATIVE_AUTH_TIMEOUT_MS : WEB_AUTH_TIMEOUT_MS)

        const response = await fetch(resolveNitroUrl('/auth/me'), {
          credentials: 'include',
          ...(controller ? { signal: controller.signal } : {}),
        })

        if (response.status === 401) {
          clearUserState({ notify: false })
          return null
        }

        if (!response.ok) {
          throw new Error(`Failed to hydrate auth session: ${response.status}`)
        }

        const data = await response.json().catch(() => ({}))
        const user = data?.user && typeof data.user === 'object'
          ? data.user
          : null

        if (!user) {
          clearUserState({ notify: false })
          return null
        }

        setUser(user, { notify: false })
        return user
      }
      catch (error) {
        console.warn('Failed to hydrate auth session:', error)
        return _user.value
      }
      finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        hydrated.value = true
        hydratePromise = null
      }
    })()

    return hydratePromise
  }

  async function logout() {
    // Call server to clear http-only auth cookie
    try {
      if (isClient)
        await fetch(resolveNitroUrl('/auth/logout'), { method: 'POST', credentials: 'include' })
    }
    catch { }
    clearUserState()
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
    hydrated,
    isAuthenticated,
    authenticated,
    savedName,
    setUserInfo,
    setUser,
    clearUserState,
    hydrateSession,
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
