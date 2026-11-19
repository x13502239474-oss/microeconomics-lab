import { Link } from 'react-router-dom'
import { cases } from '../content/cases'
import { stages } from '../content'
import { IconArrow } from '../components/Icons'

export default function Cases() {
  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header className="border-b border-line pb-5">
        <div className="eyebrow">Case Library · 08 Studies</div>
        <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">现实案例库</h1>
        <p className="mt-2 max-w-[40rem] text-[13px] leading-[1.9] text-muted">
          每个案例按「背景 → 参与者 → 经济变量 → 理论模型 → 计算 → 结果 → 启示」拆解。
          数字是课堂算例，用来演示机制；现实世界的复杂性，另在每篇末尾标注。
        </p>
      </header>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {cases.map((c, i) => (
          <Link key={c.id} to={`/cases/${c.id}`} className="group grid grid-cols-[32px_1fr] gap-3 py-5 sm:grid-cols-[40px_1fr_170px] sm:gap-5">
            <div className="font-mono text-[11px] text-copper">{String(i + 1).padStart(2, '0')}</div>
            <div className="min-w-0">
              <div className="meta">{c.question}</div>
              <h2 className="mt-1 text-[18px] leading-snug text-ink group-hover:text-navy sm:text-[20px]">{c.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.85] text-muted">{c.background}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-linesoft pt-2 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
              <div className="meta">{stages.find((s) => s.id === c.stage)?.title}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-navy sm:justify-end">
                阅读 <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
