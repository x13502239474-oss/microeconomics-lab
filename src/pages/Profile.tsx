import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { lessons } from '../content'
import { useStore } from '../lib/store'
import { cloudStatus } from '../lib/sync'
import { dayKey, fromNow, lastNDays, secondsLabel } from '../lib/time'
import { ProgressBar, Stat } from '../components/ui'
import { IconArrow } from '../components/Icons'

export default function Profile() {
  const { state, exportJSON, importJSON, reset } = useStore()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [msg, setMsg] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const done = Object.keys(state.completed).length
  const pct = Math.round((done / lessons.length) * 100)
  const totalSeconds = Object.values(state.secondsByDay).reduce((a, b) => a + b, 0)
  const cloud = cloudStatus()

  const week = useMemo(() => {
    const days = lastNDays(7)
    return days.map((d) => ({
      day: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`,
      minutes: Math.round((state.secondsByDay[d] || 0) / 60),
    }))
  }, [state.secondsByDay])

  const notes = Object.values(state.notes).sort((a, b) => b.at - a.at)
  const favorites = [...state.favorites].sort((a, b) => b.at - a.at)
  const weekTotal = week.reduce((n, d) => n + d.minutes, 0)
  const weekMax = Math.max(10, Math.ceil(Math.max(...week.map((d) => d.minutes), 1) / 10) * 10)

  const download = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `microlab-backup-${dayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('备份文件已生成')
  }

  const importFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importJSON(String(reader.result || ''))
      setMsg(ok ? '学习记录已导入' : '导入失败：文件格式不正确')
    }
    reader.readAsText(file)
  }

  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <header className="border-b border-line pb-5">
        <div className="eyebrow">Profile · Local First</div>
        <h1 className="mt-2 text-[28px] tracking-tight sm:text-[36px]">我的学习</h1>
        <p className="mt-2 max-w-[36rem] text-[13px] leading-[1.9] text-muted">
          不需要注册，所有进度、答题与笔记都保存在这台设备的浏览器里。换设备时用下方备份文件迁移。
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-x-6 border-b border-line pb-2 sm:grid-cols-4">
        <Stat label="已完成" value={done} unit={`/ ${lessons.length} 讲`} />
        <Stat label="完成率" value={`${pct}%`} />
        <Stat label="累计学习" value={secondsLabel(totalSeconds)} />
        <Stat label="连续学习" value={state.streak} unit="天" hint={`最长 ${state.bestStreak} 天`} />
      </section>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="eyebrow">Last 7 Days</div>
              <span className="meta">单位：分钟</span>
            </div>
            <div className="border border-line bg-surface p-3">
              {weekTotal === 0 ? (
                <div className="flex h-[190px] flex-col items-center justify-center gap-2 border border-dashed border-line">
                  <span className="font-serif text-[15px] text-ink2">最近 7 天还没有学习记录</span>
                  <span className="text-[11.5px] text-muted">开始阅读后，这里会按天累计你的学习分钟数。</span>
                  <Link to="/course" className="mt-1 text-[12px] text-navy hover:underline">
                    去课程目录 →
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={week} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="#E9E2D4" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6E7F93' }} axisLine={{ stroke: '#DCD3C2' }} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#6E7F93' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      domain={[0, weekMax]}
                    />
                    <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #DCD3C2', background: '#FFFCF5' }} />
                    <Bar dataKey="minutes" fill="#16324F" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} />
              <div className="mt-1.5 flex justify-between meta">
                <span>课程完成度</span>
                <span>{done} / {lessons.length}</span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="eyebrow">Saved</div>
              <span className="meta">{favorites.length} 条</span>
            </div>
            {favorites.length === 0 ? (
              <p className="border border-dashed border-line px-4 py-6 text-[12px] text-muted">
                还没有收藏。在课程页右上角的书签按钮可以收藏重点章节。
              </p>
            ) : (
              <div className="divide-y divide-linesoft border-y border-linesoft">
                {favorites.map((f) => (
                  <Link key={f.id} to={`/lesson/${f.id}`} className="group flex items-center justify-between gap-3 py-2.5">
                    <span className="text-[13px] text-ink group-hover:text-navy">{f.title}</span>
                    <span className="flex items-center gap-2 meta">
                      阶段 {f.stage} <IconArrow className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="eyebrow">Notes</div>
              <span className="meta">{notes.length} 条</span>
            </div>
            {notes.length === 0 ? (
              <p className="border border-dashed border-line px-4 py-6 text-[12px] text-muted">
                还没有笔记。每讲末尾都可以写下自己的理解。
              </p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => {
                  const lesson = lessons.find((l) => l.id === n.lessonId)
                  return (
                    <Link key={n.lessonId} to={`/lesson/${n.lessonId}`} className="block border border-line bg-surface p-3 hover:border-navy">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] text-ink">{lesson?.title || n.lessonId}</span>
                        <span className="meta">{fromNow(n.at)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">{n.text}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:border-l lg:border-line lg:pl-7">
          <div>
            <div className="eyebrow">Review Reminder</div>
            <p className="mt-2 text-[12px] leading-[1.9] text-muted">
              已学完 {done} 讲，其中 {Object.values(state.quizPassed).length} 讲通过了章节测试。
              {Object.keys(state.attempts).length > 0
                ? ` 还有 ${Object.keys(state.attempts).length} 道错题待重做。`
                : ' 目前没有待重做的错题。'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/wrong" className="btn-outline px-3 py-1.5 text-[12px]">
                去错题本
              </Link>
              <Link to="/course" className="btn-ghost px-3 py-1.5 text-[12px]">
                继续学习
              </Link>
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <div className="eyebrow">Data</div>
            <dl className="mt-2 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">存储位置</dt>
                <dd className="text-ink">浏览器 LocalStorage</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">云端同步</dt>
                <dd className={cloud.connected ? 'text-moss' : 'text-muted'}>
                  {cloud.connected ? cloud.name : '未配置（接口已预留）'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">数据版本</dt>
                <dd className="tabular-nums text-ink">v{state.version}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-outline px-3 py-1.5 text-[12px]" onClick={download}>
                导出备份
              </button>
              <button className="btn-outline px-3 py-1.5 text-[12px]" onClick={() => fileRef.current?.click()}>
                导入备份
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) importFile(f)
                  e.target.value = ''
                }}
              />
            </div>
            {msg && <p className="mt-2 text-[11px] text-moss">{msg}</p>}
          </div>

          <div className="border-t border-line pt-5">
            <div className="eyebrow">Danger Zone</div>
            {!confirmReset ? (
              <button className="mt-2 text-[12px] text-oxblood hover:underline" onClick={() => setConfirmReset(true)}>
                清空全部学习记录
              </button>
            ) : (
              <div className="mt-2 border border-oxblood/30 bg-[#F7EBE8] p-3">
                <p className="text-[11.5px] leading-relaxed text-ink2">
                  将删除进度、答题、错题、收藏与笔记，且无法撤销。建议先导出备份。
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="border border-oxblood bg-oxblood px-3 py-1.5 text-[11.5px] text-paper"
                    onClick={() => {
                      reset()
                      setConfirmReset(false)
                      setMsg('已清空')
                    }}
                  >
                    确认清空
                  </button>
                  <button className="btn-outline px-3 py-1.5 text-[11.5px]" onClick={() => setConfirmReset(false)}>
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line pt-5">
            <Link to="/about" className="flex items-center justify-between text-[12px] text-muted hover:text-ink">
              教材与版权说明
              <IconArrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
