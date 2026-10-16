const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const SURAHS_TO_TEST = [
  { id: 1, expectedName: 'الفاتحة', expectedEn: 'The Opener', expectedVerses: 7, hasVideo: true },
  { id: 112, expectedName: 'الإخلاص', expectedEn: 'The Sincerity', expectedVerses: 4, hasVideo: false },
  { id: 113, expectedName: 'الفلق', expectedEn: 'The Daybreak', expectedVerses: 5, hasVideo: false },
  { id: 114, expectedName: 'الناس', expectedEn: 'Mankind', expectedVerses: 6, hasVideo: false },
];

(async () => {
  const screenshotsDir = '/Users/waelio/.gemini/antigravity-ide/brain/262cbc82-689a-4d03-b8fe-94dcfe751c87';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching Chrome with Playwright for Multi-Surah Verification...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });

  const results = [];

  for (const surah of SURAHS_TO_TEST) {
    console.log(`\n========================================`);
    console.log(`Testing Surah ${surah.id} (${surah.expectedEn})...`);
    console.log(`========================================`);

    const url = `http://localhost:4000/quran/${surah.id}?lyrics=true`;
    console.log(`Navigating to ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e) {
      console.log(`Navigation notice: ${e.message}`);
    }

    console.log('Waiting for Shazam theater dialog...');
    await page.waitForTimeout(4000);

    // 1. Check modal root
    const theaterRoot = await page.$('.shazam-theater-root');
    const isRootVisible = !!theaterRoot;
    console.log(`[Check] .shazam-theater-root found: ${isRootVisible}`);

    // 2. Check Ambient meshes
    const ambientMeshes = await page.$$('.ambient-mesh');
    console.log(`[Check] .ambient-mesh count: ${ambientMeshes.length}`);

    // 3. Check Badge text
    const badgeTextEl = await page.$('.shazam-badge-text');
    const badgeText = badgeTextEl ? await badgeTextEl.textContent() : null;
    console.log(`[Check] Badge text: "${badgeText?.trim()}"`);

    // 4. Check Surah meta in header
    const surahMetaEl = await page.$('.header-surah-meta');
    const surahMeta = surahMetaEl ? await surahMetaEl.innerText() : null;
    console.log(`[Check] Surah meta: ${surahMeta?.replace(/\n+/g, ' ')}`);

    // 5. Check Video vs Visualizer stage
    const videoIframe = await page.$('iframe.video-iframe');
    const visualizerStage = await page.$('.visualizer-stage');
    const visualizerOrb = await page.$('.visualizer-orb');
    console.log(`[Check] YouTube Iframe found: ${!!videoIframe}`);
    console.log(`[Check] Sacred Geometry Visualizer Stage found: ${!!visualizerStage}`);
    console.log(`[Check] Pulsing Visualizer Orb found: ${!!visualizerOrb}`);

    // 6. Check Lyric cards
    const lyricCards = await page.$$('.lyric-line-card');
    console.log(`[Check] .lyric-line-card count: ${lyricCards.length} (Expected: ${surah.expectedVerses})`);

    // 7. Check Bismillah banner
    const bismillahEl = await page.$('.bismillah-banner');
    console.log(`[Check] Bismillah banner present: ${!!bismillahEl}`);

    // 8. Test seeking to verse 2 by clicking the 2nd lyric card
    if (lyricCards.length >= 2) {
      console.log('Testing click on verse 2 lyric card...');
      await lyricCards[1].click();
      await page.waitForTimeout(1000);
    }

    // Capture main view screenshot
    const shotFilename = `surah_${surah.id}_theater.png`;
    const shotPath = path.join(screenshotsDir, shotFilename);
    await page.screenshot({ path: shotPath });
    console.log(`[Screenshot Saved] ${shotFilename}`);

    // 9. If visualizer fallback, test 'Watch Channel Video Preview' button
    if (!surah.hasVideo && visualizerStage) {
      const previewBtn = await page.$('button:has-text("Watch Channel Video Preview"), .q-btn:has-text("Watch Channel Video Preview")');
      if (previewBtn) {
        console.log('Testing "Watch Channel Video Preview" button click...');
        await previewBtn.click();
        await page.waitForTimeout(1500);
        const fallbackShotFilename = `surah_${surah.id}_channel_fallback.png`;
        const fallbackShotPath = path.join(screenshotsDir, fallbackShotFilename);
        await page.screenshot({ path: fallbackShotPath });
        console.log(`[Screenshot Saved] ${fallbackShotFilename}`);
      }
    }

    results.push({
      surah: surah.id,
      name: surah.expectedEn,
      rendered: isRootVisible,
      lyricCount: lyricCards.length,
      hasVideo: !!videoIframe,
      hasVisualizer: !!visualizerStage,
      screenshot: shotFilename
    });
  }

  await browser.close();
  console.log('\n========================================');
  console.log('Multi-Surah Verification Results Summary:');
  console.table(results);
  console.log('========================================');
})();
