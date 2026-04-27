/**
 * Creates the App Review demo account on the production API,
 * then seeds it with representative bookmarks.
 *
 * Usage:
 *   node scripts/seed-demo-account.mjs [--base https://peace2074.com]
 *
 * The script is idempotent — if the account already exists it just
 * logs in and re-seeds any bookmarks that are not yet present.
 */

const DEFAULT_BASE = 'https://peace2074.com'
const explicitBaseIndex = process.argv.findIndex((arg) => arg === '--base')
const explicitBase =
  explicitBaseIndex >= 0 ? process.argv[explicitBaseIndex + 1] : null
const positionalBase =
  process.argv.find((arg) => arg.startsWith('http')) ?? null
const base = explicitBase || positionalBase || DEFAULT_BASE

const DEMO_EMAIL = 'demo@peace2074.com'
const DEMO_PASSWORD = 'Demo2074!Review'
const DEMO_USERNAME = 'appreview'

// A handful of representative sura:ayah bookmarks that demonstrate the feature
const DEMO_BOOKMARKS = [
  '1:1', // Al-Fatiha – first ayah
  '1:7', // Al-Fatiha – last ayah
  '2:255', // Ayat Al-Kursi
  '2:286', // Last ayah of Al-Baqara
  '18:1', // Al-Kahf – start
  '36:1', // Ya-Sin – start
  '55:1', // Ar-Rahman – start
  '112:1', // Al-Ikhlas
]

// ─── helpers ────────────────────────────────────────────────────────────────

async function post(path, body, cookieJar) {
  const headers = { 'Content-Type': 'application/json' }
  if (cookieJar?.cookie) headers['Cookie'] = cookieJar.cookie

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    redirect: 'follow',
  })

  // Capture session cookie
  if (cookieJar != null) {
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) cookieJar.cookie = setCookie.split(';')[0]
  }

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { _raw: text }
  }

  return { status: res.status, ok: res.ok, json }
}

async function get(path, cookieJar) {
  const headers = {}
  if (cookieJar?.cookie) headers['Cookie'] = cookieJar.cookie

  const res = await fetch(`${base}${path}`, { headers })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, ok: res.ok, json }
}

// ─── main ───────────────────────────────────────────────────────────────────

const jar = { cookie: null }

// 1. Try to sign up
console.log(`\n→ Creating demo account at ${base} …`)
const signup = await post(
  '/api/auth/signup',
  {
    username: DEMO_USERNAME,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    first_name: 'App',
    last_name: 'Review',
  },
  null
)

if (signup.ok) {
  console.log('  ✔ Account created')
} else if (signup.status === 409) {
  console.log('  ℹ Account already exists — logging in instead')
} else {
  console.error('  ✖ Unexpected signup error:', signup.json)
  process.exit(1)
}

// 2. Log in to get a session cookie
console.log('→ Logging in …')
const login = await post(
  '/api/auth/login',
  {
    username: DEMO_USERNAME,
    password: DEMO_PASSWORD,
  },
  jar
)

if (!login.ok) {
  console.error('  ✖ Login failed:', login.json)
  process.exit(1)
}
console.log('  ✔ Logged in, session cookie captured')

// 3. Fetch existing bookmarks
const existing = await get('/api/bookmarks', jar)
const existingKeys = new Set(
  (existing.json?.bookmarks ?? []).map((b) => b.bookmark)
)
console.log(`  ℹ ${existingKeys.size} bookmark(s) already on account`)

// 4. Seed missing bookmarks
let added = 0
for (const bm of DEMO_BOOKMARKS) {
  if (existingKeys.has(bm)) continue
  const r = await post('/api/bookmarks', { bookmark: bm }, jar)
  if (r.ok) {
    console.log(`  ✔ Bookmark added: ${bm}`)
    added++
  } else {
    console.warn(`  ⚠ Failed to add ${bm}:`, r.json)
  }
}

console.log(`\n✅ Done — ${added} new bookmark(s) seeded.\n`)
console.log('App Store Connect credentials:')
console.log(`  Email:    ${DEMO_EMAIL}`)
console.log(`  Password: ${DEMO_PASSWORD}`)
console.log('\nPaste these into:')
console.log(
  '  App Store Connect → Your App → App Review Information → Demo Account\n'
)
