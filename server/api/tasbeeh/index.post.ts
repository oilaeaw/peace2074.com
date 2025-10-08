import process from 'node:process'
import Tasbeeh from '@server/models/tasbeeh'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  let userId
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    userId = decoded.id || decoded.userId
  }
  catch (err) {
    console.error('JWT verify failed for /api/tasbeeh POST:', err)
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

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
