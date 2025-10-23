export default defineNitroPlugin(() => {
  try {
    process.on('unhandledRejection', (reason: any) => {
      // eslint-disable-next-line no-console
      console.error('[unhandledRejection]', reason?.stack || reason)
    })
    process.on('uncaughtException', (err: any) => {
      // eslint-disable-next-line no-console
      console.error('[uncaughtException]', err?.stack || err)
    })
  } catch {}
})
