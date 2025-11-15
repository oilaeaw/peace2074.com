import { getServerSession } from '#auth'
import User from '@server/models/user'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const userId = (session.user as any).id

  // Update the user in the database
  const updatedUser = await User.findByIdAndUpdate(userId, {
    first_name: body.first_name,
    last_name: body.last_name,
  }, { new: true }).lean()

  return { status: 'ok', user: updatedUser }
})
