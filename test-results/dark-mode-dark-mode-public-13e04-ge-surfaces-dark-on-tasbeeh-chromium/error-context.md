# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /tasbeeh
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /tasbeeh: [
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
      - generic [ref=e27]:
        - generic [ref=e28]:
          - button "Back" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]:
              - img [ref=e31]: arrow_back
              - text: Back
          - heading "Digital Tasbeeh" [level=1] [ref=e32]
          - paragraph [ref=e33]: Islamic Prayer Beads
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: سُبْحَانَ اللّٰهِ
            - generic [ref=e37]: SubhanAllah
            - generic [ref=e38]: Glory be to Allah
          - generic [ref=e39]:
            - generic [ref=e40]: chevron_left
            - generic [ref=e41]: Swipe to change
            - generic [ref=e42]: chevron_right
        - generic [ref=e43]:
          - generic [ref=e44] [cursor=pointer]:
            - generic [ref=e45]: "0"
            - generic [ref=e46]: / 33
          - progressbar [ref=e48]:
            - img [ref=e49]
        - generic [ref=e52]:
          - button [ref=e53] [cursor=pointer]:
            - generic [ref=e55]: touch_app
          - paragraph [ref=e56]: Tap to Count
        - generic [ref=e57]:
          - generic [ref=e58]:
            - button "Reset" [ref=e59] [cursor=pointer]:
              - generic [ref=e60]:
                - img [ref=e61]: refresh
                - generic [ref=e62]: Reset
            - button "Settings" [ref=e63] [cursor=pointer]:
              - generic [ref=e64]:
                - img [ref=e65]: settings
                - generic [ref=e66]: Settings
          - generic [ref=e68]:
            - button "33" [pressed] [ref=e69] [cursor=pointer]:
              - generic [ref=e71]: "33"
            - button "99" [ref=e72] [cursor=pointer]:
              - generic [ref=e74]: "99"
            - button "100" [ref=e75] [cursor=pointer]:
              - generic [ref=e77]: "100"
            - button "∞" [ref=e78] [cursor=pointer]:
              - generic [ref=e80]: ∞
        - generic [ref=e81]:
          - heading "Select Dhikr Phrase" [level=3] [ref=e82]
          - generic [ref=e83]:
            - generic [ref=e84] [cursor=pointer]:
              - generic [ref=e85]: سُبْحَانَ اللّٰهِ
              - generic [ref=e86]: SubhanAllah
            - generic [ref=e87] [cursor=pointer]:
              - generic [ref=e88]: الْحَمْدُ لِلّٰهِ
              - generic [ref=e89]: Alhamdulillah
            - generic [ref=e90] [cursor=pointer]:
              - generic [ref=e91]: اللّٰهُ أَكْبَرُ
              - generic [ref=e92]: Allahu Akbar
            - generic [ref=e93] [cursor=pointer]:
              - generic [ref=e94]: لَا إِلٰهَ إِلَّا اللّٰهُ
              - generic [ref=e95]: La ilaha illa Allah
            - generic [ref=e96] [cursor=pointer]:
              - generic [ref=e97]: أَسْتَغْفِرُ اللّٰهَ
              - generic [ref=e98]: Astaghfirullah
            - generic [ref=e99] [cursor=pointer]:
              - generic [ref=e100]: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ
              - generic [ref=e101]: La hawla wa la quwwata illa billah
        - generic [ref=e102]:
          - heading "Today's Statistics" [level=3] [ref=e103]
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]: "0"
              - generic [ref=e107]: Total
            - generic [ref=e108]:
              - generic [ref=e109]: "0"
              - generic [ref=e110]: Sessions
            - generic [ref=e111]:
              - generic [ref=e112]: "0"
              - generic [ref=e113]: Completed Sets
    - alert [ref=e114]:
      - generic [ref=e116]:
        - generic [ref=e117]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e118]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e119]:
        - button "Accept" [ref=e120] [cursor=pointer]:
          - generic [ref=e122]: Accept
        - button "Decline" [ref=e123] [cursor=pointer]:
          - generic [ref=e125]: Decline
    - contentinfo [ref=e126]:
      - generic [ref=e127]:
        - generic [ref=e128]:
          - img "decor" [ref=e129]
          - generic [ref=e130]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e131]:
          - link "About" [ref=e132] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e133] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e134] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e135] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e136] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e137] [cursor=pointer]:
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
      |               ^ Error: Found bright neutral surfaces in dark mode on /tasbeeh: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```