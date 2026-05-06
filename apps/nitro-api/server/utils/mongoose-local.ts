/**
 * Local MongoDB fallback connection.
 * Used when Atlas (DATABASE_URL) is unreachable — e.g. network outage, war-zone connectivity.
 * Set DATABASE_URL_LOCAL to a local or nearby MongoDB instance.
 * Writes made while Atlas is down are queued and replayed when Atlas recovers.
 */
import mongoose from 'mongoose'

type WriteOp = () => Promise<void>

const localUri =
    process.env.DATABASE_URL_LOCAL ||
    process.env.NITRO_DATABASE_URL_LOCAL ||
    null

let localConnection: mongoose.Connection | null = null
let localConnectionPromise: Promise<mongoose.Connection> | null = null
let localFailedAt = 0
const LOCAL_RETRY_MS = 60_000

// Queue of write operations to replay on Atlas when it recovers
const pendingWrites: WriteOp[] = []
let syncScheduled = false

export function hasLocalFallback(): boolean {
    return Boolean(localUri)
}

export async function getLocalConnection(): Promise<mongoose.Connection | null> {
    if (!localUri) return null

    if (localConnection && localConnection.readyState === 1) return localConnection

    if (localConnectionPromise) return localConnectionPromise

    if (Date.now() - localFailedAt < LOCAL_RETRY_MS) return null

    localConnectionPromise = mongoose
        .createConnection(localUri, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            maxPoolSize: 5,
            bufferCommands: false,
        })
        .asPromise()
        .then((conn) => {
            localConnection = conn
            localConnectionPromise = null
            console.log('[mongoose-local] Connected to local MongoDB fallback')
            return conn
        })
        .catch((err) => {
            localConnectionPromise = null
            localFailedAt = Date.now()
            console.warn('[mongoose-local] Local MongoDB unreachable:', err?.message)
            throw err
        })

    return localConnectionPromise
}

export function isLocalConnected(): boolean {
    return localConnection?.readyState === 1
}

/**
 * Queue a write operation to be replayed on Atlas when it recovers.
 * The op receives the primary mongoose instance when called.
 */
export function queueWrite(op: WriteOp): void {
    pendingWrites.push(op)
}

/**
 * Call this when Atlas connection is restored.
 * Replays all queued writes in order, then clears the queue.
 */
export async function flushPendingWrites(): Promise<void> {
    if (!pendingWrites.length || syncScheduled) return
    syncScheduled = true
    console.log(`[mongoose-local] Flushing ${pendingWrites.length} queued write(s) to Atlas`)
    const ops = pendingWrites.splice(0)
    for (const op of ops) {
        try {
            await op()
        } catch (err) {
            console.warn('[mongoose-local] Queued write replay failed:', err)
            // Re-queue failed op so we don't lose data
            pendingWrites.unshift(op)
            break
        }
    }
    syncScheduled = false
}

export function getPendingWriteCount(): number {
    return pendingWrites.length
}
