import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

interface Chapter {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

interface ProgressRecord {
  surahId: number
  surahName: string
  videoPath?: string
  youtubeVideoId?: string
  status: 'pending' | 'generated' | 'uploaded' | 'failed'
  error?: string
}

const CHAPTERS_FILE = path.join('src', 'shared', 'data', 'chapters', 'en.json')
const OUTPUT_DIR = path.join('output_videos')
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'batch_progress.json')
const BANNER_IMAGE = path.join('public', 'yt_banner.png')
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCKPAQJxnUTX-pzvLQ3M0aEQ'

function pad3(num: number): string {
  return String(num).padStart(3, '0')
}

function loadChapters(): Chapter[] {
  const content = fs.readFileSync(CHAPTERS_FILE, 'utf8')
  return JSON.parse(content) as Chapter[]
}

function loadProgress(): Record<number, ProgressRecord> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
    } catch {
      return {}
    }
  }
  return {}
}

function saveProgress(progress: Record<number, ProgressRecord>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

async function downloadSurahAudio(chapter: Chapter, tempDir: string): Promise<string> {
  const paddedSura = pad3(chapter.id)
  const mp3Files: string[] = []

  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const paddedVerse = pad3(verse)
    const fileKey = `${paddedSura}${paddedVerse}.mp3`
    const localMp3 = path.join(tempDir, fileKey)
    const url = `https://everyayah.com/data/Alafasy_128kbps/${fileKey}`

    if (!fs.existsSync(localMp3) || fs.statSync(localMp3).size < 100) {
      let success = false
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          execSync(`curl -sSL --connect-timeout 10 --retry 3 "${url}" -o "${localMp3}"`, { stdio: 'ignore' })
          if (fs.existsSync(localMp3) && fs.statSync(localMp3).size > 100) {
            success = true
            break
          }
        } catch {
          // retry
        }
      }
      if (!success) {
        throw new Error(`Failed to download audio for verse ${verse} of Surah ${chapter.id}`)
      }
    }
    mp3Files.push(localMp3)
  }

  const concatListFile = path.join(tempDir, 'concat_list.txt')
  const concatContent = mp3Files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(concatListFile, concatContent)

  const outputAudio = path.join(tempDir, `surah_${paddedSura}_audio.mp3`)
  execSync(
    `/usr/local/bin/ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy "${outputAudio}"`,
    { stdio: 'ignore' }
  )

  return outputAudio
}

async function generateSurahVideo(chapter: Chapter, audioPath: string): Promise<string> {
  const paddedSura = pad3(chapter.id)
  const outputVideo = path.join(OUTPUT_DIR, `surah_${paddedSura}_${chapter.transliteration.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`)

  if (fs.existsSync(outputVideo) && fs.statSync(outputVideo).size > 100000) {
    return outputVideo
  }

  console.log(`[Surah ${chapter.id}/${114}] Rendering HD video: ${chapter.transliteration} (${chapter.name})...`)

  const ffmpegCmd = `/usr/local/bin/ffmpeg -y -loop 1 -i "${BANNER_IMAGE}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputVideo}"`
  execSync(ffmpegCmd, { stdio: 'ignore' })

  return outputVideo
}

