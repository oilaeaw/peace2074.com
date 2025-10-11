export default defineNitroPlugin(async (nitroApp) => {
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
      const io = new Server(server, {
        cors: {
          origin: '*', // permissive for development; tighten for production
          methods: ['GET', 'POST'],
        },
      })

      console.warn('[socketio] Socket.IO attached to Nitro server')

      io.on('connection', (socket: any) => {
        console.warn('[socketio] client connected', socket.id)

        // Periodic health ping
        const healthInterval = setInterval(() => {
          socket.emit('health', { timestamp: new Date().toISOString(), id: socket.id })
        }, 10000)

        socket.on('client:event', (payload: any) => {
          console.warn('[socketio] client:event', payload)
          socket.emit('server:ack', { received: true, payload })
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
