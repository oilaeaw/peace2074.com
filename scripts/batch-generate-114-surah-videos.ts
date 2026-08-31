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

interface WordTiming {
  start: number  // seconds
  end: number    // seconds
}

interface VerseContent {
  verseNumber: number
  arabicText: string
  translationText: string
  words: string[]          // individual Arabic words
  wordTimings: WordTiming[] // start/end per word
}

async function fetchSurahVersesData(chapterId: number): Promise<VerseContent[]> {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=en&audio=7&words=true&word_fields=text_uthmani&fields=text_uthmani&translations=131&per_page=300`)
    if (!res.ok) return []
    const json = await res.json()
    const verses = json?.verses || []
    return verses.map((v: any) => {
      const words = Array.isArray(v?.words)
        ? v.words
            .filter((w: any) => w?.char_type_name === 'word')
            .map((w: any) => w?.text_uthmani || w?.text || '')
            .filter(Boolean)
        : []

      const segments: number[][] = v?.audio?.segments || []
      const wordTimings = segments
        .filter((seg: number[]) => seg.length >= 4)
        .map((seg: number[]) => ({
          start: (seg[2] ?? 0) / 1000,
          end: (seg[3] ?? 0) / 1000,
        }))

      return {
        verseNumber: v.verse_number,
        arabicText: v.text_uthmani || '',
        translationText: v.translations?.[0]?.text?.replace(/<[^>]*>/g, '').trim() || '',
        words,
        wordTimings,
      }
    })
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

function generateVerseHtml(chapter: Chapter, activeVerse: VerseContent, allVerses: VerseContent[], activeWordIndex: number = -1): string {
  const verseRowsHtml = allVerses
    .map((v) => {
      const isActive = v.verseNumber === activeVerse.verseNumber
      // Build word-by-word spans for the active verse, plain text for others
      let arabicHtml: string
      if (isActive && v.words.length > 0) {
        arabicHtml = v.words
          .map((word, wIdx) => {
            const isCurrent = wIdx === activeWordIndex
            return `<span class="word${isCurrent ? ' is-current-word' : ''}">${word}</span>`
          })
          .join(' ') + ` ﴿${v.verseNumber}﴾`
      } else {
        arabicHtml = `${v.arabicText} ﴿${v.verseNumber}﴾`
      }

      return `
      <div id="${isActive ? 'activeAyah' : 'ayah-' + v.verseNumber}" class="verse-row ${isActive ? 'is-current-ayah' : ''}">
        <div class="verse-main">
          <div class="verse-number-badge">${v.verseNumber}</div>
          <div class="arabic-text">
            ${arabicHtml}
          </div>
        </div>
        <div class="translation-text">
          ${v.translationText}
        </div>
      </div>
    `
    })
    .join('')

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
      background-color: #0b1120;
      color: #f8fafc;
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .app-header {
      width: 100%;
      height: 64px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      flex-shrink: 0;
      z-index: 10;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 20px;
      color: #fbbf24;
      letter-spacing: 0.05em;
    }
    .surah-heading-title {
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
    }
    .recitation-banner {
      width: 100%;
      background: rgba(245, 158, 11, 0.14);
      border-bottom: 1px solid rgba(245, 158, 11, 0.3);
      padding: 10px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fbbf24;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .reader-scroll-container {
      flex: 1;
      overflow-y: auto;
      padding: 32px 80px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      scroll-behavior: smooth;
    }
    .verse-row {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 24px 32px;
      transition: all 0.25s ease;
    }
    .verse-row.is-current-ayah {
      background: rgba(251, 191, 36, 0.16) !important;
      border-inline-start: 4px solid #fbbf24 !important;
      box-shadow: 0 0 24px rgba(251, 191, 36, 0.2) !important;
      border-radius: 16px;
    }
    .verse-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      direction: rtl;
    }
    .verse-number-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      border-radius: 50%;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }
    .arabic-text {
      font-family: 'Amiri', serif;
      font-size: 38px;
      line-height: 1.8;
      color: #ffffff;
      flex: 1;
      direction: rtl;
    }
    .translation-text {
      margin-top: 16px;
      font-size: 18px;
      line-height: 1.6;
      color: #94a3b8;
      direction: ltr;
      text-align: left;
    }
    .verse-row.is-current-ayah .translation-text {
      color: #f1f5f9;
      font-weight: 500;
    }
    .word {
      display: inline;
      padding: 2px 4px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .word.is-current-word {
      background: rgba(251, 191, 36, 0.45) !important;
      color: #fef3c7 !important;
      box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
      border-radius: 8px;
      padding: 4px 8px;
    }
  </style>
</head>
<body>
  <div class="app-header">
    <div class="brand-logo">
      <span>✨ PEACE2074</span>
    </div>
    <div class="surah-heading-title">
      Surah ${chapter.transliteration} — ${chapter.name} (${chapter.type})
    </div>
  </div>

  <div class="recitation-banner">
    <div>▶ Reciting: Sheikh Mishary Rashid Alafasy • Verse ${activeVerse.verseNumber} of ${chapter.total_verses}</div>
    <div>PEACE2074 Reader App</div>
  </div>

  <div class="reader-scroll-container" id="readerContainer">
    ${verseRowsHtml}
  </div>

  <script>
    const el = document.getElementById('activeAyah');
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  </script>
</body>
</html>`
}