async function uploadToYouTube(chapter: Chapter, videoPath: string, oauthToken?: string): Promise<string | null> {
  if (!oauthToken) {
    console.log(`[Surah ${chapter.id}/${114}] Video generated at ${videoPath} (Skipping direct YouTube upload: No YOUTUBE_OAUTH_TOKEN provided)`)
    return null
  }

  const title = `Surah ${chapter.id}. ${chapter.transliteration} (${chapter.name}) — Chapter ${chapter.id} of 114 | Peace2074 Quran Recitation`
  const description = `Recitation of Surah ${chapter.transliteration} (${chapter.name} - ${chapter.translation}), Chapter ${chapter.id} of the Holy Quran (${chapter.total_verses} verses, ${chapter.type === 'meccan' ? 'Meccan' : 'Medinan'}). Recited by Sheikh Mishary Rashid Alafasy. Streamed on Peace2074.\n\nSubscribe to Peace2074: https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`
  const tags = ['Quran', `Surah ${chapter.transliteration}`, `Surah ${chapter.id}`, 'Peace2074', 'Quran Recitation', 'Mishary Alafasy', 'Holy Quran', 'Islam']

  try {
    const videoBuffer = fs.readFileSync(videoPath)
    
    // 1. Resumable Upload Session Init
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(videoBuffer.length),
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            tags,
            categoryId: '22',
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    )

    if (!initRes.ok) {
      console.error(`[Surah ${chapter.id}] YouTube upload init failed: ${initRes.status}`)
      return null
    }

    const uploadUrl = initRes.headers.get('location')
    if (!uploadUrl) return null

    // 2. Binary Video Data Upload
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length),
      },
      body: videoBuffer,
    })

    if (uploadRes.ok) {
      const data = await uploadRes.json()
      console.log(`[Surah ${chapter.id}/${114}] 🎉 Uploaded to YouTube! Video ID: ${data.id}`)
      return data.id
    }
  } catch (err: any) {
    console.error(`[Surah ${chapter.id}] YouTube upload error:`, err?.message || err)
  }

  return null
}

async function main() {
  console.log('================================================================');
  console.log('🚀 PEACE2074 AUTOMATED BATCH 114 SURAHS VIDEO GENERATOR & PUBLISHER');
  console.log('================================================================');

  const chapters = loadChapters()
  const progress = loadProgress()
  const oauthToken = process.env.YOUTUBE_OAUTH_TOKEN

  const startSurahArg = process.argv[2] ? parseInt(process.argv[2], 10) : 1
  const endSurahArg = process.argv[3] ? parseInt(process.argv[3], 10) : 114

  console.log(`Processing Surahs ${startSurahArg} through ${endSurahArg} of 114...\n`)

  for (let id = startSurahArg; id <= endSurahArg; id++) {
    const chapter = chapters.find((c) => c.id === id)
    if (!chapter) continue

    const rec = progress[id] || { surahId: id, surahName: chapter.transliteration, status: 'pending' }

    if (rec.status === 'uploaded' && rec.youtubeVideoId) {
      console.log(`[Surah ${id}/114] Already completed & uploaded (Video ID: ${rec.youtubeVideoId}). Skipping.`)
      continue
    }

    // Reset failed status to pending on retry
    if (rec.status === 'failed') {
      rec.status = 'pending'
      delete rec.error
    }

    const tempDir = path.join('/tmp', `surah_${pad3(id)}`)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    try {
      console.log(`\n▶ [${id}/114] Processing Surah ${chapter.transliteration} (${chapter.name}) - ${chapter.total_verses} verses...`)
      
      const audioPath = await downloadSurahAudio(chapter, tempDir)
      const videoPath = await generateSurahVideo(chapter, audioPath)
      rec.videoPath = videoPath
      rec.status = 'generated'
      saveProgress(progress)

      if (oauthToken) {
        const ytVideoId = await uploadToYouTube(chapter, videoPath, oauthToken)
        if (ytVideoId) {
          rec.youtubeVideoId = ytVideoId
          rec.status = 'uploaded'
        }
      }

      progress[id] = rec
      saveProgress(progress)

      // Clean up temporary audio files
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (err: any) {
      console.error(`❌ [Surah ${id}/114] Error:`, err?.message || err)
      rec.status = 'failed'
      rec.error = err?.message || String(err)
      progress[id] = rec
      saveProgress(progress)
    }
  }

  console.log('\n================================================================');
  console.log('✅ BATCH PROCESSING COMPLETE!');
  console.log(`Progress saved in: ${PROGRESS_FILE}`);
  console.log('Generated HD videos are available in: output_videos/ directory');
  console.log('================================================================');
}

main().catch(console.error)
