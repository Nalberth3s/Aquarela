import { useParams } from 'react-router-dom'
import { CalendarDays, CalendarPlus, ChevronLeft, Clock, ListChecks, MapPin, Share2, Timer, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calendarService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { countdownLabel, eventTiming, formatEventDate, googleCalendarLink } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { EventCover } from '@/components/calendar/EventCover'
import { eventCategories } from '@/components/calendar/eventCategories'

export default function EventDetailPage() {
  const { id = '' } = useParams()
  const info = useSchoolInfo()
  const { data: event, loading, error, reload } = useAsync(() => calendarService.getPublished(id), [id])
  useDocumentTitle(event?.title ?? 'Evento', event?.summary)

  return (
    <section className="pt-6 pb-24 lg:pt-10">
      <Container className="max-w-4xl">
        <Link
          to="/calendario"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <ChevronLeft className="size-4" aria-hidden /> Calendário de eventos
        </Link>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !event ? (
          <Skeleton className="h-[32rem] rounded-[2rem]" />
        ) : (
          (() => {
            const meta = eventCategories[event.category]
            const t = toneClasses[meta.tone]
            const location = `${info.address}, ${info.neighborhood}, ${info.city} - ${info.state}`
            const shareText = `${event.title} — ${formatEventDate(event)}${event.time ? `, ${event.time}` : ''} na Aquarela do Saber. ${window.location.href}`
            const past = eventTiming(event) === 'passado'
            return (
              <article className="animate-fade-in overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-lift">
                <EventCover event={event} className="aspect-[16/8] w-full" iconSize="size-20" />
                <div className="p-6 sm:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', t.bg, t.text)}>{meta.label}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-sage-600">
                      <Timer className="size-4" aria-hidden /> {countdownLabel(event)}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{event.title}</h1>
                  <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">{event.summary}</p>

                  <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="flex gap-3 rounded-2xl bg-surface-container-low p-4">
                      <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden />
                      <div>
                        <dt className="text-xs text-on-surface-variant">Data</dt>
                        <dd className="font-semibold">{formatEventDate(event, true)}</dd>
                      </div>
                    </div>
                    {event.time && (
                      <div className="flex gap-3 rounded-2xl bg-surface-container-low p-4">
                        <Clock className="size-5 shrink-0 text-primary" aria-hidden />
                        <div>
                          <dt className="text-xs text-on-surface-variant">Horário</dt>
                          <dd className="font-semibold">{event.time}</dd>
                        </div>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex gap-3 rounded-2xl bg-surface-container-low p-4">
                        <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
                        <div>
                          <dt className="text-xs text-on-surface-variant">Local</dt>
                          <dd className="font-semibold">{event.location}</dd>
                        </div>
                      </div>
                    )}
                    {event.audience && (
                      <div className="flex gap-3 rounded-2xl bg-surface-container-low p-4">
                        <UsersRound className="size-5 shrink-0 text-primary" aria-hidden />
                        <div>
                          <dt className="text-xs text-on-surface-variant">Para quem</dt>
                          <dd className="font-semibold">{event.audience}</dd>
                        </div>
                      </div>
                    )}
                  </dl>

                  <div className="mt-8 space-y-4 text-lg leading-relaxed whitespace-pre-line text-on-surface">
                    {event.description}
                  </div>

                  {event.whatToBring.length > 0 && (
                    <div className={cn('mt-8 rounded-3xl p-5', t.soft)}>
                      <h2 className={cn('flex items-center gap-2 text-lg', t.text)}>
                        <ListChecks className="size-5" aria-hidden /> O que levar
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {event.whatToBring.map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <span className={cn('mt-2 size-2 shrink-0 rounded-full', t.dot)} aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {!past && (
                      <Button
                        href={googleCalendarLink(event, location)}
                        external
                        icon={<CalendarPlus className="size-4" />}
                      >
                        Adicionar à minha agenda
                      </Button>
                    )}
                    <Button
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      external
                      variant="secondary"
                      icon={<Share2 className="size-4" />}
                    >
                      Compartilhar no WhatsApp
                    </Button>
                    <Button
                      href={whatsappLink(info.whatsappNumber, `Olá! Tenho uma dúvida sobre o evento "${event.title}".`)}
                      external
                      variant="ghost"
                    >
                      Dúvidas? Fale com a escola
                    </Button>
                  </div>
                </div>
              </article>
            )
          })()
        )}
      </Container>
    </section>
  )
}
