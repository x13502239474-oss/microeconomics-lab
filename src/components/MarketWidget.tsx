import { useMemo, useState } from 'react'
import { equilibrium, num, qtyDemanded, qtySupplied } from '../lib/econ'
import { CurvePlot } from './CurvePlot'

export function MarketWidget({
  a = 120,
  b = 2,
  c = 20,
  d = 2,
  price = 60,
  caption,
}: {
  a?: number
  b?: number
  c?: number
  d?: number
  price?: number
  caption?: string
}) {
  const [p, setP] = useState(price)
  const m = { a, b, c, d }
  const eq = useMemo(() => equilibrium(m), [a, b, c, d])
  const qd = Math.max(0, qtyDemanded(m, p))
  const qs = Math.max(0, qtySupplied(m, p))
  const gap = qd - qs
  const status = Math.abs(gap) < 0.05 ? '均衡' : gap > 0 ? `短缺 ${num(gap, 1)}` : `过剩 ${num(-gap, 1)}`
  const xMax = Math.ceil(Math.max(eq.qty * 1.9, 40))

  return (
    <div className="border border-line bg-[#FBF7EE] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow">Interactive · 拖动价格</div>
        <div className="meta">均衡 P* = {num(eq.price, 1)}，Q* = {num(eq.qty, 1)}</div>
      </div>

      <div className="mt-3">
        <CurvePlot
          height={260}
          spec={{
            xLabel: '数量 Q',
            yLabel: '价格 P',
            xMax,
            yMax: Math.ceil(a * 1.08),
            curves: [
              { label: '需求 D', color: 'navy', f: (x) => a - b * x },
              { label: '供给 S', color: 'copper', f: (x) => c + d * x },
            ],
            shapes: [
              { kind: 'hline', y: p, label: `P = ${num(p, 0)}`, color: 'steel' },
              { kind: 'vline', x: qd, label: `Qd ${num(qd, 1)}`, color: 'navy', dash: true },
              { kind: 'vline', x: qs, label: `Qs ${num(qs, 1)}`, color: 'copper', dash: true },
              { kind: 'point', x: eq.qty, y: eq.price, label: 'E', color: 'oxblood' },
            ],
          }}
        />
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={a}
          step={1}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          aria-label="价格"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted">
          <span>0</span>
          <span>价格 {num(p, 0)} 元</span>
          <span>{a}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-line border-t border-line pt-3">
        <div className="pr-3">
          <div className="meta">需求量</div>
          <div className="tabnum mt-0.5 font-serif text-[19px]">{num(qd, 1)}</div>
        </div>
        <div className="px-3">
          <div className="meta">供给量</div>
          <div className="tabnum mt-0.5 font-serif text-[19px]">{num(qs, 1)}</div>
        </div>
        <div className="pl-3">
          <div className="meta">市场状态</div>
          <div className={`mt-0.5 text-[13px] ${gap > 0.05 ? 'text-oxblood' : gap < -0.05 ? 'text-copper' : 'text-moss'}`}>
            {status}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {caption || '价格高于均衡价出现过剩，卖者降价；低于均衡价出现短缺，买者加价。'}
      </p>
    </div>
  )
}
