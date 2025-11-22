import bcrypt from 'bcryptjs'
import { createError, readBody } from 'h3'
import User from '@server/models/user'

export default defineEventHandler(async (event) => {
  try {
    const { email, password, username, first_name, last_name } = await readBody(event)

    // Basic validation
    if (!email || !password || !username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    // Check if user already exists
    const U: any = User as any
    const existingUser = await U.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: 'User with this email or username already exists.',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      first_name,
      last_name,
    })

    await newUser.save()

    return { message: 'User created successfully' }
  }
  catch (error: any) {
    // Ensure we don't pass an invalid object to createError
    const isErrorObject = error && typeof error === 'object';
    const statusCode = isErrorObject ? error.statusCode : 500;
    const statusMessage = isErrorObject ? error.statusMessage : 'An unexpected error occurred during registration.';
    throw createError({ statusCode, statusMessage });
  }
})