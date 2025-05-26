import bcrypt from 'bcryptjs'
import { createError, readBody, sendError } from 'h3'
import User from '../models/user'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, first_name, last_name } = body

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email and password are required.' }))
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return sendError(event, createError({ statusCode: 409, statusMessage: 'User already exists.' }))
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Save the user
  const user = await User.create({ email, password: hashedPassword, first_name, last_name, role: 'user' })
  if (!user) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'User creation failed.' }))
  }

  return { message: 'Signup successful!', user: { email: user.email, id: user._id, first_name: user.first_name, last_name: user.last_name, role: user.role } }
})
