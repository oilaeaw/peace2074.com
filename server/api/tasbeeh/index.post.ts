import Tasbeeh from '@server/models/tasbeeh'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { getUserFromEvent } = await import('../../utils/auth')
  const userData = await getUserFromEvent(event)
  const userId = userData?.id

  if (!userId)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  // body may contain { date, total, sessions, session: { phraseIndex, count, target } }
  const { date, total, sessions, session } = body

  let doc = await Tasbeeh.findOne({ userId })
  if (!doc) {
    doc = await Tasbeeh.create({ userId, daily: [], sessions: [] })
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
