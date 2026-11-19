import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout, Slider } from '../components/lab'
import { costTable, minAtcQty, num } from '../lib/econ'
import { costChart } from '../content/plots'

export default function CostLab() {
  const [q, setQ] = useState(10)
  const [fc, setFc] = useState(100)
  const [v1, setV1] = useState(10)
  const [v2, setV2] = useState(0.5)
  const cp = { fc, v1, v2 }
  const row = costTable(cp, q)
  const qMin = minAtcQty(cp)

  return (
    <LabShell
      kicker="Laboratory 04 · Cost Curves"
      title="企业成本实验室"
      lead="固定成本像一块要摊的饼，可变成本随产量上升。拖动产量与成本参数，看平均成本为什么是 U 形，边际成本又为什么穿过它的最低点。"
      formula="TC = FC + v₁Q + v₂Q²　MC = v₁ + 2v₂Q　ATC = FC/Q + v₁ + v₂Q"
      controls={
        <>
          <Slider label="产量 Q" value={q} onChange={setQ} min={1} max={50} unit="件" />
          <Slider label="固定成本 FC" value={fc} onChange={setFc} min={0} max={400} unit="元" hint="房租、设备折旧" />
          <Slider label="可变成本系数 v₁" value={v1} onChange={setV1} min={0} max={30} unit="元/件" hint="每件都发生的成本" />
          <Slider label="可变成本系数 v₂" value={v2} onChange={setV2} min={0.1} max={2} step={0.1} hint="产量越大，边际成本上升越快" />
          <div className="border-t border-linesoft pt-3 text-[11px] leading-relaxed text-muted">
            ATC 最低点产量：√(FC / v₂) = <span className="font-mono text-ink">{num(qMin, 1)}</span>
          </div>
        </>
      }
      chart={<CurvePlot height={340} spec={costChart(cp, 50, 'MC 从下方穿过 AVC 与 ATC 的最低点；AFC 持续下降但永远为正。')} />}
      readouts={
        <>
          <Readout label="总成本 TC" value={num(row.tc, 1)} unit="元" />
          <Readout label="固定成本 FC" value={num(row.fc, 1)} />
          <Readout label="可变成本 VC" value={num(row.vc, 1)} />
          <Readout label="平均固定成本 AFC" value={num(row.afc, 2)} />
          <Readout label="平均可变成本 AVC" value={num(row.avc, 2)} />
          <Readout label="平均总成本 ATC" value={num(row.atc, 2)} tone="copper" />
          <Readout label="边际成本 MC" value={num(row.mc, 2)} tone="oxblood" />
          <Readout label="ATC 最低点" value={num(costTable(cp, qMin).atc, 2)} hint={`Q = ${num(qMin, 1)}`} />
          <Readout label="当前是否低于最低点" value={q < qMin ? '是' : '否'} hint={q < qMin ? 'ATC 仍在下降' : 'ATC 已开始上升'} />
        </>
      }
      note={
        <>
          <p>
            当前产量 {q} 件：总成本 {num(row.tc, 1)} 元，平均成本 {num(row.atc, 2)} 元，边际成本 {num(row.mc, 2)} 元。
            {row.mc < row.atc ? ' 边际成本低于平均成本，ATC 正在下降。' : ' 边际成本高于平均成本，ATC 正在上升。'}
          </p>
          <p className="mt-2">
            把固定成本翻倍，ATC 整体上移、最低点右移，但 MC 曲线不动——因为多生产一件并不需要多付房租。这正是短期决策看 MC、长期生存看 ATC 的原因。
          </p>
        </>
      }
    />
  )
}
