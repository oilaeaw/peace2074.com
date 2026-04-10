import { defineEventHandler, getQuery, getCookie, deleteCookie, sendRedirect, createError } from 'h3'
import { OAuth2RequestError, decodeIdToken } from 'arctic'
import { getAppleOAuth, type OAuthUserInfo } from '../../../utils/oauth'
import { createSession } from '../../../utils/auth'
import { findOrCreateOAuthUser } from '../../../utils/users'
import { applyCors } from '../../../utils/cors'

interface AppleIdTokenClaims {
    sub: string
    email: string
    email_verified: boolean | string
}

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const query = getQuery(event)
        const code = query.code as string
        const state = query.state as string

        const storedState = getCookie(event, 'apple_oauth_state')

        // Validate state for CSRF protection
        if (!code || !state || !storedState || state !== storedState) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid OAuth state'
            })
        }

        // Clear the state cookie
        deleteCookie(event, 'apple_oauth_state')

        const apple = getAppleOAuth()

        // Exchange code for tokens
        const tokens = await apple.validateAuthorizationCode(code)

        // Decode ID token to get user info
        const idTokenClaims = decodeIdToken(tokens.idToken) as AppleIdTokenClaims

        if (!idTokenClaims.email_verified || idTokenClaims.email_verified === 'false') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Apple email not verified'
            })
        }

        // Apple doesn't provide name in ID token consistently
        // We'll use email username as fallback
        const emailUsername = idTokenClaims.email.split('@')[0]

        const oauthInfo: OAuthUserInfo = {
            provider: 'apple',
            providerId: idTokenClaims.sub,
            email: idTokenClaims.email,
            name: emailUsername
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
        console.error('[auth/apple/callback] OAuth error:', error)

        if (error instanceof OAuth2RequestError) {
            throw createError({
                statusCode: 400,
                statusMessage: `Apple OAuth error: ${error.message}`
            })
        }

        if (error?.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: `OAuth callback failed: ${error?.message || 'unknown error'}`
        })
    }
})
