import process from 'node:process'
import mongoose from 'mongoose'

export async function ensureDbConnection(maxRetries = 3, timeoutMs = 30000) {
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return mongoose.connection
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.warn(`Database connection attempt ${attempt}/${maxRetries}`)

      const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
      if (!uri) {
        throw new Error('MongoDB URI not found in environment variables')
      }

      await mongoose.connect(uri, {
        connectTimeoutMS: timeoutMs,
        socketTimeoutMS: timeoutMs,
        serverSelectionTimeoutMS: timeoutMs,
        bufferMaxEntries: 0,
        bufferCommands: false,
      })

      console.warn('Database connected successfully')
      return mongoose.connection
    }
    catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error.message)

      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error.message}`)
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * (2 ** (attempt - 1)), 10000)
      console.warn(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export function getDbConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return {
    state: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  }
}
