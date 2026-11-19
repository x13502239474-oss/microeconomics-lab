import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Attempt, DailyTask, Favorite, Persisted, QuizQuestion } from '../types'
import { dayKey, shiftDay } from './time'

const KEY = 'microlab:v1'
const VERSION = 1

const empty = (): Persisted => ({
  version: VERSION,
  completed: {},
  quizPassed: {},
  secondsByDay: {},
  lastStudyDay: '',
  streak: 0,
  bestStreak: 0,
  attempts: {},
  favorites: [],
  notes: {},
  taskDay: '',
  tasks: [],
  createdAt: Date.now(),
})

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Persisted
    if (!parsed || typeof parsed !== 'object') return empty()
    return { ...empty(), ...parsed, version: VERSION }
  } catch {
    return empty()
  }
}

type StoreValue = {
  state: Persisted
  setState: React.Dispatch<React.SetStateAction<Persisted>>
  addSeconds: (sec: number) => void
  completeLesson: (id: string) => void
  uncompleteLesson: (id: string) => void
  recordQuiz: (lessonId: string, score: number, total: number) => { passed: boolean; firstTime: boolean }
  recordAttempt: (p: {
    lessonId: string
    stage: number
    question: QuizQuestion
    chosen: string
    correct: boolean
  }) => void
  removeAttempt: (key: string) => void
  toggleFavorite: (id: string, title: string, stage: number) => void
  saveNote: (lessonId: string, text: string) => void
  setTasks: (tasks: DailyTask[]) => void
  markTask: (kind: DailyTask['kind']) => void
  exportJSON: () => string
  importJSON: (raw: string) => boolean
  reset: () => void
}

const Ctx = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => load())
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state))
      } catch {
        /* 存储配额不足时静默跳过，不阻断学习 */
      }
    }, 200)
  }, [state])

  const addSeconds = useCallback((sec: number) => {
    setState((s) => {
      const today = dayKey()
      const sameDay = s.lastStudyDay === today
      const streak = sameDay
        ? s.streak || 1
        : s.lastStudyDay === shiftDay(today, -1)
          ? s.streak + 1
          : 1
      return {
        ...s,
        secondsByDay: { ...s.secondsByDay, [today]: (s.secondsByDay[today] || 0) + sec },
        lastStudyDay: today,
        streak,
        bestStreak: Math.max(s.bestStreak || 0, streak),
      }
    })
  }, [])

  const completeLesson = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      completed: s.completed[id] ? s.completed : { ...s.completed, [id]: Date.now() },
      tasks: s.tasks.map((t) => (t.kind === 'lesson' ? { ...t, done: true } : t)),
    }))
  }, [])

  const uncompleteLesson = useCallback((id: string) => {
    setState((s) => {
      const next = { ...s.completed }
      delete next[id]
      return { ...s, completed: next }
    })
  }, [])

  const recordQuiz = useCallback(
    (lessonId: string, score: number, total: number) => {
      const passed = total > 0 && score / total >= 0.6
      const firstTime = !state.quizPassed[lessonId]
      setState((s) => {
        const prev = s.quizPassed[lessonId]
        if (!passed) return s
        return {
          ...s,
          quizPassed: {
            ...s.quizPassed,
            [lessonId]: { score: Math.max(score, prev?.score ?? 0), total, at: Date.now() },
          },
          tasks: s.tasks.map((t) => (t.kind === 'quiz' ? { ...t, done: true } : t)),
        }
      })
      return { passed, firstTime }
    },
    [state.quizPassed],
  )

  const recordAttempt = useCallback(
    (p: { lessonId: string; stage: number; question: QuizQuestion; chosen: string; correct: boolean }) => {
      const key = `${p.lessonId}:${p.question.id}`
      setState((s) => {
        const prev = s.attempts[key]
        if (p.correct) {
          const next = { ...s.attempts }
          delete next[key]
          return {
            ...s,
            attempts: next,
            tasks: s.tasks.map((t) => (t.kind === 'review' ? { ...t, done: true } : t)),
          }
        }
        const attempt: Attempt = {
          key,
          lessonId: p.lessonId,
          qid: p.question.id,
          stage: p.stage,
          stem: p.question.stem,
          type: p.question.type,
          chosen: p.chosen,
          correct: false,
          wrongCount: (prev?.wrongCount || 0) + 1,
          firstAt: prev?.firstAt || Date.now(),
          lastAt: Date.now(),
        }
        return { ...s, attempts: { ...s.attempts, [key]: attempt } }
      })
    },
    [],
  )

  const removeAttempt = useCallback((key: string) => {
    setState((s) => {
      const next = { ...s.attempts }
      delete next[key]
      return {
        ...s,
        attempts: next,
        tasks: s.tasks.map((t) => (t.kind === 'review' ? { ...t, done: true } : t)),
      }
    })
  }, [])

  const toggleFavorite = useCallback((id: string, title: string, stage: number) => {
    setState((s) => {
      const exists = s.favorites.some((f) => f.id === id)
      const favorites: Favorite[] = exists
        ? s.favorites.filter((f) => f.id !== id)
        : [{ id, title, stage, at: Date.now() }, ...s.favorites]
      return { ...s, favorites }
    })
  }, [])

  const saveNote = useCallback((lessonId: string, text: string) => {
    setState((s) => {
      const notes = { ...s.notes }
      if (!text.trim()) delete notes[lessonId]
      else notes[lessonId] = { lessonId, text, at: Date.now() }
      return { ...s, notes }
    })
  }, [])

  const setTasks = useCallback((tasks: DailyTask[]) => {
    setState((s) => ({ ...s, tasks, taskDay: dayKey() }))
  }, [])

  const markTask = useCallback((kind: DailyTask['kind']) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.kind === kind ? { ...t, done: true } : t)) }))
  }, [])

  const exportJSON = useCallback(() => JSON.stringify(state, null, 2), [state])

  const importJSON = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Persisted
      if (!parsed || typeof parsed !== 'object' || !parsed.completed) return false
      setState({ ...empty(), ...parsed, version: VERSION })
      return true
    } catch {
      return false
    }
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setState(empty())
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      setState,
      addSeconds,
      completeLesson,
      uncompleteLesson,
      recordQuiz,
      recordAttempt,
      removeAttempt,
      toggleFavorite,
      saveNote,
      setTasks,
      markTask,
      exportJSON,
      importJSON,
      reset,
    }),
    [
      state,
      addSeconds,
      completeLesson,
      uncompleteLesson,
      recordQuiz,
      recordAttempt,
      removeAttempt,
      toggleFavorite,
      saveNote,
      setTasks,
      markTask,
      exportJSON,
      importJSON,
      reset,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用')
  return ctx
}

/** 页面停留计时：每 20 秒累计一次，仅在前台可见时计时 */
export function useStudyTimer(active = true) {
  const { addSeconds } = useStore()
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') addSeconds(20)
    }, 20000)
    return () => window.clearInterval(id)
  }, [active, addSeconds])
}
