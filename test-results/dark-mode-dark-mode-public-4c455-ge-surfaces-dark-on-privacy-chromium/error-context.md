# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /privacy
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /privacy: [
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
        - heading "Privacy Policy" [level=1] [ref=e29]
        - paragraph [ref=e30]: Your privacy is important to us. This page explains how we collect, use, and protect your information when you use our website.
        - heading "Information We Collect" [level=2] [ref=e31]
        - list [ref=e32]:
          - listitem [ref=e33]: Basic account information (such as email address) if you register or log in.
          - listitem [ref=e34]: Usage data and cookies to improve your experience.
        - heading "How We Use Information" [level=2] [ref=e35]
        - list [ref=e36]:
          - listitem [ref=e37]: To provide and maintain our services.
          - listitem [ref=e38]: To improve and personalize your experience.
          - listitem [ref=e39]: To communicate with you about updates or support.
          - listitem [ref=e40]: To calculate accurate prayer times based on your location and notify you when it is time to pray.
        - heading "Location Services" [level=2] [ref=e41]
        - paragraph [ref=e42]: On iPhone and iPad, the app may request access to your device's location in order to calculate accurate Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for your area. Location data is used only on-device to compute prayer times — it is never transmitted to our servers, stored, or shared with third parties. You can deny or revoke location permission at any time in your device Settings; the app will then fall back to a default location (Jerusalem). The Apple TV app does not use location services.
        - heading "Push Notifications" [level=2] [ref=e43]
        - paragraph [ref=e44]: The app may send you push notifications to alert you when a prayer time begins, so the Adhan (call to prayer) can play on time. Notifications are sent only if you explicitly grant permission. You can disable them at any time from your device Settings or from within the app.
        - heading "Cookies" [level=2] [ref=e45]
        - paragraph [ref=e46]: We use cookies to remember your preferences and enhance your experience. You can accept or decline cookies using the banner at the bottom of the site.
        - heading "Data Security" [level=2] [ref=e47]
        - paragraph [ref=e48]: We take reasonable measures to protect your data, but no system is 100% secure.
        - heading "Apple TV & Native Apps" [level=2] [ref=e49]
        - paragraph [ref=e50]: The PEACE2074 app is available on iPhone, iPad, and Apple TV. The Apple TV app does not use the microphone, camera, location services, or push notifications. Session authentication uses secure HTTP-only cookies — no personal data is stored locally on the device. If you use iCloud, your device handles iCloud sync independently of our servers.
        - heading "contact" [level=2] [ref=e51]
        - paragraph [ref=e52]: If you have questions about our privacy policy, please contact us.
    - alert [ref=e53]:
      - generic [ref=e55]:
        - generic [ref=e56]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e57]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e58]:
        - button "Accept" [ref=e59] [cursor=pointer]:
          - generic [ref=e61]: Accept
        - button "Decline" [ref=e62] [cursor=pointer]:
          - generic [ref=e64]: Decline
    - contentinfo [ref=e65]:
      - generic [ref=e66]:
        - generic [ref=e67]:
          - img "decor" [ref=e68]
          - generic [ref=e69]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e70]:
          - link "About" [ref=e71] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e72] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e73] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e74] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e75] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e76] [cursor=pointer]:
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
      |               ^ Error: Found bright neutral surfaces in dark mode on /privacy: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```