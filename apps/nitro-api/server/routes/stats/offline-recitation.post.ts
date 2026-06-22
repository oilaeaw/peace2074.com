import { defineEventHandler, readBody } from 'h3'
import { applyCors } from '../../utils/cors'
import { recordOfflineRecitationDownload } from '../../utils/offline-download-stats'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const body = (await readBody(event)) as { suraId?: unknown; quality?: unknown } | null
    const suraId = Number(body?.suraId)
    const quality = body?.quality

    if (!Number.isFinite(suraId) || suraId < 1 || suraId > 114) {
        return { ok: false, error: 'Valid suraId (1-114) is required' }
    }

    if (quality !== 'regular' && quality !== 'hiq') {
        return { ok: false, error: 'Valid quality (regular|hiq) is required' }
    }

    const recorded = await recordOfflineRecitationDownload()
    return { ok: recorded }
})
