import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import { useLocalStorage, useSessionStorage } from '@/composables/useUStore'

/**
 * Pinia plugin for automatic persistence using @waelio/ustore
 * 
 * Usage in store:
 * defineStore('myStore', {
 *   state: () => ({ ... }),
 *   persist: true, // or { key: 'custom-key', paths: ['field1', 'field2'] }
 * })
 */

interface PersistOptions {
    key?: string
    paths?: string[]
    storage?: 'local' | 'session'
    encrypt?: boolean
    salt?: string
    serializer?: {
        serialize?: (value: unknown) => string
        deserialize?: (value: string) => unknown
    }
}

declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        persist?: boolean | PersistOptions
    }
}

type PersistedState = Record<string, unknown>

function isRecord(value: unknown): value is PersistedState {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getPathValue(source: PersistedState, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
        if (!isRecord(current)) {
            return undefined
        }

        return current[key]
    }, source)
}

function setPathValue(target: PersistedState, path: string, value: unknown) {
    const keys = path.split('.')
    let current = target

    for (let index = 0; index < keys.length - 1; index += 1) {
        const segment = keys[index]
        const nextValue = current[segment]

        if (!isRecord(nextValue)) {
            current[segment] = {}
        }

        current = current[segment] as PersistedState
    }

    current[keys[keys.length - 1]] = value
}

function pick(source: PersistedState, paths: string[]): PersistedState {
    return paths.reduce<PersistedState>((result, path) => {
        const value = getPathValue(source, path)

        if (value !== undefined) {
            setPathValue(result, path, value)
        }

        return result
    }, {})
}

function deserializePersistedState(raw: string, serializer?: PersistOptions['serializer']) {
    try {
        if (typeof serializer?.deserialize === 'function') {
            return serializer.deserialize(raw)
        }

        return JSON.parse(raw) as unknown
    }
    catch {
        return null
    }
}

function serializePersistedState(value: unknown, serializer?: PersistOptions['serializer']) {
    try {
        if (typeof serializer?.serialize === 'function') {
            return serializer.serialize(value)
        }

        return JSON.stringify(value)
    }
    catch {
        return null
    }
}

export function createUStorePiniaPlugin(): PiniaPlugin {
    return (context: PiniaPluginContext) => {
        const { store, options } = context

        if (!options.persist) return

        const persist: PersistOptions = typeof options.persist === 'boolean'
            ? {}
            : options.persist

        const {
            key = store.$id,
            paths,
            storage = 'local',
            encrypt = false,
            salt,
            serializer,
        } = persist

        const storageApi = storage === 'session'
            ? useSessionStorage()
            : useLocalStorage()
        const storageOptions = {
            encrypt,
            salt,
            namespace: 'pinia',
        }

        // Hydrate store from storage
        const saved = serializer
            ? (() => {
                const raw = storageApi.get<string | null>(key, null, storageOptions)

                if (typeof raw !== 'string') {
                    return null
                }

                return deserializePersistedState(raw, serializer)
            })()
            : storageApi.get<unknown>(key, null, storageOptions)

        if (isRecord(saved)) {
            store.$patch(saved as typeof store.$state)
        }

        // Subscribe to changes and persist
        store.$subscribe((_mutation, state) => {
            const sourceState = state as PersistedState
            const toPersist = paths ? pick(sourceState, paths) : sourceState

            if (serializer) {
                const serialized = serializePersistedState(toPersist, serializer)

                if (typeof serialized === 'string') {
                    storageApi.set(key, serialized, storageOptions)
                }

                return
            }

            storageApi.set(key, toPersist, storageOptions)
        }, { detached: true })
    }
}
