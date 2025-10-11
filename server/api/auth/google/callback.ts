import crypto from 'node:crypto'
import User from '@server/models/user'
import bcrypt from 'bcryptjs'
import { defineEventHandler, getHeader } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/google/callback`

    passport.authenticate('google', { failureRedirect: '/', session: false, callbackURL, scope: ['openid', 'email', 'profile'] }, async (err: any, profile: any) => {
      if (err) {
        console.error('GOOGLE_PASSPORT_ERROR:', err)
        return reject(err)
      }
      if (!profile) {
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())
      }

      const email: string | null = (profile.emails && profile.emails[0]?.value) || profile._json?.email || null
      const displayName: string = profile.displayName || profile._json?.name || ''
      const baseUsername: string = (displayName || (email ? email.split('@')[0] : '') || `google_${profile.id || profile._json?.sub || 'user'}`).toLowerCase().replace(/\s+/g, '_')

      let dbUser = null
      try {
        if (email) {
          dbUser = await User.findOne({ email })
        }
        if (!dbUser) {
          dbUser = await User.findOne({ username: baseUsername })
        }
        if (!dbUser) {
          const randomPassword = crypto.randomBytes(24).toString('hex')
          const hashed = await bcrypt.hash(randomPassword, 10)
          dbUser = await User.create({
            email: email || undefined,
            username: baseUsername,
            password: hashed,
            first_name: displayName?.split(' ')?.[0] || undefined,
            last_name: displayName?.split(' ')?.slice(1)?.join(' ') || undefined,
            role: 'user',
            verified: true,
          })
        }
      }
      catch (dbError) {
        console.error('GOOGLE_CALLBACK_DB_ERROR:', dbError)
        // If DB fails, redirect to a login failure page
        event.node.res.writeHead(302, { Location: '/auth/login?error=db_error' }).end()
        return resolve(undefined)
      }

      const payload: any = {
        id: dbUser?._id?.toString() || profile._json?.sub || profile.id,
        email: dbUser?.email || email,
        username: dbUser?.username || baseUsername,
        provider: 'google',
      }
      const { issueAuthToken } = await import('../../../utils/auth')
      await issueAuthToken(event, payload)
      try { sendRedirect(event, '/') }
      catch {
        if (event?.node?.res && typeof event.node.res.writeHead === 'function') {
          event.node.res.writeHead(302, { Location: '/' }).end()
        }
      }
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
