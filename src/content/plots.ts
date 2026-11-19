import type { ChartSpec } from '../types'
import { equilibrium, taxOutcome, type CostParams } from '../lib/econ'

type MarketOpts = {
  a: number
  b: number
  c: number
  d: number
  tax?: number
  price?: number
  surplus?: boolean
  caption?: string
  xMax?: number
}

/** 标准的供求图：可叠加税收楔子、剩余区域与当前价格线 */
export function marketChart({ a, b, c, d, tax, price, surplus, caption, xMax }: MarketOpts): ChartSpec {
  const eq = equilibrium({ a, b, c, d })
  const curves: NonNullable<ChartSpec['curves']> = [
    { label: '需求 D', color: 'navy', f: (x: number) => a - b * x },
    { label: '供给 S', color: 'copper', f: (x: number) => c + d * x },
  ]
  const shapes: ChartSpec['shapes'] = [
    { kind: 'point', x: eq.qty, y: eq.price, label: `E (${eq.qty.toFixed(0)}, ${eq.price.toFixed(0)})`, color: 'copper' },
  ]

  if (tax && tax > 0) {
    const out = taxOutcome({ a, b, c, d }, tax)
    curves.push({ label: '税后供给 S+t', color: 'steel', dash: true, f: (x: number) => c + tax + d * x })
    shapes.push({ kind: 'hline', y: out.pc, label: `消费者支付 ${out.pc.toFixed(1)}`, color: 'navy' })
    shapes.push({ kind: 'hline', y: out.ps, label: `生产者净得 ${out.ps.toFixed(1)}`, color: 'copper' })
    shapes.push({ kind: 'vline', x: out.qty, label: `税后数量 ${out.qty.toFixed(1)}`, color: 'steel' })
    if (surplus) {
      shapes.push({
        kind: 'polygon',
        points: [
          [out.qty, out.pc],
          [out.qty, out.ps],
          [eq.qty, eq.price],
        ],
        fill: 'oxblood',
        label: '无谓损失',
      })
    }
  } else if (price !== undefined) {
    shapes.push({ kind: 'hline', y: price, label: `P = ${price}`, color: 'steel' })
  } else if (surplus) {
    shapes.push({
      kind: 'polygon',
      points: [
        [0, a],
        [0, eq.price],
        [eq.qty, eq.price],
      ],
      fill: 'navy',
      label: '消费者剩余',
    })
    shapes.push({
      kind: 'polygon',
      points: [
        [0, c],
        [0, eq.price],
        [eq.qty, eq.price],
      ],
      fill: 'copper',
      label: '生产者剩余',
    })
  }

  return {
    xLabel: '数量 Q',
    yLabel: '价格 P',
    xMax: xMax ?? Math.ceil(eq.qty * 1.8),
    yMax: Math.ceil(a * 1.08),
    curves,
    shapes,
    caption,
  }
}

/** 成本曲线族：ATC / AVC / MC / AFC */
export function costChart(cp: CostParams, xMax: number, caption?: string): ChartSpec {
  const yMax = Math.ceil((cp.fc / Math.max(1, xMax * 0.25) + cp.v1 + cp.v2 * xMax) * 1.05)
  return {
    xLabel: '产量 Q',
    yLabel: '单位成本',
    xMin: 0,
    yMin: 0,
    xMax,
    yMax,
    curves: [
      { label: 'MC 边际成本', color: 'navy', f: (x) => cp.v1 + 2 * cp.v2 * x, from: 0 },
      { label: 'ATC 平均总成本', color: 'copper', f: (x) => (x > 0 ? cp.fc / x + cp.v1 + cp.v2 * x : NaN), from: 0.6 },
      { label: 'AVC 平均可变成本', color: 'steel', f: (x) => cp.v1 + cp.v2 * x, from: 0 },
      { label: 'AFC 平均固定成本', color: 'moss', dash: true, f: (x) => (x > 0 ? cp.fc / x : NaN), from: 1 },
    ],
    shapes: [{ kind: 'point', x: Math.sqrt(cp.fc / cp.v2), y: cp.v1 + 2 * cp.v2 * Math.sqrt(cp.fc / cp.v2), label: 'ATC 最低点', color: 'copper' }],
    caption,
  }
}

/** 生产可能性边界 */
export function ppfChart(xbar: number, ybar: number, point?: { x: number; y: number }): ChartSpec {
  return {
    xLabel: '消费品',
    yLabel: '资本品',
    xMax: xbar * 1.1,
    yMax: ybar * 1.1,
    curves: [{ label: 'PPF', color: 'navy', f: (x) => (x >= xbar ? 0 : ybar * Math.sqrt(1 - (x * x) / (xbar * xbar))) }],
    shapes: point ? [{ kind: 'point', x: point.x, y: point.y, label: '当前组合', color: 'copper' }] : [],
    caption: '边界之内是可行但未充分利用的组合，边界之外在现有资源与技术下不可实现。',
  }
}

/** 垄断与竞争对比图 */
export function monopolyChart(a: number, b: number, mc: number): ChartSpec {
  const qc = (a - mc) / b
  const qm = (a - mc) / (2 * b)
  const pm = (a + mc) / 2
  return {
    xLabel: '数量 Q',
    yLabel: '价格 P',
    xMax: qc * 1.15,
    yMax: a * 1.05,
    curves: [
      { label: '需求 D', color: 'navy', f: (x) => a - b * x },
      { label: '边际收益 MR', color: 'steel', dash: true, f: (x) => a - 2 * b * x },
      { label: '边际成本 MC', color: 'copper', f: () => mc },
    ],
    shapes: [
      { kind: 'vline', x: qm, label: `Qm = ${qm.toFixed(1)}`, color: 'steel' },
      { kind: 'hline', y: pm, label: `Pm = ${pm.toFixed(1)}`, color: 'navy' },
      { kind: 'hline', y: mc, label: `Pc = MC = ${mc}`, color: 'copper' },
      { kind: 'point', x: qm, y: pm, label: '垄断定价点', color: 'copper' },
      {
        kind: 'polygon',
        points: [
          [qm, pm],
          [qm, mc],
          [qc, mc],
        ],
        fill: 'oxblood',
        label: '无谓损失',
      },
    ],
    caption: '垄断者按 MR = MC 定产量，再回到需求曲线定价格，价格高于边际成本。',
  }
}
