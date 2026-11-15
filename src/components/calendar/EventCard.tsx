import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { countdownLabel, eventTiming, formatEventDate } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { parseDate } from '@/utils/format'
import { toneClasses } from '@/utils/tones'
import { EventCover } from './EventCover'
import { eventCategories } from './eventCategories'

const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

/** Card de evento na lista do calendário público. */
export function EventCard({ event }: { event: CalendarEvent }) {
  const meta = eventCategories[event.category]
  const t = toneClasses[meta.tone]
  const start = parseDate(event.date)
  const past = eventTiming(event) === 'passado'

  return (
    <Link
      to={`/calendario/${event.id}`}
      className={cn(
        'group flex overflow-hidden rounded-3xl bg-surface-container-lowest shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift',
        past && 'opacity-70 hover:opacity-100',
      )}
    >
      <div className="relative w-28 shrink-0 sm:w-40">
        <EventCover event={event} className="absolute inset-0 size-full" iconSize="size-7" />
        <span className="absolute top-3 left-3 flex flex-col items-center rounded-2xl bg-white/95 px-2.5 py-1.5 shadow-soft">
          <span className="text-xl leading-none font-bold">{start.getDate()}</span>
          <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase">
            {monthShort.format(start).replace('.', '')}
          </span>
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', t.bg, t.text)}>{meta.label}</span>
          <span
            className={cn(
              'text-xs font-semibold',
              past ? 'text-outline' : eventTiming(event) === 'futuro' ? 'text-primary' : 'text-sage-600',
            )}
          >
            {countdownLabel(event)}
          </span>
        </div>
        <h3 className="mt-2 text-lg leading-snug group-hover:text-primary">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{event.summary}</p>
        <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs text-on-surface-variant">
          <span>{formatEventDate(event)}</span>
          {event.time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {event.time}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden /> {event.location}
            </span>
          )}
        </p>
      </div>
    </Link>
  )
}
