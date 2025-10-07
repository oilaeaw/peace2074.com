import User from '@server/models/user'
import { ensureDbConnection, getDbConnectionStatus } from '@server/utils/database'

export default defineEventHandler(async (_event) => {
  try {
    console.warn('Health check: Testing database connection')

    // Ensure database connection with retry logic
    await ensureDbConnection()

    // Test database connection by counting users
    const userCount = await User.countDocuments()
    console.warn('Health check: User count:', userCount)

    const dbStatus = getDbConnectionStatus()

    return {
      status: 'ok',
      database: 'connected',
      dbStatus,
      userCount,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    console.error('Health check error:', error)
    const dbStatus = getDbConnectionStatus()

    return {
      status: 'error',
      database: 'disconnected',
      dbStatus,
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
})
