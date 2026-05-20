# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-routes.spec.ts >> Miracles page >> renders 4 miracle cards with icons
- Location: tests/public-routes.spec.ts:118:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4000/miracles", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Peace2074
  - generic [ref=e5]: Loading...
```

# Test source

```ts
  19  | }
  20  | 
  21  | // ── Home ─────────────────────────────────────────────────────────────────────
  22  | 
  23  | test.describe('Home page', () => {
  24  |     test('renders hero content and primary navigation', async ({ page }) => {
  25  |         await page.goto('/')
  26  |         await dismissCookieBanner(page)
  27  | 
  28  |         // The main page should have visible content
  29  |         await expect(page.locator('main, .q-page, .manifesto-card').first()).toBeVisible()
  30  | 
  31  |         // Footer is present
  32  |         await expect(page.locator('footer, [role="contentinfo"]').first()).toBeVisible()
  33  |     })
  34  | 
  35  |     test('has working navigation links to core pages', async ({ page }) => {
  36  |         await page.goto('/')
  37  |         await dismissCookieBanner(page)
  38  | 
  39  |         // Check that key nav links exist (drawer or header)
  40  |         const quranLink = page.locator('a[href="/quran"], a[href*="/quran"]').first()
  41  |         await expect(quranLink).toBeAttached()
  42  |     })
  43  | })
  44  | 
  45  | // ── About ────────────────────────────────────────────────────────────────────
  46  | 
  47  | test.describe('About page', () => {
  48  |     test('renders hero section with h1 and stats', async ({ page }) => {
  49  |         await page.goto('/about')
  50  |         await dismissCookieBanner(page)
  51  | 
  52  |         const h1 = page.locator('h1').first()
  53  |         await expect(h1).toBeVisible()
  54  |         await expect(h1).toHaveText(/.+/)
  55  | 
  56  |         // Stats grid with 3 stat cards
  57  |         const statCards = page.locator('.stat-card')
  58  |         await expect(statCards.first()).toBeVisible()
  59  |         await expect(statCards).toHaveCount(3)
  60  |     })
  61  | 
  62  |     test('renders pillar cards and CTA section', async ({ page }) => {
  63  |         await page.goto('/about')
  64  |         await dismissCookieBanner(page)
  65  | 
  66  |         // Pillar cards
  67  |         const pillarCards = page.locator('.pillar-card')
  68  |         await expect(pillarCards.first()).toBeVisible()
  69  |         await expect(pillarCards).toHaveCount(3)
  70  | 
  71  |         // CTA section with action buttons
  72  |         const ctaPanel = page.locator('.cta-panel')
  73  |         await expect(ctaPanel).toBeVisible()
  74  |     })
  75  | })
  76  | 
  77  | // ── Holy Names ───────────────────────────────────────────────────────────────
  78  | 
  79  | test.describe('Holy Names page', () => {
  80  |     test('renders all 99 glory cards with Arabic text', async ({ page }) => {
  81  |         await page.goto('/holynames')
  82  |         await dismissCookieBanner(page)
  83  | 
  84  |         const h1 = page.locator('h1').first()
  85  |         await expect(h1).toBeVisible()
  86  | 
  87  |         const gloryCards = page.locator('.glory-card')
  88  |         await expect(gloryCards.first()).toBeVisible()
  89  |         await expect(gloryCards).toHaveCount(99)
  90  |     })
  91  | 
  92  |     test('first card contains Ar-Rahman in Arabic', async ({ page }) => {
  93  |         await page.goto('/holynames')
  94  |         await dismissCookieBanner(page)
  95  | 
  96  |         const firstCard = page.locator('.glory-card').first()
  97  |         await expect(firstCard).toBeVisible()
  98  |         // Arabic name: الرَّحْمَنُ
  99  |         await expect(firstCard.locator('.arabic-name')).toContainText('الرَّحْمَنُ')
  100 |     })
  101 | })
  102 | 
  103 | // ── Tasbeeh ───────────────────────────────────────────────────────────────────
  104 | 
  105 | test.describe('Tasbeeh page', () => {
  106 |     test('loads and renders tasbeeh card', async ({ page }) => {
  107 |         await page.goto('/tasbeeh')
  108 |         await dismissCookieBanner(page)
  109 | 
  110 |         const tasbeehCard = page.locator('.tasbeeh-card, .q-page').first()
  111 |         await expect(tasbeehCard).toBeVisible()
  112 |     })
  113 | })
  114 | 
  115 | // ── Miracles ─────────────────────────────────────────────────────────────────
  116 | 
  117 | test.describe('Miracles page', () => {
  118 |     test('renders 4 miracle cards with icons', async ({ page }) => {
> 119 |         await page.goto('/miracles')
      |                    ^ Error: page.goto: Test timeout of 30000ms exceeded.
  120 |         await dismissCookieBanner(page)
  121 | 
  122 |         const h1 = page.locator('h1').first()
  123 |         await expect(h1).toBeVisible()
  124 | 
  125 |         const miracleCards = page.locator('.miracle-card')
  126 |         await expect(miracleCards.first()).toBeVisible()
  127 |         await expect(miracleCards).toHaveCount(4)
  128 |     })
  129 | })
  130 | 
  131 | // ── Support ──────────────────────────────────────────────────────────────────
  132 | 
  133 | test.describe('Support page', () => {
  134 |     test('renders hero and action buttons', async ({ page }) => {
  135 |         await page.goto('/support')
  136 |         await dismissCookieBanner(page)
  137 | 
  138 |         const h1 = page.locator('h1').first()
  139 |         await expect(h1).toBeVisible()
  140 | 
  141 |         // CTA buttons: Chat and Contact
  142 |         const chatBtn = page.getByRole('link', { name: /chat/i })
  143 |         await expect(chatBtn).toBeVisible()
  144 | 
  145 |         const contactBtn = page.locator('.hero-actions').getByRole('link', { name: /contact/i })
  146 |         await expect(contactBtn).toBeVisible()
  147 |     })
  148 | })
  149 | 
  150 | // ── Contact ──────────────────────────────────────────────────────────────────
  151 | 
  152 | test.describe('Contact page', () => {
  153 |     test('renders contact form with all fields', async ({ page }) => {
  154 |         await page.goto('/contact')
  155 |         await dismissCookieBanner(page)
  156 | 
  157 |         const h1 = page.locator('h1').first()
  158 |         await expect(h1).toBeVisible()
  159 | 
  160 |         // Form fields
  161 |         const form = page.locator('form[name="contact"]')
  162 |         await expect(form).toBeVisible()
  163 | 
  164 |         // Name, email, message inputs
  165 |         await expect(page.locator('input[name="name"]')).toBeVisible()
  166 |         await expect(page.locator('input[name="email"]')).toBeVisible()
  167 |         await expect(page.locator('textarea[name="message"], .q-field textarea').first()).toBeAttached()
  168 |     })
  169 | 
  170 |     test('displays contact info sidebar', async ({ page }) => {
  171 |         await page.goto('/contact')
  172 |         await dismissCookieBanner(page)
  173 | 
  174 |         // Contact email
  175 |         const emailLink = page.locator('a[href="mailto:hello@peace2074.com"]')
  176 |         await expect(emailLink).toBeVisible()
  177 |     })
  178 | })
  179 | 
  180 | // ── Social ───────────────────────────────────────────────────────────────────
  181 | 
  182 | test.describe('Social page', () => {
  183 |     test('renders video grid and legal banner', async ({ page }) => {
  184 |         await page.goto('/social', { waitUntil: 'domcontentloaded' })
  185 |         await dismissCookieBanner(page)
  186 | 
  187 |         // Page title
  188 |         const title = page.locator('.text-h4').first()
  189 |         await expect(title).toBeVisible()
  190 | 
  191 |         // Video cards (3 TikTok embeds)
  192 |         const videoCards = page.locator('.video-card')
  193 |         await expect(videoCards).toHaveCount(3)
  194 | 
  195 |         // Legal banner
  196 |         const legalBanner = page.locator('.legal-banner')
  197 |         await expect(legalBanner).toBeVisible()
  198 |     })
  199 | })
  200 | 
  201 | // ── Blog ─────────────────────────────────────────────────────────────────────
  202 | 
  203 | test.describe('Blog page', () => {
  204 |     test('renders blog list page with title', async ({ page }) => {
  205 |         await page.goto('/blog')
  206 |         await dismissCookieBanner(page)
  207 | 
  208 |         const h1 = page.locator('h1').first()
  209 |         await expect(h1).toBeVisible()
  210 |     })
  211 | })
  212 | 
  213 | // ── Privacy & Terms ──────────────────────────────────────────────────────────
  214 | 
  215 | test.describe('Legal pages', () => {
  216 |     test('privacy page renders heading', async ({ page }) => {
  217 |         await page.goto('/privacy')
  218 |         await dismissCookieBanner(page)
  219 | 
```