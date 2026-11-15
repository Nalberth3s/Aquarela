import type { RoutineStep } from '@/types'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RoutineTimeline } from '@/components/school/RoutineTimeline'

export function RoutineSection({ steps }: { steps: RoutineStep[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Rotina"
            tone="sun"
            title="Um dia na Aquarela"
            description="Uma rotina previsível traz segurança. Dentro dela, há espaço para o inesperado, as perguntas e as descobertas."
          />
          <p className="max-w-xs text-sm text-outline lg:text-right">
            Exemplo de rotina do período integral. Horários adaptados para o Berçário.
          </p>
        </div>
        <div className="mt-12">
          <RoutineTimeline steps={steps} />
        </div>
      </Container>
    </section>
  )
}
