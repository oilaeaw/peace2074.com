const startAt = Date.now()
let count = 0

export default defineEventHandler((_event) => {
  const payload = { pageview: count++, startAt }

  // If the Nitro-integrated Socket.IO plugin is enabled it will expose
  // the `io` instance on `globalThis.__io` — emit an ad-hoc event so
  // connected clients can receive realtime pageview updates.
  try {
    const io = (globalThis as any).__io
    if (io && typeof io.emit === 'function') {
      io.emit('pageview', payload)
    }
  }
  catch {
    // No-op: server may not have socket.io installed or plugin disabled
  }

  return payload
})
