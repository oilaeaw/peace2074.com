import crypto from 'node:crypto'
import { H3Event, createError, deleteCookie, getCookie, setCookie } from 'h3'

const COOKIE_NAME = 'waelio_session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

type SessionPayload = {
    id: string
    role: string
    name: string
    exp: number
}

function getSecrets() {
    const config = useRuntimeConfig()
    const passcode = (config as any).authPasscode || process.env.AUTH_PASSCODE || ''
    const secret = (config as any).authSecret || process.env.AUTH_SECRET || ''
    return { passcode, secret }
}

function sign(payload: SessionPayload, secret: string) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
    return `${body}.${sig}`
}

function verify(token: string, secret: string): SessionPayload | null {
    const [body, sig] = token.split('.')
    if (!body || !sig) return null
    const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
        if (payload.exp && Date.now() > payload.exp) return null
        return payload
    } catch {
        return null
    }
}

export function requireSecrets() {
    const { passcode, secret } = getSecrets()
    if (!passcode || !secret) {
        throw createError({ statusCode: 500, statusMessage: 'Auth not configured' })
    }
    return { passcode, secret }
}

export function createSession(event: H3Event, payload: Omit<SessionPayload, 'exp'>) {
    const { secret } = requireSecrets()
    const exp = Date.now() + COOKIE_MAX_AGE * 1000
    const token = sign({ ...payload, exp }, secret)
    setCookie(event, COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    })
    return token
}

export function clearSession(event: H3Event) {
    deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function readSession(event: H3Event): SessionPayload | null {
    const { secret } = getSecrets()
    if (!secret) return null
    const token = getCookie(event, COOKIE_NAME)
    if (!token) return null
    return verify(token, secret)
}