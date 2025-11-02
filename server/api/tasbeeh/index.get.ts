import Tasbeeh from '@server/models/tasbeeh'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event)
  const userId = userData?.id

  if (!userId)
    return { message: 'Not authenticated', data: null }

  const doc = await Tasbeeh.findOne({ userId })
  if (!doc)
    return { message: 'No data', data: null }
  return { message: 'OK', data: doc }
})
