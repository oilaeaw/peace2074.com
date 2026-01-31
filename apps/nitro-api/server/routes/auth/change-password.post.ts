import { createError, defineEventHandler, readBody } from 'h3'
import { readSession } from '../../utils/auth'
import { findUserById, updateUserPassword } from '../../utils/users'

export default defineEventHandler(async (event) => {
    // Check if user is authenticated
    const session = await readSession(event)
    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized - Please login first'
        })
    }

    const body = await readBody<{
        currentPassword?: string
        newPassword?: string
        confirmPassword?: string
    }>(event) || {}

    const currentPassword = (body.currentPassword || '').trim()
    const newPassword = (body.newPassword || '').trim()
    const confirmPassword = (body.confirmPassword || '').trim()

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'All fields are required'
        })
    }

    if (newPassword !== confirmPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'New passwords do not match'
        })
    }

    if (newPassword.length < 8) {
        throw createError({
            statusCode: 400,
            statusMessage: 'New password must be at least 8 characters'
        })
    }

    // Find user
    const user = findUserById(session.id)
    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: 'User not found'
        })
    }

    // Verify current password
    if (currentPassword !== user.password) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Current password is incorrect'
        })
    }

    // Update password
    updateUserPassword(user.id, newPassword)

    return {
        ok: true,
        message: 'Password changed successfully'
    }
})
