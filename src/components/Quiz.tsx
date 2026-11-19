import { useState } from 'react'
import type { Lesson, QuizQuestion } from '../types'
import { gradeLesson, gradeQuestion } from '../lib/quiz'
import { useStore } from '../lib/store'
import { IconCheck } from './Icons'

const LETTER = ['A', 'B', 'C', 'D', 'E']
const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  single: '单选',
  judge: '判断',
  fill: '填空',
  numeric: '计算',
}

export function QuestionBody({
  q,
  value,
  onChange,
  submitted,
  disabled,
}: {
  q: QuizQuestion
  value: string
  onChange: (v: string) => void
  submitted: boolean
  disabled?: boolean
}) {
  if (q.type === 'single') {
    return (
      <div className="mt-3 space-y-1.5">
        {(q.options || []).map((opt, i) => {
          const letter = LETTER[i]
          const selected = value === letter
          const isRight = submitted && letter === q.answer
          const isWrongPick = submitted && selected && letter !== q.answer
          return (
            <button
              key={letter}
              type="button"
              disabled={disabled || submitted}
              onClick={() => onChange(letter)}
              className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left text-[13.5px] leading-relaxed transition-colors ${
                isRight
                  ? 'border-moss bg-[#EFF4ED] text-ink'
                  : isWrongPick
                    ? 'border-oxblood bg-[#F7EBE8] text-ink'
                    : selected
                      ? 'border-navy bg-[#F1EEE4] text-ink'
                      : 'border-line bg-transparent text-ink2 hover:border-steel'
              }`}
            >
              <span
                className={`mt-[1px] font-mono text-[11px] ${
                  isRight ? 'text-moss' : isWrongPick ? 'text-oxblood' : 'text-muted'
                }`}
              >
                {letter}
              </span>
              <span>{opt}</span>
              {isRight && <IconCheck className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-moss" />}
            </button>
          )
        })}
      </div>
    )
  }

  if (q.type === 'judge') {
    return (
      <div className="mt-3 flex gap-2">
        {['对', '错'].map((v) => {
          const selected = value === v
          const isRight = submitted && v === q.answer
          const isWrongPick = submitted && selected && v !== q.answer
          return (
            <button
              key={v}
              type="button"
              disabled={disabled || submitted}
              onClick={() => onChange(v)}
              className={`min-w-[88px] border px-5 py-2 text-[13px] transition-colors ${
                isRight
                  ? 'border-moss bg-[#EFF4ED]'
                  : isWrongPick
                    ? 'border-oxblood bg-[#F7EBE8]'
                    : selected
                      ? 'border-navy bg-[#F1EEE4]'
                      : 'border-line hover:border-steel'
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <input
      value={value}
      disabled={disabled || submitted}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.type === 'numeric' ? '输入数值' : '输入你的答案'}
      className={`field mt-3 max-w-[320px] tabnum ${
        submitted ? (gradeQuestion(q, value) ? 'border-moss' : 'border-oxblood') : ''
      }`}
      inputMode={q.type === 'numeric' ? 'decimal' : 'text'}
    />
  )
}

export function Quiz({ lesson }: { lesson: Lesson }) {
  const { state, recordQuiz, recordAttempt } = useStore()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const passedBefore = state.quizPassed[lesson.id]

  const submit = () => {
    const graded = gradeLesson(lesson, answers)
    setScore(graded.score)
    setSubmitted(true)
    graded.results.forEach((r) => {
      recordAttempt({
        lessonId: lesson.id,
        stage: lesson.stage,
        question: r.q,
        chosen: r.chosen,
        correct: r.correct,
      })
    })
    recordQuiz(lesson.id, graded.score, graded.total)
  }

  const answeredAll = lesson.quiz.every((q) => (answers[q.id] || '').trim().length > 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="meta">
          共 {lesson.quiz.length} 题 · 答对 60% 通过 · 错题自动进入错题本
        </div>
        {passedBefore && (
          <span className="chip border-moss/40 text-moss">
            已通过 {passedBefore.score}/{passedBefore.total}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {lesson.quiz.map((q, idx) => {
          const result = submitted ? gradeQuestion(q, answers[q.id] || '') : null
          return (
            <div key={q.id} className="border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-copper">{String(idx + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="chip">{TYPE_LABEL[q.type]}</span>
                    {submitted && (
                      <span className={`font-mono text-[10px] tracking-wide ${result ? 'text-moss' : 'text-oxblood'}`}>
                        {result ? 'CORRECT' : 'REVIEW'}
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] leading-[1.8] text-ink">{q.stem}</div>
                  <QuestionBody
                    q={q}
                    value={answers[q.id] || ''}
                    onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                    submitted={submitted}
                  />

                  {submitted && (
                    <div className="mt-3 border-t border-linesoft pt-3">
                      <div className="flex items-baseline gap-2 text-[12px]">
                        <span className="text-muted">正确答案</span>
                        <span className="font-mono text-ink">
                          {q.type === 'single' ? q.answer : q.type === 'judge' ? q.answer : q.answer}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.85] text-ink2">{q.explanation}</p>
                      {q.steps && (
                        <p className="mt-1.5 border-l border-line pl-3 font-mono text-[11px] leading-relaxed text-muted">
                          {q.steps}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!submitted ? (
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-primary" onClick={submit} disabled={!answeredAll}>
            提交答案
          </button>
          <span className="text-[11px] text-muted">
            {answeredAll ? '提交后立即批改并记录' : '请先完成全部题目'}
          </span>
        </div>
      ) : (
        <div className="mt-5 border border-line bg-[#FBF7EE] p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Result</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="tabnum font-serif text-[34px] leading-none text-ink">
                  {Math.round((score / lesson.quiz.length) * 100)}
                </span>
                <span className="text-[12px] text-muted">分</span>
                <span className={`ml-2 text-[13px] ${score / lesson.quiz.length >= 0.6 ? 'text-moss' : 'text-oxblood'}`}>
                  {score / lesson.quiz.length >= 0.6 ? '通过' : '未通过，建议重读本课'}
                </span>
              </div>
              <div className="mt-1 meta">
                答对 {score} / {lesson.quiz.length} 题
              </div>
            </div>
            <button
              className="btn-outline"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
              }}
            >
              再做一次
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
