import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // This handler catches /api/auth/callback and redirects to home or shows a helpful message
  if (event.node.req.url?.startsWith('/api/auth/callback')) {
    event.node.res.writeHead(302, { Location: '/' }).end()
    return
  }

  return 'Hello Nitro'
})
