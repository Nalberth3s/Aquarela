import { cn } from '@/utils/cn'

export interface TabOption<T extends string> {
  value: T
  label: string
  count?: number
}

/** Seletor em pílulas (filtros, abas simples). */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: TabOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
              active ? 'bg-on-surface text-white' : 'bg-white text-on-surface-variant ring-1 ring-surface-container-high hover:text-on-surface',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('text-xs', active ? 'text-white/70' : 'text-outline')}>{opt.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
