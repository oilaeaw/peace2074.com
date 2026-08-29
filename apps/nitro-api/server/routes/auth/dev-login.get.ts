import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { createSession } from '../../utils/auth'
import { findOrCreateOAuthUser } from '../../utils/users'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)

    try {
        const query = getQuery(event)
        const email = (query.email as string) || 'wahbehw@gmail.com'
        const name = (query.name as string) || 'Wael'
        const redirectUrl = process.env.PUBLIC_URL || 'http://localhost:8080'

        const user = await findOrCreateOAuthUser({
            provider: 'google',
            providerId: `dev_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email,
            name,
        })

        const payload = {
            id: user.id,
            role: user.role || 'admin',
            name: user.first_name || user.username || name,
        }

        createSession(event, payload, 'google')

        return sendRedirect(event, `${redirectUrl}/quran/1`)
    } catch (error: any) {
        console.error('[auth/dev-login] Error:', error)
        return sendRedirect(event, '/login?error=dev-login-failed')
    }
})
