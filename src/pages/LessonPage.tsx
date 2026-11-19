import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getLesson, nextLesson, prevLesson, stageOf, stages } from '../content'
import { useStore, useStudyTimer } from '../lib/store'
import { Formula } from '../components/Formula'
import { CurvePlot } from '../components/CurvePlot'
import { MarketWidget } from '../components/MarketWidget'
import { Quiz } from '../components/Quiz'
import { Callout, SectionNo } from '../components/ui'
import { IconArrow, IconBookmark, IconCheck } from '../components/Icons'
import type { Block, Lesson } from '../types'
import NotFound from './NotFound'

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-body space-y-4">
      {blocks.map((b, i) => {
        if (b.k === 'p') return <p key={i}>{b.t}</p>
        if (b.k === 'list')
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-[14.5px] leading-[1.9] text-ink2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 bg-copper" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )
        if (b.k === 'formula')
          return (
            <div key={i} className="border-y border-linesoft bg-[#FBF7EE] px-4 py-3">
              <Formula tex={b.tex} />
              {b.vars && b.vars.length > 0 && (
                <div className="mt-2 grid gap-1 border-t border-linesoft pt-2 sm:grid-cols-2">
                  {b.vars.map((v) => (
                    <div key={v.s} className="flex items-baseline gap-2 text-[12px]">
                      <span className="font-mono text-[11px] text-copper">{v.s}</span>
                      <span className="text-muted">{v.m}</span>
                    </div>
                  ))}
                </div>
              )}
              {b.note && <p className="mt-2 text-[12px] leading-relaxed text-muted">{b.note}</p>}
            </div>
          )
        if (b.k === 'table')
          return (
            <div key={i} className="overflow-x-auto border border-line">
              <table className="w-full min-w-[420px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-[#F4EFE3]">
                    {b.head.map((h) => (
                      <th key={h} className="px-3 py-2 font-medium text-ink">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri} className="border-b border-linesoft last:border-0">
                      {r.map((c, ci) => (
                        <td key={ci} className={`px-3 py-2 leading-relaxed ${ci === 0 ? 'text-ink' : 'text-ink2'}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        if (b.k === 'note')
          return (
            <Callout key={i} label={b.title} tone="copper">
              {b.t}
            </Callout>
          )
        if (b.k === 'chart')
          return (
            <figure key={i} className="my-5 border border-line bg-surface p-3 sm:p-4">
              <CurvePlot spec={b.spec} />
            </figure>
          )
        return null
      })}
    </div>
  )
}

function LessonBody({ lesson }: { lesson: Lesson }) {
  const { state, completeLesson, uncompleteLesson, toggleFavorite, saveNote } = useStore()
  useStudyTimer(true)
  const loc = useLocation()
  const [progress, setProgress] = useState(0)
  const articleRef = useRef<HTMLDivElement | null>(null)
  const [note, setNote] = useState(state.notes[lesson.id]?.text || '')
  const [saved, setSaved] = useState(false)

  const done = !!state.completed[lesson.id]
  const fav = state.favorites.some((f) => f.id === lesson.id)
  const stage = stageOf(lesson.stage)
  const prev = prevLesson(lesson.id)
  const next = nextLesson(lesson.id)

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current
      if (!el) return
      const top = el.offsetTop
      const total = el.offsetHeight - window.innerHeight + 200
      const p = total <= 0 ? 100 : ((window.scrollY - top + 260) / total) * 100
      setProgress(Math.min(100, Math.max(0, p)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (loc.hash === '#quiz') {
      setTimeout(() => document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }, [loc.hash])

  const secNo = useMemo(() => (n: number) => String(n).padStart(2, '0'), [])

  // 本讲目录：05 公式、06 图表可能缺省，编号不重排
  const toc = useMemo(
    () => [
      { id: 's1', no: '01', title: '本节学习目标' },
      { id: 's2', no: '02', title: '现实问题导入' },
      { id: 's3', no: '03', title: '核心概念' },
      { id: 's4', no: '04', title: '理论解释' },
      ...(lesson.math ? [{ id: 's5', no: '05', title: '数学公式与变量' }] : []),
      ...(lesson.chart || lesson.interactive ? [{ id: 's6', no: '06', title: '图表与曲线分析' }] : []),
      { id: 's7', no: '07', title: '现实案例' },
      { id: 's8', no: '08', title: '本节总结' },
      { id: 'quiz', no: '09', title: '章节测试' },
    ],
    [lesson],
  )
  const [active, setActive] = useState('s1')

  useEffect(() => {
    const onScroll = () => {
      let cur = toc[0].id
      for (const t of toc) {
        const el = document.getElementById(t.id)
        if (el && el.getBoundingClientRect().top <= 150) cur = t.id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [toc])

  return (
    <div>
      <div className="fixed left-0 right-0 top-0 z-40 h-[2px] bg-transparent lg:left-[250px]">
        <div className="h-full bg-copper transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="shell max-w-[1140px] pb-12 pt-7 sm:pt-10 xl:flex xl:items-start xl:gap-10">
        <article ref={articleRef} className="w-full min-w-0 max-w-[860px]">
        <nav className="flex flex-wrap items-center gap-2 meta">
          <Link to="/course" className="hover:text-ink">
            课程
          </Link>
          <span>/</span>
          <span>阶段 {String(lesson.stage).padStart(2, '0')}</span>
          <span>/</span>
          <span className="text-ink2">{stage?.title}</span>
        </nav>

        <header className="mt-4 border-b border-line pb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="meta">
                第 {String(lesson.order).padStart(2, '0')} 讲 · {lesson.chapter} · {lesson.minutes} 分钟
              </div>
              <h1 className="mt-2 text-[28px] leading-[1.2] tracking-tight sm:text-[38px]">{lesson.title}</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{lesson.subtitle}</p>
            </div>
            <button
              onClick={() => toggleFavorite(lesson.id, lesson.title, lesson.stage)}
              aria-label="收藏本讲"
              className={`mt-1 shrink-0 border p-2 transition-colors ${
                fav ? 'border-copper bg-[#F7F0E2] text-copper' : 'border-line text-steel hover:border-copper hover:text-copper'
              }`}
            >
              <IconBookmark filled={fav} />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              className={done ? 'btn-outline' : 'btn-primary'}
              onClick={() => (done ? uncompleteLesson(lesson.id) : completeLesson(lesson.id))}
            >
              {done ? (
                <>
                  <IconCheck className="h-4 w-4 text-moss" /> 已学完（点击取消）
                </>
              ) : (
                '标记本讲学完'
              )}
            </button>
            <Link to="/wrong" className="btn-ghost">
              错题本
            </Link>
            <span className="ml-auto hidden meta sm:block">学习记录自动保存在本机</span>
          </div>
        </header>

        {/* 01 学习目标 */}
        <section id="s1" className="mt-8 scroll-mt-24">
          <SectionNo n={secNo(1)} title="本节学习目标" en="Objectives" />
          <ul className="grid gap-2 sm:grid-cols-3">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="border-l border-copper/60 pl-3 text-[13px] leading-[1.8] text-ink2">
                <span className="mr-1.5 font-mono text-[9px] text-copper">0{i + 1}</span>
                {o}
              </li>
            ))}
          </ul>
        </section>

        {/* 02 导入 */}
        <section id="s2" className="mt-9 scroll-mt-24">
          <SectionNo n={secNo(2)} title="现实问题导入" en="Opening Case" />
          <h3 className="text-[18px] leading-snug text-ink">{lesson.hook.title}</h3>
          <div className="prose-body mt-2 space-y-3">
            {lesson.hook.paragraphs.map((p, i) => (
              <p key={i}>
                <span className="mr-2 font-serif text-[22px] leading-none text-copper2">{i === 0 ? '“' : ''}</span>
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* 03 概念 */}
        <section id="s3" className="mt-9 scroll-mt-24">
          <SectionNo n={secNo(3)} title="核心概念" en="Key Concepts" />
          <div className="divide-y divide-linesoft border-y border-linesoft">
            {lesson.concepts.map((c) => (
              <div key={c.term} className="grid gap-2 py-3.5 sm:grid-cols-[150px_1fr] sm:gap-6">
                <div>
                  <div className="text-[14.5px] font-medium text-ink">{c.term}</div>
                  <div className="mt-0.5 text-[12px] text-copper">{c.plain}</div>
                </div>
                <p className="text-[13px] leading-[1.9] text-ink2">{c.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 理论 */}
        <section id="s4" className="mt-9 scroll-mt-24">
          <SectionNo n={secNo(4)} title="理论解释" en="Theory" />
          <Blocks blocks={lesson.theory} />
        </section>

        {/* 05 公式 */}
        {lesson.math && (
          <section id="s5" className="mt-9 scroll-mt-24">
            <SectionNo n={secNo(5)} title="数学公式与变量" en="Formalism" />
            <div className="border border-line bg-surface px-4 py-4 sm:px-6">
              <Formula tex={lesson.math.formula} />
              <div className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-linesoft pt-3 sm:grid-cols-2">
                {lesson.math.vars.map((v) => (
                  <div key={v.s} className="flex items-baseline gap-2 text-[12.5px]">
                    <span className="min-w-[46px] font-mono text-[11px] text-copper">{v.s}</span>
                    <span className="text-muted">{v.m}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-l-2 border-line pl-3 text-[12px] leading-[1.85] text-ink2">{lesson.math.note}</p>
            </div>
          </section>
        )}

        {/* 06 图表 */}
        {(lesson.chart || lesson.interactive) && (
          <section id="s6" className="mt-9 scroll-mt-24">
            <SectionNo n={secNo(6)} title="图表与曲线分析" en="Graphical Analysis" />
            {lesson.chart && (
              <figure className="border border-line bg-surface p-3 sm:p-4">
                <CurvePlot spec={lesson.chart} />
              </figure>
            )}
            {lesson.interactive && (
              <div className="mt-4">
                <MarketWidget
                  a={lesson.interactive.a}
                  b={lesson.interactive.b}
                  c={lesson.interactive.c}
                  d={lesson.interactive.d}
                  price={lesson.interactive.price}
                  caption={lesson.interactive.caption}
                />
              </div>
            )}
          </section>
        )}

        {/* 07 案例 */}
        <section id="s7" className="mt-9 scroll-mt-24">
          <SectionNo n={secNo(7)} title="现实案例" en="Evidence" />
          <div className="space-y-4">
            {lesson.cases.map((c) => (
              <div key={c.title} className="border border-line bg-surface p-4 sm:p-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-copper">CASE</div>
                <h3 className="mt-1 text-[16.5px] leading-snug text-ink">{c.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.95] text-ink2">{c.body}</p>
                {c.numbers && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-linesoft pt-3 sm:grid-cols-3">
                    {c.numbers.map((n) => (
                      <div key={n.label}>
                        <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{n.label}</dt>
                        <dd className="tabnum mt-0.5 text-[13px] text-ink">{n.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 08 总结 */}
        <section id="s8" className="mt-9 scroll-mt-24">
          <SectionNo n={secNo(8)} title="本节总结" en="Summary" />
          <ol className="space-y-2 border-l-2 border-navy/20 pl-4">
            {lesson.summary.map((s, i) => (
              <li key={i} className="text-[13.5px] leading-[1.9] text-ink2">
                <span className="mr-2 font-mono text-[10px] text-copper">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
          {lesson.extend && (
            <p className="mt-3 border-t border-linesoft pt-3 text-[12px] leading-relaxed text-muted">
              延伸：{lesson.extend}
            </p>
          )}
        </section>

        {/* 09 测试 */}
        <section id="quiz" className="mt-10 scroll-mt-24">
          <SectionNo n={secNo(9)} title="章节测试" en="Assessment" />
          <Quiz lesson={lesson} />
        </section>

        {/* 笔记 */}
        <section className="mt-10 border-t border-line pt-6">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Notes</div>
            <span className="meta">{state.notes[lesson.id] ? '已保存' : '仅保存在本机'}</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setSaved(false)
            }}
            rows={3}
            placeholder="写下你的理解、疑问，或一个现实中的例子……"
            className="mt-2 w-full resize-y border border-line bg-surface p-3 text-[13px] leading-relaxed outline-none focus:border-navy"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              className="btn-outline px-3 py-1.5 text-[12px]"
              onClick={() => {
                saveNote(lesson.id, note)
                setSaved(true)
              }}
            >
              保存笔记
            </button>
            {saved && <span className="text-[11px] text-moss">已保存到本机</span>}
          </div>
        </section>

        {/* 翻页 */}
        <nav className="mt-10 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          {prev ? (
            <Link to={`/lesson/${prev.id}`} className="group border border-line p-4 hover:border-navy">
              <div className="meta">上一讲</div>
              <div className="mt-1 flex items-center gap-2 text-[14px] text-ink">
                <IconArrow className="h-4 w-4 rotate-180 text-steel" />
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link to={`/lesson/${next.id}`} className="group border border-line p-4 text-right hover:border-navy">
              <div className="meta">下一讲</div>
              <div className="mt-1 flex items-center justify-end gap-2 text-[14px] text-ink">
                {next.title}
                <IconArrow className="h-4 w-4 text-steel" />
              </div>
            </Link>
          ) : (
            <Link to="/me" className="border border-line p-4 text-right hover:border-navy">
              <div className="meta">课程结束</div>
              <div className="mt-1 text-[14px] text-ink">查看学习报告</div>
            </Link>
          )}
        </nav>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 meta">
          <span>
            阶段 {stages.find((s) => s.id === lesson.stage)?.title} · 对应教材 {lesson.chapter}
          </span>
          <Link to="/about" className="hover:text-ink">
            教材与版权说明
          </Link>
        </footer>
        </article>

        <aside className="sticky top-8 hidden w-[186px] shrink-0 xl:block">
          <div className="eyebrow">Contents</div>
          <nav className="mt-3 border-l border-line">
            {toc.map((t) => {
              const on = active === t.id
              return (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  aria-current={on ? 'true' : undefined}
                  className={`-ml-px flex items-baseline gap-2 border-l py-[7px] pl-3 pr-1 text-[12px] leading-snug transition-colors ${
                    on ? 'border-copper font-medium text-ink' : 'border-transparent text-muted hover:text-ink2'
                  }`}
                >
                  <span className={`font-mono text-[9px] tabnum ${on ? 'text-copper' : 'text-steel'}`}>{t.no}</span>
                  <span className="min-w-0">{t.title}</span>
                </a>
              )
            })}
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-linesoft pt-3">
            <span className="meta">已读</span>
            <span className="tabnum font-mono text-[11px] text-ink2">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-[2px] w-full bg-linesoft">
            <div className="h-full bg-navy transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function LessonPage() {
  const { id } = useParams()
  const lesson = getLesson(id)
  if (!lesson) return <NotFound />
  return <LessonBody lesson={lesson} />
}
