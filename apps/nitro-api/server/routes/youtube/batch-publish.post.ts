import { defineEventHandler, readBody } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

const OUTPUT_DIR = path.join('output_videos')
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'batch_progress.json')

/**
 * POST /api/youtube/batch-publish
 * Triggers and checks status of 114 Surahs automated batch generation & YouTube publishing pipeline
 */
export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event).catch(() => ({}))
    const body = rawBody || {}
    const start = parseInt(body.start || '1', 10)
    const end = parseInt(body.end || '114', 10)

    let progress: any = {}
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
      } catch {
        progress = {}
      }
    }

    const completedCount = Object.values(progress).filter((r: any) => r.status === 'generated' || r.status === 'uploaded').length

    return {
      ok: true,
      message: `Automated 114 Surahs pipeline initialized for Surahs ${start} through ${end}`,
      totalSurahs: 114,
      completedCount,
      progress,
      scriptPath: 'scripts/batch-generate-114-surah-videos.ts',
      runCommand: `node --experimental-strip-types scripts/batch-generate-114-surah-videos.ts ${start} ${end}`,
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to trigger batch publish pipeline' }
  }
})
