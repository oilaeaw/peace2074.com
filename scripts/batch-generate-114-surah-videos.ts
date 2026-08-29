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

function formatSrtTime(seconds: number): string {
  const date = new Date(0)
  date.setUTCMilliseconds(Math.floor(seconds * 1000))
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss},${ms}`
}

async function downloadSurahAudio(chapter: Chapter, tempDir: string): Promise<{ audioPath: string; srtPath: string | null }> {
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

  // Generate synchronized subtitles with Arabic text and English translation
  let srtPath: string | null = null
  try {
    const versesData = await fetchSurahVersesData(chapter.id)
    if (versesData.length > 0) {
      srtPath = path.join(tempDir, `surah_${paddedSura}.srt`)
      let srtContent = ''
      let currentTime = 0

      for (let i = 0; i < mp3Files.length; i++) {
        const mp3 = mp3Files[i]
        const verseNum = i + 1
        const verseData = versesData.find((v) => v.verseNumber === verseNum) || {
          verseNumber: verseNum,
          arabicText: '',
          translationText: '',
        }

        const duration = getAudioDuration(mp3)
        const startTime = currentTime
        const endTime = currentTime + duration
        currentTime = endTime

        const startSrt = formatSrtTime(startTime)
        const endSrt = formatSrtTime(endTime)

        srtContent += `${i + 1}\n`
        srtContent += `${startSrt} --> ${endSrt}\n`
        srtContent += `Surah ${chapter.transliteration} [${chapter.id}:${verseNum}]\n`
        if (verseData.arabicText) srtContent += `${verseData.arabicText}\n`
        if (verseData.translationText) srtContent += `${verseData.translationText}\n`
        srtContent += '\n'
      }
      fs.writeFileSync(srtPath, srtContent, 'utf8')
    }
  } catch (err: any) {
    console.warn(`[Surah ${chapter.id}] Could not generate subtitles:`, err?.message || err)
  }

  return { audioPath: outputAudio, srtPath }
}

async function generateSurahVideo(chapter: Chapter, audioPath: string, srtPath: string | null): Promise<string> {
  const paddedSura = pad3(chapter.id)
  const outputVideo = path.join(OUTPUT_DIR, `surah_${paddedSura}_${chapter.transliteration.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`)

  if (fs.existsSync(outputVideo) && fs.statSync(outputVideo).size > 100000) {
    return outputVideo
  }

  console.log(`[Surah ${chapter.id}/${114}] Rendering HD video with synchronized verse text: ${chapter.transliteration} (${chapter.name})...`)

  let videoFilter = ''
  if (srtPath && fs.existsSync(srtPath)) {
    const escapedSrt = srtPath.replace(/'/g, "'\\''").replace(/:/g, '\\:')
    videoFilter = `-vf "subtitles='${escapedSrt}':force_style='FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=4,Alignment=2,MarginV=50'"`
  }

  const ffmpegCmd = `/usr/local/bin/ffmpeg -y -loop 1 -i "${BANNER_IMAGE}" -i "${audioPath}" ${videoFilter} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputVideo}"`
  execSync(ffmpegCmd, { stdio: 'ignore' })

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
      
      const { audioPath, srtPath } = await downloadSurahAudio(chapter, tempDir)
      const videoPath = await generateSurahVideo(chapter, audioPath, srtPath)
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
