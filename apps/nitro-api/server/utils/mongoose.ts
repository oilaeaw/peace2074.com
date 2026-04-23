import mongoose from 'mongoose'

// Cache connection promise across Lambda invocations (process reuse)
let connectionPromise: Promise<typeof mongoose> | null = null

export async function getMongoose(): Promise<typeof mongoose> {
    // Already connected
    if (mongoose.connection.readyState === 1) return mongoose

    // Connection in progress
    if (connectionPromise) return connectionPromise

    const uri = process.env.DATABASE_URL || process.env.NITRO_DATABASE_URL
    if (!uri) throw new Error('DATABASE_URL environment variable is not set')

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
            return mongoose
        })
        .catch((err) => {
            connectionPromise = null
            throw err
        })

    return connectionPromise
}
