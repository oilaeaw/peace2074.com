import { defineEventHandler } from 'h3'
import { ensureDbConnection } from '@server/utils/database'
import OAuthLog from '@server/models/oauth-log'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (cfg.nodeEnv === 'production') {
    setResponseStatus(event, 403)
    return { error: 'Forbidden in production' }
  }
  await ensureDbConnection()
  const OLog = OAuthLog as any
  const logs = await OLog.find({}).sort({ createdAt: -1 }).limit(20).lean()
  return { logs }
})
