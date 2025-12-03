import crypto from 'node:crypto'
import User from '@server/models/user'
import { sendVerificationEmail } from '@server/utils/sendVerificationEmail'
import { createError, readBody, sendError } from 'h3'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const body = await readBody(event)
  const { email } = body
  if (!email) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email is required.' }))
  }
  const U: any = User as any
  const user = await U.findOne({ email })
  if (!user) {
    return sendError(event, createError({ statusCode: 404, statusMessage: 'User not found.' }))
  }
  if (user.verified) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'User already verified.' }))
  }
  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60)
  user.verificationToken = verificationToken
  user.verificationTokenExpires = verificationTokenExpires
  await user.save()
  await sendVerificationEmail(email, verificationToken)
  return { message: 'Verification email resent.' }
})
