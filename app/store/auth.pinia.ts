import type { UserT } from '@shared/types'
import { createMongoAbility } from '@casl/ability'
import { CaslActionE, CaslSubjectE } from '@shared/types'
import { acceptHMRUpdate, defineStore } from 'pinia'

// Central CASL ability instance
const ability = createMongoAbility()

export const useAuthStore = defineStore('auth', () => {
  // Quasar notifications
  const $q = useQuasar();

  // Core user state (nullable to match previous user.pinia behaviour)
  const _user = ref<UserT | null>(null);
  const user = computed(() => _user.value);

  // Permissions and CASL ability
  const defaultPermissions = [
    { action: CaslActionE.READ, subject: CaslSubjectE.CATEGORY },
    { action: CaslActionE.READ, subject: CaslSubjectE.POST },
    { action: CaslActionE.CREATE, subject: CaslSubjectE.USER },
    { action: CaslActionE.READ, subject: CaslSubjectE.USER },
    { action: CaslActionE.UPDATE, subject: CaslSubjectE.USER },
    { action: CaslActionE.MANAGE, subject: CaslSubjectE.ADMIN },
  ];
  const _permissions = ref<any[]>(defaultPermissions);

  // Exposed computed values
  const isAuthenticated = computed(() => !!_user.value?.id);
  const permissions = computed(() => _permissions.value);

  // Friendly saved name like the previous store
  const savedName = computed(() => {
    return _user.value?.username || null;
  });

  // Basic actions
  function setUserInfo(info: UserT) {
    setUser(info);
  }

  function setUser(u: UserT | null) {
    _user.value = u;
    try {
      if (u) {
        $q.notify({ message: 'User set successfully', type: 'positive' });
      }
    }
    catch {
      // ignore if Quasar not available
    }
    // Reset and infer permissions from user role
    _permissions.value = [...defaultPermissions];
    if (u?.role === 'admin') {
      _permissions.value.push({ action: CaslActionE.MANAGE, subject: CaslSubjectE.ALL });
    }
    else if (u?.role === 'editor') {
      _permissions.value.push({ action: CaslActionE.UPDATE, subject: CaslSubjectE.POST });
    }
    SetAbilities()
  }

  async function logout() {
    // Call server to clear http-only auth cookie
    try {
      if (isClient)
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    }
    catch (e) {
      console.error('Logout failed', e);
    }
    setUser(null);
    try {
      $q.notify({ message: 'Logged out successfully', type: 'info' })
    }
    catch {}
    // Remove persisted user data from localStorage when running in browser
    if (import.meta.client) {
      const core = (globalThis as any)?.$core;
      const keysToRemove = ['user', 'pinia_user', 'pinia'];
      keysToRemove.forEach(key => {
        try { core?.remove(key) ?? localStorage.removeItem(key) } catch {}
      });
    }
  }

  // WebAuthn login (guarded)
  async function login() {
    if (typeof navigator === 'undefined' || typeof navigator.credentials === 'undefined') {
      try { $q.notify({ message: 'WebAuthn not available in this environment', type: 'negative' }) }
      catch {}
      throw new Error('WebAuthn not available')
    }

    const pkco: any = (globalThis as any).publicKeyCredentialCreationOptions
    if (!pkco) {
      try { $q.notify({ message: 'No WebAuthn options available', type: 'negative' }) }
      catch {}
      throw new Error('No WebAuthn options available')
    }

    const credential = await navigator.credentials.create({ publicKey: pkco })
    if (!credential) {
      try { $q.notify({ message: 'No credential created', type: 'negative' }) }
      catch {}
      throw new Error('No credential created')
    }
    _user.value = credential
    try { $q.notify({ message: 'Login successful', type: 'positive' }) }
    catch {}
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
    user,
    permissions,
    isAuthenticated,
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
})

// Backwards-compatible alias: some modules called `authStore()` directly
export const authStore = useAuthStore

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
