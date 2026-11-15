import { schoolService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { experienceFields } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PageHero } from '@/components/layout/PageHero'
import { CtaBanner } from '@/components/school/CtaBanner'
import { PillarCard } from '@/components/school/PillarCard'
import { SegmentCard } from '@/components/school/SegmentCard'

export default function PedagogyPage() {
  useDocumentTitle(
    'Proposta pedagógica',
    'Proposta pedagógica baseada na BNCC: aprender brincando, com escuta, vínculo e parceria com as famílias.',
  )
  const { data } = useAsync(
    () =>
      Promise.all([schoolService.listPillars(), schoolService.listSegments()]).then(([pillars, segments]) => ({
        pillars,
        segments,
      })),
    [],
  )

  return (
    <>
      <PageHero
        eyebrow="Proposta pedagógica"
        tone="aqua"
        title={
          <>
            Aprender brincando, com <span className="brush-underline [--brush:var(--color-aqua-200)]">intenção</span>
          </>
        }
        description="Nossa proposta se apoia na Base Nacional Comum Curricular (BNCC) e em uma visão de criança curiosa, capaz e protagonista do próprio aprendizado."
      />

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.pillars.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PillarCard pillar={p} index={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-container-low/50 py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="BNCC"
            tone="sun"
            title="Os campos de experiência"
            description="A BNCC organiza a Educação Infantil em cinco campos de experiência. Eles orientam nosso planejamento e também a forma como registramos e compartilhamos o desenvolvimento de cada criança com as famílias."
          />
          <ol className="space-y-3">
            {Object.values(experienceFields).map((field, i) => {
              const t = toneClasses[field.tone]
              return (
                <Reveal as="li" key={field.label} delay={i * 60}>
                  <div className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-surface-container-high/80">
                    <span
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl font-display font-semibold',
                        t.bg,
                        t.text,
                      )}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">{field.label}</p>
                      <p className="text-sm text-outline">{field.short}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Segmentos"
            tone="coral"
            title="Como a proposta acontece em cada fase"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {data?.segments.map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <SegmentCard segment={s} index={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-4">
        <Container className="grid gap-10 rounded-[2.5rem] bg-white p-8 ring-1 ring-surface-container-high/80 sm:p-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl">Avaliação e registro</h2>
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-on-surface-variant lg:col-span-2">
            <p>
              Na Educação Infantil, avaliar é observar, registrar e refletir — nunca classificar. Nossas educadoras
              fazem registros diários, fotografias e anotações que dão origem a relatórios semestrais descritivos.
            </p>
            <p>
              As famílias acompanham tudo pela área da família: observações do dia a dia, comunicados e relatórios de
              desenvolvimento organizados pelos campos de experiência.
            </p>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  )
}
