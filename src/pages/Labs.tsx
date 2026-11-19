import { Link } from 'react-router-dom'
import { labs } from '../content/labs'
import { cases } from '../content/cases'
import { IconArrow } from '../components/Icons'

export default function Labs() {
  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header className="border-b border-line pb-5">
        <div className="eyebrow">Laboratory · 07 Experiments</div>
        <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">经济学实验室</h1>
        <p className="mt-2 max-w-[40rem] text-[13px] leading-[1.9] text-muted">
          七个可以亲手调参的实验。所有数字由同一套公式实时计算，曲线、税收、成本与福利彼此一致。
          先改一个参数，再读下面的结论——这比看十张静态图更有用。
        </p>
      </header>

      <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
        {labs.map((lab) => (
          <Link key={lab.id} to={`/labs/${lab.id}`} className="group flex flex-col bg-surface p-5 transition-colors hover:bg-[#FBF7EE] sm:p-6">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] tracking-[0.16em] text-copper">{lab.no}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{lab.en}</span>
            </div>
            <h2 className="mt-3 text-[20px] tracking-tight text-ink group-hover:text-navy">{lab.title}</h2>
            <p className="mt-2 flex-1 text-[12.5px] leading-[1.85] text-muted">{lab.desc}</p>
            <div className="mt-4 flex items-center justify-between border-t border-linesoft pt-3">
              <div className="flex gap-1.5">
                {lab.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
              <IconArrow className="h-4 w-4 text-steel transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}

        <Link to="/cases" className="group flex flex-col bg-[#F4EFE3] p-5 transition-colors hover:bg-[#EFE8D9] sm:p-6">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-[0.16em] text-copper">08</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Case Library</span>
          </div>
          <h2 className="mt-3 text-[20px] tracking-tight text-ink group-hover:text-navy">现实案例库</h2>
          <p className="mt-2 flex-1 text-[12.5px] leading-[1.85] text-muted">
            {cases.length} 个完整案例：背景、参与者、变量、模型、计算、结论与现实启示，逐一拆解。
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-[#DCD3C2] pt-3">
            <div className="flex gap-1.5">
              <span className="chip border-[#C9BDA6]">弹性</span>
              <span className="chip border-[#C9BDA6]">垄断</span>
              <span className="chip border-[#C9BDA6]">外部性</span>
            </div>
            <IconArrow className="h-4 w-4 text-steel transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="mt-8 border-l-2 border-copper bg-[#FBF7EE] p-4 text-[12px] leading-[1.9] text-ink2 sm:p-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-copper">Method</span>
        <p className="mt-1.5">
          实验使用线性供求与二次成本函数，便于手算核对。真实世界的曲线未必是直线，但「边际决策」「均衡」「无谓损失」的方向性结论不依赖具体函数形式。
          所有实验默认只在本机运行，不发送任何数据。
        </p>
      </div>
    </div>
  )
}
