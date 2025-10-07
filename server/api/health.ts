import User from '@server/models/user'

export default defineEventHandler(async (_event) => {
  try {
    console.warn('Health check: Testing database connection')

    // Test database connection by counting users
    const userCount = await User.countDocuments()
    console.warn('Health check: User count:', userCount)

    return {
      status: 'ok',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    console.error('Health check error:', error)
    return {
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
})
