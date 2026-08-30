# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /miracles
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /miracles: [
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
          - generic [ref=e30]: calculate
          - heading "Quran Miracles" [level=1] [ref=e31]
          - paragraph [ref=e32]: Examples of numerical miracles in the Qur'an
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]:
              - generic [ref=e36]: balance
              - generic [ref=e37]: Repetition of opposite words
            - generic [ref=e38]: The numbers of some opposite words are equal, such as "the world" and "the hereafter" (115 times each), "angels" and "devils" (88 times each), and "light" and "darkness" (24 times each).
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]: auto_graph
              - generic [ref=e42]: Relationships between the numbers of words, letters, verses, and surahs
            - generic [ref=e43]: The focus is on numbers, such as the number of chapters in the Qur'an being 114.
          - generic [ref=e44]:
            - generic [ref=e45]:
              - generic [ref=e46]: hub
              - generic [ref=e47]: Relationships between words and concepts
            - generic [ref=e48]: Relating the number of times certain words are repeated to other numbers, such as the word "month" being repeated 12 times (the number of months in a year).
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: functions
              - generic [ref=e52]: Number of letters in the verses
            - generic [ref=e53]: It is worth noting that the number of letters in some verses corresponds to a specific number, such as the number of letters from the beginning of a particular verse to its end being the same number mentioned in the verse itself.
    - alert [ref=e54]:
      - generic [ref=e56]:
        - generic [ref=e57]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e58]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e59]:
        - button "Accept" [ref=e60] [cursor=pointer]:
          - generic [ref=e62]: Accept
        - button "Decline" [ref=e63] [cursor=pointer]:
          - generic [ref=e65]: Decline
    - contentinfo [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - img "decor" [ref=e69]
          - generic [ref=e70]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e71]:
          - link "About" [ref=e72] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e73] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e74] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e75] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e76] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e77] [cursor=pointer]:
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
      |               ^ Error: Found bright neutral surfaces in dark mode on /miracles: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```