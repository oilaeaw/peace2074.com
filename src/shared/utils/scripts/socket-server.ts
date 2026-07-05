import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import process from 'node:process'
import { WebSocketServer, WebSocket } from 'ws'

// ─── Types ──────────────────────────────────────────────────────────────────

type MessageType =
  | 'chat:message'
  | 'client:event'
  | 'find:messages'
  | 'join:room'
  | 'server:id'
  | 'health'
  | 'server:ack'
  | 'history'
  | 'user-list'
  | 'user-joined'
  | 'user-left'

interface WsMessage {
  type: MessageType
  [key: string]: unknown
}

interface StoredMessage {
  id: string
  text: string
  author: string
  from: string
  room?: string
  to?: string
  ts: string
}

// ─── State ──────────────────────────────────────────────────────────────────

const PORT = Number(process.env.SOCKET_PORT || 3100)
const MAX_HISTORY = 200

const clients = new Map<string, WebSocket>()
const history: StoredMessage[] = []

let idCounter = 0
function makeId(): string {
  return `${Date.now().toString(36)}-${(++idCounter).toString(36)}`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function send(ws: WebSocket, payload: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload))
  }
}

function broadcast(payload: object, exclude?: WebSocket): void {
  const raw = JSON.stringify(payload)
  for (const [, client] of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(raw)
    }
  }
}

function broadcastAll(payload: object): void {
  const raw = JSON.stringify(payload)
  for (const [, client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw)
    }
  }
}

function broadcastUserList(): void {
  broadcastAll({ type: 'user-list', users: [...clients.keys()] })
}

// ─── Server ──────────────────────────────────────────────────────────────────

const server = http.createServer(
  (_req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('WebSocket server running')
  }
)

const wss = new WebSocketServer({ server })

wss.on('connection', (ws: WebSocket) => {
  const id = makeId()
  clients.set(id, ws)

  console.log(`[ws] connected  id=${id}  total=${clients.size}`)

  // Greet the client with its assigned ID
  send(ws, { type: 'server:id', id })

  // Broadcast updated user list to everyone
  broadcastUserList()

  // Notify others that a new user joined
  broadcast({ type: 'user-joined', id }, ws)

  // Health heartbeat every 10s
  const heartbeat = setInterval(() => {
    send(ws, {
      type: 'health',
      timestamp: new Date().toISOString(),
      id,
    })
  }, 10_000)

  ws.on('message', (raw: Buffer | string) => {
    let msg: WsMessage

    try {
      msg = JSON.parse(raw.toString()) as WsMessage
    } catch {
      send(ws, { type: 'server:ack', ok: false, error: 'Invalid JSON' })
      return
    }

    switch (msg.type) {
      // ── Generic client event ────────────────────────────────────────────
      case 'client:event': {
        console.log(`[ws] client:event from=${id}`, msg.data)
        send(ws, { type: 'server:ack', received: true, data: msg.data })
        break
      }

      // ── Chat broadcast / DM ─────────────────────────────────────────────
      case 'chat:message': {
        const stored: StoredMessage = {
          id: makeId(),
          text: typeof msg.text === 'string' ? msg.text : '',
          author: typeof msg.author === 'string' ? msg.author : 'anonymous',
          from: id,
          room: typeof msg.room === 'string' ? msg.room : undefined,
          to: typeof msg.to === 'string' ? msg.to : undefined,
          ts: new Date().toISOString(),
        }

        // Save to history
        history.push(stored)
        if (history.length > MAX_HISTORY) {
          history.splice(0, history.length - MAX_HISTORY)
        }

        const envelope = { type: 'chat:message' as const, ...stored }

        if (stored.to) {
          // Direct message — only to recipient (+ echo to sender)
          const recipientWs = clients.get(stored.to)
          if (recipientWs) send(recipientWs, envelope)
          send(ws, envelope)
        } else {
          // Broadcast to all
          broadcastAll(envelope)
        }
        break
      }

      // ── History request ──────────────────────────────────────────────────
      case 'find:messages': {
        send(ws, { type: 'history', messages: history.slice(-MAX_HISTORY) })
        break
      }

      // ── Room join (informational, stored client-side) ────────────────────
      case 'join:room': {
        const room = typeof msg.room === 'string' ? msg.room.trim() : ''
        if (room) {
          console.log(`[ws] ${id} joined room=${room}`)
          send(ws, { type: 'server:ack', received: true, room })
        }
        break
      }

      default:
        console.warn(`[ws] unknown message type="${msg.type}" from=${id}`)
    }
  })

  ws.on('close', () => {
    clearInterval(heartbeat)
    clients.delete(id)
    console.log(`[ws] disconnected id=${id}  total=${clients.size}`)

    // Notify remaining clients
    broadcast({ type: 'user-left', id })
    broadcastUserList()
  })

  ws.on('error', (err: Error) => {
    console.error(`[ws] error id=${id}`, err.message)
  })
})

server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`)
})