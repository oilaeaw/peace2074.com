import { defineEventHandler, sendRedirect, setCookie } from 'h3'
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

        const url = await apple.createAuthorizationURL(state, {
            scopes: ['name', 'email']
        })

        return sendRedirect(event, url.toString())
    } catch (error: any) {
        console.error('[auth/apple] OAuth initiation error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Apple OAuth error: ${error?.message || 'unknown'}`
        })
    }
})
