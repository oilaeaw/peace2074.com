import { createError, defineEventHandler, readBody } from 'h3'
import { addUser, findUserByEmail, findUserByUsername } from '../../utils/users'

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        username?: string
        email?: string
        password?: string
    }>(event) || {}

    const username = (body.username || '').trim()
    const email = (body.email || '').trim()
    const password = (body.password || '').trim()

    // Validation
    if (!username || !email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username, email, and password are required'
        })
    }

    if (password.length < 8) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Password must be at least 8 characters'
        })
    }

    // Check if username already exists
    if (await findUserByUsername(username)) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Username already taken'
        })
    }

    // Check if email already exists
    if (await findUserByEmail(email)) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Email already registered'
        })
    }

    // Create new user
    const newUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        password, // In production: await bcrypt.hash(password, 10)
        role: 'user',
        first_name: username,
        last_name: ''
    }

    await addUser(newUser)
    return {
        ok: true,
        message: 'Account created successfully'
    }
})
