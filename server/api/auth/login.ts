import passport from 'passport'
import { defineEventHandler, H3Event, createError } from 'h3'
import type { UserT } from '@shared/types/index'

// Shape returned by our LocalStrategy's `done(null, user)`
type AuthUser = Pick<UserT, 'email' | 'username' | 'first_name' | 'last_name' | 'role'> & { id: string }

interface AuthInfo { message?: string }

export default defineEventHandler((event: H3Event) => {
  return new Promise((resolve, reject) => {
    // Ensure passport is initialized for this request
    // Note: we rely on stateless auth (JWT/nuxt-auth-utils). No passport session.
    const handler = passport.authenticate('local', { session: false }, async (err: Error | null, user: AuthUser | false, info: AuthInfo = {}) => {
      if (err)
        return reject(createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: err }))
      if (!user)
        return reject(createError({ statusCode: 401, statusMessage: info.message || 'Invalid credentials' }))

      try {
        // Issue httpOnly auth cookie via utils (nuxt-auth-utils session or JWT fallback)
        const { issueAuthToken } = await import('../../utils/auth')
        await issueAuthToken(event, { id: user.id, email: user.email, username: user.username, role: user.role })

        return resolve({
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            role: user.role,
          },
        })
      }
      catch (e) {
        return reject(createError({ statusCode: 500, statusMessage: 'Failed to issue session', data: e }))
      }
    })

    handler(event.node.req, event.node.res)
  })
})
