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
    user?: string | AppleUserPayload
}

interface AppleUserPayload {
    email?: string
    name?: {
        firstName?: string
        lastName?: string
    }
}

interface AppleIdTokenClaims {
    sub: string
    email: string
    email_verified: boolean | string
}

function parseAppleUserPayload(value?: string | AppleUserPayload) {
    if (!value) return null

    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as AppleUserPayload
        } catch {
            return null
        }
    }

    return value
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
        const isNative = getCookie(event, 'oauth_from_native') === '1'
        const nativeBase = 'peace2074://auth/callback'

        // Validate state for CSRF protection
        if (!code || !state || !storedState || state !== storedState) {
            console.warn('[auth/apple/callback:post] Invalid OAuth state', {
                hasCode: Boolean(code),
                hasState: Boolean(state),
                hasStoredState: Boolean(storedState),
                stateMatches: Boolean(state && storedState && state === storedState),
            })

            return sendRedirect(event, isNative
                ? `${nativeBase}?oauthError=apple-state-invalid`
                : `${redirectUrl}/login?oauthError=apple-state-invalid`)
        }

        // Clear the state cookie
        deleteCookie(event, 'apple_oauth_state', cookieOptions)
        if (isNative) deleteCookie(event, 'oauth_from_native', cookieOptions)

        const apple = getAppleOAuth()

        // Exchange code for tokens
        const tokens = await apple.validateAuthorizationCode(code)

        // Decode ID token to get user info
        const idTokenClaims = decodeIdToken(tokens.idToken()) as AppleIdTokenClaims

        if (!idTokenClaims.email_verified || idTokenClaims.email_verified === 'false') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Apple email not verified',
            })
        }

        const postedUser = parseAppleUserPayload(body.user)
        const postedFirstName = String(postedUser?.name?.firstName || '').trim() || undefined
        const postedLastName = String(postedUser?.name?.lastName || '').trim() || undefined

        // Apple doesn't provide name in the ID token consistently.
        // The posted `user` payload is only present on first consent, so keep the email fallback too.
        const emailUsername = idTokenClaims.email.split('@')[0]
        const resolvedName = [postedFirstName, postedLastName].filter(Boolean).join(' ').trim() || emailUsername

        const oauthInfo: OAuthUserInfo = {
            provider: 'apple',
            providerId: idTokenClaims.sub,
            email: idTokenClaims.email,
            name: resolvedName,
            firstName: postedFirstName,
            lastName: postedLastName,
        }

        // Find or create user
        const user = await findOrCreateOAuthUser(oauthInfo)

        // Create session
        createSession(event, {
            id: user.id,
            role: user.role || 'user',
            name: user.first_name || user.username,
        }, 'apple')

        // Redirect to app (native gets a deep link; web gets the normal URL)
        return sendRedirect(event, isNative ? `${nativeBase}?authComplete=1` : `${redirectUrl}/`)
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
