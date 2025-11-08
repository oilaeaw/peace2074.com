export default defineNitroPlugin(() => {
  try {
    process.on('unhandledRejection', (reason: any) => {
       
      console.error('[unhandledRejection]', reason?.stack || reason)
    })
    process.on('uncaughtException', (err: any) => {
       
      console.error('[uncaughtException]', err?.stack || err)
    })
  } catch {}
})
