import { defineEventHandler, getHeader } from 'h3'
import { ensureDbConnection } from '@server/utils/database'
import OAuthLog from '@server/models/oauth-log'

// Exposes the exact Google OAuth authorization URL this server would redirect to
// for the current host/protocol, using configured client ID and callback derivation.
// Useful for debugging or capturing the link without initiating the redirect flow.
export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig()
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
  const proto = getHeader(event, 'x-forwarded-proto') || (cfg.nodeEnv === 'production' ? 'https' : 'http')
  const callbackURL = (cfg.googleCallbackUrl as string) || `${proto}://${host}/api/auth/google/callback`

  const clientId = cfg.googleClientId as string

  // Construct the Google OAuth 2.0 authorization URL
  const authBase = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || '',
    redirect_uri: callbackURL,
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
  })

  const url = `${authBase}?${params.toString()}`

  // Persist the constructed authorization URL for auditing/debugging
  ;(async () => {
    try {
      await ensureDbConnection()
      await OAuthLog.create({
        provider: 'google',
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
      try { console.warn('[auth/google/auth-url] failed to persist OAuthLog:', (e as any)?.message || e) } catch {}
    }
  })()

  return { url, callbackURL, clientId }
})
