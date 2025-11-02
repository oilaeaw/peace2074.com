import { defineEventHandler, getHeader } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    // Prefer configured callback URL; fallback to deriving dynamically from the current request
    const cfg = useRuntimeConfig()
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (cfg.nodeEnv === 'production' ? 'https' : 'http')
    const derived = `${proto}://${host}/api/auth/google/callback`
    const callbackURL = cfg.googleCallbackUrl || derived
    try { console.debug('[auth/google] computed callbackURL:', callbackURL, 'hostHeader:', host, 'protoHeader:', proto) } catch {}

    passport.authenticate('google', {
      scope: ['openid', 'email', 'profile'],
      session: false,
      callbackURL,
    })(event.node.req, event.node.res, (err: any) => {
      if (err)
        return reject(err)
      resolve(undefined)
    })
  })
})
