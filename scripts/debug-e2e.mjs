import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
    await page.goto(`${base}/`);
    await page.waitForTimeout(1000);
    // click the Read Quran button
    const readBtn = page.locator('text=Read Quran');
    if (await readBtn.count() > 0) {
      await readBtn.first().click();
    } else {
      console.log('Read Quran button not found');
    }

    // wait for navigation
    await page.waitForTimeout(1000);
    const url = page.url();
    console.log('URL after click:', url);

    // dump HTML and check for selectors
    const content = await page.content();
    console.log('PAGE HTML SNIPPET (first 2000 chars):');
    console.log(content.slice(0, 2000));

    const count = await page.locator('.sura-card').count();
    console.log('.sura-card count =', count);

    if (count === 0) {
      // take screenshot to file
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      console.log('Screenshot saved to debug-screenshot.png');
    }
  } catch (err) {
    console.error('Error during debug run:', err);
  } finally {
    await browser.close();
  }
})();
