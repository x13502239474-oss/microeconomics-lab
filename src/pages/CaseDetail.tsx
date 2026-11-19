import { Link, useParams } from 'react-router-dom'
import { cases } from '../content/cases'
import { getLesson, stages } from '../content'
import { SectionNo } from '../components/ui'
import { IconArrow } from '../components/Icons'
import NotFound from './NotFound'

export default function CaseDetail() {
  const { id } = useParams()
  const c = cases.find((x) => x.id === id)
  if (!c) return <NotFound />
  const lesson = getLesson(c.lessonId)
  const stage = stages.find((s) => s.id === c.stage)

  return (
    <article className="shell max-w-[820px] pb-14 pt-7 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-2 meta">
        <Link to="/cases" className="hover:text-ink">
          案例库
        </Link>
        <span>/</span>
        <span>{stage?.title}</span>
      </nav>

      <header className="mt-4 border-b border-line pb-5">
        <div className="eyebrow">Case · {c.question}</div>
        <h1 className="mt-2 text-[27px] leading-[1.25] tracking-tight sm:text-[35px]">{c.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip">阶段 {c.stage}</span>
          {lesson && (
            <Link to={`/lesson/${lesson.id}`} className="chip hover:border-navy hover:text-ink">
              关联课程 · {lesson.title}
            </Link>
          )}
        </div>
      </header>

      <section className="mt-7">
        <SectionNo n="01" title="背景" en="Background" />
        <p className="text-[14.5px] leading-[1.95] text-ink2">{c.background}</p>
      </section>

      <section className="mt-7">
        <SectionNo n="02" title="参与者" en="Players" />
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {c.players.map((p) => (
            <div key={p.name} className="bg-surface p-3">
              <div className="text-[13px] text-ink">{p.name}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-muted">{p.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <SectionNo n="03" title="经济变量" en="Variables" />
        <dl className="divide-y divide-linesoft border-y border-linesoft">
          {c.variables.map((v) => (
            <div key={v.name} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[13px] text-ink2">{v.name}</dt>
              <dd className="tabnum text-[13px] text-ink">{v.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-7">
        <SectionNo n="04" title="理论模型" en="Model" />
        <p className="text-[14.5px] leading-[1.95] text-ink2">{c.model}</p>
      </section>

      <section className="mt-7">
        <SectionNo n="05" title="计算与图形" en="Computation" />
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {c.calc.map((x) => (
            <div key={x.label} className="bg-surface px-3 py-3">
              <div className="meta">{x.label}</div>
              <div className="tabnum mt-1 text-[15px] text-ink">{x.value}</div>
            </div>
          ))}
        </div>
        {lesson && (
          <p className="mt-2 text-[11.5px] text-muted">
            想看曲线如何移动？打开关联课程中的图表，或到「实验室」亲手调参。
          </p>
        )}
      </section>

      <section className="mt-7">
        <SectionNo n="06" title="分析结果" en="Result" />
        <p className="text-[14.5px] leading-[1.95] text-ink2">{c.result}</p>
      </section>

      <section className="mt-7">
        <SectionNo n="07" title="现实启示" en="Implication" />
        <div className="border-l-2 border-copper bg-[#FBF7EE] p-4">
          <p className="text-[14px] leading-[1.95] text-ink2">{c.takeaway}</p>
        </div>
        <div className="mt-3 border border-line p-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-oxblood">Model vs Reality</div>
          <p className="mt-1.5 text-[12.5px] leading-[1.9] text-muted">{c.caveat}</p>
        </div>
      </section>

      <nav className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Link to="/cases" className="inline-flex items-center gap-2 text-[12.5px] text-navy">
          <IconArrow className="h-4 w-4 rotate-180" /> 返回案例库
        </Link>
        {lesson && (
          <Link to={`/lesson/${lesson.id}`} className="inline-flex items-center gap-2 text-[12.5px] text-navy">
            学对应理论 <IconArrow className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </article>
  )
}
