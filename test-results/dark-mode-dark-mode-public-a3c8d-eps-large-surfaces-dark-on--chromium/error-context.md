# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /: [
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
        - generic [ref=e29]:
          - generic [ref=e30]: auto_awesome
          - generic [ref=e31]: Welcome to a space of peace and reflection
        - generic [ref=e32]:
          - heading "Peace2074" [level=1] [ref=e33]
          - paragraph [ref=e34]: A calm place to read, reflect and remember.
          - generic [ref=e35]:
            - link "Read Quran" [ref=e36] [cursor=pointer]:
              - /url: /quran
              - generic [ref=e38]: Read Quran
            - link "Holy Names" [ref=e39] [cursor=pointer]:
              - /url: /holynames
              - generic [ref=e41]: Holy Names
            - link "Tasbeeh" [ref=e42] [cursor=pointer]:
              - /url: /tasbeeh
              - generic [ref=e44]: Tasbeeh
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]:
              - generic [ref=e48]: public
              - generic [ref=e49]: Multilingual Unity · 10 Languages
            - heading "United Nations Flag Circle" [level=2] [ref=e50]
            - paragraph [ref=e51]: Click any flag to read the Holy Quran & Peace2074 in your native language
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]: language
              - generic [ref=e55]:
                - generic [ref=e56]: English
                - generic [ref=e57]: EN
            - generic [ref=e58]:
              - generic [ref=e60] [cursor=pointer]:
                - generic [ref=e61]: 🇬🇧
                - generic [ref=e62]: English
              - generic [ref=e64] [cursor=pointer]:
                - generic [ref=e65]: 🇸🇦
                - generic [ref=e66]: Arabic
              - generic [ref=e68] [cursor=pointer]:
                - generic [ref=e69]: 🇩🇪
                - generic [ref=e70]: German
              - generic [ref=e72] [cursor=pointer]:
                - generic [ref=e73]: 🇪🇸
                - generic [ref=e74]: Spanish
              - generic [ref=e76] [cursor=pointer]:
                - generic [ref=e77]: 🇮🇷
                - generic [ref=e78]: Persian
              - generic [ref=e80] [cursor=pointer]:
                - generic [ref=e81]: 🇷🇺
                - generic [ref=e82]: Russian
              - generic [ref=e84] [cursor=pointer]:
                - generic [ref=e85]: 🇮🇱
                - generic [ref=e86]: Hebrew
              - generic [ref=e88] [cursor=pointer]:
                - generic [ref=e89]: 🇮🇹
                - generic [ref=e90]: Italian
              - generic [ref=e92] [cursor=pointer]:
                - generic [ref=e93]: 🇹🇷
                - generic [ref=e94]: Turkish
              - generic [ref=e96] [cursor=pointer]:
                - generic [ref=e97]: 🇺🇿
                - generic [ref=e98]: Uzbek
        - generic [ref=e99]:
          - generic [ref=e100]:
            - button [ref=e101] [cursor=pointer]:
              - img [ref=e103]: content_copy
            - button [ref=e104] [cursor=pointer]:
              - img [ref=e106]: shuffle
          - generic [ref=e107]: نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ
          - blockquote [ref=e108]: Inform My servants that it is I who am the Forgiving, the Merciful.
          - paragraph [ref=e109]:
            - link "— Quran 15:49" [ref=e110] [cursor=pointer]:
              - /url: /quran/15:49
        - generic [ref=e111]:
          - generic [ref=e112]:
            - generic [ref=e113]:
              - paragraph [ref=e114]: Ask PEACE AI
              - text: Get guidance on chapters, reflections, or how to use the app.
            - generic [ref=e116] [cursor=pointer]: Try another prompt
          - generic [ref=e117]:
            - generic [ref=e121]:
              - generic: Ask PEACE AI
              - textbox "Ask PEACE AI" [ref=e122]:
                - /placeholder: Ask about a surah, theme, or feature
                - text: Highlight two key lessons from Surah Maryam and where to read it here.
            - button "Ask" [ref=e123] [cursor=pointer]:
              - generic [ref=e125]: Ask
          - separator [ref=e126]
          - generic [ref=e127]:
            - generic [ref=e129]: History
            - generic [ref=e130]: No previous questions yet.
        - generic [ref=e131]:
          - generic [ref=e132]:
            - generic [ref=e133]:
              - paragraph [ref=e134]: Blog
              - text: Updates, tips, and reflections.
            - link "Blog" [ref=e135] [cursor=pointer]:
              - /url: /blog
              - generic [ref=e137]: Blog
          - list [ref=e138]:
            - listitem [ref=e139] [cursor=pointer]:
              - generic [ref=e140]:
                - generic [ref=e141]: به PEACE2074 خوش آمدید — فضایی آرام برای قرائت و تدبر قرآن
                - generic [ref=e142]: 8/30/2026
                - generic [ref=e143]: خوش‌آمدگویی صمیمانه به کاربران فارسی‌زبان. فضایی نورانی و آرام برای قرائت قرآن کریم، تسبیح و ذکر.
            - listitem [ref=e144] [cursor=pointer]:
              - generic [ref=e145]:
                - generic [ref=e146]: You Are Not Alone — A Gentle Word on Hard Days
                - generic [ref=e147]: 6/20/2026
                - generic [ref=e148]: Short lines of hope for days when reading, writing, or seeing feels hard. You still belong here.
            - listitem [ref=e149] [cursor=pointer]:
              - generic [ref=e150]:
                - generic [ref=e151]: "Peace2074 release progress: localized storefront links, iOS sync, and submission cleanup"
                - generic [ref=e152]: 4/18/2026
                - generic [ref=e153]: A quick accomplishment report covering locale-aware public URLs, App Store metadata improvements, cleaner iOS export compliance, and native release prep.
            - listitem [ref=e154] [cursor=pointer]:
              - generic [ref=e155]:
                - generic [ref=e156]: PEACE2074 ahora está en español e italiano
                - generic [ref=e157]: 4/12/2026
                - generic [ref=e158]: Ya puedes leer nuestras novedades en español e italiano mientras seguimos ampliando la experiencia multilingüe.
            - listitem [ref=e159] [cursor=pointer]:
              - generic [ref=e160]:
                - generic [ref=e161]: PEACE2074 ora è disponibile in spagnolo e italiano
                - generic [ref=e162]: 4/12/2026
                - generic [ref=e163]: Le nostre nuove pubblicazioni sono ora disponibili in spagnolo e italiano mentre continuiamo a migliorare l'esperienza multilingue.
            - listitem [ref=e164] [cursor=pointer]:
              - generic [ref=e165]:
                - generic [ref=e166]: "النور في الظلام: كيف يمنحنا القرآن القوة في الأوقات الصعبة | Light in Darkness: How the Quran Gives Us Strength in Difficult Times"
                - generic [ref=e167]: 3/16/2026
                - generic [ref=e168]: When the world feels broken and overwhelming, the Quran offers us a compass—not to escape reality, but to face it with courage, clarity, and inner peace. عندما يبدو العالم محطمًا ومربكًا، يقدم لنا القرآن بوصلة—ليس للهروب من الواقع، بل لمواجهته بشجاعة ووضوح وسلام داخلي.
            - listitem [ref=e169] [cursor=pointer]:
              - generic [ref=e170]:
                - generic [ref=e171]: How to Use the Quran Interaction Window + Share Any Ayah Link
                - generic [ref=e172]: 2/21/2026
                - generic [ref=e173]: "Quick guide: interact with any ayah while reading Quran, then share a direct verse URL like /quran/2:255."
            - listitem [ref=e174] [cursor=pointer]:
              - generic [ref=e175]:
                - generic [ref=e176]: Share Any Ayah in Seconds
                - generic [ref=e177]: 2/21/2026
                - generic [ref=e178]: Use links like /quran/2:255 to open the exact verse and share directly while reading.
            - listitem [ref=e179] [cursor=pointer]:
              - generic [ref=e180]:
                - generic [ref=e181]: How to share a specific ayah
                - generic [ref=e182]: 2/21/2026
                - generic [ref=e183]: Direct links to any verse in the Quran
    - alert [ref=e184]:
      - generic [ref=e186]:
        - generic [ref=e187]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e188]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e189]:
        - button "Accept" [ref=e190] [cursor=pointer]:
          - generic [ref=e192]: Accept
        - button "Decline" [ref=e193] [cursor=pointer]:
          - generic [ref=e195]: Decline
    - contentinfo [ref=e196]:
      - generic [ref=e197]:
        - generic [ref=e198]:
          - img "decor" [ref=e199]
          - generic [ref=e200]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e201]:
          - link "About" [ref=e202] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e203] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e204] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e205] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e206] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e207] [cursor=pointer]:
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
      |               ^ Error: Found bright neutral surfaces in dark mode on /: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```