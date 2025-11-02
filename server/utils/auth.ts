import { getCookie, setCookie, getQuery, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

export function getTokenFromEvent(event: any) {
  try {
    // Prefer Authorization header if present: "Bearer <token>"
    const headers = (event && event.node && event.node.req && event.node.req.headers) || (event && event.req && event.req.headers)
    const authHeader = headers && (headers.authorization || headers.Authorization)
    if (typeof authHeader === 'string') {
      const m = authHeader.match(/Bearer\s+(.+)/i)
      if (m && m[1]) return m[1]
    }
  }
  catch (e) {
    // ignore and fallback to cookie
  }

  // Try h3 cookie helper first
  const cookieToken = getCookie(event, 'auth_token')
  if (cookieToken)
    return cookieToken

  // Fallback: try to parse raw Cookie header in case helper failed
  try {
    const headers = (event && event.node && event.node.req && event.node.req.headers) || (event && event.req && event.req.headers)
    const cookieHeader = headers && (headers.cookie || headers.Cookie)
    if (typeof cookieHeader === 'string') {
      const m = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/)
      if (m && m[1]) return decodeURIComponent(m[1])
    }
  }
  catch (e) {
    // ignore
  }

  // Final fallback: allow token via query parameter (useful for dev/testing) - check both 'token' and 'auth_token'
  try {
    const q = getQuery(event) as Record<string, any>
    if (q) {
      if (q.token) return q.token
      if (q.auth_token) return q.auth_token
    }
  }
  catch (e) {
    // ignore
  }

  return undefined
}

// Try to use nuxt-auth-utils session helpers when available. If not present,
// fall back to the legacy JWT cookie behavior.
export async function issueAuthToken(event: any, payload: Record<string, any>, opts?: { expiresIn?: string | number }) {
  // Prefer nuxt-auth-utils setUserSession when available
  try {
    const authUtils: any = await import('#auth-utils')
    if (authUtils?.setUserSession) {
      // Keep user data minimal to avoid large cookies
      await authUtils.setUserSession(event, {
        user: payload,
        loggedInAt: Date.now(),
      })
      try { console.debug('[auth] issued session via nuxt-auth-utils for user:', (payload && payload.id) || payload) } catch {}
      return { type: 'session' }
    }
  }
  catch {
    // ignore - fallback to JWT cookie
  }

  const cfg = useRuntimeConfig()
  const secret = cfg.jwtSecret || 'changeme'
  const expiresIn = opts?.expiresIn || '7d'
  const token = jwt.sign(payload as any, secret as any, { expiresIn: expiresIn as any } as any)
  const secure = cfg.nodeEnv === 'production'

  // In production, set cookie domain to top-level (e.g., .peace2074.com) to avoid apex/www mismatches
  let domain: string | undefined
  try {
    if (cfg.nodeEnv === 'production') {
      const host = (getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || '').toString().toLowerCase()
      // Strip port if present
      const hostNoPort = host.split(':')[0]
      // If host has at least two dots, set domain to the registrable domain with leading dot
      const parts = hostNoPort.split('.').filter(Boolean)
      if (parts.length >= 2) {
        domain = `.${parts.slice(-2).join('.')}`
      }
    }
  }
  catch {}

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    domain,
    maxAge: typeof expiresIn === 'number' ? expiresIn : 7 * 24 * 60 * 60,
  })
  try { console.debug('[auth] issued JWT cookie: auth_token (httpOnly), secure:', secure, 'path:/, maxAge:', typeof expiresIn === 'number' ? expiresIn : 7 * 24 * 60 * 60) } catch {}
  return { type: 'jwt', token }
}

export async function clearAuthToken(event: any) {
  try {
    const authUtils = await import('#auth-utils')
    if (authUtils?.clearUserSession) {
      await authUtils.clearUserSession(event)
      return
    }
  }
  catch {
    // fallback
  }

  const cfg = useRuntimeConfig()
  let domain: string | undefined
  try {
    if (cfg.nodeEnv === 'production') {
      const host = (getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || '').toString().toLowerCase()
      const hostNoPort = host.split(':')[0]
      const parts = hostNoPort.split('.').filter(Boolean)
      if (parts.length >= 2) {
        domain = `.${parts.slice(-2).join('.')}`
      }
    }
  }
  catch {}

  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: cfg.nodeEnv === 'production',
    path: '/',
    domain,
    maxAge: 0,
  })
}

export function verifyAuthToken(token: string | undefined | null) {
  if (!token)
    return null
  try {
    const cfg = useRuntimeConfig()
    const secret = cfg.jwtSecret || 'changeme'
    const decoded = jwt.verify(token, secret)
    return decoded as Record<string, any>
  }
  catch {
    return null
  }
}

export async function getUserFromEvent(event: any) {
  // Try nuxt-auth-utils getUserSession first
  try {
    const authUtils = await import('#auth-utils')
    if (authUtils?.getUserSession) {
      const session = await authUtils.getUserSession(event)
      if (session?.user)
        return session.user
    }
  }
  catch {
    // fallback to JWT cookie
  }

  const token = getTokenFromEvent(event)
  return verifyAuthToken(token)
}
