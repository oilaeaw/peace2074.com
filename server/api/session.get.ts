import { defineEventHandler, useSession } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const session = await useSession(event, {
    password: config.session.password,
  })
  if (!session) {
    return { error: 'No session found' }
  }
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      first_name: session.user.first_name,
      last_name: session.user.last_name,
      role: session.user.role,
    },
    sessionId: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    isAuthenticated: session.isAuthenticated,
    isAdmin: session.user.role === 'admin',
    isUser: session.user.role === 'user',
    isGuest: session.user.role === 'guest',
  }
})
