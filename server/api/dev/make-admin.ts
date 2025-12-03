import { defineEventHandler, readBody, sendError, createError } from 'h3'
import User from '@server/models/user'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  try { await ensureDbConnection() } catch {}
  const { nodeEnv } = useRuntimeConfig()
  if (nodeEnv === 'production') return sendError(event, createError({ statusCode: 403, statusMessage: 'disabled in production' }))

  const body: any = await readBody(event)
  const identifier = body?.identifier
  if (!identifier || typeof identifier !== 'string') return sendError(event, createError({ statusCode: 400, statusMessage: 'identifier required' }))

  const isEmail = identifier.includes('@')
  const query = isEmail ? { email: identifier } : { username: identifier }
  const U: any = User as any
  const user = await U.findOne(query)
  if (!user) return sendError(event, createError({ statusCode: 404, statusMessage: 'user not found' }))

  user.role = 'admin'
  await user.save()

  return { ok: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } }
})
