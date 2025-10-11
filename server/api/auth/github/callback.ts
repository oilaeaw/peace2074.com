import bcrypt from 'bcryptjs'
import { getHeader, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import User from '../../../models/user'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/github/callback`

    passport.authenticate('github', { failureRedirect: '/', session: false, callbackURL }, async (err: any, profile: any) => {
      if (err)
        return reject(err)
      if (!profile)
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())

      // Normalize GitHub profile
      const username: string = profile.username || profile._json?.login || `github_${profile.id}`
      const email: string | null = (profile.emails && profile.emails[0]?.value) || profile._json?.email || null

      // Find or create user
      let dbUser = null
      try {
        if (email)
          dbUser = await User.findOne({ email })
        if (!dbUser)
          dbUser = await User.findOne({ username })
        if (!dbUser) {
          const randomPassword = (await import('node:crypto')).randomBytes(24).toString('hex')
          const hashed = await bcrypt.hash(randomPassword, 10)
          dbUser = await User.create({
            email: email || undefined,
            username,
            password: hashed,
            role: 'user',
            verified: true,
          })
        }
      }
      catch {}

      const config = useRuntimeConfig()
      const payload: any = {
        id: dbUser?._id?.toString() || profile.id,
        email: dbUser?.email || email,
        username: dbUser?.username || username,
        provider: 'github',
      }
      const token = jwt.sign(payload, config.jwtSecret || 'changeme', { expiresIn: '7d' })
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
