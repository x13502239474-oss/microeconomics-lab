import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const [path = '/lesson/s2-12', prefix = 'chart', w = '390'] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: 844, deviceScaleFactor: 2, isMobile: Number(w) < 700 })
await page.goto('http://localhost:4380/#' + path, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 400))
fs.mkdirSync('.tmp/shots', { recursive: true })
const svgs = await page.$$('svg')
let i = 0
for (const el of svgs) {
  const box = await el.boundingBox()
  if (!box || box.width < 200 || box.height < 80) continue
  const name = `.tmp/shots/${prefix}-${i}.png`
  await el.screenshot({ path: name })
  console.log(`${name} ${Math.round(box.width)}x${Math.round(box.height)}`)
  i++
}
await browser.close()
