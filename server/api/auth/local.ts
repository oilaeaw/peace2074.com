import { createError, defineEventHandler, readBody, sendError, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
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

      const { jwtSecret, nodeEnv } = useRuntimeConfig()
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret || 'changeme', { expiresIn: '7d' })
      setCookie(event, 'auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: nodeEnv === 'production',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })

      return resolve({ user })
    })(event.node.req, event.node.res)
  })
})
