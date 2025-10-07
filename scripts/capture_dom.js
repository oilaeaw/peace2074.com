import puppeteer from 'puppeteer'

async function run() {
  const url = process.argv[2] || 'http://localhost:3002/quran/1'
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  await page.waitForSelector('#__nuxt')
  const html = await page.$eval('#__nuxt', el => el.innerHTML)
  console.log(html.slice(0, 2000))
  await browser.close()
}
run().catch((err) => { console.error(err); process.exit(1) })
