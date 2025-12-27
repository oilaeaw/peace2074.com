import { defineEventHandler, setHeader } from 'h3'

import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
    const allowedOrigins = ['http://localhost:4000', 'https://peace2074.com', 'https://www.peace2074.com']
    const origin = event.node.req.headers.origin

    if (origin && allowedOrigins.includes(origin)) {
        setHeader(event, 'Access-Control-Allow-Origin', origin)
        setHeader(event, 'Access-Control-Allow-Credentials', 'true')
    }

    setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin')

    if (event.node.req.method === 'OPTIONS') {
        event.node.res.statusCode = 204 // No Content
        event.node.res.end()
    }
})
