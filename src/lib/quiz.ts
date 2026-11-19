import type { Lesson, QuizQuestion } from '../types'

/** 归一化：全角转半角、去空白与标点、统一小写 */
export function normalize(s: string) {
  return s
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .replace(/[\s,.;:!?'"“”‘’、，。；：！？（）()《》【】\-—_]/g, '')
    .toLowerCase()
}

const TRUE_WORDS = ['对', '正确', '是', '√', 'true', 't', 'yes', 'y']
const FALSE_WORDS = ['错', '错误', '否', '×', 'x', 'false', 'f', 'no', 'n']

export function gradeQuestion(q: QuizQuestion, raw: string): boolean {
  const value = (raw ?? '').trim()
  if (!value) return false
  if (q.type === 'single') return value.toUpperCase() === q.answer.toUpperCase()
  if (q.type === 'judge') {
    const v = normalize(value)
    const target = q.answer === '对'
    if (TRUE_WORDS.some((w) => normalize(w) === v)) return target
    if (FALSE_WORDS.some((w) => normalize(w) === v)) return !target
    return false
  }
  if (q.type === 'numeric') {
    const n = Number(value.replace(/[^\d.\-]/g, ''))
    const target = Number(q.answer)
    if (!Number.isFinite(n)) return false
    return Math.abs(n - target) <= (q.tol ?? 0.01)
  }
  const v = normalize(value)
  const list = [q.answer, ...(q.accepted || [])].map(normalize)
  return list.includes(v)
}

export function gradeLesson(lesson: Lesson, answers: Record<string, string>) {
  const results = lesson.quiz.map((q) => ({
    q,
    correct: gradeQuestion(q, answers[q.id] || ''),
    chosen: answers[q.id] || '',
  }))
  const score = results.filter((r) => r.correct).length
  return { score, total: lesson.quiz.length, results, passed: score / lesson.quiz.length >= 0.6 }
}
