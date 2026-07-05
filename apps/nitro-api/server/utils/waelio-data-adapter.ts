/**
 * WaelioDataAdapter — bridges @waelio/realdb's StorageAdapter interface
 * to @waelio/data's Database for native JSON-file persistence.
 *
 * Data is saved to .data/peace2074.json automatically.
 * Falls back to in-process memory if the file cannot be written (edge runtimes).
 */
import type { StorageAdapter } from '@waelio/realdb'
import { Database } from '@waelio/data'

type AnyDoc = Record<string, unknown> & { id: string }

// Single shared Database instance — one JSON file for the whole app
let _wdb: Database | null = null
function getWdb(): Database {
    if (!_wdb) {
        _wdb = new Database({ filePath: './.data/peace2074.json' })
    }
    return _wdb
}

export class WaelioDataAdapter implements StorageAdapter {
    readonly name = 'waelio-data'

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    async init(_collectionName: string): Promise<void> {
        // Database is lazily created — nothing to do here
    }

    // ── Reads ─────────────────────────────────────────────────────────────────

    async getAll(collectionName: string): Promise<AnyDoc[]> {
        try {
            const record = getWdb().getAll(collectionName)
            return Object.values(record) as AnyDoc[]
        } catch {
            return []
        }
    }

    async getById(collectionName: string, id: string): Promise<AnyDoc | null> {
        try {
            return (getWdb().get(collectionName, id) as AnyDoc) ?? null
        } catch {
            return null
        }
    }

    // ── Writes ────────────────────────────────────────────────────────────────

    async put(collectionName: string, doc: unknown): Promise<void> {
        const d = doc as AnyDoc
        try {
            getWdb().set(collectionName, d.id, d)
        } catch (err) {
            console.warn('[waelio-data] put failed:', err)
        }
    }

    async delete(collectionName: string, id: string): Promise<void> {
        try {
            getWdb().delete(collectionName, id)
        } catch (err) {
            console.warn('[waelio-data] delete failed:', err)
        }
    }

    async clear(collectionName: string): Promise<void> {
        try {
            getWdb().clear(collectionName)
        } catch (err) {
            console.warn('[waelio-data] clear failed:', err)
        }
    }

    async destroy(): Promise<void> {
        // Nothing to clean up — the JSON file stays on disk
    }
}
