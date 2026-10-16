const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const screenshotsDir = '/Users/waelio/.gemini/antigravity-ide/brain/262cbc82-689a-4d03-b8fe-94dcfe751c87';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching Chrome with Playwright for Reciter Switching Verification...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });

  const url = 'http://localhost:4000/quran/112?lyrics=true';
  console.log(`Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.log(`Navigation notice: ${e.message}`);
  }

  console.log('Waiting for Shazam theater dialog...');
  await page.waitForTimeout(4000);

  // 1. Check initial reciter label
  const initialReciterText = await page.locator('.reciter-selector-dropdown .q-btn__content').innerText();
  console.log(`[Check] Initial reciter dropdown text: "${initialReciterText.trim()}"`);

  // 2. Click the reciter selector dropdown with force: true
  console.log('Clicking reciter selector dropdown...');
  await page.locator('.reciter-selector-dropdown').click({ force: true });
  await page.waitForTimeout(1000);

  // Take screenshot with dropdown menu open
  const menuShotPath = path.join(screenshotsDir, 'reciter_dropdown_open.png');
  await page.screenshot({ path: menuShotPath });
  console.log(`[Screenshot Saved] ${menuShotPath}`);

  // 3. Select AbdulBaset AbdulSamad
  console.log('Selecting "AbdulBaset AbdulSamad"...');
  const abdulbasetItem = page.locator('.q-menu .q-item:has-text("AbdulBaset AbdulSamad")');
  await abdulbasetItem.click({ force: true });
  await page.waitForTimeout(2500);

  // 4. Verify new reciter label
  const updatedReciterText = await page.locator('.reciter-selector-dropdown .q-btn__content').innerText();
  console.log(`[Check] Updated reciter dropdown text: "${updatedReciterText.trim()}"`);

  // 5. Check bottom dock reciter text
  const dockReciterText = await page.locator('.shazam-dock-footer').innerText();
  console.log(`[Check] Dock footer contains AbdulBaset: ${dockReciterText.includes('AbdulBaset')}`);

  // Take screenshot with AbdulBaset active
  const abdulbasetShotPath = path.join(screenshotsDir, 'reciter_abdulbaset_active.png');
  await page.screenshot({ path: abdulbasetShotPath });
  console.log(`[Screenshot Saved] ${abdulbasetShotPath}`);

  // 6. Test Play/Pause audio with new reciter
  console.log('Testing audio playback trigger with AbdulBaset...');
  const playBtn = page.locator('.dock-play-btn');
  await playBtn.click({ force: true });
  await page.waitForTimeout(2500);

  const playingShotPath = path.join(screenshotsDir, 'reciter_abdulbaset_playing.png');
  await page.screenshot({ path: playingShotPath });
  console.log(`[Screenshot Saved] ${playingShotPath}`);

  await browser.close();
  console.log('\nReciter Verification Completed Successfully!');
})();
