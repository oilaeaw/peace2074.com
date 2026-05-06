import mongoose from 'mongoose'
import { isFallbackAuthStorageAllowed } from './database-mode'
import { flushPendingWrites } from './mongoose-local'

// Cache connection promise across Lambda invocations (process reuse)
let connectionPromise: Promise<typeof mongoose> | null = null
let lastConnectionError: Error | null = null
let lastConnectionFailureAt = 0

const FALLBACK_RETRY_COOLDOWN_MS = 30_000

function toConnectionError(error: unknown) {
    return error instanceof Error
        ? error
        : new Error(String(error || 'MongoDB connection failed'))
}

export async function getMongoose(): Promise<typeof mongoose> {
    // Already connected
    if (mongoose.connection.readyState === 1) {
        lastConnectionError = null
        lastConnectionFailureAt = 0
        return mongoose
    }

    // Connection in progress
    if (connectionPromise) return connectionPromise

    if (
        lastConnectionError
        && isFallbackAuthStorageAllowed()
        && Date.now() - lastConnectionFailureAt < FALLBACK_RETRY_COOLDOWN_MS
    ) {
        throw lastConnectionError
    }

    const uri = process.env.DATABASE_URL || process.env.NITRO_DATABASE_URL
    if (!uri) {
        lastConnectionError = new Error('DATABASE_URL environment variable is not set')
        lastConnectionFailureAt = Date.now()
        throw lastConnectionError
    }

    connectionPromise = mongoose
        .connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 0,
            bufferCommands: false,
        })
        .then(() => {
            console.log('[mongoose] Connected to MongoDB Atlas')
            lastConnectionError = null
            lastConnectionFailureAt = 0
            // Atlas is back — replay any writes that happened during outage
            flushPendingWrites().catch(() => { })
            return mongoose
        })
        .catch((err) => {
            connectionPromise = null
            lastConnectionError = toConnectionError(err)
            lastConnectionFailureAt = Date.now()
            throw lastConnectionError
        })

    return connectionPromise
}
