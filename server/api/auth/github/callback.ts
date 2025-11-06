import User from '@server/models/user'
import OAuthLog from '@server/models/oauth-log'
import { ensureDbConnection } from '@server/utils/database'
import bcrypt from 'bcryptjs'
import { getHeader, getRequestURL, getQuery } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/github/callback`
    const homeURL = `${proto}://${host}/`
    try {
      console.debug('[auth/github/callback] computed callbackURL:', callbackURL, 'hostHeader:', host, 'protoHeader:', proto)
    }
    catch {}

    let capturedUrl = ''
    let capturedQuery: any = undefined
    try {
      const reqUrl = getRequestURL(event)
      capturedUrl = reqUrl.toString()
      capturedQuery = getQuery(event)
    }
    catch {}

  ;(passport as any).authenticate('github', { failureRedirect: homeURL, session: false, callbackURL }, async (err: any, profile: any) => {
      if (err) {
        // persist failure
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({ provider: 'github', direction: 'callback', url: capturedUrl || callbackURL, callbackURL, host, proto, query: capturedQuery, outcome: 'failure', error: String(err?.message || err) })
        }
        catch {}
        return reject(err)
      }
      if (!profile) {
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({ provider: 'github', direction: 'callback', url: capturedUrl || callbackURL, callbackURL, host, proto, query: capturedQuery, outcome: 'failure', error: 'No profile returned from GitHub' })
        }
        catch {}
        // Use H3 redirect if possible
        try { sendRedirect(event, '/') }
        catch { /* fallback */ }
        return resolve(undefined)
      }

      // Normalize GitHub profile
      const username: string = profile.username || profile._json?.login || `github_${profile.id}`
      const email: string | null = (profile.emails && profile.emails[0]?.value) || profile._json?.email || null

      // Ensure DB connection then find or create user
      try { await ensureDbConnection() } catch (e) {
        try { return sendRedirect(event, '/auth/login?error=db_connect') } catch {}
        return resolve(undefined)
      }
      // Find or create user
      let dbUser: any = null
      try {
        const U: any = User as any
        if (email)
          dbUser = await U.findOne({ email })
        if (!dbUser)
          dbUser = await U.findOne({ username })
        if (!dbUser) {
          const randomPassword = (await import('node:crypto')).randomBytes(24).toString('hex')
          const hashed = await bcrypt.hash(randomPassword, 10)
          dbUser = await U.create({
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
  const issued = await issueAuthToken(event, payload)
      try { console.debug('[auth/github/callback] issued token result:', issued) } catch {}

      // First, attempt a proper server-side redirect to absolute home URL
      try {
        // persist success
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({ provider: 'github', direction: 'callback', url: capturedUrl || callbackURL, callbackURL, host, proto, query: capturedQuery, outcome: 'success', userId: dbUser?._id, profileId: profile?.id, email: dbUser?.email || email })
        }
        catch {}
        return sendRedirect(event, homeURL)
      }
      catch {
        // Fallback: write a minimal HTML page that forces the browser to navigate
        // to the site root via client-side script. This is robust for popup or
        // cross-site scenarios where Set-Cookie + redirect ordering might be off.
        try {
          if (event?.node?.res && typeof event.node.res.writeHead === 'function') {
            const body = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body><script>try{window.location.replace(${JSON.stringify(homeURL)})}catch(e){window.location.href=${JSON.stringify(homeURL)}}</script><noscript><a href="${homeURL}">Continue</a></noscript></body></html>`
            event.node.res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            event.node.res.end(body)
            return resolve(undefined)
          }
        }
        catch {}
      }
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
