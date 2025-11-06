import User from '@server/models/user'
import { ensureDbConnection } from '@server/utils/database'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const userData = await getUserFromEvent(event) as any
  if (!userData?.id)
    return { user: null }

  try {
    await ensureDbConnection()
    const U: any = User as any
    const user = await U.findById(userData.id)
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
