import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)

const targets = process.argv.slice(2)
const pages = targets.length
  ? targets
  : ['/', '/course', '/lesson/s2-12', '/labs', '/labs/structure', '/wrong', '/me', '/cases', '/about']

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})

let problems = 0
for (const path of pages) {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto(`http://localhost:4380/#${path}`, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 400))
  const info = await page.evaluate(() => {
    const vw = window.innerWidth
    const bad = []
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.right > vw + 1) {
        const cs = getComputedStyle(el)
        if (cs.position === 'fixed') return
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 70),
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 24),
        })
      }
    })
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewport: vw,
      height: document.documentElement.scrollHeight,
      bad: bad.slice(0, 8),
      h1: document.querySelector('h1')?.textContent?.trim(),
    }
  })
  const name = path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-/, '')
  await page.screenshot({ path: `.tmp/shots/v-${name}.png`, fullPage: true })
  const overflow = info.scrollWidth > info.viewport + 1
  if (overflow) problems++
  console.log(
    `${overflow ? '✗' : '✓'} ${path.padEnd(20)} h=${info.height} scrollW=${info.scrollWidth} viewport=${info.viewport} h1=${info.h1 || '-'}`,
  )
  if (overflow) console.log('   overflow:', JSON.stringify(info.bad, null, 1))
  if (errors.length) console.log('   errors:', errors.slice(0, 3))
  await page.close()
}

await browser.close()
console.log(problems ? `\n${problems} 个页面存在横向溢出` : '\n所有页面无横向溢出')
