export default defineEventHandler(() => {
  try {
    const io = (globalThis as any).__io
    return { socketEnabled: !!io, clients: io ? (io.sockets?.sockets?.size ?? io.sockets?.sockets?.length ?? 0) : 0 }
  }
  catch {
    return { socketEnabled: false, clients: 0 }
  }
})
