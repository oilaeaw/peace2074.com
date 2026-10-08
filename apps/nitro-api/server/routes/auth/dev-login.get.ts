import { defineEventHandler, getQuery, getHeader, sendRedirect } from 'h3'
import { createSession } from '../../utils/auth'
import { findOrCreateOAuthUser } from '../../utils/users'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const query = getQuery(event)
        const email = (query.email as string) || 'wahbehw@gmail.com'
        const name = (query.name as string) || 'Wael'

        const rawProvider = (query.provider as string) || 'google'
        const provider = (rawProvider === 'apple' ? 'apple' : 'google') as 'google' | 'apple'

        const user = await findOrCreateOAuthUser({
            provider,
            providerId: `dev_${provider}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email,
            name,
        })

        const payload = {
            id: user.id,
            role: user.role || 'admin',
            name: user.first_name || user.username || name,
        }

        createSession(event, payload, provider)

        const accept = String(getHeader(event, 'accept') || '')
        const wantsJson =
            query.format === 'json' ||
            query.json === '1' ||
            accept.includes('application/json')

        if (wantsJson) {
            return {
                ok: true,
                user: payload,
            }
        }

        const rawRedirect = (query.redirect as string) || '/'
        let redirectPath = rawRedirect
        if (redirectPath.startsWith('http://') || redirectPath.startsWith('https://')) {
            try {
                const url = new URL(redirectPath)
                redirectPath = url.pathname + url.search + url.hash
            } catch {
                redirectPath = '/'
            }
        }
        if (!redirectPath.startsWith('/')) {
            redirectPath = '/' + redirectPath
        }

        return sendRedirect(event, redirectPath)
    } catch (error: any) {
        console.error('[auth/dev-login] Error:', error)
        return sendRedirect(event, '/login?error=dev-login-failed')
    }
})
