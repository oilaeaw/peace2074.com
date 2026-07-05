/**
 * NitroStorageAdapter — bridges @waelio/realdb's StorageAdapter interface
 * to Nitro's built-in useStorage('data') for file-backed persistence.
 *
 * Falls back to an in-process Map when file storage is unavailable
 * (e.g., Cloudflare Workers / read-only environments).
 */
import type { StorageAdapter } from '@waelio/realdb'

type AnyDoc = Record<string, unknown> & { id: string }

export class NitroStorageAdapter implements StorageAdapter {
    readonly name = 'nitro-storage'

    /** In-process fallback cache keyed by collection name */
    private readonly memoryCache = new Map<string, Map<string, AnyDoc>>()

    private storageKey(collectionName: string): string {
        return `realdb:${collectionName}`
    }

    private getMemory(collectionName: string): Map<string, AnyDoc> {
        if (!this.memoryCache.has(collectionName)) {
            this.memoryCache.set(collectionName, new Map())
        }
        return this.memoryCache.get(collectionName)!
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    async init(_collectionName: string): Promise<void> {
        // Lazy init — nothing to do upfront
    }

    async getAll(collectionName: string): Promise<AnyDoc[]> {
        try {
            const storage = useStorage('data')
            const docs = await storage.getItem<AnyDoc[]>(this.storageKey(collectionName))
            if (Array.isArray(docs)) {
                // Warm the in-process cache so subsequent getById calls are fast
                const mem = this.getMemory(collectionName)
                for (const doc of docs) {
                    if (doc?.id) mem.set(doc.id, doc)
                }
                return docs
            }
        } catch {
            // File storage unavailable — serve from in-memory cache
        }
        return Array.from(this.getMemory(collectionName).values())
    }

    async getById(collectionName: string, id: string): Promise<AnyDoc | null> {
        // Fast path: check memory cache first
        const mem = this.getMemory(collectionName)
        if (mem.has(id)) return mem.get(id) ?? null

        // Populate cache via full read, then retry
        await this.getAll(collectionName)
        return mem.get(id) ?? null
    }

    // ── Writes ───────────────────────────────────────────────────────────────

    async put(collectionName: string, doc: unknown): Promise<void> {
        const d = doc as AnyDoc
        const mem = this.getMemory(collectionName)

        // Ensure cache is loaded before mutating
        if (mem.size === 0) await this.getAll(collectionName)

        mem.set(d.id, d)
        await this.flush(collectionName, mem)
    }

    async delete(collectionName: string, id: string): Promise<void> {
        const mem = this.getMemory(collectionName)
        if (mem.size === 0) await this.getAll(collectionName)
        mem.delete(id)
        await this.flush(collectionName, mem)
    }

    async clear(collectionName: string): Promise<void> {
        this.getMemory(collectionName).clear()
        await this.flush(collectionName, new Map())
    }

    async destroy(): Promise<void> {
        this.memoryCache.clear()
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private async flush(collectionName: string, mem: Map<string, AnyDoc>): Promise<void> {
        const docs = Array.from(mem.values())
        try {
            const storage = useStorage('data')
            await storage.setItem(this.storageKey(collectionName), docs)
        } catch {
            // Edge / read-only runtime — data lives only in the process memory cache
        }
    }
}
