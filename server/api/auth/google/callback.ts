import { defineEventHandler, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('google', { failureRedirect: '/' }, (err: any, user: any) => {
      if (err)
        return reject(err)
      if (!user)
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())

      const config = useRuntimeConfig()
      const token = jwt.sign({ id: user.id || user._json?.sub, username: user.displayName || user.username, provider: 'google' }, config.jwtSecret || 'dev_secret', { expiresIn: '7d' })
      setCookie(event, 'auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: useRuntimeConfig().nodeEnv === 'production',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
      event.node.res.writeHead(302, { Location: '/' }).end()
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
