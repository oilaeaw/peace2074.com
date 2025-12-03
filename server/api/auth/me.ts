import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session) {
    return { user: null }
  }

  // The session object already contains the user data you need.
  return { user: session.user }
})
