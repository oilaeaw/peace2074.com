import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import { useLocalStorage } from '@/composables/useUStore'

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
}

declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        persist?: boolean | PersistOptions
    }
}

function pick(obj: any, paths: string[]): any {
    return paths.reduce((result, path) => {
        const value = path.split('.').reduce((o, k) => o?.[k], obj)
        if (value !== undefined) {
            const keys = path.split('.')
            let current = result
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {}
                current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
        }
        return result
    }, {} as any)
}

export function createUStorePiniaPlugin(): PiniaPlugin {
    return (context: PiniaPluginContext) => {
        const { store, options } = context

        if (!options.persist) return

        const persist: PersistOptions = typeof options.persist === 'boolean'
            ? {}
            : options.persist

        const {
            key = `pinia:${store.$id}`,
            paths,
            storage = 'local',
            encrypt = false,
            salt
        } = persist

        const localStorage = useLocalStorage()

        // Hydrate store from storage
        const saved = localStorage.get(key, null, {
            encrypt,
            salt,
            namespace: 'pinia'
        })

        if (saved && typeof saved === 'object') {
            store.$patch(saved)
        }

        // Subscribe to changes and persist
        store.$subscribe((_mutation: any, state: any) => {
            const toPersist = paths ? pick(state, paths) : state
            localStorage.set(key, toPersist, {
                encrypt,
                salt,
                namespace: 'pinia'
            })
        }, { detached: true })
    }
}
