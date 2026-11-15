import { ArrowRight, CalendarDays, Clock, MapPin, Timer } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { countdownLabel, formatEventDate } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Button } from '@/components/ui/Button'
import { EventCover } from './EventCover'
import { eventCategories } from './eventCategories'

/** Destaque do próximo grande evento. */
export function FeaturedEvent({ event }: { event: CalendarEvent }) {
  const meta = eventCategories[event.category]
  const t = toneClasses[meta.tone]
  return (
    <article className="grid overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-lift lg:grid-cols-[1.1fr_1fr]">
      <EventCover event={event} className="aspect-[16/10] w-full lg:aspect-auto lg:h-full" iconSize="size-16" />
      <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Próximo destaque</span>
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', t.bg, t.text)}>{meta.label}</span>
        </div>
        <h2 className="text-3xl leading-tight lg:text-4xl">{event.title}</h2>
        <p className="text-lg leading-relaxed text-on-surface-variant">{event.summary}</p>
        <ul className="space-y-2 text-sm text-on-surface-variant">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            {formatEventDate(event, true)}
          </li>
          {event.time && (
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-primary" aria-hidden />
              {event.time}
            </li>
          )}
          {event.location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden />
              {event.location}
            </li>
          )}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
          <Button to={`/calendario/${event.id}`} iconRight={<ArrowRight className="size-4" />}>
            Ver detalhes
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sage-600">
            <Timer className="size-4" aria-hidden />
            {countdownLabel(event)}
          </span>
        </div>
      </div>
    </article>
  )
}
