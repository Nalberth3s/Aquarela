import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { capitalizeFirst, eventDays } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { todayISO } from '@/utils/format'
import { toneClasses } from '@/utils/tones'
import { eventCategories } from './eventCategories'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const monthTitle = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const pad = (n: number) => String(n).padStart(2, '0')

/** Calendário mensal com marcações coloridas nos dias com evento. */
export function MonthCalendar({
  events,
  year,
  month,
  onChangeMonth,
  selectedDay,
  onSelectDay,
}: {
  events: CalendarEvent[]
  year: number
  /** 0–11 */
  month: number
  onChangeMonth: (year: number, month: number) => void
  selectedDay?: string
  onSelectDay: (day: string | undefined) => void
}) {
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) for (const d of eventDays(e)) map.set(d, [...(map.get(d) ?? []), e])
    return map
  }, [events])

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayISO()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1)
    onChangeMonth(d.getFullYear(), d.getMonth())
  }

  return (
    <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-surface-container-low"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg" aria-live="polite">
          {capitalizeFirst(monthTitle.format(new Date(year, month, 1)))}
        </h2>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-surface-container-low"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-outline" aria-hidden>
        {weekdays.map((w, i) => (
          <span key={i} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />
          const iso = `${year}-${pad(month + 1)}-${pad(day)}`
          const dayEvents = eventsByDay.get(iso) ?? []
          const selected = selectedDay === iso
          const has = dayEvents.length > 0
          return (
            <button
              key={iso}
              type="button"
              disabled={!has}
              onClick={() => onSelectDay(selected ? undefined : iso)}
              aria-pressed={selected}
              aria-label={`${day}${has ? `: ${dayEvents.map((e) => e.title).join(', ')}` : ''}`}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition',
                selected
                  ? 'bg-primary font-bold text-white'
                  : has
                    ? 'bg-aqua-50 font-semibold text-on-surface hover:bg-aqua-100'
                    : 'text-on-surface-variant',
                iso === today && !selected && 'ring-2 ring-primary',
              )}
            >
              {day}
              {has && (
                <span className="absolute bottom-1 flex gap-0.5" aria-hidden>
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={cn('size-1.5 rounded-full', selected ? 'bg-white' : toneClasses[eventCategories[e.category].tone].dot)}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-surface-container pt-3 text-xs text-on-surface-variant">
        {Object.entries(eventCategories).map(([key, meta]) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', toneClasses[meta.tone].dot)} aria-hidden />
            {meta.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
