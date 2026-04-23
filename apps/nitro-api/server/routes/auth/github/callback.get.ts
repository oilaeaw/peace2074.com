import { createError, defineEventHandler, getQuery, sendRedirect } from 'h3'
import { createSession } from '../../../utils/auth'
import { findOrCreateOAuthUser } from '../../../utils/users'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const code = query.code as string

    if (!code) {
        return sendRedirect(event, '/login?error=github_auth_failed')
    }

    const config = useRuntimeConfig()
    const clientId = process.env.GITHUB_CLIENT_ID || (config as any).githubClientId
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || (config as any).githubClientSecret

    if (!clientId || !clientSecret) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GitHub OAuth not configured'
        })
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: process.env.NODE_ENV === 'production'
                    ? 'https://peace2074.com/auth/github/callback'
                    : 'http://localhost:3000/auth/github/callback'
            })
        })

        const tokenData = await tokenResponse.json()

        if (!tokenData.access_token) {
            return sendRedirect(event, '/login?error=github_token_failed')
        }

        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json'
            }
        })

        const githubUser = await userResponse.json()

        // Get user email if not public
        let email = githubUser.email
        if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Accept': 'application/json'
                }
            })
            const emails = await emailResponse.json()
            email = emails.find((e: any) => e.primary)?.email || emails[0]?.email
        }

        // Find or create user
        const user = await findOrCreateOAuthUser({
            provider: 'github',
            providerId: String(githubUser.id),
            email: email || `${githubUser.login}@github.user`,
            name: githubUser.name || githubUser.login,
            firstName: githubUser.name?.split(' ')[0] || githubUser.login,
            lastName: githubUser.name?.split(' ').slice(1).join(' ') || undefined,
            picture: githubUser.avatar_url,
        })

        // Create session
        const sessionUser = {
            id: user.id,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`.trim() || user.username
        }

        createSession(event, sessionUser, 'github')

        // Redirect to home
        return sendRedirect(event, '/')

    } catch (error: any) {
        console.error('GitHub OAuth error:', error)
        return sendRedirect(event, '/login?error=github_auth_error')
    }
})
