import { defineEventHandler, getQuery, getCookie, deleteCookie, sendRedirect, createError } from 'h3'
import { OAuth2RequestError } from 'arctic'
import { getGoogleOAuth, type OAuthUserInfo } from '../../../utils/oauth'
import { createSession } from '../../../utils/auth'
import { findUserByEmail, findOrCreateOAuthUser } from '../../../utils/users'
import { applyCors } from '../../../utils/cors'

interface GoogleUserResponse {
    sub: string
    name: string
    email: string
    email_verified: boolean
    picture?: string
}

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const query = getQuery(event)
        const code = query.code as string
        const state = query.state as string

        const storedState = getCookie(event, 'google_oauth_state')
        const storedCodeVerifier = getCookie(event, 'google_code_verifier')

        // Validate state for CSRF protection
        if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid OAuth state'
            })
        }

        // Clear the auth cookies
        deleteCookie(event, 'google_oauth_state')
        deleteCookie(event, 'google_code_verifier')

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
            picture: googleUser.picture
        }

        // Find or create user
        const user = await findOrCreateOAuthUser(oauthInfo)

        // Create session
        createSession(event, {
            id: user.id,
            role: user.role || 'user',
            name: user.first_name || user.username
        })

        // Redirect to app
        const redirectUrl = process.env.PUBLIC_URL || 'https://peace2074.com'
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
