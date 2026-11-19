import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLesson, lessons, stages } from '../content'
import { useStore } from '../lib/store'
import { QuestionBody } from '../components/Quiz'
import { gradeQuestion } from '../lib/quiz'
import { fromNow } from '../lib/time'
import { Empty } from '../components/ui'

export default function Wrong() {
  const { state, removeAttempt } = useStore()
  const [stage, setStage] = useState(0)
  const [lessonId, setLessonId] = useState('')
  const [sort, setSort] = useState<'count' | 'recent'>('count')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null)

  const all = Object.values(state.attempts)
  const filtered = useMemo(() => {
    let list = all.filter((a) => (stage ? a.stage === stage : true))
    if (lessonId) list = list.filter((a) => a.lessonId === lessonId)
    if (q.trim()) list = list.filter((a) => a.stem.includes(q.trim()))
    return list.sort((a, b) => (sort === 'count' ? b.wrongCount - a.wrongCount : b.lastAt - a.lastAt))
  }, [all, stage, lessonId, sort, q])

  const openItem = (key: string) => {
    setOpen(key)
    setAnswer('')
    setFeedback(null)
  }

  const submit = (key: string) => {
    const a = all.find((x) => x.key === key)
    if (!a) return
    const lesson = getLesson(a.lessonId)
    const question = lesson?.quiz.find((x) => x.id === a.qid)
    if (!question) return
    const correct = gradeQuestion(question, answer)
    setFeedback({ correct, explanation: question.explanation })
    if (correct) {
      removeAttempt(key)
      setOpen(null)
    }
  }

  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="eyebrow">Errata · {all.length} Open</div>
          <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">错题本</h1>
          <p className="mt-2 max-w-[36rem] text-[13px] leading-[1.9] text-muted">
            答错的题会自动收进来。重做并答对后，该题自动移出；错得越多，排序越靠前。
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="meta">错题总数</div>
            <div className="tabnum font-serif text-[26px] leading-none">{all.length}</div>
          </div>
          <div>
            <div className="meta">涉及课程</div>
            <div className="tabnum font-serif text-[26px] leading-none">{new Set(all.map((a) => a.lessonId)).size}</div>
          </div>
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select value={stage} onChange={(e) => { setStage(Number(e.target.value)); setLessonId('') }} className="field py-1.5 text-[12px] sm:w-[130px]">
          <option value={0}>全部阶段</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {String(s.id).padStart(2, '0')} {s.title}
            </option>
          ))}
        </select>
        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="field py-1.5 text-[12px] sm:w-[220px]">
          <option value="">全部课程</option>
          {lessons
            .filter((l) => (stage ? l.stage === stage : true))
            .map((l) => (
              <option key={l.id} value={l.id}>
                {String(l.order).padStart(2, '0')} {l.title}
              </option>
            ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'count' | 'recent')} className="field py-1.5 text-[12px] sm:w-[150px]">
          <option value="count">按错误次数</option>
          <option value="recent">按最近作答</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索题干" className="field py-1.5 text-[12px] sm:ml-auto sm:w-[200px]" />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((a) => {
          const lesson = getLesson(a.lessonId)
          const question = lesson?.quiz.find((x) => x.id === a.qid)
          return (
            <div key={a.key} className="border border-line bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="chip">阶段 {a.stage}</span>
                <Link to={`/lesson/${a.lessonId}`} className="text-[12px] text-navy hover:underline">
                  {lesson?.title || a.lessonId}
                </Link>
                <span className="meta">第 {a.qid.replace('q', '')} 题</span>
                <span className="ml-auto font-mono text-[10px] text-oxblood">×{a.wrongCount}</span>
                <span className="meta">{fromNow(a.lastAt)}</span>
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.8] text-ink">{a.stem}</p>

              {open === a.key && question ? (
                <div className="mt-3 border-t border-linesoft pt-3">
                  <QuestionBody q={question} value={answer} onChange={setAnswer} submitted={!!feedback} />
                  {feedback && (
                    <p className={`mt-2 text-[12.5px] leading-relaxed ${feedback.correct ? 'text-moss' : 'text-oxblood'}`}>
                      {feedback.correct ? '答对了，已移出错题本。' : `再看一遍：${feedback.explanation}`}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {!feedback && (
                      <button className="btn-primary px-3 py-1.5 text-[12px]" onClick={() => submit(a.key)} disabled={!answer}>
                        提交
                      </button>
                    )}
                    <button className="btn-outline px-3 py-1.5 text-[12px]" onClick={() => setOpen(null)}>
                      收起
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <button className="btn-outline px-3 py-1.5 text-[12px]" onClick={() => openItem(a.key)} disabled={!question}>
                    重做这题
                  </button>
                  <Link to={`/lesson/${a.lessonId}#quiz`} className="text-[11.5px] text-muted hover:text-ink">
                    回到课程复习
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6">
          <Empty
            title={all.length === 0 ? '还没有错题' : '没有符合筛选条件的错题'}
            hint={all.length === 0 ? '完成任意一讲的章节测试，答错的题会自动出现在这里。' : '试试放宽阶段或课程筛选。'}
          />
          {all.length === 0 && (
            <div className="mt-4 text-center">
              <Link to="/course" className="btn-primary">
                去课程目录
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
