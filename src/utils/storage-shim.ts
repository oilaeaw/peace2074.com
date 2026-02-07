/**
 * Storage shim - provides localStorage, sessionStorage, memoryStorage
 * without triggering GunDB initialization from @waelio/ustore
 * 
 * This is a workaround for the ustore package auto-initializing GunDB
 * when the main index is imported. Uses native browser APIs directly.
 */

type StorageValue = string | number | boolean | object | null | undefined

interface StorageAPI {
    get: (key: string) => StorageValue
    getItem: (key: string) => StorageValue
    set: (key: string, value: StorageValue) => void
    setItem: (key: string, value: StorageValue) => void
    remove: (key: string) => void
    removeItem: (key: string) => void
    has: (key: string) => boolean
    hasItem: (key: string) => boolean
    clear: () => void
}

function createStorage(storage: Storage | null): StorageAPI {
    const store = storage

    const parse = (value: string | null): StorageValue => {
        if (value === null) return null
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }

    const stringify = (value: StorageValue): string => {
        if (value === undefined || value === null) return ''
        if (typeof value === 'string') return value
        return JSON.stringify(value)
    }

    return {
        get: (key: string) => parse(store?.getItem(key) ?? null),
        getItem: (key: string) => parse(store?.getItem(key) ?? null),
        set: (key: string, value: StorageValue) => store?.setItem(key, stringify(value)),
        setItem: (key: string, value: StorageValue) => store?.setItem(key, stringify(value)),
        remove: (key: string) => store?.removeItem(key),
        removeItem: (key: string) => store?.removeItem(key),
        has: (key: string) => store?.getItem(key) !== null,
        hasItem: (key: string) => store?.getItem(key) !== null,
        clear: () => store?.clear(),
    }
}

// In-memory storage for SSR or when localStorage is unavailable
const memoryStore = new Map<string, StorageValue>()

function createMemoryStorage(): StorageAPI {
    return {
        get: (key: string) => memoryStore.get(key) ?? null,
        getItem: (key: string) => memoryStore.get(key) ?? null,
        set: (key: string, value: StorageValue) => memoryStore.set(key, value),
        setItem: (key: string, value: StorageValue) => memoryStore.set(key, value),
        remove: (key: string) => memoryStore.delete(key),
        removeItem: (key: string) => memoryStore.delete(key),
        has: (key: string) => memoryStore.has(key),
        hasItem: (key: string) => memoryStore.has(key),
        clear: () => memoryStore.clear(),
    }
}

// Export storage instances
export const localStorage: StorageAPI = typeof window !== 'undefined' && window.localStorage
    ? createStorage(window.localStorage)
    : createMemoryStorage()

export const sessionStorage: StorageAPI = typeof window !== 'undefined' && window.sessionStorage
    ? createStorage(window.sessionStorage)
    : createMemoryStorage()

export const memoryStorage: StorageAPI = createMemoryStorage()

// Config storage uses localStorage with fallback to memory
export const configStorage: StorageAPI = localStorage
