import { useMemo, useState } from 'react'
import { CalendarX, X } from 'lucide-react'
import { calendarService } from '@/services'
import type { CalendarEvent, EventCategory } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { capitalizeFirst, eventDays, eventTiming } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { formatDate, parseDate, todayISO } from '@/utils/format'
import { toneClasses } from '@/utils/tones'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState, Skeleton } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHero } from '@/components/layout/PageHero'
import { EventCard } from '@/components/calendar/EventCard'
import { FeaturedEvent } from '@/components/calendar/FeaturedEvent'
import { MonthCalendar } from '@/components/calendar/MonthCalendar'
import { eventCategories } from '@/components/calendar/eventCategories'

type View = 'proximos' | 'realizados' | 'todos'

const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

function groupByMonth(events: CalendarEvent[]) {
  const groups = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const key = capitalizeFirst(monthLabel.format(parseDate(e.date)))
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups.entries()]
}

/** Calendário público de eventos da escola. */
export default function CalendarPage() {
  useDocumentTitle(
    'Calendário de Eventos',
    'Festas, datas comemorativas, passeios e reuniões da Aquarela do Saber. Programe-se com a família.',
  )
  const { data: events = [], loading } = useAsync(() => calendarService.listPublished(), [])
  const now = parseDate(todayISO())
  const [view, setView] = useState<View>('proximos')
  const [category, setCategory] = useState<EventCategory | 'todas'>('todas')
  const [selectedDay, setSelectedDay] = useState<string>()
  const [calMonth, setCalMonth] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const upcoming = events.filter((e) => eventTiming(e) !== 'passado')
  const featured = upcoming.find((e) => e.featured) ?? upcoming[0]

  const visible = useMemo(() => {
    let list = events
    if (selectedDay) return list.filter((e) => eventDays(e).includes(selectedDay))
    if (category !== 'todas') list = list.filter((e) => e.category === category)
    if (view === 'proximos') list = list.filter((e) => eventTiming(e) !== 'passado')
    if (view === 'realizados') list = list.filter((e) => eventTiming(e) === 'passado').reverse()
    return list
  }, [events, selectedDay, category, view])

  return (
    <>
      <PageHero
        eyebrow="Calendário"
        tone="coral"
        title={
          <>
            Nossos <span className="wavy-underline text-primary">eventos</span> do ano
          </>
        }
        description="Festas, datas comemorativas, passeios e reuniões: tudo o que vai acontecer na Aquarela do Saber para você se programar com a família."
      />

      <section className="pb-24">
        <Container className="space-y-12">
          {loading ? (
            <Skeleton className="h-80 rounded-[2rem]" />
          ) : (
            featured && (
              <Reveal>
                <FeaturedEvent event={featured} />
              </Reveal>
            )
          )}

          <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start">
            <aside className="space-y-5 lg:sticky lg:top-28">
              <MonthCalendar
                events={events}
                year={calMonth.year}
                month={calMonth.month}
                onChangeMonth={(year, month) => setCalMonth({ year, month })}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Categorias</p>
                <div className="flex flex-wrap gap-2">
                  {(['todas', ...Object.keys(eventCategories)] as (EventCategory | 'todas')[]).map((key) => {
                    const active = category === key
                    const meta = key === 'todas' ? null : eventCategories[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setCategory(key)
                          setSelectedDay(undefined)
                        }}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-sm font-semibold transition',
                          active
                            ? 'bg-on-surface text-white'
                            : meta
                              ? cn(toneClasses[meta.tone].soft, toneClasses[meta.tone].text)
                              : 'bg-surface-container-lowest text-on-surface-variant shadow-soft',
                        )}
                      >
                        {meta?.label ?? 'Todas'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            <div>
              {selectedDay ? (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-aqua-50 px-4 py-3">
                  <p className="font-semibold text-primary">
                    Eventos em {formatDate(selectedDay, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(undefined)}
                    className="flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    <X className="size-4" aria-hidden /> Limpar
                  </button>
                </div>
              ) : (
                <Tabs
                  className="mb-6"
                  label="Período"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'proximos', label: 'Próximos', count: upcoming.length },
                    { value: 'realizados', label: 'Já aconteceram', count: events.length - upcoming.length },
                    { value: 'todos', label: 'Ano todo', count: events.length },
                  ]}
                />
              )}

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-36 rounded-3xl" />
                  ))}
                </div>
              ) : visible.length ? (
                <div className="space-y-8">
                  {groupByMonth(visible).map(([month, items]) => (
                    <section key={month}>
                      <h2 className="mb-3 text-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                        {month}
                      </h2>
                      <ul className="space-y-3">
                        {items.map((e) => (
                          <Reveal as="li" key={e.id}>
                            <EventCard event={e} />
                          </Reveal>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarX className="size-5" />}
                  title="Nenhum evento por aqui"
                  description="Troque a categoria ou o período para ver outros eventos."
                />
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
