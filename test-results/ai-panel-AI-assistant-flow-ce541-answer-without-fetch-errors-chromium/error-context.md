# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-panel.spec.ts >> AI assistant flow >> support AI panel returns an answer without fetch errors
- Location: tests/ai-panel.spec.ts:105:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.support-ai-widget')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.support-ai-widget')

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
    - contentinfo [ref=e184]:
      - generic [ref=e185]:
        - generic [ref=e186]:
          - img "decor" [ref=e187]
          - generic [ref=e188]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e189]:
          - link "About" [ref=e190] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e191] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e192] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e193] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e194] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e195] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
  13  |     async function waitForApiReady(page: Parameters<typeof test>[0]['page']) {
  14  |         await expect
  15  |             .poll(
  16  |                 async () => {
  17  |                     try {
  18  |                         return await page.evaluate(async () => {
  19  |                             try {
  20  |                                 const response = await fetch('/api/health', {
  21  |                                     credentials: 'include',
  22  |                                 })
  23  | 
  24  |                                 if (!response.ok) {
  25  |                                     return `http-${response.status}`
  26  |                                 }
  27  | 
  28  |                                 return 'ready'
  29  |                             } catch (error) {
  30  |                                 return (error as Error)?.message || 'network-error'
  31  |                             }
  32  |                         })
  33  |                     } catch (error) {
  34  |                         return (error as Error)?.message || 'page-reloading'
  35  |                     }
  36  |                 },
  37  |                 {
  38  |                     timeout: 90_000,
  39  |                     intervals: [500, 1000, 2000],
  40  |                 }
  41  |             )
  42  |             .toBe('ready')
  43  |     }
  44  | 
  45  |     test('AI API responds with assistant content', async ({ page }) => {
  46  |         await page.goto('/')
  47  |         await page.waitForLoadState('domcontentloaded')
  48  |         await dismissCookieBanner(page)
  49  |         await waitForApiReady(page)
  50  | 
  51  |         const body = await page.evaluate(async () => {
  52  |             try {
  53  |                 const response = await fetch('/api/kimi', {
  54  |                     method: 'POST',
  55  |                     credentials: 'include',
  56  |                     headers: { 'Content-Type': 'application/json' },
  57  |                     body: JSON.stringify({
  58  |                         messages: [
  59  |                             {
  60  |                                 role: 'user',
  61  |                                 content:
  62  |                                     'Briefly describe how Peace2074 helps users read and explore the Quran.',
  63  |                             },
  64  |                         ],
  65  |                     }),
  66  |                 })
  67  | 
  68  |                 const text = await response.text()
  69  |                 let payload: unknown = null
  70  |                 try {
  71  |                     payload = text ? JSON.parse(text) : null
  72  |                 } catch {
  73  |                     payload = null
  74  |                 }
  75  | 
  76  |                 return {
  77  |                     ok: response.ok,
  78  |                     status: response.status,
  79  |                     url: response.url,
  80  |                     payload,
  81  |                     rawText: text.slice(0, 200),
  82  |                 }
  83  |             } catch (err) {
  84  |                 return { ok: false, status: 0, url: '', payload: null, rawText: String(err) }
  85  |             }
  86  |         })
  87  | 
  88  |         // Skip gracefully when the Kimi/AI API is not available in this environment
  89  |         if (!body.ok || body.status === 404 || body.status === 503 || body.payload === null) {
  90  |             test.skip(
  91  |                 true,
  92  |                 `AI API not available in test environment (status=${body.status}, body="${body.rawText}")`
  93  |             )
  94  |             return
  95  |         }
  96  | 
  97  |         expect(body.url).toContain('/api/kimi')
  98  | 
  99  |         const payload = body.payload as Record<string, unknown>
  100 |         expect(payload?.error).toBeFalsy()
  101 |         expect(typeof (payload?.message as Record<string, unknown>)?.content).toBe('string')
  102 |         expect(((payload?.message as Record<string, unknown>)?.content as string).trim().length).toBeGreaterThan(0)
  103 |     })
  104 | 
  105 |     test('support AI panel returns an answer without fetch errors', async ({ page }) => {
  106 |         await page.goto('/')
  107 |         await page.waitForLoadState('domcontentloaded')
  108 |         await dismissCookieBanner(page)
  109 |         await waitForApiReady(page)
  110 |         await page.evaluate(() => window.sessionStorage.removeItem('support-ai-hidden'))
  111 | 
  112 |         const widget = page.locator('.support-ai-widget')
> 113 |         await expect(widget).toBeVisible()
      |                              ^ Error: expect(locator).toBeVisible() failed
  114 | 
  115 |         const openButton = widget.getByRole('button', { name: /ask support ai|ai support/i }).first()
  116 |         await expect(openButton).toBeVisible()
  117 |         await openButton.click()
  118 | 
  119 |         const promptInput = widget.getByLabel(/describe the problem or question/i)
  120 |         await expect(promptInput).toBeVisible()
  121 |         await promptInput.fill(
  122 |             'What Quran features can I use on Peace2074? Answer in one short sentence.'
  123 |         )
  124 | 
  125 |         const requestPromise = page.waitForRequest(
  126 |             (request) =>
  127 |                 request.url().includes('/api/kimi') && request.method() === 'POST',
  128 |             { timeout: 90_000 }
  129 |         )
  130 |         const responsePromise = page.waitForResponse(
  131 |             (response) =>
  132 |                 response.url().includes('/api/kimi') &&
  133 |                 response.request().method() === 'POST',
  134 |             { timeout: 90_000 }
  135 |         )
  136 | 
  137 |         await widget.getByRole('button', { name: /^ask$/i }).click()
  138 | 
  139 |         const kimiRequest = await requestPromise
  140 |         const response = await responsePromise
  141 | 
  142 |         expect(kimiRequest.url()).toContain('/api/kimi')
  143 |         expect(response.ok()).toBeTruthy()
  144 | 
  145 |         const payload = await response.json()
  146 |         expect(payload?.error).toBeFalsy()
  147 | 
  148 |         const answer = widget.locator('.ai-response-text')
  149 |         await expect(answer).toBeVisible({ timeout: 90_000 })
  150 |         await expect(answer).not.toHaveText(/^\s*$/)
  151 |         await expect(widget).not.toContainText(/failed to fetch/i)
  152 |     })
  153 | })
  154 | 
```