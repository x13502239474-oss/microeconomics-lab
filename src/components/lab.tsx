import type { ReactNode } from 'react'

export function LabShell({
  kicker,
  title,
  lead,
  controls,
  chart,
  readouts,
  note,
  formula,
}: {
  kicker: string
  title: string
  lead: string
  controls: ReactNode
  chart: ReactNode
  readouts: ReactNode
  note: ReactNode
  formula?: string
}) {
  return (
    <div className="shell pb-14 pt-7 sm:pt-10">
      <div className="eyebrow">{kicker}</div>
      <h1 className="mt-2 text-[27px] tracking-tight sm:text-[34px]">{title}</h1>
      <p className="mt-2 max-w-[42rem] text-[13px] leading-[1.9] text-muted">{lead}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[292px_1fr] lg:gap-7">
        <div className="card h-fit p-4 sm:p-5">
          <div className="eyebrow mb-4">Parameters</div>
          <div className="space-y-5">{controls}</div>
          {formula && (
            <div className="mt-5 border-t border-linesoft pt-4">
              <div className="meta mb-1">计算式</div>
              <div className="font-mono text-[11px] leading-relaxed text-ink2">{formula}</div>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="card p-3 sm:p-4">{chart}</div>
          <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">{readouts}</div>
          <div className="card-quiet p-4 text-[12.5px] leading-[1.9] text-ink2 sm:p-5">{note}</div>
        </div>
      </div>
    </div>
  )
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-ink2">{label}</span>
        <span className="tabnum font-mono text-[11px] text-navy">
          {Number.isInteger(value) ? value : value.toFixed(2)}
          {unit && <span className="ml-0.5 text-[9px] text-muted">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1.5"
      />
      {hint && <p className="mt-0.5 text-[10px] leading-snug text-muted">{hint}</p>}
    </div>
  )
}

export function Readout({
  label,
  value,
  unit,
  tone = 'ink',
  hint,
}: {
  label: string
  value: string | number
  unit?: string
  tone?: 'ink' | 'moss' | 'oxblood' | 'copper'
  hint?: string
}) {
  const color = tone === 'moss' ? 'text-moss' : tone === 'oxblood' ? 'text-oxblood' : tone === 'copper' ? 'text-copper' : 'text-ink'
  return (
    <div className="bg-surface px-3 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className={`tabnum mt-1 font-serif text-[20px] leading-none ${color}`}>
        {value}
        {unit && <span className="ml-1 font-sans text-[10px] text-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-[10px] text-muted">{hint}</div>}
    </div>
  )
}

export function LabTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-line bg-[#F4EFE3]">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-linesoft last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 tabnum ${j === 0 ? 'text-ink' : 'text-ink2'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
