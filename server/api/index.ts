/// <reference path="../../types/express-shim.d.ts" />
 
import express, { Router } from 'express'

const app = express()
const router = Router()
router.use((req: any, res: any, next: any) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// IMPORTANT: Mount Express under a non-conflicting base path to avoid shadowing
// Nitro's file-based /api/* routes.
export default {
  path: '/_express',
  handler: router,
}
