import { chromium, devices, type Page } from '@playwright/test'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type ScreenshotTarget = {
    slug: string
    route: string
    selector: string
    delayMs: number
}

type DeviceConfig = {
    name: keyof typeof devices
    width: number
    height: number
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const configuredBaseUrl = process.env.SCREENSHOT_BASE_URL
const candidateBaseUrls = configuredBaseUrl
    ? [configuredBaseUrl]
    : ['http://127.0.0.1:4000', 'https://peace2074.com']
const outputDir = path.join(repoRoot, 'ios', 'App', 'fastlane', 'screenshots', 'en-US')

const deviceConfigs: DeviceConfig[] = [
    { name: 'iPhone 14 Plus', width: 428, height: 926 },
    { name: 'iPhone 11 Pro Max', width: 414, height: 896 },
]

const screenshotTargets: ScreenshotTarget[] = [
    { slug: '01-home', route: '/', selector: 'h1', delayMs: 600 },
    { slug: '02-quran-list', route: '/quran', selector: 'a.sura-card', delayMs: 800 },
    { slug: '03-quran-reader', route: '/quran/1/reader', selector: '.arabic-text', delayMs: 1200 },
]

let resolvedBaseUrl: string | null = configuredBaseUrl ?? null

async function gotoTarget(page: Page, route: string) {
    const baseUrls = resolvedBaseUrl ? [resolvedBaseUrl] : candidateBaseUrls
    let lastError: unknown = null

    for (const baseUrl of baseUrls) {
        try {
            const url = new URL(route, baseUrl).toString()
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
            if (!resolvedBaseUrl) {
                resolvedBaseUrl = baseUrl
                console.log(`using ${baseUrl}`)
            }
            return
        } catch (error) {
            lastError = error
        }
    }

    throw lastError
}

async function main() {
    await fs.rm(outputDir, { recursive: true, force: true })
    await fs.mkdir(outputDir, { recursive: true })

    const browser = await chromium.launch({ headless: true })

    try {
        for (const deviceConfig of deviceConfigs) {
            const device = devices[deviceConfig.name]
            if (!device) {
                throw new Error(`Missing Playwright device profile: ${deviceConfig.name}`)
            }

            const context = await browser.newContext({
                ...device,
                viewport: {
                    width: deviceConfig.width,
                    height: deviceConfig.height,
                },
                screen: {
                    width: deviceConfig.width,
                    height: deviceConfig.height,
                },
                locale: 'en-US',
                colorScheme: 'light',
            })

            try {
                await context.addInitScript(() => {
                    window.localStorage.setItem('app-locale', 'en')
                    window.localStorage.setItem('consent-banner-v1', 'accepted')
                    window.sessionStorage.setItem('support-ai-hidden', '1')
                })

                const page = await context.newPage()

                for (const target of screenshotTargets) {
                    await gotoTarget(page, target.route)
                    await page.locator(target.selector).first().waitFor({
                        state: 'visible',
                        timeout: 30000,
                    })
                    await page.addStyleTag({
                        content: `
              * { caret-color: transparent !important; }
                            .app-splash,
              .consent-banner { display: none !important; }
                            .support-ai-widget,
                            footer,
                            .q-footer { display: none !important; }
            `,
                    })
                    await page.evaluate(() => window.scrollTo(0, 0))
                    await page.waitForTimeout(target.delayMs)

                    const outputPath = path.join(outputDir, `${deviceConfig.name}-${target.slug}.png`)
                    await page.screenshot({ path: outputPath, fullPage: false })
                    console.log(`saved ${path.relative(repoRoot, outputPath)}`)
                }
            } finally {
                await context.close()
            }
        }
    } finally {
        await browser.close()
    }

    console.log(`done ${path.relative(repoRoot, outputDir)}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
