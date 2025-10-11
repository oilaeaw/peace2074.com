import type { UserT } from './../../shared/types/index'
import bcrypt from 'bcryptjs'
import { createError, readBody, sendError, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../../models/user'

// JWT secret is provided via Nuxt runtimeConfig

interface PayloadT {
  identifier?: string
  email?: string
  username?: string
  password: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as PayloadT | null
    const { identifier, email, username, password } = body || ({} as PayloadT)

    // Support a unified identifier (email or username), but accept legacy email/username too
    const id = typeof identifier === 'string' && identifier.trim().length > 0
      ? identifier.trim()
      : (email || username || '')

    if (!id || !password) {
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Username/email and password are required.' }))
    }

    const isEmail = id.includes('@')
    const query: any = isEmail ? { email: id } : { username: id }
    const user: UserT | null = await User.findOne(query)

    // --- Temporary Debugging --- //
    console.log('USER OBJECT FROM DB:', user)
    // ------------------------- //

    if (!user) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
    }
    // Require verification only in production; allow local/dev login without email verification
    const { nodeEnv } = useRuntimeConfig()
    if (!user.verified && nodeEnv === 'production') {
      return sendError(event, createError({ statusCode: 403, statusMessage: 'Please verify your email before logging in.' }))
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
    }

    // Issue JWT with runtime secret
    const { jwtSecret } = useRuntimeConfig()
    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret || 'changeme', { expiresIn: '7d' })

    // Set the token as an httpOnly cookie so it cannot be accessed by JavaScript
    const secure = useRuntimeConfig().nodeEnv === 'production'
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
  }
  catch (error: any) {
    console.error('LOGIN_ERROR:', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal server error during login',
      data: { error: error?.message, stack: error?.stack },
    }))
  }
})
