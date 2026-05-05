# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-panel.spec.ts >> AI assistant flow >> support AI panel returns an answer without fetch errors
- Location: tests/ai-panel.spec.ts:83:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
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
      - generic [ref=e24] [cursor=pointer]:
        - generic [ref=e26]:
          - generic [ref=e27]: 🇺🇸
          - combobox "🇺🇸" [ref=e28]: 🇺🇸 English
        - generic [ref=e30]: arrow_drop_down
      - button "Login" [ref=e31] [cursor=pointer]:
        - img [ref=e33]: login
  - complementary [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]: Peace2074
        - generic [ref=e38]: Navigation
        - generic [ref=e39]: Control drawer ordering and visibility.
      - separator [ref=e40]
      - list [ref=e41]:
        - listitem "Home" [ref=e42] [cursor=pointer]:
          - generic [ref=e45]: HO
          - generic [ref=e46]:
            - generic [ref=e47]: Home
            - generic [ref=e48]: /
          - button "Pin" [ref=e50]:
            - generic [ref=e52]: Pin
        - listitem "About" [ref=e53] [cursor=pointer]:
          - generic [ref=e56]: AB
          - generic [ref=e57]:
            - generic [ref=e58]: About
            - generic [ref=e59]: /about
          - button "Pin" [ref=e61]:
            - generic [ref=e63]: Pin
        - listitem "Quran" [ref=e64] [cursor=pointer]:
          - generic [ref=e67]: QU
          - generic [ref=e68]:
            - generic [ref=e69]: Quran
            - generic [ref=e70]: /quran
          - button "Pin" [ref=e72]:
            - generic [ref=e74]: Pin
        - listitem "Holy Names" [ref=e75] [cursor=pointer]:
          - generic [ref=e78]: HN
          - generic [ref=e79]:
            - generic [ref=e80]: Holy Names
            - generic [ref=e81]: /holynames
          - button "Pin" [ref=e83]:
            - generic [ref=e85]: Pin
        - listitem "Tasbeeh" [ref=e86] [cursor=pointer]:
          - generic [ref=e89]: TA
          - generic [ref=e90]:
            - generic [ref=e91]: Tasbeeh
            - generic [ref=e92]: /tasbeeh
          - button "Pin" [ref=e94]:
            - generic [ref=e96]: Pin
        - listitem "Miracles" [ref=e97] [cursor=pointer]:
          - generic [ref=e100]: MI
          - generic [ref=e101]:
            - generic [ref=e102]: Miracles
            - generic [ref=e103]: /miracles
          - button "Pin" [ref=e105]:
            - generic [ref=e107]: Pin
        - listitem "Chat" [ref=e108] [cursor=pointer]:
          - generic [ref=e111]: CH
          - generic [ref=e112]:
            - generic [ref=e113]: Chat
            - generic [ref=e114]: /chat
          - button "Pin" [ref=e116]:
            - generic [ref=e118]: Pin
        - listitem "Support" [ref=e119] [cursor=pointer]:
          - generic [ref=e122]: SU
          - generic [ref=e123]:
            - generic [ref=e124]: Support
            - generic [ref=e125]: /support
          - button "Pin" [ref=e127]:
            - generic [ref=e129]: Pin
        - listitem "Settings" [ref=e130] [cursor=pointer]:
          - generic [ref=e133]: SE
          - generic [ref=e134]:
            - generic [ref=e135]: Settings
            - generic [ref=e136]: /settings
          - button "Pin" [ref=e138]:
            - generic [ref=e140]: Pin
        - listitem "Preferences" [ref=e141] [cursor=pointer]:
          - generic [ref=e144]: PR
          - generic [ref=e145]:
            - generic [ref=e146]: Preferences
            - generic [ref=e147]: /preferences
          - button "Pin" [ref=e149]:
            - generic [ref=e151]: Pin
        - listitem "Admin Page" [ref=e152] [cursor=pointer]:
          - generic [ref=e155]: AP
          - generic [ref=e156]:
            - generic [ref=e157]: Admin Page
            - generic [ref=e158]: /admin
          - button "Pin" [ref=e160]:
            - generic [ref=e162]: Pin
        - listitem "Login" [ref=e163] [cursor=pointer]:
          - generic [ref=e166]: LO
          - generic [ref=e167]:
            - generic [ref=e168]: Login
            - generic [ref=e169]: /login
          - button "Pin" [ref=e171]:
            - generic [ref=e173]: Pin
        - listitem "Blog" [ref=e174] [cursor=pointer]:
          - generic [ref=e177]: BL
          - generic [ref=e178]:
            - generic [ref=e179]: Blog
            - generic [ref=e180]: /blog
          - button "Pin" [ref=e182]:
            - generic [ref=e184]: Pin
        - listitem "Deploys" [ref=e185] [cursor=pointer]:
          - generic [ref=e188]: DE
          - generic [ref=e189]:
            - generic [ref=e190]: Deploys
            - generic [ref=e191]: /deploys
          - button "Pin" [ref=e193]:
            - generic [ref=e195]: Pin
        - listitem "Contact" [ref=e196] [cursor=pointer]:
          - generic [ref=e199]: CO
          - generic [ref=e200]:
            - generic [ref=e201]: Contact
            - generic [ref=e202]: /contact
          - button "Pin" [ref=e204]:
            - generic [ref=e206]: Pin
  - main [ref=e208]:
    - generic [ref=e209]:
      - generic [ref=e211]:
        - generic [ref=e212]: auto_awesome
        - generic [ref=e213]: Every verse holds wisdom for those who reflect
      - generic [ref=e214]:
        - heading "Peace2074" [level=1] [ref=e215]
        - paragraph [ref=e216]: A calm place to read, reflect and remember.
        - generic [ref=e217]:
          - link "Read Quran" [ref=e218] [cursor=pointer]:
            - /url: /quran
            - generic [ref=e220]: Read Quran
          - link "Holy Names" [ref=e221] [cursor=pointer]:
            - /url: /holynames
            - generic [ref=e223]: Holy Names
          - link "Tasbeeh" [ref=e224] [cursor=pointer]:
            - /url: /tasbeeh
            - generic [ref=e226]: Tasbeeh
      - generic [ref=e227]:
        - generic [ref=e228]:
          - button [ref=e229] [cursor=pointer]:
            - img [ref=e231]: content_copy
          - button [ref=e232] [cursor=pointer]:
            - img [ref=e234]: shuffle
        - generic [ref=e235]: إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ
        - blockquote [ref=e236]: I only complain of my suffering and my grief to Allah.
        - paragraph [ref=e237]:
          - link "— Quran 12:86" [ref=e238] [cursor=pointer]:
            - /url: /quran/12:86
      - generic [ref=e239]:
        - generic [ref=e240]:
          - generic [ref=e241]:
            - paragraph [ref=e242]: Ask PEACE AI
            - text: Get guidance on chapters, reflections, or how to use the app.
          - generic [ref=e244] [cursor=pointer]: Try another prompt
        - generic [ref=e245]:
          - generic [ref=e249]:
            - generic: Ask PEACE AI
            - textbox "Ask PEACE AI" [ref=e250]:
              - /placeholder: Ask about a surah, theme, or feature
              - text: Highlight two key lessons from Surah Maryam and where to read it here.
          - button "Ask" [ref=e251] [cursor=pointer]:
            - generic [ref=e253]: Ask
        - separator [ref=e254]
        - generic [ref=e255]:
          - generic [ref=e257]: History
          - generic [ref=e258]: No previous questions yet.
      - generic [ref=e259]:
        - generic [ref=e260]:
          - generic [ref=e261]:
            - paragraph [ref=e262]: Blog
            - text: Updates, tips, and reflections.
          - link "Blog" [ref=e263] [cursor=pointer]:
            - /url: /blog
            - generic [ref=e265]: Blog
        - list [ref=e266]:
          - listitem [ref=e267] [cursor=pointer]:
            - generic [ref=e268]:
              - generic [ref=e269]: "Peace2074 release progress: localized storefront links, iOS sync, and submission cleanup"
              - generic [ref=e270]: 4/18/2026
              - generic [ref=e271]: A quick accomplishment report covering locale-aware public URLs, App Store metadata improvements, cleaner iOS export compliance, and native release prep.
          - listitem [ref=e272] [cursor=pointer]:
            - generic [ref=e273]:
              - generic [ref=e274]: PEACE2074 ahora está en español e italiano
              - generic [ref=e275]: 4/12/2026
              - generic [ref=e276]: Ya puedes leer nuestras novedades en español e italiano mientras seguimos ampliando la experiencia multilingüe.
          - listitem [ref=e277] [cursor=pointer]:
            - generic [ref=e278]:
              - generic [ref=e279]: PEACE2074 ora è disponibile in spagnolo e italiano
              - generic [ref=e280]: 4/12/2026
              - generic [ref=e281]: Le nostre nuove pubblicazioni sono ora disponibili in spagnolo e italiano mentre continuiamo a migliorare l'esperienza multilingue.
          - listitem [ref=e282] [cursor=pointer]:
            - generic [ref=e283]:
              - generic [ref=e284]: "النور في الظلام: كيف يمنحنا القرآن القوة في الأوقات الصعبة | Light in Darkness: How the Quran Gives Us Strength in Difficult Times"
              - generic [ref=e285]: 3/16/2026
              - generic [ref=e286]: When the world feels broken and overwhelming, the Quran offers us a compass—not to escape reality, but to face it with courage, clarity, and inner peace. عندما يبدو العالم محطمًا ومربكًا، يقدم لنا القرآن بوصلة—ليس للهروب من الواقع، بل لمواجهته بشجاعة ووضوح وسلام داخلي.
          - listitem [ref=e287] [cursor=pointer]:
            - generic [ref=e288]:
              - generic [ref=e289]: How to Use the Quran Interaction Window + Share Any Ayah Link
              - generic [ref=e290]: 2/21/2026
              - generic [ref=e291]: "Quick guide: interact with any ayah while reading Quran, then share a direct verse URL like /quran/2:255."
          - listitem [ref=e292] [cursor=pointer]:
            - generic [ref=e293]:
              - generic [ref=e294]: Share Any Ayah in Seconds
              - generic [ref=e295]: 2/21/2026
              - generic [ref=e296]: Use links like /quran/2:255 to open the exact verse and share directly while reading.
          - listitem [ref=e297] [cursor=pointer]:
            - generic [ref=e298]:
              - generic [ref=e299]: How to share a specific ayah
              - generic [ref=e300]: 2/21/2026
              - generic [ref=e301]: Direct links to any verse in the Quran
  - generic [ref=e302]:
    - generic [ref=e303]:
      - generic [ref=e304]:
        - generic [ref=e305]: AI Support
        - generic [ref=e306]: Describe your issue and Kimi will suggest next steps.
      - generic [ref=e307]:
        - button "Reset" [ref=e308] [cursor=pointer]:
          - img [ref=e310]: refresh
        - button "close" [ref=e311] [cursor=pointer]:
          - img [ref=e313]: visibility_off
        - button "close" [ref=e314] [cursor=pointer]:
          - img [ref=e316]: close
    - separator [ref=e317]
    - generic [ref=e318]:
      - generic [ref=e319]: Use the header icons to hide. A reopen button sits bottom-right.
      - generic [ref=e323]:
        - generic: Describe the problem or question
        - textbox "Describe the problem or question" [ref=e324]: What Quran features can I use on Peace2074? Answer in one short sentence.
      - generic [ref=e325]:
        - button "Ask" [ref=e326] [cursor=pointer]:
          - generic [ref=e328]: Ask
          - img [ref=e330]
        - button "Copy" [disabled] [ref=e332]:
          - img [ref=e334]: content_copy
      - alert [ref=e335]:
        - generic [ref=e336]: Kimi request failed (500)
  - contentinfo [ref=e337]:
    - generic [ref=e338]:
      - generic [ref=e339]:
        - img "decor" [ref=e340]
        - generic [ref=e341]: © 2026 Peace2074 · v3.1.3
      - navigation "Footer links" [ref=e342]:
        - link "About" [ref=e343] [cursor=pointer]:
          - /url: /about
        - link "Quran" [ref=e344] [cursor=pointer]:
          - /url: /quran
        - link "Terms and Conditions" [ref=e345] [cursor=pointer]:
          - /url: /terms
        - link "Privacy Policy" [ref=e346] [cursor=pointer]:
          - /url: /privacy
        - link "Contact" [ref=e347] [cursor=pointer]:
          - /url: /contact
