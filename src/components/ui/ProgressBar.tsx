import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

/** Barra segmentada (ex.: níveis 1–4) ou contínua (0–100). */
export function ProgressBar({
  value,
  max = 100,
  tone = 'aqua',
  segmented,
  label,
}: {
  value: number
  max?: number
  tone?: Tone
  segmented?: boolean
  label: string
}) {
  const t = toneClasses[tone]
  if (segmented) {
    return (
      <div className="flex gap-1.5" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn('h-2 flex-1 rounded-full', i < value ? t.dot : 'bg-surface-container-low')} />
        ))}
      </div>
    )
  }
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-surface-container-low"
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-700', t.dot)} style={{ width: `${pct}%` }} />
    </div>
  )
}
