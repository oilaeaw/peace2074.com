import type { H3Event } from 'h3'
import { createError } from 'h3'
import { getServerSession } from '#auth'

export interface SessionUser {
	id?: string
	_id?: string
	username?: string | null
	name?: string | null
	email?: string | null
	role?: string | null
	image?: string | null
	[key: string]: any
}

export interface AuthSession {
	user?: SessionUser | null
	expires?: string
	[key: string]: any
}

/**
 * Returns the nuxt-auth session for a given event or null if no session exists.
 */
export async function getSessionFromEvent(event: H3Event): Promise<AuthSession | null> {
	const session = await getServerSession(event)
	return (session as any) ?? null
}

/**
 * Convenience wrapper to directly access the user from the current session.
 * Falls back to null when unauthenticated.
 */
export async function getUserFromEvent(event: H3Event): Promise<SessionUser | null> {
	const session = await getServerSession(event)
	return (session as any)?.user ?? null
}

/**
 * Ensures a user is present in the current request context, throwing 401 otherwise.
 */
export async function requireUser(event: H3Event): Promise<SessionUser> {
	const user = await getUserFromEvent(event)
	if (!user) {
		// Use h3's createError for consistent formatting and downstream handling
		throw createError({ statusCode: 401, statusMessage: 'Unauthorized', message: 'Unauthorized', data: { reason: 'Missing session user' } })
	}
	return user
}

