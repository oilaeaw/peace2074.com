import { createError, defineEventHandler, getRequestHeader, sendRedirect, setCookie } from 'h3'
import { generateState } from 'arctic'
import { getAppleOAuth } from '../../utils/oauth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const apple = getAppleOAuth()
        const state = generateState()

        // Store state in cookie for CSRF protection
        setCookie(event, 'apple_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/'
        })

        const url = await apple.createAuthorizationURL(state, ['name', 'email'])

        return sendRedirect(event, url.toString())
    } catch (error: any) {
        console.error('[auth/apple] OAuth initiation error:', error)

        const errorMessage = String(error?.message || error?.statusMessage || 'unknown')
        const acceptHeader = String(getRequestHeader(event, 'accept') || '')

        if (/Apple OAuth not configured/i.test(errorMessage) && acceptHeader.includes('text/html')) {
            return sendRedirect(event, '/login?oauthError=apple-not-configured')
        }

        throw createError({
            statusCode: Number(error?.statusCode || 500),
            statusMessage: `Apple OAuth error: ${errorMessage}`
        })
    }
})
