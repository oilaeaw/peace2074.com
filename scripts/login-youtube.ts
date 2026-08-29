import http from 'node:http'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const CLIENT_ID = process.env.NITRO_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.NITRO_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || ''
const PORT = process.env.AUTH_PORT ? parseInt(process.env.AUTH_PORT, 10) : 8080
const REDIRECT_URI = `http://localhost:${PORT}/api/auth/google/callback`

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
].join(' ')

async function main() {
  console.log('================================================================')
  console.log('🔒 AUTOMATED YOUTUBE ONE-CLICK AUTHENTICATION HELPER')
  console.log('================================================================')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', SCOPES)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url || '/', `http://localhost:${PORT}`)
      console.log(`[HTTP Request] Path: ${reqUrl.pathname}`)

      if (reqUrl.pathname.includes('/api/auth/google/callback') || reqUrl.pathname === '/callback') {
        const code = reqUrl.searchParams.get('code')
        const error = reqUrl.searchParams.get('error')

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(`<h1>Authentication Failed</h1><p>${error}</p><p><a href="${authUrl.toString()}">Try Again</a></p>`)
          console.error(`❌ Authentication error: ${error}`)
          return
        }

        if (code) {
          console.log('\n🔑 Received authorization code! Exchanging with Google for access token...')
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code',
            }),
          })

          const tokenData = await tokenRes.json()

          if (tokenData.access_token) {
            console.log('🎉 Successfully authenticated with YouTube!')

            // Save to .env
            const envPath = path.join(process.cwd(), '.env')
            let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
            if (envContent.includes('YOUTUBE_OAUTH_TOKEN=')) {
              envContent = envContent.replace(/YOUTUBE_OAUTH_TOKEN=.* /g, `YOUTUBE_OAUTH_TOKEN="${tokenData.access_token}"`)
            } else {
              envContent += `\nYOUTUBE_OAUTH_TOKEN="${tokenData.access_token}"\n`
            }
            fs.writeFileSync(envPath, envContent)
            console.log('💾 Saved YOUTUBE_OAUTH_TOKEN to .env file.')

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <html>
                <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white;">
                  <h1 style="color: #4ade80;">✅ YouTube Authentication Successful!</h1>
                  <p style="font-size: 1.2rem;">Peace2074 will now automatically upload your Quran videos and build your playlist.</p>
                  <p>You can safely close this browser window now.</p>
                </body>
              </html>
            `)

            server.close()

            // Trigger video generator and uploader script
            console.log('\n🚀 Triggering automated video generation and YouTube playlist upload...')
            const child = exec(`YOUTUBE_OAUTH_TOKEN="${tokenData.access_token}" node --experimental-strip-types scripts/batch-generate-114-surah-videos.ts 1`, (err, stdout, stderr) => {
              if (err) console.error('Upload process error:', err)
            })
            child.stdout?.pipe(process.stdout)
            child.stderr?.pipe(process.stderr)
          } else {
            console.error('❌ Token exchange failed:', tokenData)
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`<h1>Token Exchange Failed</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre><p><a href="${authUrl.toString()}">Click here to re-authorize</a></p>`)
          }
        }
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<h1>Peace2074 Auth Listener</h1><p>Waiting for Google Auth callback...</p><p><a href="${authUrl.toString()}">Click here to Sign In with Google</a></p>`)
      }
    } catch (err: any) {
      console.error('Server error:', err)
    }
  })

  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT} for OAuth callback...`)
    console.log('\n🌐 Opening Google Authentication in your web browser...')
    exec(`open "${authUrl.toString()}"`)
  })
}

main().catch(console.error)
