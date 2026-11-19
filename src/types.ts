/** 全站数据类型定义 */

export type Stage = {
  id: number
  title: string
  en: string
  chapters: string
  blurb: string
}

export type ChartCurve = {
  label?: string
  color?: string
  dash?: boolean
  width?: number
  f: (x: number) => number
  from?: number
  to?: number
}

export type ChartShape =
  | { kind: 'polygon'; points: [number, number][]; fill?: string; stroke?: string; label?: string }
  | { kind: 'point'; x: number; y: number; label?: string; color?: string; dy?: number; anchor?: 'start' | 'end' }
  | { kind: 'vline'; x: number; label?: string; color?: string; dash?: boolean }
  | { kind: 'hline'; y: number; label?: string; color?: string; dash?: boolean }
  | { kind: 'label'; x: number; y: number; text: string; color?: string; anchor?: 'start' | 'middle' | 'end' }

export type ChartSpec = {
  xLabel: string
  yLabel: string
  xMin?: number
  yMin?: number
  xMax: number
  yMax: number
  curves?: ChartCurve[]
  shapes?: ChartShape[]
  caption?: string
  height?: number
}

export type Block =
  | { k: 'p'; t: string }
  | { k: 'list'; items: string[]; ordered?: boolean }
  | { k: 'formula'; tex: string; vars?: { s: string; m: string }[]; note?: string }
  | { k: 'table'; head: string[]; rows: string[][] }
  | { k: 'note'; title: string; t: string }
  | { k: 'chart'; spec: ChartSpec }
  | { k: 'interactive'; caption?: string }

export type QuizQuestion = {
  id: string
  type: 'single' | 'judge' | 'fill' | 'numeric'
  stem: string
  options?: string[]
  /** 选择题为选项字母；判断题为 '对'/'错'；填空为参考答案；数值题为数字字符串 */
  answer: string
  /** 填空题可接受的其他写法 */
  accepted?: string[]
  tol?: number
  explanation: string
  /** 计算过程，答题后展示 */
  steps?: string
}

export type Lesson = {
  id: string
  stage: number
  order: number
  title: string
  subtitle: string
  /** 对应教材章节，如「第 4 章 4.2」 */
  chapter: string
  minutes: number
  objectives: string[]
  hook: { title: string; paragraphs: string[] }
  concepts: { term: string; plain: string; detail: string }[]
  theory: Block[]
  math?: { formula: string; vars: { s: string; m: string }[]; note: string }
  chart?: ChartSpec
  interactive?: { a: number; b: number; c: number; d: number; price?: number; caption: string }
  cases: { title: string; body: string; numbers?: { label: string; value: string }[] }[]
  summary: string[]
  quiz: QuizQuestion[]
  extend?: string
}

export type Attempt = {
  key: string
  lessonId: string
  qid: string
  stage: number
  stem: string
  type: QuizQuestion['type']
  chosen: string
  correct: boolean
  wrongCount: number
  firstAt: number
  lastAt: number
}

export type Favorite = { id: string; title: string; stage: number; at: number }
export type Note = { lessonId: string; text: string; at: number }

export type DailyTask = { id: string; label: string; kind: 'lesson' | 'quiz' | 'review'; done: boolean }

export type Persisted = {
  version: number
  completed: Record<string, number>
  quizPassed: Record<string, { score: number; total: number; at: number }>
  secondsByDay: Record<string, number>
  lastStudyDay: string
  streak: number
  bestStreak: number
  attempts: Record<string, Attempt>
  favorites: Favorite[]
  notes: Record<string, Note>
  taskDay: string
  tasks: DailyTask[]
  createdAt: number
}
