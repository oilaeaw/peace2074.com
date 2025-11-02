import crypto from 'node:crypto'
import User from '@server/models/user'
import { sendVerificationEmail } from '@server/utils/sendVerificationEmail'
import bcrypt from 'bcryptjs'
import { createError, readBody, sendError } from 'h3'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const body = await readBody(event)
  const { email, password, first_name, last_name, username } = body

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required.' }))
  }
  if (!username) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Username is required.' }))
  }

  // Check if user already exists (by email)
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return sendError(event, createError({ statusCode: 409, statusMessage: 'User already exists.' }))
  }

  // Check if username is taken
  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    return sendError(event, createError({ statusCode: 409, statusMessage: 'Username already taken.' }))
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  // Save the user (unverified)
  const user = await User.create({
    email,
    password: hashedPassword,
    first_name,
    last_name,
    username,
    role: 'user',
    verified: useRuntimeConfig().nodeEnv !== 'production',
    verificationToken,
    verificationTokenExpires,
  })
  if (!user) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'User creation failed.' }))
  }

  // Send verification email (best-effort in dev)
  try {
    await sendVerificationEmail(email, verificationToken)
  }
  catch (e) {
    if (useRuntimeConfig().nodeEnv === 'production')
      throw e
    // In development, don't block signup on mail failures
  }

  const msg = useRuntimeConfig().nodeEnv === 'production'
    ? 'Signup successful! Please check your email to verify your account.'
    : 'Signup successful! (Dev mode: verification skipped)'
  return { message: msg, user: { email: user.email, id: user._id, username: user.username, first_name: user.first_name, last_name: user.last_name, role: user.role } }
})
