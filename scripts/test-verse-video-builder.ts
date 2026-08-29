import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { chromium } from '@playwright/test'

interface Chapter {
  id: number
  name: string
  transliteration: string
  translation: string
  type: string
  total_verses: number
}

interface VerseContent {
  verseNumber: number
  arabicText: string
  translationText: string
}

function pad3(num: number): string {
  return String(num).padStart(3, '0')
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

async function testBuildSurahVideo(surahId: number) {
  console.log(`🚀 Testing synced video builder for Surah ${surahId}...`)

  const chapters: Chapter[] = JSON.parse(fs.readFileSync(path.join('src', 'shared', 'data', 'chapters', 'en.json'), 'utf8'))
  const chapter = chapters.find((c) => c.id === surahId)
  if (!chapter) throw new Error('Chapter not found')

  const tempDir = path.join('/tmp', `test_surah_${pad3(surahId)}`)
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

  const outputDir = path.join('output_videos')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const versesData = await fetchSurahVersesData(surahId)
  console.log(`Loaded ${versesData.length} verses data for Surah ${chapter.transliteration}`)

  // Launch Playwright
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  const segmentVideos: string[] = []

  for (let verse = 1; verse <= chapter.total_verses; verse++) {
    const paddedSura = pad3(surahId)
    const paddedVerse = pad3(verse)
    const fileKey = `${paddedSura}${paddedVerse}.mp3`
    const localMp3 = path.join(tempDir, fileKey)
    const url = `https://everyayah.com/data/Alafasy_128kbps/${fileKey}`

    if (!fs.existsSync(localMp3) || fs.statSync(localMp3).size < 100) {
      execSync(`curl -sSL --connect-timeout 10 --retry 3 "${url}" -o "${localMp3}"`, { stdio: 'ignore' })
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

    console.log(`Rendering verse segment ${verse}/${chapter.total_verses} (duration: ${duration.toFixed(2)}s)...`)
    execSync(
      `/usr/local/bin/ffmpeg -y -loop 1 -i "${cardPng}" -i "${localMp3}" -t ${duration} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p "${segmentMp4}"`,
      { stdio: 'ignore' }
    )

    segmentVideos.push(segmentMp4)
  }

  await browser.close()

  // Concat all segment MP4s
  const concatListFile = path.join(tempDir, 'segments_list.txt')
  const concatContent = segmentVideos.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(concatListFile, concatContent)

  const finalVideo = path.join(outputDir, `surah_${pad3(surahId)}_${chapter.transliteration.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`)
  console.log(`Concatenating segments into final video: ${finalVideo}...`)
  execSync(
    `/usr/local/bin/ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c copy "${finalVideo}"`,
    { stdio: 'ignore' }
  )

  console.log(`🎉 Successfully rendered synced video for Surah ${chapter.transliteration}! File: ${finalVideo}`)
}

testBuildSurahVideo(1).catch(console.error)
