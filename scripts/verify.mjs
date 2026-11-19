import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'

mkdirSync('.tmp', { recursive: true })
await build({
  entryPoints: ['src/lib/econ.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/econ.mjs',
  logLevel: 'silent',
})
const E = await import(pathToFileURL(process.cwd() + '/.tmp/econ.mjs').href)

let pass = 0
let fail = 0
function check(name, actual, expected, tol = 1e-6) {
  const ok = Math.abs(actual - expected) <= tol
  if (ok) pass++
  else {
    fail++
    console.error(`✗ ${name}: 实际 ${actual}，期望 ${expected}`)
  }
}

// 1. 均衡：P = 120 - 2Q，P = 20 + 2Q
const m = { a: 120, b: 2, c: 20, d: 2 }
const eq = E.equilibrium(m)
check('均衡数量', eq.qty, 25)
check('均衡价格', eq.price, 70)
check('价格 60 时需求量', E.qtyDemanded(m, 60), 30)
check('价格 60 时供给量', E.qtySupplied(m, 60), 20)

// 2. 税收：t = 10
const t = E.taxOutcome(m, 10)
check('税后数量', t.qty, 22.5)
check('消费者价格', t.pc, 75)
check('生产者净价', t.ps, 65)
check('税收收入', t.revenue, 225)
check('无谓损失', t.dwl, 12.5)
check('消费者承担', t.consumerIncidence, 5)
check('生产者承担', t.producerIncidence, 5)

// 3. 弹性（中点法）：10→12，100→80
check('中点弹性', E.midpointElasticity(10, 12, 100, 80), 110 / 90, 1e-9)
// 点弹性：P=60, Q=30, 斜率 2 → (60/30)/2 = 1
check('单位弹性', E.pointElasticity(120, 2, 60), 1)

// 4. 成本：FC=100, VC=10Q+0.5Q²
const cp = { fc: 100, v1: 10, v2: 0.5 }
const qMin = E.minAtcQty(cp)
check('ATC 最低点产量', qMin, Math.sqrt(200), 1e-9)
check('ATC 最低点 = MC', E.avgTotal(cp, qMin), E.marginalCost(cp, qMin), 1e-9)
check('Q=10 时 MC', E.marginalCost(cp, 10), 20)
check('Q=10 时 ATC', E.avgTotal(cp, 10), 25)
const pmax = E.profitMax(100, 1, { fc: 400, v1: 20, v2: 0.5 })
check('利润最大化产量', pmax.qty, 80 / 3, 1e-9)
check('利润最大化价格', pmax.price, 220 / 3, 1e-9)

// 5. 市场结构：P=100-Q，MC=20，F=400
const s = E.marketStructures({ a: 100, b: 1, mc: 20, fixed: 400 })
check('完全竞争产量', s.competition.qty, 80)
check('垄断产量', s.monopoly.qty, 40)
check('垄断价格', s.monopoly.price, 60)
check('垄断利润', s.monopoly.profit, 1200)
check('垄断无谓损失', s.monopoly.dwl, 800)
check('古诺总产量', s.cournot.qty, 160 / 3, 1e-9)
check('古诺价格', s.cournot.price, 140 / 3, 1e-9)
check('垄断竞争零利润', s.monopolistic.profit, 0, 1e-9)

// 6. 外部性：P=100-Q，MPC=10+Q，MEC=Q
const x = E.externality({ a: 100, b: 1, c: 10, d: 1, e: 1 })
check('市场产量', x.market.qty, 45)
check('社会最优产量', x.social.qty, 30)
check('庇古税', x.pigou, 30)
check('无谓损失', x.dwl, 337.5)
check('干预后福利更高', x.social.welfare - x.market.welfare, 337.5, 1e-9)

// 7. PPF
check('PPF 端点', E.ppfY(0, 100, 100), 100)

console.log(`\n计算内核校验：${pass} 项通过，${fail} 项失败`)
if (fail > 0) process.exit(1)
