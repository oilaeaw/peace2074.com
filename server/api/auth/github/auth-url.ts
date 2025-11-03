import { defineEventHandler, getHeader } from 'h3'
import { ensureDbConnection } from '@server/utils/database'
import OAuthLog from '@server/models/oauth-log'

export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig()
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
  const proto = getHeader(event, 'x-forwarded-proto') || (cfg.nodeEnv === 'production' ? 'https' : 'http')
  const callbackURL = (cfg.githubCallbackUrl as string) || `${proto}://${host}/api/auth/github/callback`
  const clientId = cfg.githubClientId as string

  const authBase = 'https://github.com/login/oauth/authorize'
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: callbackURL,
    scope: 'user:email',
    allow_signup: 'true',
  })
  const url = `${authBase}?${params.toString()}`

  ;(async () => {
    try {
      await ensureDbConnection()
      await OAuthLog.create({
        provider: 'github',
        direction: 'auth-url',
        url,
        callbackURL,
        clientId,
        host,
        proto,
        outcome: 'init',
      })
    }
    catch (e) {
      try { console.warn('[auth/github/auth-url] failed to persist OAuthLog:', (e as any)?.message || e) } catch {}
    }
  })()

  return { url, callbackURL, clientId }
})
