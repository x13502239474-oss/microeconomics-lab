import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout } from '../components/lab'
import { midpointElasticity, num } from '../lib/econ'

const PRESETS = [
  { name: '食品', p1: 10, p2: 11, q1: 100, q2: 99 },
  { name: '汽油', p1: 7, p2: 8, q1: 50, q2: 47 },
  { name: '奢侈品', p1: 1000, p2: 1100, q1: 100, q2: 85 },
  { name: '日用品', p1: 20, p2: 22, q1: 200, q2: 180 },
]

export default function ElasticityLab() {
  const [p1, setP1] = useState(1000)
  const [p2, setP2] = useState(1100)
  const [q1, setQ1] = useState(100)
  const [q2, setQ2] = useState(85)
  const [active, setActive] = useState('奢侈品')

  const e = p1 !== p2 && q1 !== q2 ? midpointElasticity(p1, p2, q1, q2) : 0
  const type = e > 1.02 ? '富有弹性' : e < 0.98 ? '缺乏弹性' : '单位弹性'
  const rev1 = p1 * q1
  const rev2 = p2 * q2
  const revChange = rev1 > 0 ? ((rev2 - rev1) / rev1) * 100 : 0
  const slope = q2 !== q1 ? (p2 - p1) / (q2 - q1) : 0
  const xMax = Math.ceil(Math.max(q1, q2) * 1.7)
  const yMax = Math.ceil(Math.max(p1, p2) * 1.35)

  const load = (preset: (typeof PRESETS)[number]) => {
    setP1(preset.p1)
    setP2(preset.p2)
    setQ1(preset.q1)
    setQ2(preset.q2)
    setActive(preset.name)
  }

  return (
    <LabShell
      kicker="Laboratory 02 · Elasticity"
      title="弹性计算器"
      lead="同样是涨价 10%，有人几乎不买账，有人立刻换品牌。弹性把这种敏感度变成可比较的数字，也决定了涨价能不能增加收入。"
      formula="Ed = |(ΔQ / Q̄) ÷ (ΔP / P̄)|，Q̄、P̄ 为变动前后的平均值"
      controls={
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] text-muted">原价格 P₁</span>
              <input type="number" value={p1} onChange={(e) => setP1(Number(e.target.value))} className="field tabnum py-1.5 text-[13px]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-muted">新价格 P₂</span>
              <input type="number" value={p2} onChange={(e) => setP2(Number(e.target.value))} className="field tabnum py-1.5 text-[13px]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-muted">原数量 Q₁</span>
              <input type="number" value={q1} onChange={(e) => setQ1(Number(e.target.value))} className="field tabnum py-1.5 text-[13px]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-muted">新数量 Q₂</span>
              <input type="number" value={q2} onChange={(e) => setQ2(Number(e.target.value))} className="field tabnum py-1.5 text-[13px]" />
            </label>
          </div>
          <div className="border-t border-linesoft pt-3">
            <div className="meta mb-2">商品案例</div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => load(preset)}
                  className={`border px-2 py-1.5 text-[11.5px] ${
                    active === preset.name ? 'border-navy bg-navy text-paper' : 'border-line text-muted hover:border-steel'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </>
      }
      chart={
        <CurvePlot
          height={330}
          spec={{
            xLabel: '数量 Q',
            yLabel: '价格 P',
            xMax,
            yMax,
            curves: [{ label: '需求曲线', color: 'navy', f: (x) => p1 + slope * (x - q1) }],
            shapes: [
              { kind: 'point', x: q1, y: p1, label: `A (${q1}, ${p1})`, color: 'steel' },
              { kind: 'point', x: q2, y: p2, label: `B (${q2}, ${p2})`, color: 'copper' },
            ],
            caption: '两点决定一条线性需求曲线；弹性大小与曲线陡峭程度有关，也随位置变化。',
          }}
        />
      }
      readouts={
        <>
          <Readout label="需求价格弹性" value={num(e, 2)} hint="中点法" tone={e > 1 ? 'copper' : 'ink'} />
          <Readout label="弹性类型" value={type} tone={e > 1 ? 'copper' : e < 1 ? 'moss' : 'ink'} />
          <Readout label="收入变化" value={`${revChange >= 0 ? '+' : ''}${num(revChange, 1)}%`} tone={revChange >= 0 ? 'moss' : 'oxblood'} />
          <Readout label="原收入" value={num(rev1, 0)} />
          <Readout label="新收入" value={num(rev2, 0)} />
          <Readout label="价格变化" value={`${num(((p2 - p1) / p1) * 100, 1)}%`} />
        </>
      }
      note={
        <>
          <p>
            当前弹性 {num(e, 2)}：{e > 1 ? '富有弹性，涨价会减少总收益，降价反而增收。' : e < 1 ? '缺乏弹性，涨价会增加总收益，但销量下降。' : '单位弹性，价格变化不改变总收益。'}
          </p>
          <p className="mt-2">
            把「食品」与「奢侈品」两个预设对比：前者的数量几乎不随价格变化，后者对价格高度敏感。弹性不是产品「贵不贵」，而是「有没有替代品、能不能不买」。
          </p>
        </>
      }
    />
  )
}
