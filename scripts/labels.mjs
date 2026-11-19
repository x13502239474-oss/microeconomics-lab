import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const ids = fs
  .readFileSync('.tmp/ids.txt', 'utf8')
  .trim()
  .split(/\s+/)
const routes = ids.map((i) => '/lesson/' + i).concat(['/labs/supply-demand', '/labs/elasticity', '/labs/tax', '/labs/cost', '/labs/profit', '/labs/structure', '/labs/externality'])
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true })
let problems = 0
for (const r of routes) {
  await page.goto('http://localhost:4380/#' + r, { waitUntil: 'networkidle0' })
  await new Promise((res) => setTimeout(res, 250))
  const out = await page.evaluate(() => {
    const issues = []
    document.querySelectorAll('svg').forEach((svg, si) => {
      const sb = svg.getBoundingClientRect()
      if (sb.width < 200 || sb.height < 80) return
      const texts = [...svg.querySelectorAll('text')].map((t) => ({
        s: t.textContent.trim(),
        r: t.getBoundingClientRect(),
      }))
      // 文字互相重叠
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i].r
          const b = texts[j].r
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ox > 3 && oy > 3) issues.push(`svg${si} 文字重叠: "${texts[i].s}" × "${texts[j].s}" (${Math.round(ox)}x${Math.round(oy)}px)`)
        }
      }
      // 文字超出画布
      for (const t of texts) {
        if (!t.s) continue
        if (t.r.left < sb.left - 2 || t.r.right > sb.right + 2 || t.r.top < sb.top - 2 || t.r.bottom > sb.bottom + 2)
          issues.push(`svg${si} 文字溢出: "${t.s}"`)
      }
    })
    return issues
  })
  if (out.length) {
    problems += out.length
    console.log(r)
    out.forEach((x) => console.log('   ' + x))
  }
}
console.log(problems ? `\n共 ${problems} 处图表文字问题` : '\n图表文字无重叠/溢出')
await browser.close()
