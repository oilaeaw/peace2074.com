import {
    createError,
    defineEventHandler,
    getQuery,
    getRequestHeader,
    sendRedirect,
    setCookie,
} from 'h3'
import { generateState } from 'arctic'
import {
    getAppleOAuth,
    getCanonicalOAuthStartUrl,
    getOAuthCookieOptions,
    setOAuthNoStoreHeaders,
} from '../../utils/oauth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)
    setOAuthNoStoreHeaders(event)

    try {
        const canonicalUrl = getCanonicalOAuthStartUrl(event, 'apple')
        if (canonicalUrl) {
            return sendRedirect(event, canonicalUrl)
        }

        const query = getQuery(event)
        const isNative = query.native === '1'

        const apple = getAppleOAuth()
        const state = generateState()

        // Apple form_post is a cross-site POST: SameSite=Lax cookies are NOT sent.
        // Must use SameSite=None;Secure so the state cookie is included when Apple POSTs back.
        const baseOpts = getOAuthCookieOptions(event)
        setCookie(event, 'apple_oauth_state', state, {
            ...baseOpts,
            sameSite: 'none',
            secure: true,
        })

        // Track native app requests so the callback can redirect to the custom URL scheme
        if (isNative) {
            setCookie(event, 'oauth_from_native', '1', {
                ...baseOpts,
                maxAge: 600,
                sameSite: 'none',
                secure: true,
            })
        }

        const url = await apple.createAuthorizationURL(state, ['name', 'email'])
        // Apple requires form_post when requesting name/email scopes.
        url.searchParams.set('response_mode', 'form_post')

        return sendRedirect(event, url.toString())
    } catch (error: any) {
        console.error('[auth/apple] OAuth initiation error:', error)

        const errorMessage = String(
            error?.message || error?.statusMessage || 'unknown'
        )
        const acceptHeader = String(getRequestHeader(event, 'accept') || '')

        if (
            /Apple OAuth not configured/i.test(errorMessage) &&
            acceptHeader.includes('text/html')
        ) {
            return sendRedirect(event, '/login?oauthError=apple-not-configured')
        }

        throw createError({
            statusCode: Number(error?.statusCode || 500),
            statusMessage: `Apple OAuth error: ${errorMessage}`,
        })
    }
})
