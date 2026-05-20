import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4000/signup', { waitUntil: 'networkidle' });
const html = await page.content();
console.log(html.slice(0,2000));
console.log('--- selector counts ---');
console.log('q-input count', await page.$$eval('q-input', els => els.length));
console.log('input count', await page.$$eval('input', els => els.length));
const usernameInputs = await page.$$eval('input', els => els.filter(i => {
  const aria = i.getAttribute('aria-label') || '';
  return aria.toLowerCase().includes('username') || (i.name || '').toLowerCase().includes('username') || (i.id || '').toLowerCase().includes('username');
}).map(i => ({name:i.name, id:i.id, aria:i.getAttribute('aria-label')})));
console.log('username inputs', usernameInputs);
await browser.close();
