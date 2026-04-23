import { connectMongoose } from './mongoose'
import { UserSessionModel } from '../models/UserSession'

const SESSION_TTL_DAYS = 30

/**
 * Record a login session for a user in MongoDB.
 * Fire-and-forget — never throws; failures are only logged.
 */
export async function recordSession(
    userId: string,
    provider: 'password' | 'google' | 'apple' | 'github' | 'passkey' | 'otp' | 'magic',
    meta?: { ip?: string; user_agent?: string }
): Promise<void> {
    try {
        await connectMongoose()
        const expires_at = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
        await UserSessionModel.create({
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
