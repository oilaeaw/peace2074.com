import { eventHandler, readBody, createError } from "h3"
import { connectToDatabase } from "../../utils/database.ts"
import { User } from "../../models/user.ts"
import { hashPassword, generateToken, sanitizeUser } from "../../utils/auth.ts"

export default eventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    await connectToDatabase()
    
    const { name, email, password } = await readBody(event)

    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and password are required'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User already exists with this email'
      })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      provider: 'local'
    })

    await user.save()

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