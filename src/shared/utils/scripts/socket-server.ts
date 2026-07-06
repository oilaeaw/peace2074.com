/**
 * WebSocket chat server — zero external dependencies, Node 22+ built-ins only.
 *
 * Start:  node --experimental-strip-types --env-file=.env src/shared/utils/scripts/socket-server.ts
 * Or via: pnpm dev:ws
 *
 * Env vars:
 *   SOCKET_PORT  — default 3100
 */

import http, { type IncomingMessage, type ServerResponse } from 'node:http'
import process from 'node:process'
import crypto from 'node:crypto'

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

// ─── Minimal WebSocket frame encoder/decoder ─────────────────────────────────
// Implements RFC 6455 — enough for text frames used by the chat.

type FrameOpcode = 0x1 | 0x8 | 0x9 | 0xa // text, close, ping, pong

function encodeFrame(data: string, opcode: FrameOpcode = 0x1): Buffer {
  const payload = Buffer.from(data, 'utf8')
  const len = payload.length
  let header: Buffer
  if (len < 126) {
    header = Buffer.alloc(2)
    header[0] = 0x80 | opcode
    header[1] = len
  } else if (len < 65536) {
    header = Buffer.alloc(4)
    header[0] = 0x80 | opcode
    header[1] = 126
    header.writeUInt16BE(len, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x80 | opcode
    header[1] = 127
    header.writeBigUInt64BE(BigInt(len), 2)
  }
  return Buffer.concat([header, payload])
}

function decodeFrame(buf: Buffer): { opcode: number; payload: Buffer; complete: boolean } | null {
  if (buf.length < 2) return null
  const fin = (buf[0] & 0x80) !== 0
  const opcode = buf[0] & 0x0f
  const masked = (buf[1] & 0x80) !== 0
  let payloadLen = buf[1] & 0x7f
  let offset = 2

  if (payloadLen === 126) {
    if (buf.length < 4) return null
    payloadLen = buf.readUInt16BE(2)
    offset = 4
  } else if (payloadLen === 127) {
    if (buf.length < 10) return null
    payloadLen = Number(buf.readBigUInt64BE(2))
    offset = 10
  }

  if (masked) {
    if (buf.length < offset + 4 + payloadLen) return null
    const mask = buf.slice(offset, offset + 4)
    offset += 4
    const payload = Buffer.allocUnsafe(payloadLen)
    for (let i = 0; i < payloadLen; i++) {
      payload[i] = buf[offset + i] ^ mask[i % 4]
    }
    return { opcode, payload, complete: fin }
  }

  if (buf.length < offset + payloadLen) return null
  return { opcode, payload: buf.slice(offset, offset + payloadLen), complete: fin }
}

function wsHandshake(req: IncomingMessage): string {
  const key = req.headers['sec-websocket-key'] as string
  return crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64')
}

// ─── State ──────────────────────────────────────────────────────────────────

const PORT = Number(process.env.SOCKET_PORT || 3100)
const MAX_HISTORY = 200

interface ClientSocket {
  id: string
  write: (data: Buffer) => void
  close: () => void
}

const clients = new Map<string, ClientSocket>()
const history: StoredMessage[] = []

let idCounter = 0
function makeId(): string {
  return `${Date.now().toString(36)}-${(++idCounter).toString(36)}`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendToClient(client: ClientSocket, payload: object): void {
  try {
    client.write(encodeFrame(JSON.stringify(payload)))
  } catch {
    // ignore closed socket errors
  }
}

function broadcast(payload: object, excludeId?: string): void {
  const frame = encodeFrame(JSON.stringify(payload))
  for (const [id, client] of clients) {
    if (id !== excludeId) {
      try { client.write(frame) } catch { /* ignore */ }
    }
  }
}

function broadcastAll(payload: object): void {
  broadcast(payload)
}

function broadcastUserList(): void {
  broadcastAll({ type: 'user-list', users: [...clients.keys()] })
}

// ─── Connection handler ───────────────────────────────────────────────────────

function handleConnection(req: IncomingMessage, socket: import('node:net').Socket): void {
  const id = makeId()
  let buffer = Buffer.alloc(0)

  // Complete WebSocket handshake
  const acceptKey = wsHandshake(req)
  socket.write(
    `HTTP/1.1 101 Switching Protocols\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  )

  const client: ClientSocket = {
    id,
    write: (data: Buffer) => socket.write(data),
    close: () => socket.destroy(),
  }
  clients.set(id, client)

  console.log(`[ws] connected  id=${id}  total=${clients.size}`)

  // Greet client with its ID
  sendToClient(client, { type: 'server:id', id })
  broadcastUserList()
  broadcast({ type: 'user-joined', id }, id)

  // Heartbeat every 10s
  const heartbeat = setInterval(() => {
    sendToClient(client, { type: 'health', timestamp: new Date().toISOString(), id })
  }, 10_000)

  socket.on('data', (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk])
    while (buffer.length > 0) {
      const frame = decodeFrame(buffer)
      if (!frame) break

      // Advance buffer past this frame
      const payloadLen = frame.payload.length
      let headerSize = 2
      const rawLen = buffer[1] & 0x7f
      if (rawLen === 126) headerSize += 2
      else if (rawLen === 127) headerSize += 8
      if (buffer[1] & 0x80) headerSize += 4 // mask
      buffer = buffer.slice(headerSize + payloadLen)

      if (frame.opcode === 0x8) {
        // Close frame
        socket.destroy()
        return
      }
      if (frame.opcode === 0x9) {
        // Ping → Pong
        sendToClient(client, {})
        return
      }
      if (frame.opcode !== 0x1) continue // only handle text

      let msg: WsMessage
      try {
        msg = JSON.parse(frame.payload.toString('utf8')) as WsMessage
      } catch {
        sendToClient(client, { type: 'server:ack', ok: false, error: 'Invalid JSON' })
        continue
      }

      switch (msg.type) {
        case 'client:event': {
          console.log(`[ws] client:event from=${id}`, msg.data)
          sendToClient(client, { type: 'server:ack', received: true, data: msg.data })
          break
        }

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
          history.push(stored)
          if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY)

          const envelope = { type: 'chat:message' as const, ...stored }
          if (stored.to) {
            const recipient = clients.get(stored.to)
            if (recipient) sendToClient(recipient, envelope)
            sendToClient(client, envelope)
          } else {
            broadcastAll(envelope)
          }
          break
        }

        case 'find:messages': {
          sendToClient(client, { type: 'history', messages: history.slice(-MAX_HISTORY) })
          break
        }

        case 'join:room': {
          const room = typeof msg.room === 'string' ? msg.room.trim() : ''
          if (room) {
            console.log(`[ws] ${id} joined room=${room}`)
            sendToClient(client, { type: 'server:ack', received: true, room })
          }
          break
        }

        default:
          console.warn(`[ws] unknown type="${msg.type}" from=${id}`)
      }
    }
  })

  socket.on('close', () => {
    clearInterval(heartbeat)
    clients.delete(id)
    console.log(`[ws] disconnected id=${id}  total=${clients.size}`)
    broadcast({ type: 'user-left', id })
    broadcastUserList()
  })

  socket.on('error', (err: Error) => {
    console.error(`[ws] error id=${id}`, err.message)
  })
}

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const server = http.createServer((_req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket server running\n')
})

server.on('upgrade', (req: IncomingMessage, socket, _head: Buffer) => {
  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    socket.destroy()
    return
  }
  handleConnection(req, socket as import('node:net').Socket)
})

server.listen(PORT, () => {
  console.log(`[ws] WebSocket server listening on ws://localhost:${PORT}`)
})