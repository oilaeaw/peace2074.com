import bcrypt from 'bcryptjs'
import { createError, defineEventHandler, readBody, sendError } from 'h3'
import User from '@server/models/user'

export default defineEventHandler(async (event) => {
  const { nodeEnv } = useRuntimeConfig()
  if (nodeEnv === 'production') {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Dev login disabled in production.' }))
  }

  const body = await readBody(event)
  const { identifier } = body || {}
  if (!identifier || typeof identifier !== 'string') {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Identifier (email or username) is required.' }))
  }

  const isEmail = identifier.includes('@')
  let user = await User.findOne(isEmail ? { email: identifier } : { username: identifier })

  if (!user) {
    const randomPassword = (await import('node:crypto')).randomBytes(16).toString('hex')
    const hashed = await bcrypt.hash(randomPassword, 10)
    const username = isEmail ? identifier.split('@')[0] : identifier
    user = await User.create({
      email: isEmail ? identifier : undefined,
      username,
      password: hashed,
      verified: true,
      role: 'user',
    })
  }

  const { issueAuthToken } = await import('../../utils/auth')
  const tokenResp = await issueAuthToken(event, { id: user._id, email: user.email })

  const response: any = {
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  }

  // For convenience in development, return the raw JWT when JWT fallback is
  // used. Do NOT return this in production.
  try {
    if ((useRuntimeConfig().nodeEnv !== 'production') && tokenResp && tokenResp.type === 'jwt' && tokenResp.token) {
      response.token = tokenResp.token
    }
  } catch (e) {
    // ignore
  }

  return response
})
