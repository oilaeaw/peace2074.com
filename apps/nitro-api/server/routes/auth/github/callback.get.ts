import { createError, defineEventHandler, getQuery, sendRedirect } from 'h3'
import { createSession } from '../../../utils/auth'
import { findUserByUsername, addUser } from '../../../utils/users'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const code = query.code as string
    const state = query.state as string

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
        let user = await findUserByUsername(githubUser.login)

        if (!user) {
            // Create new user from GitHub profile
            user = {
                id: `github_${githubUser.id}`,
                username: githubUser.login,
                email: email || `${githubUser.login}@github.user`,
                password: randomBytes(32).toString('hex'), // Random password, won't be used
                role: 'user',
                first_name: githubUser.name?.split(' ')[0] || githubUser.login,
                last_name: githubUser.name?.split(' ').slice(1).join(' ') || '',
                avatar_url: githubUser.avatar_url,
                github_id: githubUser.id
            }
            await addUser(user)
        }

        // Create session
        const sessionUser = {
            id: user.id,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`.trim() || user.username
        }

        createSession(event, sessionUser)

        // Redirect to home
        return sendRedirect(event, '/')

    } catch (error: any) {
        console.error('GitHub OAuth error:', error)
        return sendRedirect(event, '/login?error=github_auth_error')
    }
})

function randomBytes(size: number): Buffer {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(size)
        crypto.getRandomValues(bytes)
        return Buffer.from(bytes)
    }
    return require('crypto').randomBytes(size)
}
