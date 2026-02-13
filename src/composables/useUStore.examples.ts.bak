/**
 * Storage Management Examples using @waelio/ustore
 * 
 * This file demonstrates various patterns for using uStore
 * in the Peace2074 application.
 */

import { useUStore, useStorageRef } from '@/composables/useUStore'

// ============================================
// Example 1: Basic Usage
// ============================================
export function exampleBasicUsage() {
    const { local, session, memory } = useUStore()

    // Simple set/get
    local.set('username', 'waelio')
    const username = local.get('username') // 'waelio'

    // With fallback
    const theme = local.get('theme', 'dark') // Returns 'dark' if not found

    // Check existence
    if (local.has('username')) {
        console.log('Username exists')
    }

    // Remove
    local.remove('username')

    // Session storage (cleared on tab close)
    session.set('temp-token', 'abc123')
    const token = session.get('temp-token')

    // Memory storage (no persistence, useful for SSR)
    memory.set('cache-key', { data: 'value' })
    const cached = memory.get('cache-key')
}

// ============================================
// Example 2: Encrypted Storage
// ============================================
export function exampleEncryptedStorage() {
    const { local } = useUStore()
    const SALT = 'my-secret-salt' // In production, use env var

    // Store encrypted user credentials
    local.set('user-session',
        { id: 'user123', role: 'admin' },
        { encrypt: true, salt: SALT }
    )

    // Retrieve and decrypt
    const session = local.get('user-session', null, {
        encrypt: true,
        salt: SALT
    })

    console.log(session) // { id: 'user123', role: 'admin' }
}

// ============================================
// Example 3: Namespaced Storage
// ============================================
export function exampleNamespacedStorage() {
    const { local } = useUStore()

    // Different namespaces to avoid collisions
    local.set('config', { darkMode: true }, { namespace: 'user-prefs' })
    local.set('config', { apiUrl: 'https://api.example.com' }, { namespace: 'app-settings' })

    const userConfig = local.get('config', {}, { namespace: 'user-prefs' })
    const appConfig = local.get('config', {}, { namespace: 'app-settings' })

    // Both keys are 'config' but stored separately
    console.log(userConfig) // { darkMode: true }
    console.log(appConfig) // { apiUrl: '...' }
}

// ============================================
// Example 4: Reactive Storage with Composable
// ============================================
export function exampleReactiveStorage() {
    // Creates a reactive ref that auto-syncs with localStorage
    const darkMode = useStorageRef('darkMode', false, 'local')

    // Use like a normal ref
    console.log(darkMode.value) // false
    darkMode.set(true) // Updates ref AND localStorage

    // Check if value exists
    if (darkMode.has()) {
        console.log('Dark mode preference is set')
    }

    // Remove (resets to default)
    darkMode.remove() // darkMode.value becomes false again

    // With encryption
    const secureData = useStorageRef(
        'secure-key',
        { secret: 'data' },
        'local',
        { encrypt: true, salt: 'my-salt' }
    )
}

// ============================================
// Example 5: User Preferences Store
// ============================================
export function exampleUserPreferences() {
    const { local } = useUStore()
    const PREFS_KEY = 'user-preferences'
    const NAMESPACE = 'peace2074-prefs'

    interface UserPreferences {
        locale: string
        darkMode: boolean
        fontSize: number
        notifications: boolean
    }

    const defaultPrefs: UserPreferences = {
        locale: 'en',
        darkMode: false,
        fontSize: 16,
        notifications: true
    }

    // Load preferences
    const loadPreferences = (): UserPreferences => {
        return local.get<UserPreferences>(
            PREFS_KEY,
            defaultPrefs,
            { namespace: NAMESPACE }
        ) || defaultPrefs
    }

    // Save preferences
    const savePreferences = (prefs: UserPreferences) => {
        local.set(PREFS_KEY, prefs, { namespace: NAMESPACE })
    }

    // Update single preference
    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        const prefs = loadPreferences()
        prefs[key] = value
        savePreferences(prefs)
    }

    // Usage
    const prefs = loadPreferences()
    updatePreference('darkMode', true)
    updatePreference('locale', 'ar')
}

