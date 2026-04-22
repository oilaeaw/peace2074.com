/**
 * Generate Mac App Store screenshots at all required sizes.
 *
 * Required sizes:
 *   1280 × 800  (13" Retina — 1x)
 *   1440 × 900  (15" Retina — 1x)
 *   2560 × 1600 (13" Retina — 2x)
 *   2880 × 1800 (15" Retina — 2x)
 *
 * Usage:
 *   pnpm dlx playwright install chromium
 *   node scripts/capture-mac-screenshots.mjs [https://peace2074.com]
 *
 * Output: screenshots/mac/
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE =
  process.argv.find((a) => a.startsWith('http')) ?? 'https://peace2074.com'
const OUT = path.resolve('screenshots/mac')

const SIZES = [
  { w: 1280, h: 800, label: '1280x800' },
  { w: 1440, h: 900, label: '1440x900' },
  { w: 2560, h: 1600, label: '2560x1600' },
  { w: 2880, h: 1800, label: '2880x1800' },
]

// Pages to capture — name becomes the filename prefix
const PAGES = [
  { name: '01-home', path: '/' },
  { name: '02-quran', path: '/quran' },
  { name: '03-sura-1', path: '/quran/1' },
  { name: '04-tasbeeh', path: '/tasbeeh' },
  { name: '05-holynames', path: '/holynames' },
  { name: '06-settings', path: '/settings' },
]

// Wait for Vue app to hydrate and images to settle
async function waitForApp(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForSelector('#app', { timeout: 10000 }).catch(() => {})
  // Let fonts/animations settle
  await page.waitForTimeout(1200)
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

for (const size of SIZES) {
  console.log(`\n── ${size.label} ──`)
  const dir = path.join(OUT, size.label)
  await mkdir(dir, { recursive: true })

  const context = await browser.newContext({
    viewport: { width: size.w, height: size.h },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  })
  const page = await context.newPage()

  for (const pg of PAGES) {
    const url = `${BASE}${pg.path}`
    console.log(`  → ${url}`)
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await waitForApp(page)
      const file = path.join(dir, `${pg.name}.png`)
      await page.screenshot({ path: file, fullPage: false })
      console.log(`    ✔ ${file}`)
    } catch (err) {
      console.warn(`    ✖ failed: ${err.message}`)
    }
  }

  await context.close()
}

await browser.close()

console.log(`\n✅ Screenshots saved to ${OUT}`)
console.log('Upload them in App Store Connect → Mac → Screenshots\n')
