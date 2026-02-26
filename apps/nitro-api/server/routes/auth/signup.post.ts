import { createError, defineEventHandler, readBody } from 'h3'
import { addUser, findUserByEmail, findUserByUsername } from '../../utils/users'
import { createProfile } from '../../utils/profile'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        username?: string
        email?: string
        password?: string
        first_name?: string
        last_name?: string
    }>(event) || {}

    const username = (body.username || '').trim()
    const email = (body.email || '').trim()
    const password = (body.password || '').trim()
    const first_name = (body.first_name || username).trim()
    const last_name = (body.last_name || '').trim()

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

    // Hash password securely
    const hashedPassword = await hashPassword(password)

    // Default user permissions
    const defaultPermissions = [
        { action: 'read', subject: 'category' },
        { action: 'read', subject: 'post' },
        { action: 'create', subject: 'user' },
        { action: 'read', subject: 'user' },
        { action: 'update', subject: 'user' },
        { action: 'read', subject: 'chat' },  // New users can access chat
    ]

    const userId = `user_${Date.now()}`

    // Create new user (identity only)
    const newUser = {
        id: userId,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        permissions: defaultPermissions
    }

    await addUser(newUser)

    // Create user profile
    await createProfile({
        userId,
        first_name,
        last_name,
        settings: {},
        tasbeeh_summary: { total: 0, sessions: 0 }
    })

    return {
        ok: true,
        message: 'Account created successfully'
    }
})
