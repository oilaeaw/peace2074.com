import { defineEventHandler } from 'h3'
import passport from 'passport'

export default defineEventHandler((event) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('github', { scope: ['user:email'] })(event.node.req, event.node.res, (err: any) => {
      if (err)
        return reject(err)
      resolve(undefined)
    })
  })
})
