import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons, stages, stageLessons, totalQuestions } from '../content'
import { useStore } from '../lib/store'
import { IconCheck } from '../components/Icons'
import { Empty, ProgressBar } from '../components/ui'

type Filter = 'all' | 'todo' | 'done' | 'saved'

export default function CourseList() {
  const { state } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')

  const savedIds = useMemo(() => new Set(state.favorites.map((f) => f.id)), [state.favorites])

  const matches = (id: string) => {
    const l = lessons.find((x) => x.id === id)!
    if (filter === 'done' && !state.completed[id]) return false
    if (filter === 'todo' && state.completed[id]) return false
    if (filter === 'saved' && !savedIds.has(id)) return false
    if (!q.trim()) return true
    const key = q.trim().toLowerCase()
    return (
      l.title.toLowerCase().includes(key) ||
      l.subtitle.toLowerCase().includes(key) ||
      l.concepts.some((c) => c.term.toLowerCase().includes(key)) ||
      l.chapter.toLowerCase().includes(key)
    )
  }

  const total = lessons.length
  const done = Object.keys(state.completed).length

  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="eyebrow">Curriculum · 01–{String(total).padStart(2, '0')}</div>
          <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">课程目录</h1>
          <p className="mt-2 max-w-[34rem] text-[13px] leading-[1.9] text-muted">
            按教材章节顺序编排的 {total} 讲。每讲含学习目标、公式、曲线、案例与至少 3 道自动批改练习。
          </p>
        </div>
        <div className="text-right">
          <div className="tabnum font-serif text-[28px] leading-none">{done}/{total}</div>
          <div className="mt-1 meta">已完成 · {Math.round((done / total) * 100)}%</div>
          <div className="mt-2 w-[140px]">
            <ProgressBar value={(done / total) * 100} />
          </div>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', '全部'],
              ['todo', '未完成'],
              ['done', '已完成'],
              ['saved', '收藏'],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`border px-3 py-1.5 text-[12px] transition-colors ${
                filter === k ? 'border-navy bg-navy text-paper' : 'border-line text-muted hover:border-steel hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-[240px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索课程、概念或章节"
            className="field py-2 pl-8 text-[12.5px]"
          />
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="m15.5 15.5 4 4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="mt-8 space-y-9">
        {stages.map((s) => {
          const list = stageLessons(s.id).filter((l) => matches(l.id))
          const full = stageLessons(s.id)
          const finished = full.filter((l) => state.completed[l.id]).length
          if (list.length === 0 && (q.trim() || filter !== 'all')) return null
          return (
            <section key={s.id} id={`stage-${s.id}`} className="scroll-mt-24">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
                <span className="font-mono text-[11px] tracking-[0.16em] text-copper">STAGE {String(s.id).padStart(2, '0')}</span>
                <h2 className="text-[19px] tracking-tight">{s.title}</h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{s.en}</span>
                <span className="ml-auto meta">
                  {s.chapters} · {finished}/{full.length}
                </span>
              </div>
              <p className="mb-3 text-[12px] leading-relaxed text-muted">{s.blurb}</p>

              <div className="divide-y divide-linesoft border-y border-linesoft">
                {list.map((l) => {
                  const isDone = !!state.completed[l.id]
                  const quiz = state.quizPassed[l.id]
                  return (
                    <Link
                      key={l.id}
                      to={`/lesson/${l.id}`}
                      className="group grid grid-cols-[26px_1fr_auto] items-start gap-3 py-3.5"
                    >
                      <span className="pt-[3px] font-mono text-[10.5px] text-muted">{String(l.order).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className={`text-[14.5px] ${isDone ? 'text-muted' : 'text-ink'} group-hover:text-navy`}>
                            {l.title}
                          </span>
                          {isDone && <IconCheck className="h-3.5 w-3.5 text-moss" />}
                          {quiz && (
                            <span className="font-mono text-[9px] tracking-wide text-moss">
                              TEST {quiz.score}/{quiz.total}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-muted">{l.subtitle}</span>
                      </span>
                      <span className="pt-[3px] text-right">
                        <span className="meta block whitespace-nowrap">{l.minutes}′</span>
                        <span className="mt-0.5 hidden font-mono text-[9px] text-muted/80 sm:block">{l.chapter}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {stages.every((s) => stageLessons(s.id).filter((l) => matches(l.id)).length === 0) && (
        <div className="mt-8">
          <Empty title="没有匹配的课程" hint={`试试其他关键词，或切换到「全部」。当前共 ${totalQuestions} 道练习题。`} />
        </div>
      )}
    </div>
  )
}