// ============================================
// Example 6: Pinia Store with Auto-Persistence
// ============================================
export function examplePiniaIntegration() {
    // In your Pinia store definition:
    /*
    import { defineStore } from 'pinia'
  
    export const useMyStore = defineStore('myStore', {
      state: () => ({
        count: 0,
        user: null,
        settings: {}
      }),
      
      actions: {
        increment() {
          this.count++
        }
      },
  
      // Option 1: Persist entire state
      persist: true,
  
      // Option 2: Persist specific fields only
      persist: {
        key: 'my-custom-key',
        paths: ['user', 'settings'], // Only persist these fields
        storage: 'local', // or 'session'
        encrypt: false // Enable encryption if needed
      }
    })
  
    // The store will automatically:
    // - Load saved state on initialization
    // - Save state changes to localStorage/sessionStorage
    // - Use @waelio/ustore under the hood
    */
}

// ============================================
// Example 7: Authentication Token Management
// ============================================
export function exampleAuthTokens() {
    const { local, session } = useUStore()
    const SALT = import.meta.env.VITE_TOKEN_SALT || 'default-salt'

    interface AuthTokens {
        accessToken: string
        refreshToken: string
        expiresAt: number
    }

    // Store tokens (encrypted)
    const saveTokens = (tokens: AuthTokens) => {
        local.set('auth-tokens', tokens, {
            encrypt: true,
            salt: SALT,
            namespace: 'auth'
        })
    }

    // Load tokens
    const loadTokens = (): AuthTokens | undefined => {
        return local.get<AuthTokens>('auth-tokens', undefined, {
            encrypt: true,
            salt: SALT,
            namespace: 'auth'
        })
    }

    // Check if tokens are valid
    const hasValidTokens = (): boolean => {
        const tokens = loadTokens()
        if (!tokens) return false
        return Date.now() < tokens.expiresAt
    }

    // Clear tokens on logout
    const clearTokens = () => {
        local.remove('auth-tokens', 'auth')
    }

    // Usage
    saveTokens({
        accessToken: 'abc123',
        refreshToken: 'xyz789',
        expiresAt: Date.now() + 3600000 // 1 hour
    })

    if (hasValidTokens()) {
        const tokens = loadTokens()
        // Use tokens
    } else {
        clearTokens()
        // Redirect to login
    }
}

// ============================================
// Example 8: Cross-Tab Synchronization
// ============================================
export function exampleCrossTabSync() {
    // useStorageRef automatically syncs across tabs for localStorage
    const sharedCounter = useStorageRef('shared-counter', 0, 'local')

    // When another tab changes the value, this tab's ref updates automatically
    watch(() => sharedCounter.value, (newValue) => {
        console.log('Counter updated from another tab:', newValue)
    })

    // Increment in this tab
    sharedCounter.set((sharedCounter.value as unknown as number) + 1)
    // All tabs will see the update!
}

// ============================================
// Example 9: Cache Management
// ============================================
export function exampleCacheManagement() {
    const { local } = useUStore()
    const CACHE_NAMESPACE = 'api-cache'
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    interface CacheEntry<T> {
        data: T
        timestamp: number
        ttl: number
    }

    const setCache = <T>(key: string, data: T, ttl = CACHE_TTL) => {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl
        }
        local.set(key, entry, { namespace: CACHE_NAMESPACE })
    }

    const getCache = <T>(key: string): T | undefined => {
        const entry = local.get<CacheEntry<T>>(key, undefined, {
            namespace: CACHE_NAMESPACE
        })

        if (!entry) return undefined

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            local.remove(key, CACHE_NAMESPACE)
            return undefined
        }

        return entry.data
    }

    const clearCache = () => {
        // Note: uStore doesn't have namespace-specific clear
        // You'd need to track keys or use native localStorage.clear()
        // with caution
    }

    // Usage
    setCache('user-list', [{ id: 1, name: 'Wael' }])
    const cached = getCache<any[]>('user-list')
}

// ============================================
// Example 10: Migration Helper
// ============================================
export function exampleMigrateFromOldStorage() {
    /**
     * Migrate from native localStorage to uStore
     */
    const migrateToUStore = () => {
        const { local } = useUStore()

        // List of keys to migrate
        const keysToMigrate = ['user', 'settings', 'preferences']

        keysToMigrate.forEach(key => {
            const oldValue = window.localStorage.getItem(key)
            if (oldValue) {
                try {
                    const parsed = JSON.parse(oldValue)
                    local.set(key, parsed, { namespace: 'peace2074' })
                    window.localStorage.removeItem(key) // Clean up old storage
                } catch (err) {
                    console.warn(`Failed to migrate key: ${key}`, err)
                }
            }
        })

        console.log('Migration to uStore complete')
    }

    // Run once on app init
    // migrateToUStore()
}
