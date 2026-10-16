const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const screenshotsDir = '/Users/waelio/.gemini/antigravity-ide/brain/10e369ed-80ee-479a-bd12-58f78dd13e02';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching Chrome with Playwright...');
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

  console.log('Navigating to http://localhost:4000/quran/1?lyrics=true ...');
  try {
    await page.goto('http://localhost:4000/quran/1?lyrics=true', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  } catch (e) {
    console.log('Networkidle timeout or partial load, continuing...', e.message);
  }

  console.log('Waiting for Shazam theater dialog...');
  await page.waitForTimeout(4000);

  // Check dialog root
  const theaterRoot = await page.$('.shazam-theater-root');
  console.log(`[Check] .shazam-theater-root found: ${!!theaterRoot}`);

  // Check ambient meshes
  const ambientMeshes = await page.$$('.ambient-mesh');
  console.log(`[Check] .ambient-mesh count: ${ambientMeshes.length}`);

  // Check Shazam badge & branding
  const badgeTextEl = await page.$('.shazam-badge-text');
  const badgeText = badgeTextEl ? await badgeTextEl.textContent() : null;
  console.log(`[Check] .shazam-badge-text: "${badgeText?.trim()}"`);

  // Check equalizer bars
  const eqBars = await page.$$('.shazam-equalizer-bars .bar');
  console.log(`[Check] Equalizer bars count: ${eqBars.length}`);

  // Check surah meta & reciter
  const surahMetaEl = await page.$('.header-surah-meta');
  const surahMeta = surahMetaEl ? await surahMetaEl.innerText() : null;
  console.log(`[Check] Surah meta: ${surahMeta?.replace(/\n+/g, ' ')}`);

  // Check video stage / geometry visualizer / iframe
  const videoStage = await page.$('.video-stage-container, .video-player-wrap, .shazam-video-stage, .geometry-canvas-wrapper, canvas');
  console.log(`[Check] Video / Visualizer stage element found: ${!!videoStage}`);

  // Check lyrics stream
  const lyricsContainer = await page.$('.lyrics-scroll-area, .lyrics-stream-container, .shazam-lyrics-panel, .lyrics-container');
  console.log(`[Check] Lyrics container found: ${!!lyricsContainer}`);

  const ayahLines = await page.$$('.lyric-line, .ayah-lyric-card, .lyric-row, [class*="lyric"]');
  console.log(`[Check] Lyric lines/elements found: ${ayahLines.length}`);

  // Take initial Split Theater screenshot
  const initialShotPath = path.join(screenshotsDir, 'theater_split.png');
  await page.screenshot({ path: initialShotPath });
  console.log(`[Screenshot Saved] ${initialShotPath}`);

  // Check Layout View Buttons
  console.log('Testing layout switcher: Lyrics Focus...');
  const lyricsFocusBtn = await page.$('button:has-text("Lyrics Focus"), [aria-label*="Lyrics Focus"], .q-btn:has-text("Lyrics Focus")');
  if (lyricsFocusBtn) {
    await lyricsFocusBtn.click();
    await page.waitForTimeout(1500);
    const lyricsFocusShotPath = path.join(screenshotsDir, 'theater_lyrics_focus.png');
    await page.screenshot({ path: lyricsFocusShotPath });
    console.log(`[Screenshot Saved] ${lyricsFocusShotPath}`);
  } else {
    console.log('[Notice] Lyrics Focus button not found by text query');
  }

  console.log('Testing layout switcher: Video Stage...');
  const videoStageBtn = await page.$('button:has-text("Video Stage"), [aria-label*="Video Stage"], .q-btn:has-text("Video Stage")');
  if (videoStageBtn) {
    await videoStageBtn.click();
    await page.waitForTimeout(1500);
    const videoStageShotPath = path.join(screenshotsDir, 'theater_video_stage.png');
    await page.screenshot({ path: videoStageShotPath });
    console.log(`[Screenshot Saved] ${videoStageShotPath}`);
  } else {
    console.log('[Notice] Video Stage button not found by text query');
  }

  // Switch back to Split Theater
  console.log('Switching back to Split Theater...');
  const splitBtn = await page.$('button:has-text("Split Theater"), [aria-label*="Split Theater"], .q-btn:has-text("Split Theater")');
  if (splitBtn) {
    await splitBtn.click();
    await page.waitForTimeout(1500);
  }

  // Check Play Button
  console.log('Checking Play button...');
  const playBtn = await page.$('.playback-controls button, button:has-text("Play"), .q-btn:has(.q-icon[name="play_arrow"])');
  if (playBtn) {
    console.log('Found Play button, clicking...');
    await playBtn.click();
    await page.waitForTimeout(3000);
    const playingShotPath = path.join(screenshotsDir, 'theater_playing.png');
    await page.screenshot({ path: playingShotPath });
    console.log(`[Screenshot Saved] ${playingShotPath}`);
  } else {
    console.log('[Notice] Play button not found via standard selector');
  }

  await browser.close();
  console.log('Verification run finished successfully.');
})();
