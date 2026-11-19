import type { Lesson, Stage } from '../types'
import { stage1a } from './stage1a'
import { stage1b } from './stage1b'
import { stage2a } from './stage2a'
import { stage2b } from './stage2b'
import { stage3a } from './stage3a'
import { stage3b } from './stage3b'
import { stage4a } from './stage4a'
import { stage4b } from './stage4b'
import { stage5a } from './stage5a'
import { stage5b } from './stage5b'
import { stage6 } from './stage6'

export const stages: Stage[] = [
  {
    id: 1,
    title: '经济学基础',
    en: 'Foundations',
    chapters: '第 1–3 章',
    blurb: '稀缺、机会成本、边际思维与模型方法——先把看世界的镜片磨好。',
  },
  {
    id: 2,
    title: '市场如何运行',
    en: 'How Markets Work',
    chapters: '第 4–5 章',
    blurb: '供给、需求、均衡与弹性：价格如何把千万人的选择汇总成信号。',
  },
  {
    id: 3,
    title: '市场与政府',
    en: 'Markets & Policy',
    chapters: '第 6–9 章',
    blurb: '限价、税收、剩余与无谓损失，以及贸易带来的赢家与输家。',
  },
  {
    id: 4,
    title: '消费者与生产者行为',
    en: 'Choice & Cost',
    chapters: '第 14、22 章',
    blurb: '从生产函数到成本曲线，从预算约束到无差异曲线：供给与需求的微观地基。',
  },
  {
    id: 5,
    title: '不同市场结构',
    en: 'Market Structure',
    chapters: '第 15–18 章',
    blurb: '完全竞争、垄断、垄断竞争与寡头：定价权从哪里来，又带来什么代价。',
  },
  {
    id: 6,
    title: '市场失灵与公共政策',
    en: 'Market Failure',
    chapters: '第 10–11、23 章',
    blurb: '外部性、公共物品、公共资源与信息不对称：市场做不到的地方，制度如何补位。',
  },
]

export const lessons: Lesson[] = [
  ...stage1a,
  ...stage1b,
  ...stage2a,
  ...stage2b,
  ...stage3a,
  ...stage3b,
  ...stage4a,
  ...stage4b,
  ...stage5a,
  ...stage5b,
  ...stage6,
].sort((a, b) => a.order - b.order)

export const totalLessons = lessons.length
export const totalQuestions = lessons.reduce((n, l) => n + l.quiz.length, 0)
export const totalMinutes = lessons.reduce((n, l) => n + l.minutes, 0)

export const lessonById = new Map(lessons.map((l) => [l.id, l]))

export function getLesson(id?: string) {
  return id ? lessonById.get(id) : undefined
}

export function stageLessons(stage: number) {
  return lessons.filter((l) => l.stage === stage)
}

export function nextLesson(id: string) {
  const i = lessons.findIndex((l) => l.id === id)
  return i >= 0 && i < lessons.length - 1 ? lessons[i + 1] : undefined
}

export function prevLesson(id: string) {
  const i = lessons.findIndex((l) => l.id === id)
  return i > 0 ? lessons[i - 1] : undefined
}

export function stageOf(stage: number) {
  return stages.find((s) => s.id === stage)
}

// 内容完整性自检：编号唯一、顺序连续
const ids = new Set<string>()
for (const l of lessons) {
  if (ids.has(l.id)) throw new Error(`课程编号重复：${l.id}`)
  ids.add(l.id)
  if (l.quiz.length < 3) throw new Error(`课程 ${l.id} 的练习题少于 3 题`)
}
