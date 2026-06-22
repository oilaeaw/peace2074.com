import { defineEventHandler } from 'h3'
import { applyCors } from '../../utils/cors'
import { getOfflineRecitationDownloadStats } from '../../utils/offline-download-stats'

export default defineEventHandler(async (event) => {
    applyCors(event)
    const stats = await getOfflineRecitationDownloadStats()
    return { ok: true, ...stats }
})
