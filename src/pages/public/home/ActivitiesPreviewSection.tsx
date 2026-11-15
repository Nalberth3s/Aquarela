import { ArrowRight } from 'lucide-react'
import type { Activity } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ActivityCard } from '@/components/school/ActivityCard'

export function ActivitiesPreviewSection({ activities }: { activities: Activity[] }) {
  return (
    <section className="bg-surface-container-low/50 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Atividades"
            tone="lilac"
            title="Experiências que ampliam o mundo"
            description="Música, arte, natureza, movimento e linguagem se entrelaçam aos projetos de cada turma."
          />
          <Button to="/atividades" variant="secondary" iconRight={<ArrowRight className="size-4" />}>
            Ver todas
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.slice(0, 4).map((activity, i) => (
            <Reveal key={activity.id} delay={i * 80}>
              <ActivityCard activity={activity} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
