import enrollmentFlyer from '@/assets/images/escola/matriculas-abertas.jpg'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import type { Tone } from '@/types'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/layout/PageHero'
import { EnrollmentForm } from '@/components/school/EnrollmentForm'

const steps: { title: string; text: string; tone: Tone }[] = [
  { title: 'Envie seu interesse', text: 'Preencha o formulário com alguns dados sobre sua família.', tone: 'aqua' },
  { title: 'Visite a escola', text: 'Agendamos uma visita para você conhecer os espaços e a equipe.', tone: 'sun' },
  { title: 'Conversa pedagógica', text: 'Apresentamos a proposta e tiramos todas as dúvidas.', tone: 'coral' },
  { title: 'Matrícula e adaptação', text: 'Organizamos juntos uma adaptação tranquila e gradual.', tone: 'sage' },
]

export default function EnrollmentPage() {
  useDocumentTitle(
    'Matrículas',
    'Matrículas abertas para Berçário, Maternal e Jardim, em período parcial ou integral. Agende uma visita à Aquarela do Saber.',
  )
  return (
    <>
      <PageHero
        eyebrow="Matrículas abertas"
        tone="coral"
        title="Vamos nos conhecer?"
        description="Conte um pouco sobre sua família e agende uma visita. Nossa secretaria retorna em até 1 dia útil."
      />
      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <aside>
            <img
              src={enrollmentFlyer}
              alt="Matrículas abertas: período parcial e integral, Berçário e Educação Infantil — Centro Educacional Aquarela do Saber"
              className="mb-10 w-full max-w-xs rounded-3xl shadow-lift"
            />
            <h2 className="font-sans text-xs font-bold tracking-[0.16em] text-outline uppercase">Como funciona</h2>
            <ol className="mt-6 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full font-display font-semibold',
                      toneClasses[s.tone].bg,
                      toneClasses[s.tone].text,
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface">{s.title}</p>
                    <p className="mt-1 leading-relaxed text-on-surface-variant">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
          <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-soft sm:p-10 lg:self-start">
            <EnrollmentForm />
          </div>
        </Container>
      </section>
    </>
  )
}
