// Use local storage shim to avoid GunDB auto-initialization from @waelio/ustore
import { getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'
import {
    localStorage as localStorageDriver,
    sessionStorage as sessionStorageDriver,
    memoryStorage as memoryStorageDriver,
} from '@/utils/storage-shim'
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

type StorageKind = 'local' | 'session' | 'memory'

type StorageAdapter = Pick<
    typeof localStorageDriver,
    'get' | 'set' | 'remove' | 'has' | 'clear'
>

type StoredValue = Parameters<StorageAdapter['set']>[1]

interface StorageController {
    set: <T extends StoredValue>(key: string, value: T, options?: StoreOptions) => void
    get: <T>(key: string, fallback?: T, options?: StoreOptions) => T | undefined
    remove: (key: string, namespace?: string) => void
    has: (key: string, namespace?: string) => boolean
    clear: (namespace?: string) => void
}

/**
 * Namespace a key to avoid collisions
 */
function ns(key: string, namespace = NAMESPACE_PREFIX): string {
    return `${namespace}:${key}`
}

function getStorageLabel(kind: StorageKind): string {
    return kind === 'local'
        ? 'localStorage'
        : kind === 'session'
            ? 'sessionStorage'
            : 'memoryStorage'
}

function clearBrowserNamespace(kind: Exclude<StorageKind, 'memory'>, namespace: string) {
    if (typeof window === 'undefined') {
        return
    }

    const target = kind === 'local' ? window.localStorage : window.sessionStorage
    const prefix = `${namespace}:`
    const keysToRemove: string[] = []

    for (let index = 0; index < target.length; index += 1) {
        const key = target.key(index)

        if (typeof key === 'string' && key.startsWith(prefix)) {
            keysToRemove.push(key)
        }
    }

    for (const key of keysToRemove) {
        target.removeItem(key)
    }
}

function encryptValue<T extends StoredValue>(
    value: T,
    key: string,
    options: StoreOptions,
    label: string,
): T | string {
    const { encrypt = false, salt } = options

    if (!encrypt || !salt) {
        return value
    }

    try {
        const encrypted = _encrypt(value, salt)
        return `${ENC_PREFIX}${encrypted}`
    }
    catch (err) {
        console.warn(`[${label}] Encryption failed for "${key}"`, err)
        return value
    }
}

function decryptValue<T>(
    raw: unknown,
    key: string,
    fallback: T | undefined,
    options: StoreOptions,
    label: string,
): T | undefined {
    const { encrypt = false, salt } = options

    if (raw === null || raw === undefined) {
        return fallback
    }

    if (!encrypt || !salt || typeof raw !== 'string' || !raw.startsWith(ENC_PREFIX)) {
        return raw as T
    }

    try {
        return _decrypt(raw.slice(ENC_PREFIX.length), salt) as T
    }
    catch (err) {
        console.warn(`[${label}] Decryption failed for "${key}"`, err)
        return fallback
    }
}

function createStorageController(kind: StorageKind, storage: StorageAdapter): StorageController {
    const label = getStorageLabel(kind)

    return {
        set: <T extends StoredValue>(key: string, value: T, options: StoreOptions = {}) => {
            const scopedKey = ns(key, options.namespace)
            storage.set(scopedKey, encryptValue(value, key, options, label))
        },

        get: <T>(key: string, fallback?: T, options: StoreOptions = {}): T | undefined => {
            const scopedKey = ns(key, options.namespace)
            const raw = storage.get(scopedKey)
            return decryptValue(raw, key, fallback, options, label)
        },

        remove: (key: string, namespace?: string) => {
            storage.remove(ns(key, namespace))
        },

        has: (key: string, namespace?: string): boolean => {
            return storage.has(ns(key, namespace))
        },

        clear: (namespace = NAMESPACE_PREFIX) => {
            if (kind === 'memory') {
                storage.clear()
                return
            }

            if (typeof window === 'undefined') {
                storage.clear()
                return
            }

            clearBrowserNamespace(kind, namespace)
        },
    }
}

const localStorageController = createStorageController('local', localStorageDriver)
const sessionStorageController = createStorageController('session', sessionStorageDriver)
const memoryStorageController = createStorageController('memory', memoryStorageDriver)

/**
 * Set value in localStorage with optional encryption
 */
export function useLocalStorage() {
    return localStorageController
}

/**
 * Set value in sessionStorage with optional encryption
 */
export function useSessionStorage() {
    return sessionStorageController
}

/**
 * Use memory storage (no persistence, useful for SSR)
 */
export function useMemoryStorage() {
    return memoryStorageController
}

/**
 * Global uStore instance access
 */
export function useUStore() {
    return {
        local: localStorageController,
        session: sessionStorageController,
        memory: memoryStorageController,
        raw: null, // Direct access disabled (avoids @waelio/ustore side effects)
    }
}

/**
 * Reactive storage with Vue refs (composable pattern)
 */
export function useStorageRef<T extends StoredValue>(
    key: string,
    defaultValue: T,
    storage: 'local' | 'session' | 'memory' = 'local',
    options: StoreOptions = {}
): {
    value: Ref<T>
    set: (newValue: T) => void
    remove: () => void
    has: () => boolean
} {
    const stores = useUStore()
    const storageAPI = stores[storage]
    const scopedKey = ns(key, options.namespace)
    const initialValue = storageAPI.get<T>(key, defaultValue, options) ?? defaultValue
    const value = ref<T>(initialValue) as Ref<T>
    let skipNextPersist = false

    const setValue = (newValue: T) => {
        value.value = newValue
    }

    const removeValue = () => {
        skipNextPersist = true
        storageAPI.remove(key, options.namespace)
        value.value = defaultValue
    }

    watch(value, (newValue) => {
        if (skipNextPersist) {
            skipNextPersist = false
            return
        }

        storageAPI.set(key, newValue, options)
    }, { deep: true })

    // Auto-sync on storage events (cross-tab sync for localStorage)
    if (storage === 'local' && typeof window !== 'undefined') {
        const syncFromStorage = (e: StorageEvent) => {
            if (e.storageArea !== window.localStorage) {
                return
            }

            if (e.key !== null && e.key !== scopedKey) {
                return
            }

            skipNextPersist = true

            if (e.key === null || e.newValue === null) {
                value.value = defaultValue
                return
            }

            value.value = storageAPI.get<T>(key, defaultValue, options) ?? defaultValue
        }

        window.addEventListener('storage', syncFromStorage)

        if (getCurrentScope()) {
            onScopeDispose(() => {
                window.removeEventListener('storage', syncFromStorage)
            })
        }
    }

    return {
        value,
        set: setValue,
        remove: removeValue,
        has: () => storageAPI.has(key, options.namespace)
    }
}

export default useUStore
