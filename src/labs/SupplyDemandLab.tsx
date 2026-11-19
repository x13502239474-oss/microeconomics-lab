import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout, Slider } from '../components/lab'
import { num } from '../lib/econ'

export default function SupplyDemandLab() {
  const [a, setA] = useState(120)
  const [c, setC] = useState(20)
  const [size, setSize] = useState(1)
  const [p, setP] = useState(60)
  const b = 2
  const d = 2

  const qEq = (size * (a - c)) / (b + d)
  const pEq = a - (b * qEq) / size
  const qd = Math.max(0, (size * (a - p)) / b)
  const qs = Math.max(0, (size * (p - c)) / d)
  const gap = qd - qs
  const cs = 0.5 * Math.max(0, a - pEq) * qEq
  const ps = 0.5 * Math.max(0, pEq - c) * qEq

  return (
    <LabShell
      kicker="Laboratory 01 · Supply & Demand"
      title="供需市场模拟器"
      lead="价格不是谁定的，是买卖双方在同一张图上相遇的结果。拖动参数，看均衡如何移动，以及价格偏离均衡时短缺与过剩如何出现。"
      formula="Qd = m(a − bP)　Qs = m(c + dP)　Q* = m(a − c)/(b + d)"
      controls={
        <>
          <Slider label="当前价格 P" value={p} onChange={setP} min={0} max={140} unit="元" hint="拖动它，观察偏离均衡后的市场状态" />
          <Slider label="需求强度 a" value={a} onChange={setA} min={80} max={180} unit="元" hint="收入上升、偏好增强 → 需求右移" />
          <Slider label="供给成本 c" value={c} onChange={setC} min={0} max={60} unit="元" hint="原料或工资上涨 → 供给左移" />
          <Slider label="市场规模 m" value={size} onChange={setSize} min={0.5} max={2} step={0.1} unit="倍" hint="买者与卖者同比增加，价格不变、数量放大" />
          <button
            className="btn-outline w-full py-1.5 text-[11px]"
            onClick={() => {
              setA(120)
              setC(20)
              setSize(1)
              setP(60)
            }}
          >
            重置参数
          </button>
        </>
      }
      chart={
        <CurvePlot
          height={330}
          spec={{
            xLabel: '数量 Q',
            yLabel: '价格 P',
            xMax: Math.ceil(size * 100),
            yMax: Math.ceil(a * 1.06),
            curves: [
              { label: '需求 D', color: 'navy', f: (x) => a - (b * x) / size },
              { label: '供给 S', color: 'copper', f: (x) => c + (d * x) / size },
            ],
            shapes: [
              { kind: 'hline', y: p, label: `P = ${num(p, 0)}`, color: 'steel' },
              { kind: 'vline', x: qd, label: `Qd ${num(qd, 1)}`, color: 'navy', dash: true },
              { kind: 'vline', x: qs, label: `Qs ${num(qs, 1)}`, color: 'copper', dash: true },
              { kind: 'point', x: qEq, y: pEq, label: `E (${num(qEq, 1)}, ${num(pEq, 1)})`, color: 'oxblood' },
            ],
            caption: '均衡点 E 是唯一没有短缺也没有过剩的价格—数量组合。',
          }}
        />
      }
      readouts={
        <>
          <Readout label="均衡价格" value={num(pEq, 1)} unit="元" />
          <Readout label="均衡数量" value={num(qEq, 1)} />
          <Readout
            label="市场状态"
            value={Math.abs(gap) < 0.05 ? '均衡' : gap > 0 ? '短缺' : '过剩'}
            tone={Math.abs(gap) < 0.05 ? 'moss' : gap > 0 ? 'oxblood' : 'copper'}
            hint={Math.abs(gap) < 0.05 ? '买卖数量相等' : `${num(Math.abs(gap), 1)} 单位`}
          />
          <Readout label="当前需求量" value={num(qd, 1)} />
          <Readout label="当前供给量" value={num(qs, 1)} />
          <Readout label="总剩余" value={num(cs + ps, 0)} hint="CS + PS" />
        </>
      }
      note={
        <>
          <p>
            把价格拖到均衡之上，供给量大于需求量，出现<span className="text-copper">过剩</span>，卖者会降价；拖到均衡之下，出现
            <span className="text-oxblood">短缺</span>，买者会加价。价格的自发调整，就是市场把分散信息汇总的过程。
          </p>
          <p className="mt-2">
            注意市场规模滑块：买卖双方同比例增加时，均衡价格不变、均衡数量放大。这说明「人多」不等于「更贵」，价格取决于相对稀缺程度。
          </p>
        </>
      }
    />
  )
}
