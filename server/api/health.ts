import { ensureDbConnection, getDbConnectionStatus } from '@server/utils/database'

export default defineEventHandler(async (_event) => {
  try {
    await ensureDbConnection()
    const dbStatus = getDbConnectionStatus()
    return {
      ok: true,
      env: useRuntimeConfig().nodeEnv,
      db: dbStatus,
    }
  }
  catch (error) {
    const err = error as any
    return {
      ok: false,
      error: err?.message || String(err),
    }
  }
})
