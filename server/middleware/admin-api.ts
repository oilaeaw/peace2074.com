import { getToken } from '#auth'
import { defineAbilitiesFor } from '@server/utils/abilities'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only apply this middleware to routes starting with /api/admin/
  if (url.pathname.startsWith('/api/admin')) {
    const token = await getToken({ event }) as any
    const ability = defineAbilitiesFor(token)

    // If the user does not have the ability to 'manage' 'all', throw a 403 Forbidden error.
    if (!ability.can('manage', 'all')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admins only.',
      })
    }
  }
})