import Tasbeeh from '@server/models/tasbeeh'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event)
  const userId = (userData as any)?.id

  if (!userId)
    return { message: 'Not authenticated', data: null }

  const T: any = Tasbeeh as any
  const doc = await T.findOne({ userId })
  if (!doc)
    return { message: 'No data', data: null }
  return { message: 'OK', data: doc }
})
