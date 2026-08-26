import { defineEventHandler, readBody, getHeader } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

interface VideoUploadPayload {
  accessToken?: string
  title?: string
  description?: string
  tags?: string[] | string
  privacyStatus?: 'public' | 'unlisted' | 'private'
  videoPath?: string
}

const DEFAULT_CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'

/**
 * POST /api/youtube/upload
 * Resumable Video Uploader Endpoint for YouTube Data API v3
 * Uploads .mp4 video files directly to YouTube Channel Peace2074
 */
export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event).catch(() => ({}))
    const body: VideoUploadPayload = rawBody || {}

    const authHeader = getHeader(event, 'authorization') || ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    const token = body.accessToken || bearerToken || process.env.YOUTUBE_OAUTH_TOKEN

    if (!token) {
      return {
        ok: false,
        error: 'OAuth2 access_token is required to upload videos to YouTube. Pass token in Authorization header, body.accessToken, or set YOUTUBE_OAUTH_TOKEN in environment.',
        helpUrl: 'https://developers.google.com/youtube/v3/docs/videos/insert',
      }
    }

    const title = body.title || 'Surah Al-Fatihah — Peace2074 Quran Recitation'
    const description = body.description || 'Beautiful Quran Recitation of Surah Al-Fatihah. Listen, read, and reflect on Peace2074.'
    const privacyStatus = body.privacyStatus || 'public'

    let tagsArr = ['Quran', 'Surah Al-Fatihah', 'Peace2074', 'Quran Recitation', 'Islam']
    if (body.tags) {
      tagsArr = Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t) => t.trim())
    }

    let videoBuffer: Buffer | null = null

    if (body.videoPath && fs.existsSync(body.videoPath)) {
      videoBuffer = fs.readFileSync(body.videoPath)
    }

    if (!videoBuffer) {
      return {
        ok: false,
        error: 'No valid video file provided. Specify body.videoPath pointing to a valid .mp4 file.',
      }
    }

    // 1. Initiate Resumable Upload Session with YouTube API
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(videoBuffer.length),
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            tags: tagsArr,
            categoryId: '22', // People & Blogs / Education
          },
          status: {
            privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    )

    if (!initRes.ok) {
      const errText = await initRes.text()
      console.error('[YouTube Upload Init Failed]:', errText)
      return {
        ok: false,
        status: initRes.status,
        error: `Failed to initiate YouTube video upload session (${initRes.status})`,
        details: errText,
      }
    }

    const uploadUrl = initRes.headers.get('location')
    if (!uploadUrl) {
      return { ok: false, error: 'YouTube API did not return upload location URL' }
    }

    // 2. Upload Video Binary Data
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length),
      },
      body: videoBuffer,
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      return {
        ok: false,
        status: uploadRes.status,
        error: `Video binary upload failed (${uploadRes.status})`,
        details: errText,
      }
    }

    const videoData = await uploadRes.json()

    return {
      ok: true,
      message: `Successfully uploaded video "${title}" to YouTube channel Peace2074!`,
      videoId: videoData.id,
      url: `https://www.youtube.com/watch?v=${videoData.id}`,
      videoData,
    }
  } catch (err: any) {
    console.error('[YouTube Upload Error]:', err)
    return { ok: false, error: err?.message || 'Failed to upload video to YouTube' }
  }
})
