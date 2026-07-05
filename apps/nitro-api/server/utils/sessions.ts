import { getDb } from './realdb'

const SESSION_TTL_DAYS = 30

export interface UserSession {
    userId: string
    provider: 'password' | 'google' | 'apple' | 'github' | 'passkey' | 'otp' | 'magic'
    ip?: string | null
    user_agent?: string | null
    expires_at: string
}

/**
 * Record a login session for a user.
 * Fire-and-forget — never throws; failures are only logged.
 */
export async function recordSession(
    userId: string,
    provider: UserSession['provider'],
    meta?: { ip?: string; user_agent?: string }
): Promise<void> {
    try {
        const db = await getDb()
        const sessions = db.collection<UserSession>('sessions')
        const expires_at = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
        await sessions.insert({
            userId,
            provider,
            ip: meta?.ip ?? null,
            user_agent: meta?.user_agent ?? null,
            expires_at,
        })
    } catch (err) {
        console.error('[sessions] Failed to record session:', err)
    }
}
