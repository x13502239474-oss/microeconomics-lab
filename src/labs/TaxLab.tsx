import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout, Slider } from '../components/lab'
import { num, taxOutcome } from '../lib/econ'
import { marketChart } from '../content/plots'

export default function TaxLab() {
  const [t, setT] = useState(20)
  const [a, setA] = useState(120)
  const [c, setC] = useState(20)
  const [b, setB] = useState(2)
  const [d, setD] = useState(2)
  const m = { a, b, c, d }
  const out = taxOutcome(m, t)

  return (
    <LabShell
      kicker="Laboratory 03 · Tax Incidence"
      title="税收模拟器"
      lead="对每单位商品征 t 元税，买家支付的价格与卖家净得的价格之间就插进一个楔子。拖动税额与斜率，看税负到底落在谁身上。"
      formula="Q* = (a − c − t)/(b + d)　Pc = a − bQ*　Ps = Pc − t"
      controls={
        <>
          <Slider label="单位税额 t" value={t} onChange={setT} min={0} max={60} unit="元" hint="楔子的大小" />
          <Slider label="需求强度 a" value={a} onChange={setA} min={80} max={180} unit="元" />
          <Slider label="供给成本 c" value={c} onChange={setC} min={0} max={60} unit="元" />
          <Slider label="需求斜率 b" value={b} onChange={setB} min={1} max={4} step={0.5} hint="越大表示需求越缺乏弹性" />
          <Slider label="供给斜率 d" value={d} onChange={setD} min={1} max={4} step={0.5} hint="越大表示供给越缺乏弹性" />
          <button className="btn-outline w-full py-1.5 text-[11px]" onClick={() => { setT(20); setA(120); setC(20); setB(2); setD(2) }}>
            重置参数
          </button>
        </>
      }
      chart={
        <CurvePlot
          height={330}
          spec={{
            ...marketChart({ a, b, c, d, tax: t, surplus: true }),
            caption: '税后供给曲线上移 t；红色三角形为无谓损失，矩形为税收收入（未单独填色）。',
          }}
        />
      }
      readouts={
        <>
          <Readout label="消费者支付" value={num(out.pc, 1)} unit="元" />
          <Readout label="生产者净得" value={num(out.ps, 1)} unit="元" />
          <Readout label="税后数量" value={num(out.qty, 1)} />
          <Readout label="税收收入" value={num(out.revenue, 0)} tone="copper" />
          <Readout label="无谓损失" value={num(out.dwl, 1)} tone="oxblood" />
          <Readout label="消费者承担" value={`${num(out.consumerShare * 100, 0)}%`} hint={`${num(out.consumerIncidence, 1)} 元/单位`} />
        </>
      }
      note={
        <>
          <p>
            当前税额 {t} 元：买家多付 {num(out.consumerIncidence, 1)} 元，卖家少得 {num(out.producerIncidence, 1)} 元，两者之和正好等于税额。
            税后交易量从 {num((a - c) / (b + d), 1)} 降到 {num(out.qty, 1)}，消失的交易构成无谓损失 {num(out.dwl, 1)} 元。
          </p>
          <p className="mt-2">
            把需求斜率 b 调大（需求更陡、更缺乏弹性），消费者承担的份额会上升；把供给斜率调大，生产者承担更多。谁更难离开市场，谁承担更多税负。
          </p>
        </>
      }
    />
  )
}
