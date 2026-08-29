import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config()

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

interface VerseContent {
  verseNumber: number
  arabicText: string
  translationText: string
}

async function fetchSurahVersesData(chapterId: number): Promise<VerseContent[]> {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=en&fields=text_uthmani&translations=131&per_page=300`)
    if (!res.ok) return []
    const json = await res.json()
    const verses = json?.verses || []
    return verses.map((v: any) => ({
      verseNumber: v.verse_number,
      arabicText: v.text_uthmani || '',
      translationText: v.translations?.[0]?.text?.replace(/<[^>]*>/g, '').trim() || '',
    }))
  } catch {
    return []
  }
}

function getAudioDuration(filePath: string): number {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' })
    return parseFloat(out.trim()) || 0
  } catch {
    return 0
  }
}

function generateVerseHtml(chapter: Chapter, verse: VerseContent): string {
  return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 720px;
      background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
      color: #f8fafc;
      font-family: 'DM Sans', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 40px 60px;
      overflow: hidden;
    }
    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 24px;
      color: #fbbf24;
      letter-spacing: 1px;
    }
    .surah-info {
      text-align: right;
      font-size: 20px;
      color: #94a3b8;
    }
    .surah-info span {
      color: #38bdf8;
      font-weight: 600;
    }
    .content-card {
      width: 100%;
      max-width: 1100px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      border: 2px solid rgba(251, 191, 36, 0.4);
      box-shadow: 0 0 40px rgba(251, 191, 36, 0.15), inset 0 0 20px rgba(251, 191, 36, 0.05);
      border-radius: 24px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      text-align: center;
    }
    .verse-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.5);
      color: #fbbf24;
      padding: 6px 18px;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 600;
    }
    .arabic-text {
      font-family: 'Amiri', serif;
      font-size: 44px;
      line-height: 1.8;
      color: #ffffff;
      direction: rtl;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
    .translation-text {
      font-size: 22px;
      line-height: 1.6;
      color: #cbd5e1;
      max-width: 900px;
      font-weight: 400;
    }
    .footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }
    .active-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4ade80;
      font-weight: 600;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      background-color: #4ade80;
      border-radius: 50%;
      box-shadow: 0 0 10px #4ade80;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span>✨ PEACE2074</span>
    </div>
    <div class="surah-info">
      Surah <span>${chapter.transliteration}</span> (${chapter.name})
    </div>
  </div>

  <div class="content-card">
    <div class="verse-badge">
      <span>Ayah ${verse.verseNumber} of ${chapter.total_verses}</span>
    </div>
    <div class="arabic-text">
      ${verse.arabicText} ﴿${verse.verseNumber}﴾
    </div>
    <div class="translation-text">
      "${verse.translationText}"
    </div>
  </div>

  <div class="footer">
    <div class="active-indicator">
      <div class="pulse-dot"></div>
      <span>Recitation Follow-Along</span>
    </div>
    <div>Recited by Sheikh Mishary Rashid Alafasy</div>
  </div>
</body>
</html>`
}

