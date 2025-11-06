// Avoid depending on socket.io-client types to keep typecheck green if
// the package/types are not installed in the current environment.
type Socket = any

export function useSocket() {
  const { $socket } = useNuxtApp()
  const socket = ($socket as unknown as Socket) || (undefined as any)

  const noop = () => {}
  function on<T = any>(event: string, handler: (payload: T) => void) {
    if (!socket || typeof socket.on !== 'function') {
      if (import.meta.env.MODE !== 'production') console.debug('[socket] on: no socket available (SSR or plugin not loaded)')
      return noop
    }
    socket.on(event, handler as any)
    return () => socket.off(event, handler as any)
  }

  function off<T = any>(event: string, handler: (payload: T) => void) {
    if (!socket || typeof socket.off !== 'function') return
    socket.off(event, handler as any)
  }

  function emit<T = any>(event: string, payload?: T, ack?: (response?: any) => void) {
    if (!socket || typeof socket.emit !== 'function') return
    if (ack) socket.emit(event, payload, ack)
    else socket.emit(event, payload)
  }

  return { socket, on, off, emit }
}
