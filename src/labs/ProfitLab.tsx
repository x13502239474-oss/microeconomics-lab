import { useState } from 'react'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, Readout, Slider } from '../components/lab'
import { num, profitAt, profitMax } from '../lib/econ'

export default function ProfitLab() {
  const [price, setPrice] = useState(70)
  const [qty, setQty] = useState(20)
  const [a, setA] = useState(100)
  const [b, setB] = useState(1)
  const [fc, setFc] = useState(100)
  const [v1, setV1] = useState(10)
  const [v2, setV2] = useState(0.5)

  const cp = { fc, v1, v2 }
  const res = profitAt(cp, price, qty)
  const best = profitMax(a, b, cp)
  const demandQty = Math.max(0, (a - price) / b)
  const overstock = qty > demandQty + 0.01

  return (
    <LabShell
      kicker="Laboratory 05 · Profit Maximisation"
      title="企业利润模拟器"
      lead="利润不是「价格越高越好」，也不是「卖得越多越好」。设定价格与产量，看看总收益与总成本如何拉扯，再用 MR = MC 找到真正的最大利润点。"
      formula="π = P·Q − TC(Q)　MR = a − 2bQ = MC → Q*"
      controls={
        <>
          <Slider label="价格 P" value={price} onChange={setPrice} min={10} max={100} unit="元" />
          <Slider label="产量 Q" value={qty} onChange={setQty} min={1} max={60} unit="件" />
          <div className="border-t border-linesoft pt-3">
            <div className="meta mb-2">需求与成本环境</div>
            <Slider label="需求截距 a" value={a} onChange={setA} min={60} max={140} />
            <Slider label="需求斜率 b" value={b} onChange={setB} min={0.5} max={2} step={0.1} />
            <div className="mt-3" />
            <Slider label="固定成本 FC" value={fc} onChange={setFc} min={0} max={400} />
            <Slider label="可变成本 v₁" value={v1} onChange={setV1} min={0} max={30} />
            <Slider label="可变成本 v₂" value={v2} onChange={setV2} min={0.1} max={1.5} step={0.1} />
          </div>
        </>
      }
      chart={
        <CurvePlot
          height={340}
          spec={{
            xLabel: '产量 Q',
            yLabel: '价格 / 成本',
            xMax: Math.ceil(Math.max(60, a / b)),
            yMax: Math.ceil(a * 1.05),
            curves: [
              { label: '需求 D', color: 'navy', f: (x) => a - b * x },
              { label: '边际收益 MR', color: 'steel', dash: true, f: (x) => a - 2 * b * x },
              { label: '边际成本 MC', color: 'copper', f: (x) => v1 + 2 * v2 * x },
            ],
            shapes: [
              { kind: 'point', x: qty, y: price, label: '你的选择', color: 'oxblood', anchor: 'end' },
              { kind: 'point', x: best.qty, y: best.price, label: '最优', color: 'moss' },
              { kind: 'vline', x: qty, color: 'oxblood', dash: true },
            ],
            caption: '你的选择未必在需求曲线上；若产量超过该价格的需求量，多出的部分卖不掉。',
          }}
        />
      }
      readouts={
        <>
          <Readout label="总收益 TR" value={num(res.revenue, 0)} unit="元" />
          <Readout label="总成本 TC" value={num(res.cost, 0)} unit="元" />
          <Readout label="利润 π" value={num(res.profit, 0)} tone={res.profit >= 0 ? 'moss' : 'oxblood'} />
          <Readout label="利润最大化产量" value={num(best.qty, 1)} tone="copper" />
          <Readout label="最大利润" value={num(best.profit, 0)} />
          <Readout
            label="该价格可卖数量"
            value={num(demandQty, 1)}
            tone={overstock ? 'oxblood' : 'ink'}
            hint={overstock ? '产量超过需求，存在库存' : '需求足以吸收'}
          />
        </>
      }
      note={
        <>
          <p>
            你的组合：TR {num(res.revenue, 0)} − TC {num(res.cost, 0)} = {num(res.profit, 0)} 元。
            理论最优是产量 {num(best.qty, 1)}、价格 {num(best.price, 1)}，利润 {num(best.profit, 0)} 元。
          </p>
          <p className="mt-2">
            {overstock
              ? '当前产量超过了该价格下的需求量，多生产的部分卖不掉，会计入库存而不是收入。'
              : '当前产量可以被市场吸收，但利润未必最大——把 Q 拖到 MR 与 MC 的交点附近试试。'}
          </p>
          <p className="mt-1.5 text-muted">
            注意：按 MR = MC 定产量后，价格要回到需求曲线上读取，而不是直接用 MC 定价。
          </p>
        </>
      }
    />
  )
}
