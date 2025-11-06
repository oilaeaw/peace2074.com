import crypto from 'node:crypto'
import User from '@server/models/user'
import OAuthLog from '@server/models/oauth-log'
import bcrypt from 'bcryptjs'
import { defineEventHandler, getHeader, getRequestURL, getQuery } from 'h3'
import { ensureDbConnection } from '@server/utils/database'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    // Capture and log the exact incoming callback URL for debugging purposes
    let capturedUrl = ''
    let capturedQuery: any = undefined
    try {
      const reqUrl = getRequestURL(event)
      capturedUrl = reqUrl.toString()
      capturedQuery = getQuery(event)
      console.debug('[auth/google/callback] incoming URL:', capturedUrl)
    }
    catch {}

    const cfg = useRuntimeConfig()
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (cfg.nodeEnv === 'production' ? 'https' : 'http')
    const derived = `${proto}://${host}/api/auth/google/callback`
    const callbackURL = cfg.googleCallbackUrl || derived
    try { console.debug('[auth/google/callback] computed callbackURL:', callbackURL, 'hostHeader:', host, 'protoHeader:', proto) } catch {}

    ;(passport as any).authenticate('google', { failureRedirect: '/', session: false, callbackURL, scope: ['openid', 'email', 'profile'] }, async (err: any, profile: any) => {
      if (err) {
        console.error('GOOGLE_PASSPORT_ERROR:', err)
        // Best-effort log persistence on error
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({
            provider: 'google',
            direction: 'callback',
            url: capturedUrl || derived,
            callbackURL,
            host,
            proto,
            query: capturedQuery,
            outcome: 'failure',
            error: String(err?.message || err),
          })
        }
        catch {}
        return reject(err)
      }
      if (!profile) {
        // Persist no-profile case
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({
            provider: 'google',
            direction: 'callback',
            url: capturedUrl || derived,
            callbackURL,
            host,
            proto,
            query: capturedQuery,
            outcome: 'failure',
            error: 'No profile returned from Google',
          })
        }
        catch {}
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())
      }

      // Ensure DB connection before any queries
      try {
        await ensureDbConnection()
      }
      catch (dbConnErr) {
        console.error('GOOGLE_CALLBACK_DB_CONNECT_ERROR:', dbConnErr)
        event.node.res.writeHead(302, { Location: '/auth/login?error=db_connect' }).end()
        return resolve(undefined)
      }

      const email: string | null = (profile.emails && profile.emails[0]?.value) || profile._json?.email || null
      const displayName: string = profile.displayName || profile._json?.name || ''
      const baseUsername: string = (displayName || (email ? email.split('@')[0] : '') || `google_${profile.id || profile._json?.sub || 'user'}`).toLowerCase().replace(/\s+/g, '_')

      let dbUser = null
      try {
        const U: any = User as any
        if (email) {
          dbUser = await U.findOne({ email })
        }
        if (!dbUser) {
          dbUser = await U.findOne({ username: baseUsername })
        }
        if (!dbUser) {
          const randomPassword = crypto.randomBytes(24).toString('hex')
          const hashed = await bcrypt.hash(randomPassword, 10)
          
          dbUser = await U.create({
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
      const issued = await issueAuthToken(event, payload)
      try { console.debug('[auth/google/callback] issued token result:', issued) } catch {}

      // Prefer an absolute redirect to the current origin to avoid host mismatches on some platforms
      try {
        const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
        const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
        const absoluteHome = `${proto}://${host}/`
        // Persist success log
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({
            provider: 'google',
            direction: 'callback',
            url: capturedUrl || derived,
            callbackURL,
            host,
            proto,
            query: capturedQuery,
            userId: dbUser?._id,
            profileId: profile?._json?.sub || profile?.id,
            email: dbUser?.email || email,
            outcome: 'success',
          })
        }
        catch {}
        sendRedirect(event, absoluteHome)
      }
      catch {
        if (event?.node?.res && typeof event.node.res.writeHead === 'function') {
          const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
          const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
          const absoluteHome = `${proto}://${host}/`
          event.node.res.writeHead(302, { Location: absoluteHome }).end()
        }
      }
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
