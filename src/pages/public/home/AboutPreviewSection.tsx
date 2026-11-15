import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import classroomImage from '@/assets/images/escola/patio-escola.jpg'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/IconTile'
import { Reveal } from '@/components/ui/Reveal'

export function AboutPreviewSection() {
  return (
    <section id="sobre-escola" className="bg-surface-container-lowest py-10 lg:py-24">
      <Container className="grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-2 lg:order-2 lg:gap-4">
          <Eyebrow>Quem somos</Eyebrow>
          <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
            Ambiente planejado para o brincar com afeto
          </h2>
          <p className="leading-relaxed text-on-surface-variant lg:text-lg">
            A Aquarela do Saber proporciona aprendizado significativo em espaços pensados para o ritmo de cada
            criança. Aqui, o cuidado e a infância caminham lado a lado.
          </p>
          <Link
            to="/sobre"
            className="group mt-2 hidden items-center gap-2 font-semibold text-primary lg:inline-flex"
          >
            Conheça nossa história
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
        <Reveal className="aspect-[4/3] overflow-hidden rounded-3xl bg-surface-container shadow-sm lg:order-1 lg:rounded-[2.5rem]">
          <img
            src={classroomImage}
            alt="Pátio coberto da Aquarela do Saber com o logo da escola na parede"
            loading="lazy"
            className="size-full object-cover object-[center_40%]"
          />
        </Reveal>
      </Container>
    </section>
  )
}
