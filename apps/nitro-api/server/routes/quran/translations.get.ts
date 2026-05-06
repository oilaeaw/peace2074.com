import { defineEventHandler } from 'h3'
import { QURAN_TRANSLATORS } from '../../../../../src/shared/data/quran-translators'

/**
 * GET /api/quran/translations
 * Returns the list of available Quran translators grouped by locale.
 */
export default defineEventHandler(() => {
    return { translators: QURAN_TRANSLATORS }
})
