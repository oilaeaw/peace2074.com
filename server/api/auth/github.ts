import { defineEventHandler, getHeader } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
    const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
    const callbackURL = `${proto}://${host}/api/auth/github/callback`
    // Debug: log chosen callback URL and headers to help diagnose OAuth app mismatch
    try {
      console.debug('[auth/github] computed callbackURL:', callbackURL, 'hostHeader:', host, 'protoHeader:', proto)
    }
    catch {}

    passport.authenticate('github', { scope: ['user:email'], callbackURL })(event.node.req, event.node.res, (err: any) => {
      if (err)
        return reject(err)
      resolve(undefined)
    })
  })
})
