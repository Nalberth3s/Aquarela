import { Clock, MapPin } from 'lucide-react'
import type { SchoolEvent } from '@/types'
import { parseDate } from '@/utils/format'

const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

export function EventList({ events, detailed }: { events: SchoolEvent[]; detailed?: boolean }) {
  return (
    <ul className="divide-y divide-surface-container-high">
      {events.map((event) => {
        const date = parseDate(event.date)
        return (
          <li key={event.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-surface-container-low py-2">
              <span className="font-display text-xl leading-none font-semibold">{date.getDate()}</span>
              <span className="mt-1 text-[0.7rem] font-bold text-outline uppercase">
                {month.format(date).replace('.', '')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface">{event.title}</p>
              <p className="text-sm text-outline capitalize">{weekday.format(date)}</p>
              {detailed && <p className="mt-1.5 text-on-surface-variant">{event.description}</p>}
              {detailed && (event.time || event.location) && (
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-outline">
                  {event.time && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden /> {event.time}
                    </span>
                  )}
                  {event.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" aria-hidden /> {event.location}
                    </span>
                  )}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
