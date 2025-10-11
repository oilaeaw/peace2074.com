// eslint-disable-next-line import/no-duplicates
import express, { Router } from 'express'

const app = express()
const router = Router()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

export default {
  path: '/api',
  handler: router,
}
