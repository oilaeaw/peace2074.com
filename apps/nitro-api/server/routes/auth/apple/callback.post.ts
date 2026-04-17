import {
    createError,
    defineEventHandler,
    deleteCookie,
    getCookie,
    readBody,
    sendRedirect,
} from 'h3'
import { OAuth2RequestError, decodeIdToken } from 'arctic'
import {
    getAppleOAuth,
    getOAuthCookieOptions,
    setOAuthNoStoreHeaders,
    type OAuthUserInfo,
} from '../../../utils/oauth'
import { createSession } from '../../../utils/auth'
import { findOrCreateOAuthUser } from '../../../utils/users'
import { applyCors } from '../../../utils/cors'

interface AppleCallbackBody {
    code?: string
    state?: string
}

interface AppleIdTokenClaims {
    sub: string
    email: string
    email_verified: boolean | string
}

export default defineEventHandler(async (event) => {
    applyCors(event)
    setOAuthNoStoreHeaders(event)

    try {
        const body = (await readBody<AppleCallbackBody>(event).catch(() => ({}))) || {}
        const code = String(body.code || '').trim()
        const state = String(body.state || '').trim()
        const redirectUrl = process.env.PUBLIC_URL || 'https://peace2074.com'
        const cookieOptions = getOAuthCookieOptions(event)

        const storedState = getCookie(event, 'apple_oauth_state')

        // Validate state for CSRF protection
        if (!code || !state || !storedState || state !== storedState) {
            console.warn('[auth/apple/callback:post] Invalid OAuth state', {
                hasCode: Boolean(code),
                hasState: Boolean(state),
                hasStoredState: Boolean(storedState),
                stateMatches: Boolean(state && storedState && state === storedState),
            })

            return sendRedirect(event, `${redirectUrl}/login?oauthError=apple-state-invalid`)
        }

        // Clear the state cookie
        deleteCookie(event, 'apple_oauth_state', cookieOptions)

        const apple = getAppleOAuth()

        // Exchange code for tokens
        const tokens = await apple.validateAuthorizationCode(code)

        // Decode ID token to get user info
        const idTokenClaims = decodeIdToken(tokens.idToken) as AppleIdTokenClaims

        if (!idTokenClaims.email_verified || idTokenClaims.email_verified === 'false') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Apple email not verified',
            })
        }

        // Apple doesn't provide name in ID token consistently
        // We'll use email username as fallback
        const emailUsername = idTokenClaims.email.split('@')[0]

        const oauthInfo: OAuthUserInfo = {
            provider: 'apple',
            providerId: idTokenClaims.sub,
            email: idTokenClaims.email,
            name: emailUsername,
        }

        // Find or create user
        const user = await findOrCreateOAuthUser(oauthInfo)

        // Create session
        createSession(event, {
            id: user.id,
            role: user.role || 'user',
            name: user.first_name || user.username,
        })

        // Redirect to app
        return sendRedirect(event, `${redirectUrl}/`)
    } catch (error: any) {
        console.error('[auth/apple/callback:post] OAuth error:', error)

        if (error instanceof OAuth2RequestError) {
            throw createError({
                statusCode: 400,
                statusMessage: `Apple OAuth error: ${error.message}`,
            })
        }

        if (error?.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: `OAuth callback failed: ${error?.message || 'unknown error'}`,
        })
    }
})
