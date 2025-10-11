import bcrypt from 'bcryptjs'
import { createError, readBody, sendError } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../models/user'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, email, username, password } = body || {}

  const id = typeof identifier === 'string' && identifier.trim().length > 0 ? identifier.trim() : (email || username)
  if (!password || !id) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Username/email and password are required.' }))
  }

  const isEmail = id.includes('@')
  const query: any = isEmail ? { email: id } : { username: id }
  const user = await User.findOne(query)
  if (!user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }
  // Only enforce verification in production to ease local testing
  if (!user.verified && useRuntimeConfig().nodeEnv === 'production') {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Please verify your email before logging in.' }))
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }

  // Issue JWT using runtime secret for consistency
  const { jwtSecret, nodeEnv } = useRuntimeConfig()
  const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret || 'changeme', { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return {
    user: {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      role: user.role,
    },
  }
})