```

# Test source

```ts
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
  52  |             const response = await fetch('/api/kimi', {
  53  |                 method: 'POST',
  54  |                 credentials: 'include',
  55  |                 headers: { 'Content-Type': 'application/json' },
  56  |                 body: JSON.stringify({
  57  |                     messages: [
  58  |                         {
  59  |                             role: 'user',
  60  |                             content:
  61  |                                 'Briefly describe how Peace2074 helps users read and explore the Quran.',
  62  |                         },
  63  |                     ],
  64  |                 }),
  65  |             })
  66  | 
  67  |             return {
  68  |                 ok: response.ok,
  69  |                 url: response.url,
  70  |                 payload: await response.json(),
  71  |             }
  72  |         })
  73  | 
  74  |         expect(body.ok).toBeTruthy()
  75  |         expect(body.url).toContain('/api/kimi')
  76  | 
  77  |         const payload = body.payload
  78  |         expect(payload?.error).toBeFalsy()
  79  |         expect(typeof payload?.message?.content).toBe('string')
  80  |         expect(payload.message.content.trim().length).toBeGreaterThan(0)
  81  |     })
  82  | 
  83  |     test('support AI panel returns an answer without fetch errors', async ({ page }) => {
  84  |         await page.goto('/')
  85  |         await page.waitForLoadState('domcontentloaded')
  86  |         await dismissCookieBanner(page)
  87  |         await waitForApiReady(page)
  88  |         await page.evaluate(() => window.sessionStorage.removeItem('support-ai-hidden'))
  89  | 
  90  |         const widget = page.locator('.support-ai-widget')
  91  |         await expect(widget).toBeVisible()
  92  | 
  93  |         const openButton = widget.getByRole('button', { name: /ask support ai|ai support/i }).first()
  94  |         await expect(openButton).toBeVisible()
  95  |         await openButton.click()
  96  | 
  97  |         const promptInput = widget.getByLabel(/describe the problem or question/i)
  98  |         await expect(promptInput).toBeVisible()
  99  |         await promptInput.fill(
  100 |             'What Quran features can I use on Peace2074? Answer in one short sentence.'
  101 |         )
  102 | 
  103 |         const requestPromise = page.waitForRequest(
  104 |             (request) =>
  105 |                 request.url().includes('/api/kimi') && request.method() === 'POST',
  106 |             { timeout: 90_000 }
  107 |         )
  108 |         const responsePromise = page.waitForResponse(
  109 |             (response) =>
  110 |                 response.url().includes('/api/kimi') &&
  111 |                 response.request().method() === 'POST',
  112 |             { timeout: 90_000 }
  113 |         )
  114 | 
  115 |         await widget.getByRole('button', { name: /^ask$/i }).click()
  116 | 
  117 |         const kimiRequest = await requestPromise
  118 |         const response = await responsePromise
  119 | 
  120 |         expect(kimiRequest.url()).toContain('/api/kimi')
> 121 |         expect(response.ok()).toBeTruthy()
      |                               ^ Error: expect(received).toBeTruthy()
  122 | 
  123 |         const payload = await response.json()
  124 |         expect(payload?.error).toBeFalsy()
  125 | 
  126 |         const answer = widget.locator('.ai-response-text')
  127 |         await expect(answer).toBeVisible({ timeout: 90_000 })
  128 |         await expect(answer).not.toHaveText(/^\s*$/)
  129 |         await expect(widget).not.toContainText(/failed to fetch/i)
  130 |     })
  131 | })
  132 | 
```