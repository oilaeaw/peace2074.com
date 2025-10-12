import { defineEventHandler, getHeader } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    // Derive callback URL dynamically from the current request
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/google/callback`
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
