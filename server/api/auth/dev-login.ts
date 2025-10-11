import bcrypt from 'bcryptjs'
import { createError, defineEventHandler, readBody, sendError, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../../models/user'

export default defineEventHandler(async (event) => {
  const { nodeEnv, jwtSecret } = useRuntimeConfig()
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
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  }
})
