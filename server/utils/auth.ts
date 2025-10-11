import { getCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

export function getTokenFromEvent(event: any) {
  return getCookie(event, 'auth_token')
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
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: typeof expiresIn === 'number' ? expiresIn : 7 * 24 * 60 * 60,
  })
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

  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: useRuntimeConfig().nodeEnv === 'production',
    path: '/',
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
