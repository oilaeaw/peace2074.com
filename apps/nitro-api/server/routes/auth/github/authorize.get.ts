import { createError, defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const clientId = process.env.GITHUB_CLIENT_ID || (config as any).githubClientId

    if (!clientId) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GitHub OAuth not configured - missing GITHUB_CLIENT_ID'
        })
    }

    // Get the origin for callback URL
    const origin = process.env.NODE_ENV === 'production'
        ? 'https://peace2074.com'
        : 'http://localhost:3000'

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${origin}/auth/github/callback`,
        scope: 'read:user user:email',
        state: randomBytes(16).toString('hex') // CSRF protection
    })

    return sendRedirect(event, `https://github.com/login/oauth/authorize?${params}`)
})

function randomBytes(size: number): Buffer {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(size)
        crypto.getRandomValues(bytes)
        return Buffer.from(bytes)
    }
    return require('crypto').randomBytes(size)
}
