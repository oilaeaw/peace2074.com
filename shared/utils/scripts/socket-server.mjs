import http from 'node:http'
import process from 'node:process'
import { Server } from 'socket.io'

const PORT = process.env.SOCKET_PORT || 3001

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Socket server running')
})

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('socket connected', socket.id)

  try { socket.emit('server:id', socket.id) } catch {}

  // Emit a simple health ping every 10 seconds
  const interval = setInterval(() => {
    socket.emit('health', {
      timestamp: new Date().toISOString(),
      id: socket.id,
    })
  }, 10000)

  socket.on('client:event', (data) => {
    console.log('client:event', data)
    // Echo back as an acknowledgement
    socket.emit('server:ack', { received: true, data })
  })

  // Broadcast chat messages to all connected clients (dev parity with Nitro plugin)
  socket.on('chat:message', (payload, ack) => {
    try {
      const normalized = {
        id: socket.id,
        text: String(payload?.text ?? ''),
        author: String(payload?.author ?? 'anonymous'),
        ts: new Date().toISOString(),
      }
      io.emit('chat:message', normalized)
      if (typeof ack === 'function') ack({ ok: true })
    } catch (err) {
      if (typeof ack === 'function') ack({ ok: false, error: err?.message || 'error' })
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason)
    clearInterval(interval)
  })
})

server.listen(PORT, () => {
  console.log(`Socket IO server listening on http://localhost:${PORT}`)
})
