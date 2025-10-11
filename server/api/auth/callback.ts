import { defineEventHandler } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('github', { failureRedirect: '/' }, async (err: any, user: any) => {
      if (err)
        return reject(err)
      if (!user)
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())
      // Use centralized helper to issue session cookie
      const { issueAuthToken } = await import('../../utils/auth')
      await issueAuthToken(event, { id: user.id, username: user.username, provider: 'github' })
      event.node.res.writeHead(302, { Location: '/' }).end()
      return resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
