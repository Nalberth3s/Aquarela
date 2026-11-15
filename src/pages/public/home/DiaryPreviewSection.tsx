import { ArrowRight } from 'lucide-react'
import studentPhoto from '@/assets/images/crianca-pintando.jpg'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/IconTile'
import { Reveal } from '@/components/ui/Reveal'

const indicators = [
  { label: 'Refeições', value: 'Excelente' },
  { label: 'Soneca', value: 'Tranquila' },
  { label: 'Social', value: 'Ativa' },
]

/** Demonstração do Diário de Bordo digital para as famílias. */
export function DiaryPreviewSection() {
  return (
    <section id="diario" className="bg-surface-container-low py-10 lg:py-24">
      <Container className="grid items-center gap-5 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-1 lg:gap-4">
          <Eyebrow tone="lilac">Diário de Bordo Digital</Eyebrow>
          <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
            Transparência na rotina do seu filho
          </h2>
          <p className="hidden text-lg leading-relaxed text-on-surface-variant lg:block">
            Todos os dias a professora registra participação, alimentação, descanso, fotos e um recado carinhoso sobre
            o dia. A família acompanha tudo pelo celular.
          </p>
          <span className="mt-2 hidden lg:block">
            <Button to="/entrar" variant="soft" iconRight={<ArrowRight className="size-4" />}>
              Acessar a Área da Família
            </Button>
          </span>
        </div>

        <Reveal className="flex flex-col gap-3.5 rounded-3xl bg-surface-container-lowest p-5 shadow-[0_8px_24px_rgb(59_130_166/0.08)] lg:p-7">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div className="flex items-center gap-3">
              <img src={studentPhoto} alt="" className="size-11 rounded-full bg-primary-fixed object-cover" />
              <div>
                <p className="text-lg font-semibold">Maria Eduarda</p>
                <p className="text-xs font-medium text-on-surface-variant">Turma Maternal II</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary">Hoje</span>
          </div>
          <blockquote className="rounded-2xl bg-surface-container-low p-3.5 text-sm leading-relaxed italic">
            “Maria participou com muita alegria da oficina de aquarela. Reconheceu novas cores primárias e interagiu
            carinhosamente com os colegas.”
          </blockquote>
          <dl className="flex items-center justify-between px-1 text-xs font-semibold text-on-surface-variant">
            {indicators.map((i) => (
              <div key={i.label} className="flex gap-1">
                <dt>{i.label}:</dt>
                <dd className="text-primary">{i.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}
