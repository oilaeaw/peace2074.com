import { defineEventHandler } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('github', { failureRedirect: '/' }, (err, user, info) => {
      if (err) {
        // Optionally log error
        return reject(err)
      }
      if (!user) {
        // If user is not authenticated, redirect to home
        event.node.res.writeHead(302, { Location: '/' }).end()
        return resolve(undefined)
      }
      // Here you would typically create a session or JWT for the user
      // For now, just redirect to home (or dashboard)
      event.node.res.writeHead(302, { Location: '/' }).end()
      resolve(undefined)
    })(event.node.req, event.node.res)
  })
})
