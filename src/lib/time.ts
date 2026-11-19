export const pad = (n: number) => String(n).padStart(2, '0')

/** 本地日期键：2026-11-19 */
export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return dayKey(date)
}

export function prettyDate(d = new Date()) {
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}`
}

export function lastNDays(n: number) {
  const today = dayKey()
  return Array.from({ length: n }, (_, i) => shiftDay(today, i - n + 1))
}

export function secondsLabel(sec: number) {
  if (sec < 60) return `${Math.round(sec)} 秒`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分钟`
  const h = Math.floor(min / 60)
  return `${h} 小时 ${min % 60} 分`
}

export function fromNow(ts: number) {
  const diff = Date.now() - ts
  const day = Math.floor(diff / 86400000)
  if (day <= 0) return '今天'
  if (day === 1) return '昨天'
  if (day < 7) return `${day} 天前`
  if (day < 30) return `${Math.floor(day / 7)} 周前`
  return `${Math.floor(day / 30)} 个月前`
}
