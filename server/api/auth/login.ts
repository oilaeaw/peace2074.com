import type { UserT } from './../../shared/types/index'
import process from 'node:process'
import bcrypt from 'bcryptjs'
import { createError, readBody, sendError } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../../models/user'

// JWT secret should be stored in environment variables for security;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

interface payloadT {
  email: string
  password: string
}
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body as payloadT

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required.' }))
  }

  const user: UserT = await User.findOne({ email })
  if (!user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }
  if (!user.verified) {
    return sendError(event, createError({ statusCode: 403, statusMessage: 'Please verify your email before logging in.' }))
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }

  // Issue JWT
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  // Set the token as an httpOnly cookie so it cannot be accessed by JavaScript
  const runtime = useRuntimeConfig()
  const secure = runtime.nodeEnv === 'production'
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  // Return only the user object (no token in response body)
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
