import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { lessons, stages, totalMinutes, totalQuestions, stageLessons } from '../content'
import { cases } from '../content/cases'
import { useStore } from '../lib/store'
import { dayKey, prettyDate, secondsLabel, shiftDay } from '../lib/time'
import { IconArrow, IconCheck } from '../components/Icons'
import { ProgressBar, Ring } from '../components/ui'

export default function Home() {
  const { state, setTasks } = useStore()
  const today = dayKey()

  const done = Object.keys(state.completed).length
  const pct = Math.round((done / lessons.length) * 100)
  const next = lessons.find((l) => !state.completed[l.id]) || lessons[lessons.length - 1]

  const secondsToday = state.secondsByDay[today] || 0
  const weekSeconds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => state.secondsByDay[shiftDay(today, -i)] || 0).reduce((a, b) => a + b, 0),
    [state.secondsByDay, today],
  )
  const wrongCount = Object.keys(state.attempts).length

  const reviewList = useMemo(
    () =>
      lessons
        .filter((l) => state.completed[l.id] && Date.now() - state.completed[l.id] > 3 * 86400000)
        .slice(0, 2),
    [state.completed],
  )

  useEffect(() => {
    if (state.taskDay === today && state.tasks.length === 3) return
    const learnedToday = Object.values(state.completed).some((t) => dayKey(new Date(t)) === today)
    const quizToday = Object.values(state.quizPassed).some((q) => dayKey(new Date(q.at)) === today)
    setTasks([
      { id: 'lesson', label: done === lessons.length ? '回看一门已学课程' : `学习「${next.title}」`, kind: 'lesson', done: learnedToday },
      { id: 'quiz', label: '完成一组章节测试（≥60%）', kind: 'quiz', done: quizToday },
      { id: 'review', label: '重做 1 道错题', kind: 'review', done: false },
    ])
  }, [today, state.taskDay, state.tasks.length, state.completed, state.quizPassed, setTasks, next.title, done])

  const taskHref = (kind: string) => (kind === 'review' ? '/wrong' : `/lesson/${next.id}${kind === 'quiz' ? '#quiz' : ''}`)

  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header>
        <div className="flex items-center justify-between">
          <div className="eyebrow">Microeconomics · Vol. 01</div>
          <div className="meta hidden sm:block">{prettyDate()}</div>
        </div>
        <h1 className="mt-3 text-[30px] leading-[1.15] tracking-tight text-ink sm:text-[42px]">微观经济学研究所</h1>
        <p className="mt-3 max-w-[40rem] text-[13.5px] leading-[1.95] text-muted sm:text-[14px]">
          以曼昆《经济学原理·微观经济学分册》第 10 版的知识体系为骨架，从稀缺与选择讲到市场失灵。
          每一讲配公式、曲线、案例与自动批改的章节测试，七个实验室可以亲手调参。
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-line py-3">
          <span className="meta">{lessons.length} 讲</span>
          <span className="meta">{stages.length} 个阶段</span>
          <span className="meta">{totalQuestions} 道题</span>
          <span className="meta">约 {Math.round(totalMinutes / 60)} 小时</span>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_306px] lg:gap-12">
        <div className="min-w-0 space-y-10">
          {/* 今日任务 */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="eyebrow">Today</div>
                <h2 className="mt-1 text-[19px] tracking-tight">今日任务</h2>
              </div>
              <div className="text-right">
                <div className="tabnum font-serif text-[20px] leading-none text-ink">{secondsLabel(secondsToday)}</div>
                <div className="mt-1 meta">今日学习</div>
              </div>
            </div>
            <div className="mt-4 divide-y divide-linesoft border-t border-linesoft">
              {state.tasks.map((t) => (
                <Link
                  key={t.id}
                  to={taskHref(t.kind)}
                  className="group flex items-center gap-3 py-3"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border ${
                      t.done ? 'border-moss bg-moss text-paper' : 'border-line text-transparent'
                    }`}
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className={`flex-1 text-[13.5px] ${t.done ? 'text-muted line-through' : 'text-ink'}`}>
                    {t.label}
                  </span>
                  <IconArrow className="h-4 w-4 text-steel transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          {/* 继续学习 */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <div className="eyebrow">Continue</div>
              <span className="meta">
                第 {next.order} / {lessons.length} 讲
              </span>
            </div>
            <Link to={`/lesson/${next.id}`} className="group block border border-line bg-surface p-5 transition-colors hover:border-navy sm:p-6">
              <div className="meta">
                {stages.find((s) => s.id === next.stage)?.title} · {next.chapter}
              </div>
              <h3 className="mt-2 text-[24px] leading-tight tracking-tight text-ink sm:text-[27px]">{next.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{next.subtitle}</p>
              <div className="mt-5 flex items-center justify-between border-t border-linesoft pt-3">
                <span className="meta">{next.minutes} 分钟 · {next.quiz.length} 道练习</span>
                <span className="inline-flex items-center gap-2 text-[12px] text-navy">
                  开始阅读
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </section>

          {/* 六个阶段 */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <div className="eyebrow">Curriculum</div>
              <Link to="/course" className="meta hover:text-ink">
                全部课程 →
              </Link>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {stages.map((s) => {
                const list = stageLessons(s.id)
                const finished = list.filter((l) => state.completed[l.id]).length
                const p = Math.round((finished / list.length) * 100)
                return (
                  <Link key={s.id} to={`/course#stage-${s.id}`} className="group grid grid-cols-[34px_1fr] gap-3 py-4 sm:grid-cols-[40px_1fr_150px]">
                    <div className="font-mono text-[11px] leading-6 text-copper">{String(s.id).padStart(2, '0')}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[15px] text-ink group-hover:text-navy">{s.title}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{s.en}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">{s.blurb}</p>
                      <div className="mt-2 sm:hidden">
                        <ProgressBar value={p} />
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="meta">{s.chapters}</div>
                      <div className="mt-2">
                        <ProgressBar value={p} />
                      </div>
                      <div className="mt-1.5 tabnum text-[11px] text-muted">
                        {finished}/{list.length}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* 案例 */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <div className="eyebrow">Case Studies</div>
              <Link to="/cases" className="meta hover:text-ink">
                案例库 →
              </Link>
            </div>
            <Link to={`/cases/${cases[0].id}`} className="group flex items-start gap-4 border border-line bg-[#FBF7EE] p-5">
              <div className="hidden font-serif text-[44px] leading-none text-copper2 sm:block">§</div>
              <div>
                <div className="meta">为什么有些商品越贵越好卖</div>
                <h3 className="mt-1.5 text-[17px] leading-snug text-ink">{cases[0].title}</h3>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
                  {cases[0].background}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-navy">
                  读案例 <IconArrow className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </section>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-6 lg:border-l lg:border-line lg:pl-8">
          <div>
            <div className="eyebrow">Progress</div>
            <div className="mt-3 flex items-center gap-4">
              <div className="relative">
                <Ring value={pct} size={76} stroke={4} />
                <span className="absolute inset-0 flex items-center justify-center tabnum font-serif text-[18px] text-ink">
                  {pct}%
                </span>
              </div>
              <div>
                <div className="tabnum font-serif text-[22px] leading-none text-ink">
                  {done}
                  <span className="ml-1 font-sans text-[11px] text-muted">/ {lessons.length}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted">已完成课程</div>
                <Link to="/course" className="mt-2 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-copper hover:underline">
                  查看目录
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 border-t border-line pt-3">
            <div>
              <div className="meta">连续学习</div>
              <div className="tabnum mt-1 font-serif text-[24px] leading-none">
                {state.streak}
                <span className="ml-1 font-sans text-[11px] text-muted">天</span>
              </div>
            </div>
            <div>
              <div className="meta">近 7 天</div>
              <div className="tabnum mt-1 font-serif text-[24px] leading-none">
                {Math.round(weekSeconds / 60)}
                <span className="ml-1 font-sans text-[11px] text-muted">分钟</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="meta">待复习错题</div>
              <div className="tabnum mt-1 font-serif text-[24px] leading-none">{wrongCount}</div>
            </div>
            <div className="mt-4">
              <div className="meta">收藏</div>
              <div className="tabnum mt-1 font-serif text-[24px] leading-none">{state.favorites.length}</div>
            </div>
          </div>

          {reviewList.length > 0 && (
            <div className="border-t border-line pt-4">
              <div className="eyebrow">Review</div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">这几讲已学过 3 天以上，建议回看：</p>
              <div className="mt-2 space-y-2">
                {reviewList.map((l) => (
                  <Link key={l.id} to={`/lesson/${l.id}`} className="block border-l border-copper/50 pl-2.5 text-[12.5px] text-ink2 hover:text-navy">
                    {l.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-line pt-4">
            <div className="eyebrow">Studio</div>
            <p className="mt-1.5 text-[11.5px] leading-[1.85] text-muted">
              七个互动实验室：供需、弹性、税收、成本、利润、市场结构、外部性。全部使用真实的计算逻辑，不是动画摆设。
            </p>
            <Link to="/labs" className="mt-3 inline-flex items-center gap-2 text-[12px] text-navy">
              进入实验室 <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
