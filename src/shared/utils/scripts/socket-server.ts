import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import { createRequire } from 'node:module'
import process from 'node:process'

type ClientEventPayload = unknown

type ChatMessagePayload = {
  text?: unknown
  author?: unknown
} | null | undefined

type ChatAck = (response: {
  ok: boolean
  error?: string
}) => void

type DevSocket = {
  id: string
  emit: (event: string, payload?: unknown) => void
  on: (event: string, handler: (...args: any[]) => void) => void
}

type SocketServerInstance = {
  on: (event: 'connection', handler: (socket: DevSocket) => void) => void
  emit: (event: string, payload: unknown) => void
}

const require = createRequire(import.meta.url)
const { Server } = require('socket.io') as {
  Server: new (...args: any[]) => SocketServerInstance
}

const PORT = Number(process.env.SOCKET_PORT || 3100)

const server = http.createServer(
  (_req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Socket server running')
  }
)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket: DevSocket) => {
  console.log('socket connected', socket.id)

  try {
    socket.emit('server:id', socket.id)
  } catch {
    // ignore fire-and-forget emit failures
  }

  const interval = setInterval(() => {
    socket.emit('health', {
      timestamp: new Date().toISOString(),
      id: socket.id,
    })
  }, 10000)

  socket.on('client:event', (data: ClientEventPayload) => {
    console.log('client:event', data)
    socket.emit('server:ack', { received: true, data })
  })

  socket.on('chat:message', (payload: ChatMessagePayload, ack?: ChatAck) => {
    try {
      const normalized = {
        id: socket.id,
        text: String(payload?.text ?? ''),
        author: String(payload?.author ?? 'anonymous'),
        ts: new Date().toISOString(),
      }

      io.emit('chat:message', normalized)
      if (typeof ack === 'function') {
        ack({ ok: true })
      }
    } catch (error) {
      if (typeof ack === 'function') {
        ack({
          ok: false,
          error: error instanceof Error ? error.message : 'error',
        })
      }
    }
  })

  socket.on('disconnect', (reason: string) => {
    console.log('socket disconnected', socket.id, reason)
    clearInterval(interval)
  })
})

server.listen(PORT, () => {
  console.log(`Socket IO server listening on http://localhost:${PORT}`)
})