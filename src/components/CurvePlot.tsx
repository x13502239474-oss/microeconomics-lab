import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChartCurve, ChartShape, ChartSpec } from '../types'
import { num } from '../lib/econ'

const COLOR: Record<string, string> = {
  navy: '#16324F',
  copper: '#9C7A4A',
  steel: '#7C93AB',
  moss: '#3F6B4F',
  oxblood: '#8F3B31',
  ink: '#12263F',
}

const resolve = (c?: string) => (c ? COLOR[c] || c : '#16324F')

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min
  if (!(span > 0)) return [min]
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  const start = Math.ceil(min / step - 1e-9) * step
  const out: number[] = []
  for (let v = start; v <= max + step * 0.001; v += step) out.push(Number(v.toFixed(6)))
  return out
}

function useWidth() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [w, setW] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setW(width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

type Box = { x1: number; y1: number; x2: number; y2: number }

const CJK = /[\u2e80-\u9fff\uff00-\uffef]/

function textWidth(s: string, fs: number) {
  let w = 0
  for (const ch of s) w += CJK.test(ch) ? fs : fs * 0.55
  return w
}

/** 以基线坐标为基准估算文字外框 */
function textBox(x: number, y: number, s: string, fs: number, anchor: 'start' | 'middle' | 'end'): Box {
  const w = textWidth(s, fs)
  const x1 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
  return { x1, y1: y - fs * 0.8, x2: x1 + w, y2: y + fs * 0.25 }
}

const hits = (a: Box, b: Box, gap = 2) =>
  Math.min(a.x2, b.x2) + gap > Math.max(a.x1, b.x1) && Math.min(a.y2, b.y2) + gap > Math.max(a.y1, b.y1)

function sample(curve: ChartCurve, min: number, max: number) {
  const from = curve.from ?? min
  const to = curve.to ?? max
  const n = 160
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n
    const y = curve.f(x)
    if (Number.isFinite(y)) pts.push([x, y])
  }
  return pts
}

