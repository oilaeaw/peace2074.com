// Backwards-compat shim: re-export the index.get handler so both /api/tasbeeh and /api/tasbeeh/tasbeeh work
import handler from './index.get'

export default handler
