import passport from 'passport'
import { defineEventHandler, H3Event, createError } from 'h3'
import type { UserT } from '@shared/types/index'

// Define a type for the info object passed by Passport on failure
interface AuthInfo {
  message: string
}

export default defineEventHandler((event: H3Event) => {
  return new Promise((resolve, reject) => {
    // The 'local' strategy is defined in `server/plugins/passport.ts`.
    // Passport will handle the entire authentication flow.
    passport.authenticate('local', (err: Error | null, user: UserT | false, info: AuthInfo) => {
      if (err) {
        // Handle framework-level errors.
        return reject(createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: err }))
      }
      if (!user) {
        // Handle authentication failures (e.g., "Invalid credentials").
        return reject(createError({ statusCode: 401, statusMessage: info?.message || 'Invalid credentials' }))
      }

      // The `req.logIn` method is added by Passport. It establishes a session.
      event.node.req.logIn(user, (loginErr: Error | null) => {
        if (loginErr) {
          return reject(createError({ statusCode: 500, statusMessage: 'Error establishing session', data: loginErr }))
        }

        // On successful login, return the user data.
        resolve({
          user: {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            role: user.role,
          },
        })
      })
    })(event.node.req, event.node.res)
  })
})
