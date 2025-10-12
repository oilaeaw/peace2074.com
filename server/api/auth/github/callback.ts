import User from '@server/models/user'
import bcrypt from 'bcryptjs'
import { getHeader } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/github/callback`
    try {
      console.debug('[auth/github/callback] computed callbackURL:', callbackURL, 'hostHeader:', host, 'protoHeader:', proto)
    }
    catch {}

    passport.authenticate('github', { failureRedirect: '/', session: false, callbackURL }, async (err: any, profile: any) => {
      if (err)
        return reject(err)
      if (!profile) {
        // Use H3 redirect if possible
        try { sendRedirect(event, '/') }
        catch { /* fallback */ }
        return resolve(undefined)
      }

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

      const payload: any = {
        id: dbUser?._id?.toString() || profile.id,
        email: dbUser?.email || email,
        username: dbUser?.username || username,
        provider: 'github',
      }
      const { issueAuthToken } = await import('../../../utils/auth')
      await issueAuthToken(event, payload)
      try { sendRedirect(event, '/') }
      catch {
        // if sendRedirect isn't available or fails, try writing to node res
        if (event?.node?.res && typeof event.node.res.writeHead === 'function') {
          event.node.res.writeHead(302, { Location: '/' }).end()
        }
      }
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
