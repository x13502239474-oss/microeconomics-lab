import puppeteer from 'puppeteer-core'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
const [path = '/', out = 'shot', w = '390', h = '844', scroll = '0'] = process.argv.slice(2)
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 2, isMobile: Number(w) < 700, hasTouch: Number(w) < 700 })
await page.goto('http://localhost:4380/#' + path, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 300))
if (Number(scroll)) await page.evaluate((y) => window.scrollTo(0, y), Number(scroll))
await new Promise((r) => setTimeout(r, 250))
await page.screenshot({ path: `.tmp/shots/${out}.png` })
await browser.close()
