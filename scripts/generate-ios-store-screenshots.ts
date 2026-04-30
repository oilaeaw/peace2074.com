import { chromium, type Page } from '@playwright/test'
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
    label: string
    outputPrefix: string
    width: number
    height: number
    deviceScaleFactor: number
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const configuredBaseUrl = process.env.SCREENSHOT_BASE_URL
const candidateBaseUrls = configuredBaseUrl
    ? [configuredBaseUrl]
    : ['http://127.0.0.1:4000', 'https://peace2074.com']
const outputDir = path.join(repoRoot, 'ios', 'App', 'fastlane', 'screenshots', 'en-US')

const deviceConfigs: DeviceConfig[] = [
    {
        label: '6.7-inch iPhone (1290x2796)',
        outputPrefix: 'APP_IPHONE_67',
        width: 430,
        height: 932,
        deviceScaleFactor: 3,
    },
    {
        label: '6.5-inch iPhone (1242x2688)',
        outputPrefix: 'APP_IPHONE_65',
        width: 414,
        height: 896,
        deviceScaleFactor: 3,
    },
    {
        label: '3.5-inch iPhone (640x920)',
        outputPrefix: 'APP_IPHONE_35',
        width: 320,
        height: 460,
        deviceScaleFactor: 2,
    },
    {
        label: '13-inch iPad Pro (2064x2752)',
        outputPrefix: 'APP_IPAD_PRO_13',
        width: 1032,
        height: 1376,
        deviceScaleFactor: 2,
    },
    {
        label: '12.9-inch iPad Pro (2048x2732)',
        outputPrefix: 'IPAD_PRO_3GEN_129',
        width: 1024,
        height: 1366,
        deviceScaleFactor: 2,
    },
]

const screenshotTargets: ScreenshotTarget[] = [
    { slug: '01-home', route: '/', selector: 'h1', delayMs: 600 },
    { slug: '02-quran-list', route: '/quran', selector: 'a.sura-card', delayMs: 800 },
    { slug: '03-recitation', route: '/quran/1/reader', selector: '.arabic-text', delayMs: 1200 },
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
            console.log(`capturing ${deviceConfig.label}`)

            const context = await browser.newContext({
                viewport: {
                    width: deviceConfig.width,
                    height: deviceConfig.height,
                },
                screen: {
                    width: deviceConfig.width,
                    height: deviceConfig.height,
                },
                deviceScaleFactor: deviceConfig.deviceScaleFactor,
                isMobile: true,
                hasTouch: true,
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

                    const outputPath = path.join(outputDir, `${deviceConfig.outputPrefix}-${target.slug}.png`)
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
