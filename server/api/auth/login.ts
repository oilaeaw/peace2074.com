import { eventHandler, readBody, createError } from "h3"
import { connectToDatabase } from "../../utils/database.ts"
import { User } from "../../models/user.ts"
import { verifyPassword, generateToken, sanitizeUser } from "../../utils/auth.ts"

export default eventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    await connectToDatabase()
    
    const { email, password } = await readBody(event)

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password!)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Generate token and return user data
    const token = generateToken(user)
    const sanitizedUser = sanitizeUser(user.toObject())

    return {
      success: true,
      user: sanitizedUser,
      token
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})