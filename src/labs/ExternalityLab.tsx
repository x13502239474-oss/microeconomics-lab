import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout, Slider } from '../components/lab'
import { externality, num } from '../lib/econ'

export default function ExternalityLab() {
  const [a, setA] = useState(100)
  const [c, setC] = useState(10)
  const [e, setE] = useState(1)
  const b = 1
  const d = 1
  const x = externality({ a, b, c, d, e })
  const mscAtMarket = c + (d + e) * x.market.qty

  return (
    <LabShell
      kicker="Laboratory 07 · Externalities"
      title="外部性模拟器"
      lead="工厂只付私人成本，居民却承担污染损失。拖动「边际外部成本」，看市场产量如何超过社会最优，以及庇古税怎样把产量拉回来。"
      formula="MSC = c + (d + e)Q　市场 Qm = (a − c)/(b + d)　社会最优 Qs = (a − c)/(b + d + e)"
      controls={
        <>
          <Slider label="边际外部成本 e" value={e} onChange={setE} min={0} max={2.5} step={0.1} unit="倍" hint="0 表示没有外部性" />
          <Slider label="需求截距 a" value={a} onChange={setA} min={60} max={150} />
          <Slider label="私人成本 c" value={c} onChange={setC} min={0} max={50} />
          <div className="border-t border-linesoft pt-3">
            <div className="meta mb-1">庇古税</div>
            <div className="tabnum font-serif text-[24px] text-copper">{num(x.pigou, 1)} 元/单位</div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">等于社会最优产量处的边际外部成本。</p>
          </div>
        </>
      }
      chart={
        <CurvePlot
          height={340}
          spec={{
            xLabel: '数量 Q',
            yLabel: '价格 / 成本',
            xMax: Math.ceil(x.market.qty * 1.9),
            yMax: Math.ceil(a * 1.1),
            curves: [
              { label: '需求 D', color: 'navy', f: (q) => a - b * q },
              { label: '私人成本 MPC', color: 'copper', f: (q) => c + d * q },
              { label: '社会成本 MSC', color: 'oxblood', dash: true, f: (q) => c + (d + e) * q },
            ],
            shapes: [
              { kind: 'point', x: x.market.qty, y: x.market.price, label: `市场 ${num(x.market.qty, 1)}`, color: 'copper' },
              { kind: 'point', x: x.social.qty, y: x.social.price, label: `社会最优 ${num(x.social.qty, 1)}`, color: 'moss' },
              {
                kind: 'polygon',
                points: [
                  [x.social.qty, x.social.price],
                  [x.market.qty, x.market.price],
                  [x.market.qty, mscAtMarket],
                ],
                fill: 'oxblood',
                label: '无谓损失',
              },
            ],
            caption: '市场只按 MPC 决策，产量超过社会最优；红色三角形是过量生产造成的净损失。',
          }}
        />
      }
      readouts={
        <>
          <Readout label="市场产量" value={num(x.market.qty, 1)} tone="oxblood" />
          <Readout label="社会最优产量" value={num(x.social.qty, 1)} tone="moss" />
          <Readout label="过量生产" value={num(x.gap, 1)} />
          <Readout label="庇古税" value={num(x.pigou, 1)} unit="元" tone="copper" />
          <Readout label="无谓损失" value={num(x.dwl, 1)} tone="oxblood" />
          <Readout label="福利改善" value={num(x.social.welfare - x.market.welfare, 1)} tone="moss" hint="征税后可达" />
        </>
      }
      note={
        <>
          <p>
            当前外部成本系数 e = {num(e, 1)}：市场产量 {num(x.market.qty, 1)}，社会最优 {num(x.social.qty, 1)}，多出的 {num(x.gap, 1)} 单位造成{' '}
            {num(x.dwl, 1)} 元净损失。
          </p>
          <p className="mt-2">
            按 {num(x.pigou, 1)} 元/单位征税后，企业面对的私人成本曲线上移到 MSC 的位置，市场会自动选择社会最优产量。注意：最优污染通常不是零，而是「边际治理成本 = 边际损害」的水平。
          </p>
          <p className="mt-1.5 text-muted">把 e 调到 0，两条成本曲线重合，外部性消失，市场均衡即社会最优。</p>
        </>
      }
    />
  )
}
