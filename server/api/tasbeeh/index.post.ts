import Tasbeeh from '@server/models/tasbeeh'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const body = await readBody(event)

  const auth = await import('../../utils/auth')
  const { getUserFromEvent, getTokenFromEvent, verifyAuthToken } = auth
  let userData = await getUserFromEvent(event)
  let userId = (userData as any)?.id

  // Last-resort: if no user from session helpers, try verifying any raw token ourselves.
  if (!userId) {
    try {
      const token = getTokenFromEvent(event)
      if (token) {
        const verified = verifyAuthToken(token)
        if (verified && verified.id) {
          userData = verified
          userId = verified.id
        }
      }
    }
    catch (e) {
      // ignore
    }
  }

  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      try { console.debug('[tasbeeh] unauthenticated request to POST /api/tasbeeh — no userId from session or token') } catch {}
    }
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // body may contain { date, total, sessions, session: { phraseIndex, count, target } }
  const { date, total, sessions, session } = body

  const T: any = Tasbeeh as any
  let doc = await T.findOne({ userId })
  if (!doc) {
  doc = await T.create({ userId, daily: [], sessions: [] })
  }

  // Update daily record
  const today = date || new Date().toDateString()
  const dailyRec = doc.daily.find((d: any) => d.date === today)
  if (dailyRec) {
    dailyRec.total += total || 0
    dailyRec.sessions += sessions || (session ? 1 : 0)
  }
  else {
    doc.daily.push({ date: today, total: total || (session ? session.count || 0 : 0), sessions: sessions || (session ? 1 : 0) })
  }

  // Add session record if provided
  if (session) {
    doc.sessions.push({ phraseIndex: session.phraseIndex, count: session.count, target: session.target })
  }

  await doc.save()
  return { message: 'Saved', data: doc }
})
