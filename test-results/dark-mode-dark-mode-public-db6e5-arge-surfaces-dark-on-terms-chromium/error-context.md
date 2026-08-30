# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /terms
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /terms: [
  {
    "selector": "div.q-banner.row.items-center",
    "backgroundColor": "rgba(255, 255, 255, 0.95)",
    "width": 960,
    "height": 66
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 8

- Array []
+ Array [
+   Object {
+     "backgroundColor": "rgba(255, 255, 255, 0.95)",
+     "height": 66,
+     "selector": "div.q-banner.row.items-center",
+     "width": 960,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - toolbar [ref=e7]:
        - button "Toggle menu" [ref=e8] [cursor=pointer]:
          - img [ref=e10]: menu
        - img "PEACE2074" [ref=e13]
        - link "Peace2074" [ref=e15] [cursor=pointer]:
          - /url: /
        - button "Search…" [ref=e16] [cursor=pointer]:
          - img [ref=e18]: search
        - button "Play Athan" [ref=e19] [cursor=pointer]:
          - img [ref=e21]: volume_up
        - button "Login" [ref=e22] [cursor=pointer]:
          - img [ref=e24]: login
    - main [ref=e26]:
      - generic [ref=e28]:
        - heading "Terms and Conditions" [level=1] [ref=e29]
        - paragraph [ref=e30]: Please read these terms and conditions carefully before using our website.
        - heading "Acceptance of Terms" [level=2] [ref=e31]
        - paragraph [ref=e32]: By accessing or using our website, you agree to be bound by these terms. If you do not agree, please do not use our site.
        - heading "Use of the Site" [level=2] [ref=e33]
        - list [ref=e34]:
          - listitem [ref=e35]: You must use the site in compliance with all applicable laws and regulations.
          - listitem [ref=e36]: You may not use the site for any unlawful or prohibited purpose.
        - heading "Location & Notifications" [level=2] [ref=e37]
        - paragraph [ref=e38]: By enabling prayer time notifications you consent to the app accessing your device location solely to calculate prayer times on-device. This data is never stored or shared. You may revoke location access or notification permission at any time in your device Settings.
        - heading "Intellectual Property" [level=2] [ref=e39]
        - paragraph [ref=e40]: All content on this site is the property of the site owner or its licensors and is protected by copyright laws.
        - heading "Limitation of Liability" [level=2] [ref=e41]
        - paragraph [ref=e42]: We are not liable for any damages arising from your use of the site.
        - heading "Changes to Terms" [level=2] [ref=e43]
        - paragraph [ref=e44]: We may update these terms at any time. Continued use of the site means you accept the new terms.
        - heading "contact" [level=2] [ref=e45]
        - paragraph [ref=e46]: If you have questions about our privacy policy, please contact us.
    - alert [ref=e47]:
      - generic [ref=e49]:
        - generic [ref=e50]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e51]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e52]:
        - button "Accept" [ref=e53] [cursor=pointer]:
          - generic [ref=e55]: Accept
        - button "Decline" [ref=e56] [cursor=pointer]:
          - generic [ref=e58]: Decline
    - contentinfo [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]:
          - img "decor" [ref=e62]
          - generic [ref=e63]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e64]:
          - link "About" [ref=e65] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e66] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e67] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e68] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e69] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e70] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
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
  54  |             await expect(page.locator('body')).toHaveClass(/body--dark/)
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
> 139 |             ).toEqual([])
      |               ^ Error: Found bright neutral surfaces in dark mode on /terms: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```