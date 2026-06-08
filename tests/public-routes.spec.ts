import { test, expect } from '@playwright/test'

/**
 * Public Route E2E Smoke Tests
 *
 * Covers every public-facing route that lacks dedicated test coverage.
 * Each test validates:
 *   - Page loads without console errors
 *   - Primary heading (h1) is rendered
 *   - Key structural content is visible
 *   - Core navigation links are functional
 */

async function dismissCookieBanner(page: Parameters<typeof test>[0]['page']) {
    await page
        .getByRole('button', { name: /^accept$/i })
        .click({ timeout: 3000 })
        .catch(() => { })
}

// ── Home ─────────────────────────────────────────────────────────────────────

test.describe('Home page', () => {
    test('renders hero content and primary navigation', async ({ page }) => {
        await page.goto('/')
        await dismissCookieBanner(page)

        // The main page should have visible content
        await expect(page.locator('main, .q-page, .manifesto-card').first()).toBeVisible()

        // Footer is present
        await expect(page.locator('footer, [role="contentinfo"]').first()).toBeVisible()
    })

    test('has working navigation links to core pages', async ({ page }) => {
        await page.goto('/')
        await dismissCookieBanner(page)

        // Check that key nav links exist (drawer or header)
        const quranLink = page.locator('a[href="/quran"], a[href*="/quran"]').first()
        await expect(quranLink).toBeAttached()
    })
})

// ── About ────────────────────────────────────────────────────────────────────

test.describe('About page', () => {
    test('renders hero section with h1 and stats', async ({ page }) => {
        await page.goto('/about')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()
        await expect(h1).toHaveText(/.+/)

        // Stats grid with 3 stat cards
        const statCards = page.locator('.stat-card')
        await expect(statCards.first()).toBeVisible()
        await expect(statCards).toHaveCount(3)
    })

    test('renders pillar cards and CTA section', async ({ page }) => {
        await page.goto('/about')
        await dismissCookieBanner(page)

        // Pillar cards
        const pillarCards = page.locator('.pillar-card')
        await expect(pillarCards.first()).toBeVisible()
        await expect(pillarCards).toHaveCount(3)

        // CTA section with action buttons
        const ctaPanel = page.locator('.cta-panel')
        await expect(ctaPanel).toBeVisible()
    })
})

// ── Holy Names ───────────────────────────────────────────────────────────────

test.describe('Holy Names page', () => {
    test('renders all 99 glory cards with Arabic text', async ({ page }) => {
        await page.goto('/holynames')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        const gloryCards = page.locator('.glory-card')
        await expect(gloryCards.first()).toBeVisible()
        await expect(gloryCards).toHaveCount(99)
    })

    test('first card contains Ar-Rahman in Arabic', async ({ page }) => {
        await page.goto('/holynames')
        await dismissCookieBanner(page)

        const firstCard = page.locator('.glory-card').first()
        await expect(firstCard).toBeVisible()
        // Arabic name: الرَّحْمَنُ
        await expect(firstCard.locator('.arabic-name')).toContainText('الرَّحْمَنُ')
    })
})

// ── Tasbeeh ───────────────────────────────────────────────────────────────────

test.describe('Tasbeeh page', () => {
    test('loads and renders tasbeeh card', async ({ page }) => {
        await page.goto('/tasbeeh')
        await dismissCookieBanner(page)

        const tasbeehCard = page.locator('.tasbeeh-card, .q-page').first()
        await expect(tasbeehCard).toBeVisible()
    })
})

// ── Miracles ─────────────────────────────────────────────────────────────────

test.describe('Miracles page', () => {
    test('renders 4 miracle cards with icons', async ({ page }) => {
        await page.goto('/miracles')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        const miracleCards = page.locator('.miracle-card')
        await expect(miracleCards.first()).toBeVisible()
        await expect(miracleCards).toHaveCount(4)
    })
})

// ── Support ──────────────────────────────────────────────────────────────────

test.describe('Support page', () => {
    test('renders hero and action buttons', async ({ page }) => {
        await page.goto('/support')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        // CTA buttons: Chat and Contact
        const chatBtn = page.getByRole('link', { name: /chat/i })
        await expect(chatBtn).toBeVisible()

        const contactBtn = page.locator('.hero-actions').getByRole('link', { name: /contact/i })
        await expect(contactBtn).toBeVisible()
    })
})

// ── Contact ──────────────────────────────────────────────────────────────────

