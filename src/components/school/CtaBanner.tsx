import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { WatercolorBlob } from './WatercolorBlob'

export function CtaBanner({
  title = 'Venha conhecer a Aquarela de perto',
  description = 'Agende uma visita, conheça nossos espaços e converse com a coordenação pedagógica. Será um prazer receber a sua família.',
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-aqua-900 px-7 py-14 text-white sm:px-14 sm:py-16">
          <WatercolorBlob tone="aqua" variant={0} intensity={0.35} className="absolute -top-24 -right-20 w-96" />
          <WatercolorBlob tone="coral" variant={2} intensity={0.3} className="absolute -bottom-32 left-1/3 w-80" />
          <WatercolorBlob tone="sun" variant={1} intensity={0.3} className="absolute -bottom-10 -left-16 w-52" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl leading-tight text-white text-balance sm:text-4xl">{title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                to="/matriculas"
                size="lg"
                variant="inverse"
                iconRight={<ArrowRight className="size-4" />}
              >
                Agendar visita
              </Button>
              <Button
                to="/contato"
                size="lg"
                variant="inverseGhost"
                icon={<MessageCircle className="size-4" />}
              >
                Falar com a escola
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
