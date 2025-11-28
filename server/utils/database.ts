import mongoose from 'mongoose'

/**
 * Ensures the MongoDB connection is established.
 * Safe to call multiple times - will only connect if not already connected.
 */
export async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return
  }

  const config = useRuntimeConfig()
  await mongoose.connect(config.mongodbUri)
}

/**
 * Returns the current database connection status.
 */
export function getDbConnectionStatus(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return states[mongoose.connection.readyState] || 'unknown'
}
