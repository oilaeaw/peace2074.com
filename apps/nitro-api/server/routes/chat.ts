import { defineWebSocketHandler } from 'h3'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredMessage {
    id: string
    text: string
    author: string
    from: string
    room?: string
    to?: string
    ts: string
}

// ─── In-process state ────────────────────────────────────────────────────────
// For Cloudflare Pages, state is per-isolate (single-threaded, shared within
// one edge location). True multi-region broadcast requires Durable Objects.

const history: StoredMessage[] = []
const MAX_HISTORY = 200
const CHANNEL_ALL = 'peace:all'

let _counter = 0
function makeId(): string {
    return `${Date.now().toString(36)}-${(++_counter).toString(36)}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default defineWebSocketHandler({
    open(peer) {
        // Subscribe to the global broadcast channel
        peer.subscribe(CHANNEL_ALL)

        // Announce this peer's ID
        peer.send(JSON.stringify({ type: 'server:id', id: peer.id }))

        // Notify other peers
        peer.publish(
            CHANNEL_ALL,
            JSON.stringify({ type: 'user-joined', id: peer.id })
        )

        // Send message history immediately on connect
        peer.send(
            JSON.stringify({ type: 'history', messages: history.slice(-MAX_HISTORY) })
        )

        console.log(`[ws] open  id=${peer.id}`)
    },

    message(peer, message) {
        let msg: Record<string, unknown>
        try {
            msg = JSON.parse(message.text()) as Record<string, unknown>
        } catch {
            peer.send(JSON.stringify({ type: 'server:ack', ok: false, error: 'Invalid JSON' }))
            return
        }

        const type = msg.type as string

        if (type === 'chat:message') {
            const stored: StoredMessage = {
                id: makeId(),
                text: typeof msg.text === 'string' ? msg.text : '',
                author: typeof msg.author === 'string' ? msg.author : 'anonymous',
                from: peer.id,
                room: typeof msg.room === 'string' ? msg.room : undefined,
                to: typeof msg.to === 'string' ? msg.to : undefined,
                ts: new Date().toISOString(),
            }

            history.push(stored)
            if (history.length > MAX_HISTORY) {
                history.splice(0, history.length - MAX_HISTORY)
            }

            const envelope = JSON.stringify({ type: 'chat:message', ...stored })

            // Broadcast to all subscribers (including sender for echo)
            peer.publish(CHANNEL_ALL, envelope)
            peer.send(envelope)
            return
        }

        if (type === 'find:messages') {
            peer.send(
                JSON.stringify({ type: 'history', messages: history.slice(-MAX_HISTORY) })
            )
            return
        }

        if (type === 'join:room') {
            const room = typeof msg.room === 'string' ? msg.room.trim() : ''
            if (room) {
                peer.subscribe(room)
                peer.send(JSON.stringify({ type: 'server:ack', received: true, room }))
            }
            return
        }

        if (type === 'client:event') {
            peer.send(JSON.stringify({ type: 'server:ack', received: true, data: msg.data }))
            return
        }
    },

    close(peer, details) {
        peer.unsubscribe(CHANNEL_ALL)
        peer.publish(
            CHANNEL_ALL,
            JSON.stringify({ type: 'user-left', id: peer.id })
        )
        console.log(`[ws] close  id=${peer.id}  code=${details?.code}`)
    },

    error(peer, error) {
        console.error(`[ws] error  id=${peer.id}`, error?.message)
    },
})