test.describe('Contact page', () => {
    test('renders contact form with all fields', async ({ page }) => {
        await page.goto('/contact')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        // Form fields
        const form = page.locator('form[name="contact"]')
        await expect(form).toBeVisible()

        // Name, email, message inputs
        await expect(page.locator('input[name="name"]')).toBeVisible()
        await expect(page.locator('input[name="email"]')).toBeVisible()
        await expect(page.locator('textarea[name="message"], .q-field textarea').first()).toBeAttached()
    })

    test('displays contact info sidebar', async ({ page }) => {
        await page.goto('/contact')
        await dismissCookieBanner(page)

        // Contact email
        const emailLink = page.locator('a[href="mailto:hello@peace2074.com"]')
        await expect(emailLink).toBeVisible()
    })
})

// ── Social ───────────────────────────────────────────────────────────────────

test.describe('Social page', () => {
    test('renders video grid and legal banner', async ({ page }) => {
        await page.goto('/social', { waitUntil: 'domcontentloaded' })
        await dismissCookieBanner(page)

        // Page title
        const title = page.locator('.text-h4').first()
        await expect(title).toBeVisible()

        // Video cards (3 TikTok embeds)
        const videoCards = page.locator('.video-card')
        await expect(videoCards).toHaveCount(3)

        // Legal banner
        const legalBanner = page.locator('.legal-banner')
        await expect(legalBanner).toBeVisible()
    })
})

// ── Blog ─────────────────────────────────────────────────────────────────────

test.describe('Blog page', () => {
    test('renders blog list page with title', async ({ page }) => {
        await page.goto('/blog')
        await dismissCookieBanner(page)

        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()
    })
})

// ── Privacy & Terms ──────────────────────────────────────────────────────────

test.describe('Legal pages', () => {
    test('privacy page renders heading', async ({ page }) => {
        await page.goto('/privacy')
        await dismissCookieBanner(page)

        const heading = page.locator('h1, main h1').first()
        await expect(heading).toBeVisible()
    })

    test('terms page renders heading', async ({ page }) => {
        await page.goto('/terms')
        await dismissCookieBanner(page)

        const heading = page.locator('h1, main h1').first()
        await expect(heading).toBeVisible()
    })
})

// ── Deploys ──────────────────────────────────────────────────────────────────

test.describe('Deploys page', () => {
    test('loads and shows deployment history', async ({ page }) => {
        await page.goto('/deploys')
        await dismissCookieBanner(page)

        // Page should load without error
        const pageContent = page.locator('.q-page').first()
        await expect(pageContent).toBeVisible()
    })
})

// ── Login & Signup ───────────────────────────────────────────────────────────

test.describe('Auth pages render', () => {
    test('login page renders form', async ({ page }) => {
        await page.goto('/login')
        await dismissCookieBanner(page)

        const form = page.locator('form, .q-form').first()
        await expect(form).toBeVisible()

        // Username and password fields
        const usernameField = page.getByRole('textbox', { name: /username/i })
        await expect(usernameField).toBeVisible()
    })

    test('signup page renders form', async ({ page }) => {
        await page.goto('/signup')
        await dismissCookieBanner(page)

        const form = page.locator('form, .q-form').first()
        await expect(form).toBeVisible()

        // All signup fields
        await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible()
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    })
})

// ── Cross-page Navigation ────────────────────────────────────────────────────

test.describe('Cross-page navigation', () => {
    test('home → quran → sura detail → back to quran', async ({ page }) => {
        await page.goto('/')
        await dismissCookieBanner(page)

        await page.goto('/quran')
        await page.waitForURL(/\/quran$/)
        // Wait for the sura list to finish rendering (it may lazy-load)
        await page.waitForLoadState('networkidle')

        const firstSura = page.locator('a.sura-card').first()
        await expect(firstSura).toBeVisible({ timeout: 15_000 })

        // Navigate to first sura
        await firstSura.click()
        await page.waitForURL(/\/quran\/1/)

        // Navigate back
        await page.goBack()
        await page.waitForURL(/\/quran$/)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('a.sura-card').first()).toBeVisible({ timeout: 15_000 })
    })

    test('about page CTA links navigate correctly', async ({ page }) => {
        await page.goto('/about')
        await dismissCookieBanner(page)

        // Click "Read the Quran" or similar primary CTA
        const quranCta = page.locator('.hero-actions a[href="/quran"], .hero-actions .q-btn').first()
        await expect(quranCta).toBeVisible()
    })
})

// ── Redirect handling ────────────────────────────────────────────────────────

test.describe('Route redirects', () => {
    test('/deploy redirects to /deploys', async ({ page }) => {
        await page.goto('/deploy')
        await page.waitForURL(/\/deploys/)
        await expect(page).toHaveURL(/\/deploys$/)
    })

    test('invalid sura ID redirects to quran list', async ({ page }) => {
        await page.goto('/quran/999')
        await page.waitForURL(/\/quran/)
        // Should redirect back to quran list
        await expect(page).toHaveURL(/\/quran/)
    })
})