export function CurvePlot({
  spec,
  height = 300,
  compact = false,
}: {
  spec: ChartSpec
  height?: number
  compact?: boolean
}) {
  const [ref, width] = useWidth()
  const xMin = spec.xMin ?? 0
  const yMin = spec.yMin ?? 0
  const xMax = spec.xMax
  const yMax = spec.yMax
  const pad = {
    l: compact ? 38 : 48,
    r: compact ? 14 : 20,
    t: 22,
    b: compact ? 34 : 44,
  }
  const h = height

  const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (width - pad.l - pad.r)
  const sy = (y: number) => h - pad.b - ((y - yMin) / (yMax - yMin)) * (h - pad.t - pad.b)

  const xTicks = useMemo(() => niceTicks(xMin, xMax, 4), [xMin, xMax])
  const yTicks = useMemo(() => niceTicks(yMin, yMax, 4), [yMin, yMax])

  const curves = spec.curves || []
  const shapes: ChartShape[] = spec.shapes || []

  /** 贴边文字自动收进画布：放不下就翻转锚点，仍然放不下就整体平移 */
  const place = (text: string, x: number, y: number, fs: number, anchor: 'start' | 'middle' | 'end') => {
    const w = textWidth(text, fs)
    const left = pad.l + 2
    const right = width - pad.r + 6
    let a: 'start' | 'middle' | 'end' = anchor
    let xx = x
    if (a === 'start' && xx + w > right) {
      a = 'end'
      xx = x - 4
    } else if (a === 'end' && xx - w < left) {
      a = 'start'
      xx = x + 4
    }
    if (a === 'middle') {
      xx = Math.min(Math.max(xx, left + w / 2), right - w / 2)
    } else if (a === 'start') {
      xx = Math.min(xx, right - w)
    } else {
      xx = Math.max(xx, left + w)
    }
    return { x: xx, y, anchor: a }
  }

  const pointLabel = (s: Extract<ChartShape, { kind: 'point' }>) => {
    const anchor = s.anchor === 'end' ? 'end' : 'start'
    return place(s.label || '', sx(s.x) + (anchor === 'end' ? -8 : 8), sy(s.y) - 9 + (s.dy || 0), 10.5, anchor)
  }

  /** 同一张图里常有多个点，标注先到先得，后来的往上/往下挪，避免压在一起 */
  const pointPlacements = useMemo(() => {
    const occ: Box[] = []
    const map: Record<number, { x: number; y: number; anchor: 'start' | 'end' }> = {}
    shapes.forEach((s, i) => {
      if (s.kind !== 'point' || !s.label) return
      const px = sx(s.x)
      const py = sy(s.y)
      const dy0 = s.dy || 0
      const pref = s.anchor === 'end' ? 'end' : 'start'
      const off = pref === 'end' ? -8 : 8
      const cands = [
        { x: px + off, y: py - 9 + dy0 },
        { x: px + off, y: py + 17 + dy0 },
        { x: px + off, y: py - 26 + dy0 },
        { x: px + off, y: py + 34 + dy0 },
        { x: px + off, y: py - 43 + dy0 },
      ]
      let pick: { x: number; y: number; anchor: 'start' | 'end'; b: Box } | null = null
      for (const c of cands) {
        const p = place(s.label, c.x, c.y, 10.5, pref)
        const anchor: 'start' | 'end' = p.anchor === 'end' ? 'end' : 'start'
        const b = textBox(p.x, p.y, s.label, 10.5, anchor)
        if (!occ.some((o) => hits(o, b, 3))) {
          pick = { x: p.x, y: p.y, anchor, b }
          break
        }
      }
      if (!pick) {
        const p = place(s.label, cands[0].x, cands[0].y, 10.5, pref)
        const anchor: 'start' | 'end' = p.anchor === 'end' ? 'end' : 'start'
        pick = { x: p.x, y: p.y, anchor, b: textBox(p.x, p.y, s.label, 10.5, anchor) }
      }
      occ.push(pick.b)
      map[i] = { x: pick.x, y: pick.y, anchor: pick.anchor }
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, width, h, compact])

  /**
   * 曲线名标注：先登记已写死的文字（点、辅助线、自由标签）占位，
   * 再为每条曲线的名称挑选一个落在画布内、且不与已有文字相撞的位置。
   */
  const curveLabels = useMemo(() => {
    const occupied: Box[] = []
    for (const s of shapes) {
      if (s.kind === 'point' && s.label) {
        const idx = shapes.indexOf(s)
        const p = pointPlacements[idx] ?? pointLabel(s)
        occupied.push(textBox(p.x, p.y, s.label, 10.5, p.anchor))
      } else if (s.kind === 'hline' && s.label) {
        occupied.push(textBox(pad.l + 4, sy(s.y) - 5, s.label, 9.5, 'start'))
      } else if (s.kind === 'vline' && s.label) {
        const p = place(s.label, sx(s.x) + 4, pad.t + 10, 9.5, 'start')
        occupied.push(textBox(p.x, p.y, s.label, 9.5, p.anchor))
      } else if (s.kind === 'label' && s.text) {
        const p = place(s.text, sx(s.x), sy(s.y), 11, s.anchor || 'middle')
        occupied.push(textBox(p.x, p.y, s.text, 11, p.anchor))
      }
    }
    const bounds = { x1: pad.l + 2, y1: pad.t + 3, x2: width - pad.r + 8, y2: h - pad.b - 2 }
    const out: { text: string; color?: string; x: number; y: number; anchor: 'start' | 'end' }[] = []
    for (const c of curves) {
      if (!c.label) continue
      const pts = sample(c, xMin, xMax)
      // 只取落在画布范围内的最后一点，避免曲线冲出图外时标签标记在空中
      const inside = pts.filter(
        ([x, y]) => x >= xMin - 1e-9 && x <= xMax + 1e-9 && y >= yMin - 1e-9 && y <= yMax + 1e-9,
      )
      const last = (inside.length ? inside : pts)[inside.length ? inside.length - 1 : pts.length - 1]
      if (!last) continue
      const px = sx(last[0])
      const py = sy(last[1])
      const cands: { x: number; y: number; anchor: 'start' | 'end' }[] = []
      const at = (x: number, y: number) => {
        cands.push({ x: x + 7, y, anchor: 'start' })
        cands.push({ x: x - 7, y, anchor: 'end' })
      }
      at(px, py - 9)
      // 末端拥挤时沿曲线中段找位置
      for (const frac of [0.78, 0.62]) {
        const idx = Math.max(0, Math.round(frac * (inside.length - 1)))
        const p2 = inside[idx] || last
        for (const dy of [-13, 14]) cands.push({ x: sx(p2[0]), y: sy(p2[1]) + dy, anchor: 'start' })
        for (const dy of [-13, 14]) cands.push({ x: sx(p2[0]), y: sy(p2[1]) + dy, anchor: 'end' })
      }
      at(px, py + 15)
      for (const frac of [0.9, 0.45]) {
        const idx = Math.max(0, Math.round(frac * (inside.length - 1)))
        const p2 = inside[idx] || last
        for (const dy of [-13, 14]) cands.push({ x: sx(p2[0]), y: sy(p2[1]) + dy, anchor: 'start' })
        for (const dy of [-13, 14]) cands.push({ x: sx(p2[0]), y: sy(p2[1]) + dy, anchor: 'end' })
      }
      for (const dy of [-25, 31, -41, 45, -57]) at(px, py + dy)
      let pick: { x: number; y: number; anchor: 'start' | 'end'; b: Box } | null = null
      for (const cd of cands) {
        const b = textBox(cd.x, cd.y, c.label, 11, cd.anchor)
        const ok = b.x1 >= bounds.x1 && b.x2 <= bounds.x2 && b.y1 >= bounds.y1 && b.y2 <= bounds.y2
        if (ok && !occupied.some((o) => hits(o, b, 3))) {
          pick = { x: cd.x, y: cd.y, anchor: cd.anchor, b }
          break
        }
      }
      if (!pick) {
        // 兜底：贴着曲线末端，向下依次避让
        for (const dy of [-9, 15, 31, 47, 63]) {
          const y = Math.max(bounds.y1 + 8, Math.min(bounds.y2 - 2, py + dy))
          const b = textBox(px - 7, y, c.label, 11, 'end')
          if (!occupied.some((o) => hits(o, b, 2))) {
            pick = { x: px - 7, y, anchor: 'end', b }
            break
          }
        }
      }
      if (!pick) {
        const y = Math.max(bounds.y1 + 8, Math.min(bounds.y2 - 2, py - 9))
        pick = { x: px - 7, y, anchor: 'end', b: textBox(px - 7, y, c.label, 11, 'end') }
      }
      occupied.push(pick.b)
      out.push({ text: c.label, color: c.color, x: pick.x, y: pick.y, anchor: pick.anchor })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, width, h, compact])

  const path = (curve: ChartCurve) => {
    const pts = sample(curve, xMin, xMax).filter(([x]) => x >= xMin - 1e-9 && x <= xMax + 1e-9)
    if (!pts.length) return ''
    return pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`)
      .join(' ')
  }

  return (
    <div ref={ref} className="w-full">
      <svg
        width={width}
        height={h}
        role="img"
        aria-label={`${spec.yLabel} 与 ${spec.xLabel} 的关系图`}
        style={{ overflow: 'visible' }}
      >
        <rect x={0} y={0} width={width} height={h} fill="#FFFCF5" />
        {/* 网格 */}
        {yTicks.map((t) => (
          <line key={`gy${t}`} x1={pad.l} x2={width - pad.r} y1={sy(t)} y2={sy(t)} stroke="#E9E2D4" strokeWidth={1} />
        ))}
        {xTicks.map((t) => (
          <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={pad.t} y2={h - pad.b} stroke="#EFE9DC" strokeWidth={1} />
        ))}

        {/* 坐标轴 */}
        <line x1={pad.l} x2={width - pad.r} y1={h - pad.b} y2={h - pad.b} stroke="#12263F" strokeWidth={1} />
        <line x1={pad.l} x2={pad.l} y1={pad.t} y2={h - pad.b} stroke="#12263F" strokeWidth={1} />
        {yTicks.map((t) => (
          <g key={`ty${t}`}>
            <line x1={pad.l - 4} x2={pad.l} y1={sy(t)} y2={sy(t)} stroke="#12263F" strokeWidth={1} />
            <text x={pad.l - 7} y={sy(t) + 3} fontSize={10} textAnchor="end" fill="#6E7F93">
              {num(t, 0)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`tx${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={h - pad.b} y2={h - pad.b + 4} stroke="#12263F" strokeWidth={1} />
            <text x={sx(t)} y={h - pad.b + 15} fontSize={10} textAnchor="middle" fill="#6E7F93">
              {num(t, 0)}
            </text>
          </g>
        ))}
        <text x={width - pad.r} y={h - 5} fontSize={10} textAnchor="end" fill="#6E7F93" fontStyle="italic">
          {spec.xLabel}
        </text>
        <text
          x={12}
          y={h / 2}
          fontSize={10}
          textAnchor="middle"
          fill="#6E7F93"
          fontStyle="italic"
          transform={`rotate(-90 12 ${h / 2})`}
        >
          {spec.yLabel}
        </text>

        {/* 曲线 */}
        {curves.map((c, i) => (
          <path
            key={`c${i}`}
            d={path(c)}
            fill="none"
            stroke={resolve(c.color)}
            strokeWidth={c.width ?? 1.9}
            strokeDasharray={c.dash ? '6 4' : undefined}
            strokeLinecap="round"
          />
        ))}

        {/* 阴影与辅助元素 */}
        {shapes.map((s, i) => {
          if (s.kind === 'polygon') {
            return (
              <polygon
                key={`p${i}`}
                points={s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
                fill={resolve(s.fill)}
                fillOpacity={0.14}
                stroke={s.stroke ? resolve(s.stroke) : 'none'}
                strokeWidth={1}
              />
            )
          }
          if (s.kind === 'vline') {
            return (
              <g key={`v${i}`}>
                <line
                  x1={sx(s.x)}
                  x2={sx(s.x)}
                  y1={pad.t}
                  y2={h - pad.b}
                  stroke={resolve(s.color || 'steel')}
                  strokeWidth={1}
                  strokeDasharray={s.dash === false ? undefined : '4 4'}
                />
                {s.label && (
                  <text
                    {...(() => {
                      const p = place(s.label, sx(s.x) + 4, pad.t + 10, 9.5, 'start')
                      return { x: p.x, y: p.y, textAnchor: p.anchor }
                    })()}
                    fontSize={9.5}
                    fill={resolve(s.color || 'steel')}
                    stroke="#FFFCF5"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {s.label}
                  </text>
                )}
              </g>
            )
          }
          if (s.kind === 'hline') {
            return (
              <g key={`h${i}`}>
                <line
                  x1={pad.l}
                  x2={width - pad.r}
                  y1={sy(s.y)}
                  y2={sy(s.y)}
                  stroke={resolve(s.color || 'steel')}
                  strokeWidth={1}
                  strokeDasharray={s.dash === false ? undefined : '4 4'}
                />
                {s.label && (
                  <text
                    x={pad.l + 4}
                    y={sy(s.y) - 5}
                    fontSize={9.5}
                    fill={resolve(s.color || 'steel')}
                    stroke="#FFFCF5"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {s.label}
                  </text>
                )}
              </g>
            )
          }
          if (s.kind === 'point') {
            const pl = s.label ? pointPlacements[i] ?? pointLabel(s) : null
            return (
              <g key={`pt${i}`}>
                <circle cx={sx(s.x)} cy={sy(s.y)} r={8} fill={resolve(s.color || 'copper')} fillOpacity={0.14} />
                <circle cx={sx(s.x)} cy={sy(s.y)} r={4} fill={resolve(s.color || 'copper')} />
                {pl && s.label && (
                  <>
                    <rect
                      x={textBox(pl.x, pl.y, s.label, 10.5, pl.anchor).x1 - 2}
                      y={pl.y - 10}
                      width={textWidth(s.label, 10.5) + 4}
                      height={13}
                      fill="#FFFCF5"
                      rx={2}
                    />
                    <text
                      x={pl.x}
                      y={pl.y}
                      textAnchor={pl.anchor}
                      fontSize={10.5}
                      fill={resolve(s.color || 'ink')}
                      fontWeight={600}
                      stroke="#FFFCF5"
                      strokeWidth={3}
                      paintOrder="stroke"
                      strokeLinejoin="round"
                    >
                      {s.label}
                    </text>
                  </>
                )}
              </g>
            )
          }
          const lab = place(s.text || '', sx(s.x), sy(s.y), 11, s.anchor || 'middle')
          return (
            <text
              key={`l${i}`}
              x={lab.x}
              y={lab.y}
              fontSize={11}
              textAnchor={lab.anchor}
              fill={resolve(s.color || 'ink')}
              stroke="#FFFCF5"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {s.text}
            </text>
          )
        })}

        {/* 曲线名称 */}
        {curveLabels.map((l, i) => {
          const b = textBox(l.x, l.y, l.text, 11, l.anchor)
          return (
            <g key={`cl${i}`}>
              <rect
                x={b.x1 - 2}
                y={b.y1 + 1}
                width={b.x2 - b.x1 + 4}
                height={b.y2 - b.y1 - 1}
                fill="#FFFCF5"
                rx={2}
              />
              <text
                x={l.x}
                y={l.y}
                fontSize={11}
                textAnchor={l.anchor}
                fill={resolve(l.color)}
                fontWeight={600}
                stroke="#FFFCF5"
                strokeWidth={3}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {l.text}
              </text>
            </g>
          )
        })}
      </svg>

      {(spec.caption || curves.some((c) => c.label)) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linesoft pt-2">
          {curves
            .filter((c) => c.label)
            .map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-muted">
                <span className="inline-block h-[2px] w-4" style={{ background: resolve(c.color) }} />
                {c.label}
              </span>
            ))}
          {spec.caption && <span className="text-[11px] leading-relaxed text-muted">{spec.caption}</span>}
        </div>
      )}
    </div>
  )
}
