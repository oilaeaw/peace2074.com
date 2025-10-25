import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

// Client-only Socket.IO setup. Connects to same-origin by default and
// exposes the instance as `$socket` via Nuxt provide.
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server)
    return

  const runtime = useRuntimeConfig()
  const enabled = String((runtime.public as any)?.socketEnabled) === 'true'
  const socketPath = (runtime.public as any)?.socketPath || '/_socket.io'
  const socketUrl = (runtime.public as any)?.socketUrl || undefined
  if (!enabled) {
    if (import.meta.env.MODE !== 'production') {
      console.warn('[socket] client plugin disabled (set runtimeConfig.public.socketEnabled=true to enable)')
    }
    return
  }

  // Default to same-origin socket server. If you later want to point to a
  // different origin, introduce a public runtime config like `public.socketUrl`
  // and pass it to `io(socketUrl, opts)`.
  const opts = {
    // Use a custom path to avoid any framework conflicts with /socket.io
  path: socketPath,
    // Prefer pure websocket in modern browsers; you can add 'polling' if needed
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
    // Include optional auth from your store/cookies if needed
    // auth: { token: useAuthStore().user?.token }
  } as const

  // Explicitly pass `undefined` URL so the options are applied correctly.
  // If we only pass the options object as the first argument, socket.io-client
  // may treat it as a URI and ignore our custom `path`, falling back to
  // the default "/socket.io" which conflicts with Vue Router in dev.
  const socket: Socket = io((socketUrl as any), opts as any)

  // Light dev logging to help during integration
  socket.on('connect', () => {
    if (import.meta.env.MODE !== 'production')
      console.debug('[socket] connected', socket.id)
  })
  socket.on('connect_error', (err) => {
    if (import.meta.env.MODE !== 'production')
      console.warn('[socket] connect_error', err?.message || err)
  })
  socket.on('disconnect', (reason) => {
    if (import.meta.env.MODE !== 'production')
      console.debug('[socket] disconnected', reason)
  })

  // Provide as $socket
  nuxtApp.provide('socket', socket)
  try { (globalThis as any).__socket = socket } catch {}
})
// Also available via `useSocket()` from `app/composables/useSocket.ts`