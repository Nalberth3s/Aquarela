import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/IconTile'
import { VisitWhatsAppForm } from '@/components/school/VisitWhatsAppForm'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export function VisitSection() {
  return (
    <section id="visita" className="py-10 lg:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgb(59_130_166/0.08)] lg:grid lg:grid-cols-2 lg:gap-16 lg:rounded-[2.5rem] lg:p-14">
          <WatercolorBlob tone="aqua" variant={1} intensity={0.5} className="absolute -top-24 -left-24 hidden w-96 lg:block" />
          <div className="relative mb-4 flex flex-col gap-1 lg:mb-0 lg:gap-4">
            <Eyebrow>Vagas & Matrículas</Eyebrow>
            <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
              Agende sua visita à escola
            </h2>
            <p className="text-sm text-on-surface-variant lg:text-lg lg:leading-relaxed">
              Preencha os campos abaixo e entraremos em contato diretamente pelo WhatsApp.
            </p>
            <Link
              to="/matriculas"
              className="group mt-2 hidden items-center gap-2 font-semibold text-primary lg:inline-flex"
            >
              Prefere a pré-matrícula completa?
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <div className="relative">
            <VisitWhatsAppForm />
          </div>
        </div>
      </Container>
    </section>
  )
}
