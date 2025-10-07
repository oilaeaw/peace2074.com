import { defineEventHandler } from 'h3'
import jwt from 'jsonwebtoken'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('github', { failureRedirect: '/' }, (err: any, user: any) => {
      if (err)
        return reject(err)
      if (!user)
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())
      // Here you would set a session/cookie or JWT
      const config = useRuntimeConfig()
      const token = jwt.sign({ id: user.id, username: user.username, provider: 'github' }, config.jwtSecret || 'dev_secret', { expiresIn: '7d' })
      setCookie(event, 'auth_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: useRuntimeConfig().nodeEnv === 'production',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
      event.node.res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax`)
      event.node.res.writeHead(302, { Location: '/' }).end()
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
