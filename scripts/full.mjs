import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
fs.mkdirSync('.tmp/shots', { recursive: true })
const routes = (process.env.ROUTES || '/').split(',')
const w = Number(process.env.W || 390)
for (const r of routes) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: 844, deviceScaleFactor: 2, isMobile: w < 700 })
  await page.goto('http://localhost:4380/#' + r, { waitUntil: 'networkidle0' })
  await new Promise((res) => setTimeout(res, 500))
  const name = `.tmp/shots/full-${r.replace(/[^a-z0-9]/gi, '_') || 'home'}-${w}.png`
  await page.screenshot({ path: name, fullPage: true })
  const h = await page.evaluate(() => document.body.scrollHeight)
  console.log(name, h)
  await page.close()
}
await browser.close()
