import { defineEventHandler } from 'h3'
import quranData from '../../../../../src/shared/data/quran.json'

export default defineEventHandler(() => {
    return quranData
})