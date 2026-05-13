# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('body')
Expected pattern: /body--dark/
Received string:  ""
Timeout: 5000ms

Call log:
  - Expect "toHaveClass" with timeout 5000ms
  - waiting for locator('body')
    9 × locator resolved to <body>…</body>
      - unexpected value ""

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Peace2074
  - generic [ref=e5]: Loading...
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | type DarkRouteCheck = {
  4   |     path: string
  5   |     readySelector: string
  6   | }
  7   | 
  8   | type SurfaceIssue = {
  9   |     selector: string
  10  |     backgroundColor: string
  11  |     width: number
  12  |     height: number
  13  | }
  14  | 
  15  | const darkRoutes: DarkRouteCheck[] = [
  16  |     { path: '/', readySelector: '.manifesto-card' },
  17  |     { path: '/quran', readySelector: 'a.sura-card' },
  18  |     { path: '/quran/12/reader', readySelector: '.reader-layout .arabic-block' },
  19  |     { path: '/quran/12/mushaf', readySelector: '.mushaf-page' },
  20  |     { path: '/quran/12/native', readySelector: '.native-layout' },
  21  |     { path: '/holynames', readySelector: '.glory-card' },
  22  |     { path: '/tasbeeh', readySelector: '.tasbeeh-card' },
  23  |     { path: '/miracles', readySelector: '.miracle-card' },
  24  |     { path: '/support', readySelector: '.support-card, .q-card, main' },
  25  |     { path: '/contact', readySelector: '.contact-card, .q-card, main' },
  26  |     { path: '/blog', readySelector: '.blog-list, .q-card, main' },
  27  |     { path: '/privacy', readySelector: 'main h1, main .my-card, main .q-card' },
  28  |     { path: '/terms', readySelector: 'main h1, main .my-card, main .q-card' },
  29  | ]
  30  | 
  31  | const USTORE_NAMESPACE = 'peace2074'
  32  | 
  33  | function namespacedKey(key: string) {
  34  |     return `${USTORE_NAMESPACE}:${key}`
  35  | }
  36  | 
  37  | test.describe('dark mode public route smoke test', () => {
  38  |     for (const route of darkRoutes) {
  39  |         test(`keeps large surfaces dark on ${route.path}`, async ({ page }) => {
  40  |             await page.addInitScript(() => {
  41  |                 localStorage.setItem('peace2074:pref-theme-mode', 'dark')
  42  |             })
  43  | 
  44  |             await page.goto(route.path)
  45  |             await page.waitForLoadState('networkidle')
  46  |             await expect
  47  |                 .poll(async () =>
  48  |                     page.evaluate(
  49  |                         (key) => window.localStorage.getItem(key),
  50  |                         namespacedKey('pref-theme-mode')
  51  |                     )
  52  |                 )
  53  |                 .toBe('dark')
> 54  |             await expect(page.locator('body')).toHaveClass(/body--dark/)
      |                                                ^ Error: expect(locator).toHaveClass(expected) failed
  55  |             await expect(page.locator(route.readySelector).first()).toBeVisible()
  56  | 
  57  |             const issues = await page.evaluate(() => {
  58  |                 const parseColor = (value: string) => {
  59  |                     const match = value.match(/rgba?\(([^)]+)\)/i)
  60  |                     if (!match) return null
  61  | 
  62  |                     const [r, g, b, alpha = '1'] = match[1]
  63  |                         .split(',')
  64  |                         .map((segment) => segment.trim())
  65  | 
  66  |                     return {
  67  |                         r: Number.parseFloat(r),
  68  |                         g: Number.parseFloat(g),
  69  |                         b: Number.parseFloat(b),
  70  |                         alpha: Number.parseFloat(alpha),
  71  |                     }
  72  |                 }
  73  | 
  74  |                 const isBrightNeutral = (color: {
  75  |                     r: number
  76  |                     g: number
  77  |                     b: number
  78  |                     alpha: number
  79  |                 }) => {
  80  |                     if (color.alpha < 0.85) return false
  81  | 
  82  |                     const values = [color.r, color.g, color.b]
  83  |                     const min = Math.min(...values)
  84  |                     const max = Math.max(...values)
  85  | 
  86  |                     return min >= 200 && max - min <= 35
  87  |                 }
  88  | 
  89  |                 const selectorsForElement = (element: Element) => {
  90  |                     const htmlElement = element as HTMLElement
  91  |                     const tag = element.tagName.toLowerCase()
  92  |                     const id = htmlElement.id ? `#${htmlElement.id}` : ''
  93  |                     const classNames = Array.from(htmlElement.classList)
  94  |                         .slice(0, 3)
  95  |                         .map((className) => `.${className}`)
  96  |                         .join('')
  97  | 
  98  |                     return `${tag}${id}${classNames}`
  99  |                 }
  100 | 
  101 |                 const elements = Array.from(document.body.querySelectorAll('*'))
  102 |                 const offenders: SurfaceIssue[] = []
  103 | 
  104 |                 for (const element of elements) {
  105 |                     if (!(element instanceof HTMLElement)) continue
  106 | 
  107 |                     const style = window.getComputedStyle(element)
  108 | 
  109 |                     if (
  110 |                         style.display === 'none' ||
  111 |                         style.visibility === 'hidden' ||
  112 |                         Number.parseFloat(style.opacity || '1') === 0
  113 |                     ) {
  114 |                         continue
  115 |                     }
  116 | 
  117 |                     const rect = element.getBoundingClientRect()
  118 |                     if (rect.width < 64 || rect.height < 64) continue
  119 | 
  120 |                     const color = parseColor(style.backgroundColor)
  121 |                     if (!color || !isBrightNeutral(color)) continue
  122 | 
  123 |                     offenders.push({
  124 |                         selector: selectorsForElement(element),
  125 |                         backgroundColor: style.backgroundColor,
  126 |                         width: Math.round(rect.width),
  127 |                         height: Math.round(rect.height),
  128 |                     })
  129 | 
  130 |                     if (offenders.length >= 10) break
  131 |                 }
  132 | 
  133 |                 return offenders
  134 |             })
  135 | 
  136 |             expect(
  137 |                 issues,
  138 |                 `Found bright neutral surfaces in dark mode on ${route.path}: ${JSON.stringify(issues, null, 2)}`
  139 |             ).toEqual([])
  140 |         })
  141 |     }
  142 | })
  143 | 
```