import Tasbeeh from '@server/models/tasbeeh'
import { ensureDbConnection } from '@server/utils/database'
import { readBody, createError } from 'h3'
import { requireUser } from '@server/utils/auth'

// Use a named constant export to avoid temporal dead zone issues in Nitro lazy evaluation
const handler = defineEventHandler(async (event) => {
  const body = await readBody(event)
  await ensureDbConnection()

  // Ensure the user is authenticated
  const user = await requireUser(event)
  const userId = (user as any)?.id

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

export default handler
