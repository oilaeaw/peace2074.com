import { defineEventHandler, getQuery, getCookie, deleteCookie, sendRedirect, createError } from 'h3'
import { OAuth2RequestError } from 'arctic'
import { getGoogleOAuth, getOAuthCookieOptions, setOAuthNoStoreHeaders, type OAuthUserInfo } from '../../../utils/oauth'
import { createSession, requireSecrets, sign } from '../../../utils/auth'
import { findUserByEmail, findOrCreateOAuthUser } from '../../../utils/users'
import { applyCors } from '../../../utils/cors'

interface GoogleUserResponse {
    sub: string
    name: string
    email: string
    email_verified: boolean
    given_name?: string
    family_name?: string
    picture?: string
}

export default defineEventHandler(async (event) => {
    applyCors(event)
    setOAuthNoStoreHeaders(event)

    try {
        const query = getQuery(event)
        const code = query.code as string
        const state = query.state as string
        const redirectUrl = process.env.PUBLIC_URL || 'https://peace2074.com'
        const cookieOptions = getOAuthCookieOptions(event)

        const storedState = getCookie(event, 'google_oauth_state')
        const storedCodeVerifier = getCookie(event, 'google_code_verifier')
        const isNative = getCookie(event, 'oauth_from_native') === '1'
        const nativeBase = 'peace2074://auth/callback'

        // Validate state for CSRF protection
        if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
            console.warn('[auth/google/callback] Invalid OAuth state', {
                hasCode: Boolean(code),
                hasState: Boolean(state),
                hasStoredState: Boolean(storedState),
                hasStoredCodeVerifier: Boolean(storedCodeVerifier),
                stateMatches: Boolean(state && storedState && state === storedState),
            })

            return sendRedirect(event, isNative
                ? `${nativeBase}?oauthError=google-state-invalid`
                : `${redirectUrl}/login?oauthError=google-state-invalid`)
        }

        // Clear the auth cookies
        deleteCookie(event, 'google_oauth_state', cookieOptions)
        deleteCookie(event, 'google_code_verifier', cookieOptions)
        if (isNative) deleteCookie(event, 'oauth_from_native', cookieOptions)

        const google = getGoogleOAuth()

        // Exchange code for tokens (Arctic v3 requires PKCE code verifier)
        const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier)

        // Fetch user info from Google
        const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`
            }
        })

        if (!userResponse.ok) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to fetch Google user info'
            })
        }

        const googleUser = await userResponse.json() as GoogleUserResponse

        if (!googleUser.email_verified) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Google email not verified'
            })
        }

        const oauthInfo: OAuthUserInfo = {
            provider: 'google',
            providerId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            picture: googleUser.picture
        }

        // Find or create user
        const user = await findOrCreateOAuthUser(oauthInfo)

        const payload = {
            id: user.id,
            role: user.role || 'user',
            name: user.first_name || user.username,
        }

        createSession(event, payload, 'google')

        if (isNative) {
            const { secret } = requireSecrets({ needPasscode: false })
            const exp = Date.now() + 5 * 60 * 1000 // 5 minutes validity
            const token = sign({ ...payload, exp }, secret)
            return sendRedirect(event, `${nativeBase}?authComplete=1&token=${encodeURIComponent(token)}`)
        }

        // Redirect to app
        return sendRedirect(event, `${redirectUrl}/`)

    } catch (error: any) {
        console.error('[auth/google/callback] OAuth error:', error)

        if (error instanceof OAuth2RequestError) {
            throw createError({
                statusCode: 400,
                statusMessage: `Google OAuth error: ${error.message}`
            })
        }

        if (error?.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: `OAuth callback failed: ${error?.message || 'unknown error'}`
        })
    }
})
