import type { Segment } from '@/types'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SegmentCard } from '@/components/school/SegmentCard'

export function SegmentsSection({ segments }: { segments: Segment[] }) {
  return (
    <section className="bg-surface-container-low/50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Segmentos"
          tone="aqua"
          title="Cada fase com o cuidado que ela pede"
          description="Da chegada dos bebês à transição para o Ensino Fundamental, organizamos tempos, espaços e experiências de acordo com cada momento do desenvolvimento."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {segments.map((segment, i) => (
            <Reveal key={segment.id} delay={i * 100}>
              <SegmentCard segment={segment} index={i} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
