import { defineEventHandler, sendRedirect, setCookie } from 'h3'
import { generateState, generateCodeVerifier } from 'arctic'
import { getGoogleOAuth, getOAuthCookieOptions, setOAuthNoStoreHeaders } from '../../utils/oauth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)
    setOAuthNoStoreHeaders(event)

    try {
        const google = getGoogleOAuth()
        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const cookieOpts = getOAuthCookieOptions(event)

        // Store state + PKCE verifier in cookies for CSRF protection
        setCookie(event, 'google_oauth_state', state, cookieOpts)
        setCookie(event, 'google_code_verifier', codeVerifier, cookieOpts)

        const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email'])

        return sendRedirect(event, url.toString())
    } catch (error: any) {
        console.error('[auth/google] OAuth initiation error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Google OAuth error: ${error?.message || 'unknown'}`
        })
    }
})
