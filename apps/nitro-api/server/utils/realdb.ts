/**
 * Singleton RealDB instance for the Nitro API server.
 *
 * Storage: @waelio/data Database → .data/peace2074.json (native JSON file)
 * Query API: @waelio/realdb typed collections
 *
 * No MongoDB. No paid services. No external connections.
 * Both packages are free and authored by waelio.com.
 */
import { RealDB } from '@waelio/realdb'
import { NitroStorageAdapter } from './nitro-storage-adapter'

let _db: RealDB | null = null
let _openPromise: Promise<RealDB> | null = null

export async function getDb(): Promise<RealDB> {
    if (_db?.isOpen) return _db
    if (_openPromise) return _openPromise

    _openPromise = (async () => {
        const adapter = new NitroStorageAdapter()
        const db = new RealDB({ name: 'peace2074', adapter })

        // Register all collections
        db.collection('users')
        db.collection('sessions')
        db.collection('profiles')
        db.collection('readerStats')
        db.collection('deployLikes')
        db.collection('blogLikes')
        db.collection('blogPosts')
        db.collection('quranProgress')
        db.collection('tasbeeh')
        db.collection('offlineDownloads')

        await db.open()
        _db = db
        _openPromise = null
        console.log('[realdb] Database opened → .data/peace2074.json')
        return db
    })()

    return _openPromise
}
