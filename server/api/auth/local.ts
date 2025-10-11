import { createError, defineEventHandler, readBody, sendError } from 'h3'
import passport from 'passport'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body || {}
  if (!identifier || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Username/email and password are required.' }))
  }

  return await new Promise((resolve) => {
    // Attach parsed body onto req so passport-local can read fields
    ;(event.node.req as any).body = body
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err)
        return resolve(sendError(event, createError({ statusCode: 500, statusMessage: 'Authentication error' })))
      if (!user)
        return resolve(sendError(event, createError({ statusCode: 401, statusMessage: info?.message || 'Invalid credentials' })))

      const { issueAuthToken } = await import('../../utils/auth')
      issueAuthToken(event, { id: user.id, email: user.email })
      return resolve({ user })
    })(event.node.req, event.node.res)
  })
})
