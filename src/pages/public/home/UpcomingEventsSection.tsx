import { ArrowRight } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { eventTiming } from '@/utils/calendar'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/IconTile'
import { Reveal } from '@/components/ui/Reveal'
import { EventCard } from '@/components/calendar/EventCard'

/** Próximos eventos do calendário, na página inicial. */
export function UpcomingEventsSection({ events }: { events: CalendarEvent[] }) {
  const next = events.filter((e) => eventTiming(e) !== 'passado').slice(0, 3)
  if (!next.length) return null
  return (
    <section className="bg-surface-container-low py-10 lg:py-24">
      <Container>
        <div className="mb-6 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1 lg:gap-4">
            <Eyebrow tone="coral">Calendário</Eyebrow>
            <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
              Próximos eventos
            </h2>
          </div>
          <Button to="/calendario" variant="soft" className="self-start" iconRight={<ArrowRight className="size-4" />}>
            Ver calendário completo
          </Button>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3">
          {next.map((e, i) => (
            <Reveal as="li" key={e.id} delay={i * 80}>
              <EventCard event={e} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
