import process from 'node:process'
import bcrypt from 'bcryptjs'
import { createError, readBody, sendError } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../models/user'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required.' }))
  }

  const user = await User.findOne({ email })
  if (!user) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
  }

  // Issue JWT
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: useRuntimeConfig().nodeEnv === 'production',
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
