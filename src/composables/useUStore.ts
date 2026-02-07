import { uStore, localStorage, sessionStorage, memoryStorage } from '@waelio/ustore'
import { _encrypt, _decrypt } from 'waelio-utils'

/**
 * useUStore - Composable for @waelio/ustore integration
 * Provides access to all storage types with optional encryption
 */

const ENC_PREFIX = '__enc__'
const NAMESPACE_PREFIX = 'peace2074'

interface StoreOptions {
    encrypt?: boolean
    salt?: string
    namespace?: string
}

/**
 * Namespace a key to avoid collisions
 */
function ns(key: string, namespace = NAMESPACE_PREFIX): string {
    return `${namespace}:${key}`
}

/**
 * Set value in localStorage with optional encryption
 */
export function useLocalStorage() {
    return {
        set: <T>(key: string, value: T, options: StoreOptions = {}) => {
            const { encrypt = false, salt, namespace } = options
            const scopedKey = ns(key, namespace)

            if (encrypt && salt) {
                try {
                    const encrypted = _encrypt(value as any, salt)
                    localStorage.set(scopedKey, `${ENC_PREFIX}${encrypted}`)
                } catch (err) {
                    console.warn(`[localStorage] Encryption failed for "${key}"`, err)
                    localStorage.set(scopedKey, value as any)
                }
            } else {
                localStorage.set(scopedKey, value as any)
            }
        },

        get: <T>(key: string, fallback?: T, options: StoreOptions = {}): T | undefined => {
            const { encrypt = false, salt, namespace } = options
            const scopedKey = ns(key, namespace)
            const raw = localStorage.get(scopedKey) as any

            if (raw === null || raw === undefined) return fallback

            if (encrypt && salt && typeof raw === 'string' && raw.startsWith(ENC_PREFIX)) {
                try {
                    return _decrypt(raw.slice(ENC_PREFIX.length), salt) as T
                } catch (err) {
                    console.warn(`[localStorage] Decryption failed for "${key}"`, err)
                    return fallback
                }
            }

            return raw as T
        },

        remove: (key: string, namespace?: string) => {
            const scopedKey = ns(key, namespace)
            if (typeof localStorage.remove === 'function') {
                localStorage.remove(scopedKey)
            }
        },

        has: (key: string, namespace?: string): boolean => {
            const scopedKey = ns(key, namespace)
            return localStorage.get(scopedKey) !== null
        },

        clear: () => {
            // uStore localStorage doesn't expose clear directly
            // Use native localStorage.clear() if needed
            if (typeof window !== 'undefined') {
                window.localStorage.clear()
            }
        }
    }
}

/**
 * Set value in sessionStorage with optional encryption
 */
export function useSessionStorage() {
    return {
        set: <T>(key: string, value: T, options: StoreOptions = {}) => {
            const { encrypt = false, salt, namespace } = options
            const scopedKey = ns(key, namespace)

            if (encrypt && salt) {
                try {
                    const encrypted = _encrypt(value as any, salt)
                    sessionStorage.set(scopedKey, `${ENC_PREFIX}${encrypted}`)
                } catch (err) {
                    console.warn(`[sessionStorage] Encryption failed for "${key}"`, err)
                    sessionStorage.set(scopedKey, value as any)
                }
            } else {
                sessionStorage.set(scopedKey, value as any)
            }
        },

        get: <T>(key: string, fallback?: T, options: StoreOptions = {}): T | undefined => {
            const { encrypt = false, salt, namespace } = options
            const scopedKey = ns(key, namespace)
            const raw = sessionStorage.get(scopedKey) as any

            if (raw === null || raw === undefined) return fallback

            if (encrypt && salt && typeof raw === 'string' && raw.startsWith(ENC_PREFIX)) {
                try {
                    return _decrypt(raw.slice(ENC_PREFIX.length), salt) as T
                } catch (err) {
                    console.warn(`[sessionStorage] Decryption failed for "${key}"`, err)
                    return fallback
                }
            }

            return raw as T
        },

        remove: (key: string, namespace?: string) => {
            const scopedKey = ns(key, namespace)
            if (typeof sessionStorage.remove === 'function') {
                sessionStorage.remove(scopedKey)
            }
        },

        has: (key: string, namespace?: string): boolean => {
            const scopedKey = ns(key, namespace)
            return sessionStorage.get(scopedKey) !== null
        },

        clear: () => {
            if (typeof window !== 'undefined') {
                window.sessionStorage.clear()
            }
        }
    }
}

/**
 * Use memory storage (no persistence, useful for SSR)
 */
export function useMemoryStorage() {
    return {
        set: <T>(key: string, value: T, namespace?: string) => {
            const scopedKey = ns(key, namespace)
            memoryStorage.set(scopedKey, value as any)
        },

        get: <T>(key: string, fallback?: T, namespace?: string): T | undefined => {
            const scopedKey = ns(key, namespace)
            const raw = memoryStorage.get(scopedKey) as any
            return raw === null || raw === undefined ? fallback : (raw as T)
        },

        remove: (key: string, namespace?: string) => {
            const scopedKey = ns(key, namespace)
            if (typeof memoryStorage.remove === 'function') {
                memoryStorage.remove(scopedKey)
            }
        },

        has: (key: string, namespace?: string): boolean => {
            const scopedKey = ns(key, namespace)
            return memoryStorage.get(scopedKey) !== null
        }
    }
}

/**
 * Global uStore instance access
 */
export function useUStore() {
    return {
        local: useLocalStorage(),
        session: useSessionStorage(),
        memory: useMemoryStorage(),
        raw: uStore, // Direct access to uStore if needed
    }
}

/**
 * Reactive storage with Vue refs (composable pattern)
 */
export function useStorageRef<T>(
    key: string,
    defaultValue: T,
    storage: 'local' | 'session' | 'memory' = 'local',
    options: StoreOptions = {}
) {
    const stores = useUStore()
    const storageAPI = stores[storage]

    const value = ref<T>(storageAPI.get<T>(key, defaultValue, options) as T)

    const setValue = (newValue: T) => {
        value.value = newValue
        storageAPI.set(key, newValue, options)
    }

    const removeValue = () => {
        value.value = defaultValue
        storageAPI.remove(key, options.namespace)
    }

    // Auto-sync on storage events (cross-tab sync for localStorage)
    if (storage === 'local' && typeof window !== 'undefined') {
        window.addEventListener('storage', (e: StorageEvent) => {
            const fullKey = options.namespace ? `${options.namespace}:${key}` : key
            if (e.key === fullKey && e.newValue !== null) {
                try {
                    value.value = JSON.parse(e.newValue) as T
                } catch {
                    value.value = e.newValue as unknown as T
                }
            }
        })
    }

    return {
        value,
        set: setValue,
        remove: removeValue,
        has: () => storageAPI.has(key, options.namespace)
    }
}

export default useUStore
