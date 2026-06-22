import { defineEventHandler } from 'h3'
import { applyCors } from '../../utils/cors'
import { getPeace2074PublicStats } from '../../utils/peace2074-public-stats'

export default defineEventHandler(async (event) => {
    applyCors(event)
    const stats = await getPeace2074PublicStats()
    return { ok: true, ...stats }
})