async function buildSurahVideoWithSyncedText(chapter: Chapter, tempDir: string): Promise<string> {
  const paddedSura = pad3(chapter.id)
  const outputVideo = path.join(OUTPUT_DIR, `surah_${paddedSura}_${chapter.transliteration.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`)

  if (fs.existsSync(outputVideo) && fs.statSync(outputVideo).size > 100000) {
    return outputVideo
  }

  console.log(`[Surah ${chapter.id}/${114}] 🎨 Generating synchronized verse cards & rendering HD video: ${chapter.transliteration} (${chapter.name})...`)

  const versesData = await fetchSurahVersesData(chapter.id)
  
  const { chromium } = await import('@playwright/test')
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  const segmentVideos: string[] = []

  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const paddedVerse = pad3(verse)
    const fileKey = `${paddedSura}${paddedVerse}.mp3`
    const localMp3 = path.join(tempDir, fileKey)
    const primaryUrl = `https://everyayah.com/data/Alafasy_128kbps/${fileKey}`
    const mirrorUrl = `https://mirrors.quranicaudio.com/everyayah/Alafasy_128kbps/${fileKey}`

    if (!fs.existsSync(localMp3) || fs.statSync(localMp3).size < 100) {
      let success = false
      const urls = [
        `https://everyayah.com/data/Alafasy_128kbps/${fileKey}`,
        `https://mirrors.quranicaudio.com/everyayah/Alafasy_128kbps/${fileKey}`,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${fileKey}`,
      ]
      for (const url of urls) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
            if (res.ok) {
              const buffer = Buffer.from(await res.arrayBuffer())
              if (buffer.length > 100) {
                fs.writeFileSync(localMp3, buffer)
                success = true
                break
              }
            }
          } catch {
            await new Promise((r) => setTimeout(r, 400))
          }
        }
        if (success) break
      }
      if (!success) {
        throw new Error(`Failed to download audio for verse ${verse} of Surah ${chapter.id}`)
      }
    }

    const verseData = versesData.find((v) => v.verseNumber === verse) || {
      verseNumber: verse,
      arabicText: '',
      translationText: '',
    }

    const htmlContent = generateVerseHtml(chapter, verseData)
    const cardPng = path.join(tempDir, `verse_${paddedVerse}.png`)

    await page.setContent(htmlContent, { waitUntil: 'networkidle' })
    await page.screenshot({ path: cardPng, type: 'png' })

    const duration = getAudioDuration(localMp3)
    const segmentMp4 = path.join(tempDir, `segment_${paddedVerse}.mp4`)

    execSync(
      `/usr/local/bin/ffmpeg -y -loop 1 -i "${cardPng}" -i "${localMp3}" -t ${duration} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p "${segmentMp4}"`,
      { stdio: 'ignore' }
    )

    segmentVideos.push(segmentMp4)
  }

  await browser.close()

  const concatListFile = path.join(tempDir, 'segments_list.txt')
  const concatContent = segmentVideos.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(concatListFile, concatContent)

  execSync(
    `/usr/local/bin/ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy "${outputVideo}"`,
    { stdio: 'ignore' }
  )

  return outputVideo
}

async function getOrCreatePlaylist(oauthToken: string): Promise<string | null> {
  const title = 'Peace2074 — Complete Holy Quran Recitation (114 Surahs)'
  const description = 'Complete recitation of all 114 Surahs of the Holy Quran recited by Sheikh Mishary Rashid Alafasy. Streamed and presented by Peace2074.'

  try {
    // 1. Search existing playlists
    const listRes = await fetch('https://www.googleapis.com/youtube/v3/playlists?mine=true&part=snippet&maxResults=50', {
      headers: { Authorization: `Bearer ${oauthToken}` },
    })
    if (listRes.ok) {
      const data = await listRes.json()
      const existing = data.items?.find((p: any) => p.snippet?.title === title)
      if (existing) {
        return existing.id
      }
    }

    // 2. Create playlist if not found
    const createRes = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: { title, description },
        status: { privacyStatus: 'public' },
      }),
    })
    if (createRes.ok) {
      const pData = await createRes.json()
      console.log(`[YouTube] 📁 Created Playlist: "${title}" (ID: ${pData.id})`)
      return pData.id
    }
  } catch (err: any) {
    console.error('[YouTube] Playlist creation/fetch error:', err?.message || err)
  }
  return null
}

async function addVideoToPlaylist(videoId: string, playlistId: string, oauthToken: string) {
  try {
    await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      }),
    })
    console.log(`[YouTube] ➕ Added video ${videoId} to playlist ${playlistId}`)
  } catch (err: any) {
    console.error(`[YouTube] Error adding video ${videoId} to playlist:`, err?.message || err)
  }
}

async function getOrRefreshOAuthToken(currentToken?: string): Promise<string | undefined> {
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN
  const clientId = process.env.NITRO_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.NITRO_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET

  if (refreshToken && clientId && clientSecret) {
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.access_token) {
          process.env.YOUTUBE_OAUTH_TOKEN = data.access_token
          return data.access_token
        }
      }
    } catch (err: any) {
      console.warn('[YouTube Token Refresh Error]', err?.message || err)
    }
  }
  return currentToken || process.env.YOUTUBE_OAUTH_TOKEN
}

async function uploadToYouTube(chapter: Chapter, videoPath: string, rawOauthToken?: string): Promise<string | null> {
  const oauthToken = await getOrRefreshOAuthToken(rawOauthToken)
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
      const errText = await initRes.text()
      console.error(`[Surah ${chapter.id}] YouTube upload init failed ${initRes.status}:`, errText)
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
      
      const playlistId = await getOrCreatePlaylist(oauthToken)
      if (playlistId) {
        await addVideoToPlaylist(data.id, playlistId, oauthToken)
      }
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
      
      const videoPath = await buildSurahVideoWithSyncedText(chapter, tempDir)
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
