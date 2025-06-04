import { defineEventHandler } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('github', { failureRedirect: '/' }, (err: any, user: any) => {
      if (err)
        return reject(err)
      if (!user)
        return resolve(event.node.res.writeHead(302, { Location: '/' }).end())
      // Here you would set a session/cookie or JWT
      // For now, just redirect to home
      event.node.res.writeHead(302, { Location: '/' }).end()
      resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
