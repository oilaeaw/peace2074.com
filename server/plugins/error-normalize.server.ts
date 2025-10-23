import { createError, sendError } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  // Ensure any non-Error thrown values are converted to proper Error instances.
  // This avoids Youch showing the "make sure to throw Error objects" message
  // and provides a consistent error shape for API responses.
  try {
    const h3App: any = (nitroApp as any)?.h3App
    if (!h3App)
      return

    h3App.options = h3App.options || {}

    // Preserve any existing onError handler, delegate to it first.
    const prevOnError = h3App.options.onError

    h3App.options.onError = (err: any, event: any) => {
      try {
        if (typeof prevOnError === 'function') {
          const res = prevOnError(err, event)
          // If the previous handler handled the error (returned a value), respect it
          if (res !== undefined)
            return res
        }
      }
      catch (e) {
        if (process.env.NODE_ENV !== 'production')
          console.warn('[error-normalize] previous onError threw', e)
      }

      // If it's already an Error (including H3Error), format and send it
      if (err instanceof Error) {
        return sendError(event, err)
      }

      // Coerce primitives/objects into an h3 error with useful context
      const statusCode = (typeof err === 'object' && err && 'statusCode' in (err as any))
        ? Number((err as any).statusCode) || 500
        : 500

      const data = (typeof err === 'object' && err) ? err : { value: err }
      const message = typeof (err as any)?.message === 'string'
        ? (err as any).message
        : (typeof err === 'string' ? err : 'Unhandled error')

      const wrapped = createError({
        statusCode,
        statusMessage: 'Internal Server Error',
        message,
        data,
      })

      return sendError(event, wrapped)
    }
  }
  catch (e) {
    // Best-effort; do not crash server startup if error handler wiring fails
    console.warn('[error-normalize] failed to set error handler', (e as any)?.message || e)
  }
})
