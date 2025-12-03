import { defineEventHandler, getCookie, getHeader, createError, sendError } from 'h3'
import { getUserFromEvent } from '@server/utils/auth'

export default defineEventHandler(async (event) => {
  const { nodeEnv, session } = useRuntimeConfig()
  if (nodeEnv === 'production')
    return sendError(event, createError({ statusCode: 403, statusMessage: 'disabled in production' }))

  // Inspect incoming request environment
  const host = (getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || '') as string
  const proto = (getHeader(event, 'x-forwarded-proto') || getHeader(event, 'x-forwarded-protocol') || 'http') as string

  const authCookiePresent = Boolean(getCookie(event, 'auth_token'))
  const sessionCookiePresent = Boolean(getCookie(event, session?.name || 'nuxt-session'))

  const user = await getUserFromEvent(event).catch(() => null)

  const cookieCfg = (session && typeof session.cookie === 'object' ? (session.cookie as any) : {}) as Record<string, any>

  return {
    ok: true,
    env: {
      nodeEnv,
    },
    request: {
      host,
      protocol: proto,
    },
    cookies: {
      hasAuthToken: authCookiePresent,
      hasSessionCookie: sessionCookiePresent,
      sessionCookieName: session?.name || 'nuxt-session',
      sameSite: cookieCfg?.sameSite || 'lax',
      secure: typeof cookieCfg?.secure === 'boolean' ? cookieCfg.secure : (nodeEnv === 'production'),
      domain: cookieCfg?.domain || null,
    },
    user: user ? {
      id: (user as any).id || (user as any)._id || null,
      username: (user as any).username || null,
      email: (user as any).email || null,
      role: (user as any).role || null,
    } : null,
  }
})
