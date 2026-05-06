import { defineEventHandler } from 'h3'
import { loadQuranData } from '../../utils/quran-data'

export default defineEventHandler(async (event) => {
    return await loadQuranData(event)
})