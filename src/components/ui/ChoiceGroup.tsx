import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/types'
import { cn } from '@/utils/cn'

export interface Choice<T extends string> {
  value: T
  label: string
}

const activeTone: Record<Tone, string> = {
  aqua: 'bg-primary text-on-primary',
  lilac: 'bg-lilac-600 text-white',
  sun: 'bg-sun-600 text-white',
  sage: 'bg-sage-600 text-white',
  coral: 'bg-coral-600 text-white',
}

/** Seletor segmentado (radiogroup) — usado na avaliação da rotina do diário. */
export function ChoiceGroup<T extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  tone = 'aqua',
  activeIcon: ActiveIcon,
}: {
  label: string
  icon: LucideIcon
  options: Choice<T>[]
  value?: T
  onChange: (value: T) => void
  tone?: Tone
  activeIcon?: LucideIcon
}) {
  const labelId = useId()
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
      <p className="mb-3 flex items-center gap-2 font-semibold text-on-surface" id={labelId}>
        <Icon className="size-[1.1rem] text-on-surface-variant" aria-hidden />
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-sm transition-all',
                active
                  ? cn(activeTone[tone], 'font-semibold shadow-sm')
                  : 'bg-surface-container-low text-on-surface-variant hover:text-primary',
              )}
            >
              {active && ActiveIcon && <ActiveIcon className="size-4 shrink-0" aria-hidden />}
              <span className="truncate">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
