import User from '@server/models/user'
import { ensureDbConnection } from '@server/utils/database'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userData = await getUserFromEvent(event)
  if (!userData?.id)
    return { user: null }

  try {
    await ensureDbConnection()
    const user = await User.findById(userData.id)
    if (!user)
      return { user: null }
    return { user: {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      role: user.role,
    } }
  }
  catch {
    return { user: null }
  }
})
