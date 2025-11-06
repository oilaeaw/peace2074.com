import { defineEventHandler, getHeader } from 'h3'
import passport from 'passport'
import { ensureDbConnection } from '@server/utils/database'
import OAuthLog from '@server/models/oauth-log'

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

    ;(passport as any).authenticate('github', { scope: ['user:email'], callbackURL })(event.node.req, event.node.res, (err: any) => {
      if (err)
        return reject(err)
      // best-effort: record start of flow
      ;(async () => {
        try {
          await ensureDbConnection()
          const OLog = OAuthLog as any
          await OLog.create({
            provider: 'github',
            direction: 'start',
            url: `${proto}://${host}/api/auth/github`,
            callbackURL,
            host,
            proto,
            outcome: 'init',
          })
        }
        catch {}
      })()
      resolve(undefined)
    })
  })
})
