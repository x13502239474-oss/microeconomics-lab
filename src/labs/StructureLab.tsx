import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CurvePlot } from '../components/CurvePlot'
import { LabShell, LabTable, Readout, Slider } from '../components/lab'
import { marketStructures, num } from '../lib/econ'

const COLORS = ['#3F6B4F', '#9C7A4A', '#7C93AB', '#16324F']

export default function StructureLab() {
  const [a, setA] = useState(100)
  const [b, setB] = useState(1)
  const [mc, setMc] = useState(20)
  const [fixed, setFixed] = useState(400)

  const s = marketStructures({ a, b, mc, fixed })
  const qc = (a - mc) / b

  const data = [
    { name: '完全竞争', 价格: Number(s.competition.price.toFixed(1)), 产量: Number(s.competition.qty.toFixed(1)), 消费者剩余: Math.round(s.competition.cs), 利润: Math.round(s.competition.profit) },
    { name: '垄断竞争', 价格: Number(s.monopolistic.price.toFixed(1)), 产量: Number(s.monopolistic.qty.toFixed(1)), 消费者剩余: Math.round(s.monopolistic.cs), 利润: Math.round(s.monopolistic.profit) },
    { name: '古诺寡头', 价格: Number(s.cournot.price.toFixed(1)), 产量: Number(s.cournot.qty.toFixed(1)), 消费者剩余: Math.round(s.cournot.cs), 利润: Math.round(s.cournot.profit) },
    { name: '垄断', 价格: Number(s.monopoly.price.toFixed(1)), 产量: Number(s.monopoly.qty.toFixed(1)), 消费者剩余: Math.round(s.monopoly.cs), 利润: Math.round(s.monopoly.profit) },
  ]

  return (
    <LabShell
      kicker="Laboratory 06 · Market Structure"
      title="市场结构模拟器"
      lead="同一条需求曲线、同一个边际成本，只改变市场结构：价格、产量、利润与消费者福利会怎样变化？这决定了反垄断与管制政策的讨论起点。"
      formula="竞争 P = MC　垄断 MR = MC　古诺 qi = (a − c)/3b　垄断竞争 P = ATC"
      controls={
        <>
          <Slider label="需求截距 a" value={a} onChange={setA} min={60} max={160} />
          <Slider label="需求斜率 b" value={b} onChange={setB} min={0.5} max={2.5} step={0.1} />
          <Slider label="边际成本 MC" value={mc} onChange={setMc} min={5} max={60} />
          <Slider label="固定成本 F" value={fixed} onChange={setFixed} min={50} max={900} unit="元" hint="影响垄断竞争的长期产量" />
          <button className="btn-outline w-full py-1.5 text-[11px]" onClick={() => { setA(100); setB(1); setMc(20); setFixed(400) }}>
            重置参数
          </button>
        </>
      }
      chart={
        <div className="space-y-4">
          <CurvePlot
            height={260}
            spec={{
              xLabel: '数量 Q',
              yLabel: '价格 P',
              xMax: Math.ceil(qc * 1.15),
              yMax: Math.ceil(a * 1.05),
              curves: [
                { label: '需求 D', color: 'navy', f: (x) => a - b * x },
                { label: 'MC', color: 'copper', f: () => mc },
              ],
              shapes: [
                { kind: 'vline', x: s.competition.qty, label: '竞争', color: 'moss' },
                { kind: 'vline', x: s.cournot.qty, label: '古诺', color: 'steel' },
                { kind: 'vline', x: s.monopoly.qty, label: '垄断', color: 'oxblood' },
                { kind: 'vline', x: s.monopolistic.qty, label: '垄断竞争', color: 'copper' },
              ],
              caption: '结构越集中，产量越少、价格越高。',
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="meta mb-1">价格比较</div>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#E9E2D4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6E7F93' }} axisLine={{ stroke: '#DCD3C2' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6E7F93' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #DCD3C2', background: '#FFFCF5' }} />
                  <Bar dataKey="价格" radius={0}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="meta mb-1">产量比较</div>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#E9E2D4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6E7F93' }} axisLine={{ stroke: '#DCD3C2' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6E7F93' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #DCD3C2', background: '#FFFCF5' }} />
                  <Bar dataKey="产量" radius={0}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      }
      readouts={
        <>
          <Readout label="竞争价格" value={num(s.competition.price, 1)} />
          <Readout label="垄断价格" value={num(s.monopoly.price, 1)} tone="oxblood" />
          <Readout label="垄断加成" value={num(s.monopoly.markup, 1)} hint="P − MC" />
          <Readout label="垄断无谓损失" value={num(s.monopoly.dwl, 0)} tone="oxblood" />
          <Readout label="古诺价格" value={num(s.cournot.price, 1)} />
          <Readout label="垄断竞争长期利润" value={num(s.monopolistic.profit, 0)} hint="趋近于零" />
        </>
      }
      note={
        <>
          <LabTable
            head={['结构', '价格', '产量', '利润', '消费者剩余']}
            rows={data.map((d, i) => [
              d.name,
              d.价格,
              d.产量,
              i === 0 || i === 1 ? 0 : d.利润,
              d.消费者剩余,
            ])}
          />
          <p className="mt-3">
            在当前参数下：完全竞争价格 {num(s.competition.price, 1)}、产量 {num(s.competition.qty, 1)}；垄断价格 {num(s.monopoly.price, 1)}、产量{' '}
            {num(s.monopoly.qty, 1)}，消费者剩余从 {num(s.competition.cs, 0)} 降到 {num(s.monopoly.cs, 0)}。
          </p>
          <p className="mt-2">
            古诺寡头落在两者之间：企业数量减少，价格上升，但不像垄断那样极端。垄断竞争长期利润为零，却仍保持高于 MC 的价格——产品差异的代价与回报。
          </p>
        </>
      }
    />
  )
}
