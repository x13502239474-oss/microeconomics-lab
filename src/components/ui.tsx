import type { ReactNode } from 'react'

export function SectionNo({ n, title, en }: { n: string; title: string; en?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
      <span className="font-mono text-[11px] tracking-[0.18em] text-copper">{n}</span>
      <h2 className="text-[19px] font-semibold tracking-tight text-ink sm:text-[21px]">{title}</h2>
      {en && <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.2em] text-muted sm:block">{en}</span>}
    </div>
  )
}

export function ProgressBar({ value, height = 3, color = '#16324F' }: { value: number; height?: number; color?: string }) {
  return (
    <div className="w-full bg-[#E6DECE]" style={{ height }}>
      <div
        className="h-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  )
}

export function Stat({
  label,
  value,
  unit,
  hint,
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
}) {
  return (
    <div className="px-0 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="tabnum font-serif text-[26px] leading-none text-ink">{value}</span>
        {unit && <span className="text-[11px] text-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>}
    </div>
  )
}

export function Callout({ label, children, tone = 'navy' }: { label: string; children: ReactNode; tone?: 'navy' | 'copper' }) {
  return (
    <div
      className={`my-5 border-l-2 py-3 pl-4 pr-3 ${
        tone === 'copper' ? 'border-copper bg-[#F8F1E4]' : 'border-navy bg-[#F3EFE5]'
      }`}
    >
      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-copper">{label}</div>
      <div className="text-[14px] leading-[1.85] text-ink2">{children}</div>
    </div>
  )
}

export function Ring({ value, size = 68, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6DECE" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#9C7A4A"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(c * Math.min(100, Math.max(0, value))) / 100} ${c}`}
      />
    </svg>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border border-dashed border-line px-6 py-12 text-center">
      <div className="font-serif text-[17px] text-ink">{title}</div>
      {hint && <div className="mt-2 text-[12px] leading-relaxed text-muted">{hint}</div>}
    </div>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
      {children}
    </span>
  )
}

export function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-muted">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="field tabnum" />
    </label>
  )
}
