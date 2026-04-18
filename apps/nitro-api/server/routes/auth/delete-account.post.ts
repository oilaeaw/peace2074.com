import { createError, defineEventHandler, readBody } from 'h3'

import { clearSessionCookie, readSession, requireSecrets } from '../../utils/auth'
import { applyCors } from '../../utils/cors'
import { getCollection } from '../../utils/kv-db'
import { deleteUserPasskeyStorage } from '../../utils/passkeys'
import { verifyPassword } from '../../utils/password'
import { deleteUserById, findUserById } from '../../utils/users'

async function cleanupPushSubscriptions(identifiers: string[]) {
    const uniqueIdentifiers = [...new Set(
        identifiers
            .map((value) => value.trim())
            .filter(Boolean)
    )]

    if (!uniqueIdentifiers.length) {
        return
    }

    const subscriptions = await getCollection('push_subscriptions')

    for (const identifier of uniqueIdentifiers) {
        const matches = await subscriptions.find({ userId: identifier }).toArray()

        for (const match of matches) {
            if (!match?._id) continue
            await subscriptions.deleteOne({ _id: match._id })
        }
    }
}

export default defineEventHandler(async (event) => {
    applyCors(event)
    requireSecrets({ needPasscode: false })

    const session = readSession(event)
    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = (await readBody<{
        confirmText?: string
        currentPassword?: string
    }>(event)) || {}

    const confirmText = (body.confirmText || '').trim()
    const currentPassword = (body.currentPassword || '').trim()

    const user = await findUserById(session.id)
    if (!user) {
        clearSessionCookie(event)
        return {
            ok: true,
            message: 'Account already deleted',
        }
    }

    if (!confirmText) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Confirmation text is required',
        })
    }

    if (confirmText !== user.username && confirmText !== user.email) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Confirmation text must match your username or email',
        })
    }

    const requiresPassword = Boolean(user.password && user.password.trim())
    if (requiresPassword) {
        if (!currentPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current password is required for this account',
            })
        }

        const passwordIsValid = await verifyPassword(currentPassword, user.password)
        if (!passwordIsValid) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Current password is incorrect',
            })
        }
    }

    const deleted = await deleteUserById(user.id)
    if (!deleted) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete account',
        })
    }

    try {
        await deleteUserPasskeyStorage(user.id)
    } catch (error) {
        console.warn('[auth/delete-account] Failed to clean passkey storage', error)
    }

    try {
        await cleanupPushSubscriptions([user.id, user.email])
    } catch (error) {
        console.warn('[auth/delete-account] Failed to clean push subscriptions', error)
    }

    clearSessionCookie(event)

    return {
        ok: true,
        message: 'Account deleted successfully',
    }
})