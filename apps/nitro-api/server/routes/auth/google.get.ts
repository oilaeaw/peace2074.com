import { defineEventHandler, sendRedirect, setCookie } from 'h3'
import { generateState } from 'arctic'
import { getGoogleOAuth } from '../../utils/oauth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const google = getGoogleOAuth()
        const state = generateState()

        // Store state in cookie for CSRF protection
        setCookie(event, 'google_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/'
        })

        const url = await google.createAuthorizationURL(state, {
            scopes: ['openid', 'profile', 'email']
        })

        return sendRedirect(event, url.toString())
    } catch (error: any) {
        console.error('[auth/google] OAuth initiation error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Google OAuth error: ${error?.message || 'unknown'}`
        })
    }
})