async function buildSurahVideoWithSyncedText(chapter: Chapter, tempDir: string): Promise<string> {
  const paddedSura = pad3(chapter.id)
  const outputVideo = path.join(OUTPUT_DIR, `surah_${paddedSura}_${chapter.transliteration.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`)

  if (fs.existsSync(outputVideo) && fs.statSync(outputVideo).size > 100000) {
    return outputVideo
  }

  console.log(`[Surah ${chapter.id}/${114}] 🎬 Screen-recording live PEACE2074 reader for: ${chapter.transliteration} (${chapter.name})...`)

  const { chromium } = await import('@playwright/test')

  // Playwright video recording dir
  const videoDir = path.join(tempDir, 'pw_video')
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
    colorScheme: 'dark',
  })
  const page = await context.newPage()

  // Set localStorage for word-level highlighting before navigating
  await page.addInitScript(() => {
    localStorage.setItem('quran-highlight-mode', 'word')
    localStorage.setItem('auto-continue-banner-dismissed', 'true')
    localStorage.setItem('consent-accepted', 'true')
    localStorage.setItem('cookie-consent', 'true')
  })

  // Inject CSS to force-hide all banners, notifications, and UI chrome for clean recording
  await page.addStyleTag({ content: `
    .q-banner,
    .autoplay-banner,
    [class*="auto-continue"],
    [class*="consent"],
    .q-notification,
    .q-notifications,
    .q-header,
    nav,
    .back-to-list,
    [class*="cookie"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
    }
  `})

  // Navigate to the live Quran reader page with dark theme and play=true
  const url = `https://peace2074.com/quran/${chapter.id}?play=true&theme=dark`
  console.log(`[Surah ${chapter.id}] 🌐 Opening ${url}`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

  // Wait for the verse text to fully render
  await page.waitForSelector('.verse-text-arabic, .arabic-text, [class*="verse"]', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(4000)

  // Inject persistent CSS and MutationObserver to hide any banners that appear dynamically
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      .q-banner, .autoplay-banner, [class*="auto-continue"], [class*="consent"],
      .q-notification, .q-notifications, .q-header, nav, .back-to-list,
      [class*="cookie"], .q-dialog, .q-dialog__backdrop {
        display: none !important; visibility: hidden !important;
        height: 0 !important; overflow: hidden !important;
      }
    `
    document.head.appendChild(style)

    // MutationObserver to catch any new banners
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.q-banner, .q-notification, .q-dialog, [class*="consent"], [class*="auto-continue"]').forEach((el: any) => {
        el.style.display = 'none'
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })

  // Click START RECITATION to bypass browser autoplay policy
  const startClicked = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button, [role="button"]'))
    for (const btn of allBtns) {
      const text = (btn as HTMLElement).textContent?.trim() || ''
      if (text.includes('START RECITATION') || text.includes('Start Recitation')) {
        (btn as HTMLElement).click()
        return 'start-recitation'
      }
    }
    document.body.click()
    return 'body-click'
  })
  console.log(`[Surah ${chapter.id}] ▶ Triggered playback via: ${startClicked}`)
  await page.waitForTimeout(2000)

  // Calculate expected duration from audio files
  let expectedDuration = 0
  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const fileKey = `${paddedSura}${pad3(verse)}.mp3`
    const localMp3 = path.join(tempDir, fileKey)

    if (!fs.existsSync(localMp3) || fs.statSync(localMp3).size < 100) {
      const urls = [
        `https://everyayah.com/data/Alafasy_128kbps/${fileKey}`,
        `https://mirrors.quranicaudio.com/everyayah/Alafasy_128kbps/${fileKey}`,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${fileKey}`,
      ]
      for (const u of urls) {
        try {
          const res = await fetch(u, { signal: AbortSignal.timeout(12000) })
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer())
            if (buf.length > 100) { fs.writeFileSync(localMp3, buf); break }
          }
        } catch {}
      }
    }

    if (fs.existsSync(localMp3)) {
      expectedDuration += getAudioDuration(localMp3)
    }
  }

  // Add a few seconds buffer
  const waitMs = Math.ceil((expectedDuration + 3) * 1000)
  console.log(`[Surah ${chapter.id}] ⏱️ Recording for ${Math.ceil(expectedDuration)}s (${chapter.total_verses} verses)...`)
  await page.waitForTimeout(waitMs)

  // Close context to finalize the video recording
  const videoFile = await page.video()?.path()
  await context.close()
  await browser.close()

  if (!videoFile || !fs.existsSync(videoFile)) {
    throw new Error(`Playwright video recording failed for Surah ${chapter.id}`)
  }

  // Now merge: Playwright's webm screen recording (video) + concatenated audio (mp3s)
  // 1. Concatenate all verse audio files into one full-surah audio
  const audioFiles: string[] = []
  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const localMp3 = path.join(tempDir, `${paddedSura}${pad3(verse)}.mp3`)
    if (fs.existsSync(localMp3)) audioFiles.push(localMp3)
  }

  const audioListFile = path.join(tempDir, 'audio_list.txt')
  fs.writeFileSync(audioListFile, audioFiles.map(f => `file '${f}'`).join('\n'))

  const fullAudio = path.join(tempDir, 'full_audio.mp3')
  execSync(`/usr/local/bin/ffmpeg -y -f concat -safe 0 -i "${audioListFile}" -c copy "${fullAudio}"`, { stdio: 'ignore' })

  // 2. Merge screen recording video + real recitation audio → final HD MP4
  execSync(
    `/usr/local/bin/ffmpeg -y -i "${videoFile}" -i "${fullAudio}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${outputVideo}"`,
    { stdio: 'ignore' }
  )

  // Save verse timestamps for YouTube description
  const verseTimestamps: { verse: number; timestamp: number; duration: number }[] = []
  let cumTime = 0
  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const localMp3 = path.join(tempDir, `${paddedSura}${pad3(verse)}.mp3`)
    const dur = fs.existsSync(localMp3) ? getAudioDuration(localMp3) : 0
    verseTimestamps.push({ verse, timestamp: cumTime, duration: dur })
    cumTime += dur
  }
  const chaptersFile = path.join(OUTPUT_DIR, `surah_${paddedSura}_chapters.json`)
  fs.writeFileSync(chaptersFile, JSON.stringify(verseTimestamps, null, 2))

  console.log(`[Surah ${chapter.id}] ✅ Screen recording complete → ${outputVideo}`)
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

  function formatTimestampSec(sec: number): string {
    const totalSec = Math.floor(sec)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = Math.floor(totalSec % 60)
    const p = (n: number) => String(n).padStart(2, '0')
    return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`
  }

  const paddedSura = pad3(chapter.id)
  const chaptersFile = path.join(OUTPUT_DIR, `surah_${paddedSura}_chapters.json`)
  let chaptersText = ''

  if (fs.existsSync(chaptersFile)) {
    try {
      const records: { verse: number; timestamp: number }[] = JSON.parse(fs.readFileSync(chaptersFile, 'utf8'))
      if (Array.isArray(records) && records.length > 0) {
        chaptersText = '\n\n📖 Verse Timestamp Chapters (Click to Jump):\n' +
          records.map((r) => `${formatTimestampSec(r.timestamp)} - Ayah ${r.verse}`).join('\n')
      }
    } catch {}
  }

  const title = `Surah ${chapter.id}. ${chapter.transliteration} (${chapter.name}) — Chapter ${chapter.id} of 114 | Peace2074 Quran Recitation`
  const webPlayerUrl = `https://peace2074.com/quran/${chapter.id}?play=true&theme=dark`
  const description = `Recitation of Surah ${chapter.transliteration} (${chapter.name} - ${chapter.translation}), Chapter ${chapter.id} of the Holy Quran (${chapter.total_verses} verses, ${chapter.type === 'meccan' ? 'Meccan' : 'Medinan'}). Recited by Sheikh Mishary Rashid Alafasy. Streamed on Peace2074.\n\n▶ Follow along with word-by-word highlighted text on Peace2074:\n${webPlayerUrl}${chaptersText}\n\nSubscribe to Peace2074: https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`
  const tags = ['Quran', `Surah ${chapter.transliteration}`, `Surah ${chapter.id}`, 'Peace2074', 'Quran Recitation', 'Mishary Alafasy', 'Holy Quran', 'Islam']

  try {
    const stats = fs.statSync(videoPath)
    const fileSize = stats.size

    // 1. Resumable Upload Session Init
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(fileSize),
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

    // 2. Binary Video Data Upload Stream
    const videoStream = fs.createReadStream(videoPath)
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(fileSize),
      },
      // @ts-ignore Node fetch supports stream body with duplex
      body: videoStream,
      duplex: 'half',
    })

    if (uploadRes.ok) {
      const data = (await uploadRes.json()) as { id: string }
      console.log(`[Surah ${chapter.id}/${114}] 🎉 Uploaded to YouTube! Video ID: ${data.id}`)

      const playlistId = await getOrCreatePlaylist(oauthToken)
      if (playlistId) {
        await addVideoToPlaylist(data.id, playlistId, oauthToken)
      }
      return data.id
    } else {
      const errText = await uploadRes.text()
      console.error(`[Surah ${chapter.id}] YouTube upload stream failed ${uploadRes.status}:`, errText)
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
