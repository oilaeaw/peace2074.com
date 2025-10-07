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
  try {
    console.warn('Login attempt started')
    const body = await readBody(event)
    console.warn('Body parsed successfully')
    const { email, password } = body as payloadT

    if (!email || !password) {
      console.warn('Missing email or password')
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required.' }))
    }

    console.warn('Attempting to find user with email:', email)
    const user: UserT = await User.findOne({ email })
    console.warn('User query completed, user found:', !!user)

    if (!user) {
      console.warn('User not found')
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
    }
    if (!user.verified) {
      console.warn('User not verified')
      return sendError(event, createError({ statusCode: 403, statusMessage: 'Please verify your email before logging in.' }))
    }

    console.warn('Comparing password')
    const valid = await bcrypt.compare(password, user.password)
    console.warn('Password comparison completed, valid:', valid)

    if (!valid) {
      console.warn('Invalid password')
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Invalid credentials' }))
    }

    console.warn('Creating JWT token')
    // Issue JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    console.warn('Setting cookie')
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

    console.warn('Login successful, returning user data')
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
  catch (error) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal server error during login',
      data: { error: error.message, stack: error.stack },
    }))
  }
})
