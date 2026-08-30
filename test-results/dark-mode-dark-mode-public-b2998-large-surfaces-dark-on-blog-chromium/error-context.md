# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /blog
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /blog: [
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
        - heading "Blog" [level=1] [ref=e28]
        - paragraph [ref=e29]: Updates, tips, and reflections.
      - alert [ref=e31]:
        - generic [ref=e33]: lock
        - generic [ref=e34]: You must be logged in to create or edit blog posts.
        - button "Login" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]:
            - img [ref=e38]: login
            - generic [ref=e39]: Login
      - generic [ref=e40]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]:
              - generic [ref=e45]: به PEACE2074 خوش آمدید — فضایی آرام برای قرائت و تدبر قرآن
              - generic [ref=e46]: 8/30/2026
            - generic [ref=e47]:
              - generic [ref=e48]:
                - status [ref=e49]: persian
                - status [ref=e50]: فارسی
                - status [ref=e51]: welcome
                - status [ref=e52]: quran
                - status [ref=e53]: peace2074
              - button [ref=e55] [cursor=pointer]:
                - img [ref=e57]: favorite_border
          - generic [ref=e58]: خوش‌آمدگویی صمیمانه به کاربران فارسی‌زبان. فضایی نورانی و آرام برای قرائت قرآن کریم، تسبیح و ذکر.
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e63]: You Are Not Alone — A Gentle Word on Hard Days
              - generic [ref=e64]: 6/20/2026
            - generic [ref=e65]:
              - generic [ref=e66]:
                - status [ref=e67]: hope
                - status [ref=e68]: community
                - status [ref=e69]: welcome
                - status [ref=e70]: inspiration
                - status [ref=e71]: accessibility
              - button [ref=e73] [cursor=pointer]:
                - img [ref=e75]: favorite_border
          - generic [ref=e76]: Short lines of hope for days when reading, writing, or seeing feels hard. You still belong here.
        - generic [ref=e78]:
          - generic [ref=e79]:
            - generic [ref=e80]:
              - generic [ref=e81]: "Peace2074 release progress: localized storefront links, iOS sync, and submission cleanup"
              - generic [ref=e82]: 4/18/2026
            - generic [ref=e83]:
              - generic [ref=e84]:
                - status [ref=e85]: release
                - status [ref=e86]: ios
                - status [ref=e87]: localization
                - status [ref=e88]: app-store
                - status [ref=e89]: accomplishment
              - button [ref=e91] [cursor=pointer]:
                - img [ref=e93]: favorite_border
          - generic [ref=e94]: A quick accomplishment report covering locale-aware public URLs, App Store metadata improvements, cleaner iOS export compliance, and native release prep.
        - generic [ref=e96]:
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]: PEACE2074 ahora está en español e italiano
              - generic [ref=e100]: 4/12/2026
            - generic [ref=e101]:
              - generic [ref=e102]:
                - status [ref=e103]: actualizacion
                - status [ref=e104]: blog
                - status [ref=e105]: espanol
                - status [ref=e106]: italiano
                - status [ref=e107]: idiomas
              - button [ref=e109] [cursor=pointer]:
                - img [ref=e111]: favorite_border
          - generic [ref=e112]: Ya puedes leer nuestras novedades en español e italiano mientras seguimos ampliando la experiencia multilingüe.
        - generic [ref=e114]:
          - generic [ref=e115]:
            - generic [ref=e116]:
              - generic [ref=e117]: PEACE2074 ora è disponibile in spagnolo e italiano
              - generic [ref=e118]: 4/12/2026
            - generic [ref=e119]:
              - generic [ref=e120]:
                - status [ref=e121]: aggiornamento
                - status [ref=e122]: blog
                - status [ref=e123]: spagnolo
                - status [ref=e124]: italiano
                - status [ref=e125]: lingue
              - button [ref=e127] [cursor=pointer]:
                - img [ref=e129]: favorite_border
          - generic [ref=e130]: Le nostre nuove pubblicazioni sono ora disponibili in spagnolo e italiano mentre continuiamo a migliorare l'esperienza multilingue.
        - generic [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e134]:
              - generic [ref=e135]: "النور في الظلام: كيف يمنحنا القرآن القوة في الأوقات الصعبة | Light in Darkness: How the Quran Gives Us Strength in Difficult Times"
              - generic [ref=e136]: 3/16/2026
            - generic [ref=e137]:
              - generic [ref=e138]:
                - status [ref=e139]: faith
                - status [ref=e140]: strength
                - status [ref=e141]: patience
                - status [ref=e142]: hope
                - status [ref=e143]: difficult-times
                - status [ref=e144]: bilingual
                - status [ref=e145]: إيمان
                - status [ref=e146]: قوة
                - status [ref=e147]: صبر
              - button [ref=e149] [cursor=pointer]:
                - img [ref=e151]: favorite_border
          - generic [ref=e152]: When the world feels broken and overwhelming, the Quran offers us a compass—not to escape reality, but to face it with courage, clarity, and inner peace. عندما يبدو العالم محطمًا ومربكًا، يقدم لنا القرآن بوصلة—ليس للهروب من الواقع، بل لمواجهته بشجاعة ووضوح وسلام داخلي.
        - generic [ref=e154]:
          - generic [ref=e155]:
            - generic [ref=e156]:
              - generic [ref=e157]: How to Use the Quran Interaction Window + Share Any Ayah Link
              - generic [ref=e158]: 2/21/2026
            - generic [ref=e159]:
              - generic [ref=e160]:
                - status [ref=e161]: quran
                - status [ref=e162]: recitation
                - status [ref=e163]: bookmarks
                - status [ref=e164]: sharing
                - status [ref=e165]: guide
              - button [ref=e167] [cursor=pointer]:
                - img [ref=e169]: favorite_border
          - generic [ref=e170]: "Quick guide: interact with any ayah while reading Quran, then share a direct verse URL like /quran/2:255."
        - generic [ref=e172]:
          - generic [ref=e173]:
            - generic [ref=e174]:
              - generic [ref=e175]: Share Any Ayah in Seconds
              - generic [ref=e176]: 2/21/2026
            - generic [ref=e177]:
              - generic [ref=e178]:
                - status [ref=e179]: quran
                - status [ref=e180]: sharing
                - status [ref=e181]: ayah
                - status [ref=e182]: guide
              - button [ref=e184] [cursor=pointer]:
                - img [ref=e186]: favorite_border
          - generic [ref=e187]: Use links like /quran/2:255 to open the exact verse and share directly while reading.
        - generic [ref=e189]:
          - generic [ref=e190]:
            - generic [ref=e191]:
              - generic [ref=e192]: How to share a specific ayah
              - generic [ref=e193]: 2/21/2026
            - generic [ref=e194]:
              - status [ref=e196]: Share
              - button [ref=e198] [cursor=pointer]:
                - img [ref=e200]: favorite_border
          - generic [ref=e201]: Direct links to any verse in the Quran
    - alert [ref=e202]:
      - generic [ref=e204]:
        - generic [ref=e205]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e206]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e207]:
        - button "Accept" [ref=e208] [cursor=pointer]:
          - generic [ref=e210]: Accept
        - button "Decline" [ref=e211] [cursor=pointer]:
          - generic [ref=e213]: Decline
    - contentinfo [ref=e214]:
      - generic [ref=e215]:
        - generic [ref=e216]:
          - img "decor" [ref=e217]
          - generic [ref=e218]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e219]:
          - link "About" [ref=e220] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e221] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e222] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e223] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e224] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e225] [cursor=pointer]:
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
      |               ^ Error: Found bright neutral surfaces in dark mode on /blog: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```