export default defineNitroPlugin(async (nitroApp) => {
  console.warn('[socketio] nitro plugin evaluating')
  // Attach in non-production by default, or when explicitly enabled via env.
  const shouldAttach = (process.env.NUXT_SOCKET_ATTACH === 'true') || (process.env.NODE_ENV !== 'production')
  if (!shouldAttach) {
    console.warn('[socketio] plugin disabled (set NUXT_SOCKET_ATTACH="true" to enable)')
    return
  }
  // Dynamically import socket.io only if it's installed. This prevents
  // build-time failures when socket.io is not present and keeps the plugin
  // safe to include in repos that don't want realtime.
  let Server: any
  try {
    const mod = await import('socket.io')
    Server = mod.Server || mod.default || mod
  }
  catch {
    // socket.io not installed — skip enabling sockets
    console.warn('[socketio] socket.io not installed — Nitro socket plugin disabled')
    return
  }

  // Attach the socket server when Nitro starts listening. Nitro triggers a
  // 'listen' hook with the created http.Server — attach socket.io there.
  nitroApp.hooks.hook('listen', (server: any) => {
    try {
      console.warn('[socketio] listen hook received server:', !!server, 'typeof on:', typeof (server?.on))
    }
    catch {}
    try {
      const httpServer = (server?.server || server?.httpServer || server)
      const io = new Server(httpServer, {
        path: '/_socket.io',
        cors: {
          origin: '*', // permissive for development; tighten for production
          methods: ['GET', 'POST'],
        },
      })

      console.warn('[socketio] Socket.IO attached to Nitro server')

      try {
        // Debug upgrade handling visibility
        httpServer?.on?.('upgrade', (req: any) => {
          if (req?.url?.startsWith?.('/_socket.io')) {
            console.warn('[socketio] HTTP upgrade for', req.url)
          }
        })
      }
      catch {}

      io.on('connection', (socket: any) => {
        console.warn('[socketio] client connected', socket.id)
        try { socket.emit('server:id', socket.id) } catch {}

        // Optional: capture token from handshake and attach to socket.data
        try {
          const token = (socket as any).handshake?.auth?.token || (socket as any).handshake?.headers?.authorization || null
          if (token) (socket as any).data = Object.assign({}, (socket as any).data, { token })
        }
        catch {}

        // Periodic health ping
        const healthInterval = setInterval(() => {
          socket.emit('health', { timestamp: new Date().toISOString(), id: socket.id })
        }, 10000)

        // Simple echo event for diagnostics
        socket.on('client:event', (payload: any) => {
          console.warn('[socketio] client:event', payload)
          socket.emit('server:ack', { received: true, payload })
        })

        // Broadcast chat messages to all connected clients
        socket.on('chat:message', (payload: any, ack?: (res?: any) => void) => {
          try {
            const normalized = {
              id: socket.id,
              text: String(payload?.text ?? ''),
              author: String(payload?.author ?? 'anonymous'),
              ts: new Date().toISOString(),
            }
            io.emit('chat:message', normalized)
            if (ack) ack({ ok: true })
          }
          catch (err) {
            if (ack) ack({ ok: false, error: (err as any)?.message || 'error' })
          }
        })

        socket.on('disconnect', (reason: any) => {
          clearInterval(healthInterval)
          console.warn('[socketio] client disconnected', socket.id, reason)
        })
      })

      // Expose the io instance to other server code (optional). Other
      // server files can check `globalThis.__io` and emit events.
      ;(globalThis as any).__io = io

      // Close handler: when Nitro shuts down we should close the socket
      nitroApp.hooks.hook('close', async () => {
        try {
          await io.close()
          console.warn('[socketio] Socket.IO closed')
        }
        catch (err) {
          console.warn('[socketio] error closing io', err)
        }
      })
    }
    catch (err) {
      console.error('[socketio] failed to attach Socket.IO', err)
    }
  })
})