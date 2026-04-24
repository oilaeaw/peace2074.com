import { test, expect } from '@playwright/test'

type DarkRouteCheck = {
    path: string
    readySelector: string
}

type SurfaceIssue = {
    selector: string
    backgroundColor: string
    width: number
    height: number
}

const darkRoutes: DarkRouteCheck[] = [
    { path: '/', readySelector: '.manifesto-card' },
    { path: '/quran', readySelector: 'a.sura-card' },
    { path: '/quran/12/reader', readySelector: '.reader-layout .arabic-block' },
    { path: '/quran/12/mushaf', readySelector: '.mushaf-page' },
    { path: '/quran/12/native', readySelector: '.native-layout' },
    { path: '/holynames', readySelector: '.glory-card' },
    { path: '/tasbeeh', readySelector: '.tasbeeh-card' },
    { path: '/miracles', readySelector: '.miracle-card' },
    { path: '/support', readySelector: '.support-card, .q-card, main' },
    { path: '/contact', readySelector: '.contact-card, .q-card, main' },
    { path: '/blog', readySelector: '.blog-list, .q-card, main' },
    { path: '/privacy', readySelector: 'main h1, main .my-card, main .q-card' },
    { path: '/terms', readySelector: 'main h1, main .my-card, main .q-card' },
]

const USTORE_NAMESPACE = 'peace2074'

function namespacedKey(key: string) {
    return `${USTORE_NAMESPACE}:${key}`
}

test.describe('dark mode public route smoke test', () => {
    for (const route of darkRoutes) {
        test(`keeps large surfaces dark on ${route.path}`, async ({ page }) => {
            await page.addInitScript(() => {
                localStorage.setItem('peace2074:pref-theme-mode', 'dark')
            })

            await page.goto(route.path)
            await page.waitForLoadState('networkidle')
            await expect
                .poll(async () =>
                    page.evaluate(
                        (key) => window.localStorage.getItem(key),
                        namespacedKey('pref-theme-mode')
                    )
                )
                .toBe('dark')
            await expect(page.locator('body')).toHaveClass(/body--dark/)
            await expect(page.locator(route.readySelector).first()).toBeVisible()

            const issues = await page.evaluate(() => {
                const parseColor = (value: string) => {
                    const match = value.match(/rgba?\(([^)]+)\)/i)
                    if (!match) return null

                    const [r, g, b, alpha = '1'] = match[1]
                        .split(',')
                        .map((segment) => segment.trim())

                    return {
                        r: Number.parseFloat(r),
                        g: Number.parseFloat(g),
                        b: Number.parseFloat(b),
                        alpha: Number.parseFloat(alpha),
                    }
                }

                const isBrightNeutral = (color: {
                    r: number
                    g: number
                    b: number
                    alpha: number
                }) => {
                    if (color.alpha < 0.85) return false

                    const values = [color.r, color.g, color.b]
                    const min = Math.min(...values)
                    const max = Math.max(...values)

                    return min >= 200 && max - min <= 35
                }

                const selectorsForElement = (element: Element) => {
                    const htmlElement = element as HTMLElement
                    const tag = element.tagName.toLowerCase()
                    const id = htmlElement.id ? `#${htmlElement.id}` : ''
                    const classNames = Array.from(htmlElement.classList)
                        .slice(0, 3)
                        .map((className) => `.${className}`)
                        .join('')

                    return `${tag}${id}${classNames}`
                }

                const elements = Array.from(document.body.querySelectorAll('*'))
                const offenders: SurfaceIssue[] = []

                for (const element of elements) {
                    if (!(element instanceof HTMLElement)) continue

                    const style = window.getComputedStyle(element)

                    if (
                        style.display === 'none' ||
                        style.visibility === 'hidden' ||
                        Number.parseFloat(style.opacity || '1') === 0
                    ) {
                        continue
                    }

                    const rect = element.getBoundingClientRect()
                    if (rect.width < 64 || rect.height < 64) continue

                    const color = parseColor(style.backgroundColor)
                    if (!color || !isBrightNeutral(color)) continue

                    offenders.push({
                        selector: selectorsForElement(element),
                        backgroundColor: style.backgroundColor,
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    })

                    if (offenders.length >= 10) break
                }

                return offenders
            })

            expect(
                issues,
                `Found bright neutral surfaces in dark mode on ${route.path}: ${JSON.stringify(issues, null, 2)}`
            ).toEqual([])
        })
    }
})
