import { Baby, CalendarDays } from 'lucide-react'
import heroImage from '@/assets/images/escola/primeiro-dia-de-aula.jpg'
import type { SchoolInfo } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export function HeroSection({ info }: { info: SchoolInfo }) {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 lg:pt-14 lg:pb-24">
      <Container className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex animate-fade-up flex-col gap-4 lg:gap-6">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary-fixed/35 px-3 py-1 text-xs font-medium text-primary">
            <span className="size-2 rounded-full bg-primary" aria-hidden />
            {info.city} - {info.state} • Educação Infantil
          </span>
          <h1 className="text-[1.875rem] leading-[2.375rem] tracking-[-0.015em] sm:text-5xl sm:leading-tight lg:text-[3.5rem] lg:leading-[4rem] lg:font-bold lg:tracking-[-0.03em]">
            Um lugar para aprender, descobrir e <span className="wavy-underline text-primary">crescer</span>.
          </h1>
          <p className="max-w-xl leading-relaxed text-on-surface-variant lg:text-lg lg:leading-[1.875rem]">
            Na Aquarela do Saber, cada criança é acolhida com amorosidade, respeito e intencionalidade pedagógica em
            cada fase de suas descobertas.
          </p>
          <div className="hidden gap-3 lg:flex">
            <Button to="/matriculas" size="lg" icon={<CalendarDays className="size-5" />}>
              Agendar uma visita acolhedora
            </Button>
            <Button to="/proposta-pedagogica" size="lg" variant="secondary">
              Conheça a proposta
            </Button>
          </div>
        </div>

        <div className="relative w-full animate-fade-in lg:max-w-[460px] lg:justify-self-end">
          <WatercolorBlob
            tone="aqua"
            variant={0}
            intensity={0.8}
            className="absolute -top-16 -right-16 hidden w-2/3 lg:block"
          />
          <WatercolorBlob
            tone="lilac"
            variant={2}
            intensity={0.7}
            className="absolute -bottom-14 -left-14 hidden w-1/2 lg:block"
          />
          <div className="relative aspect-square max-h-[340px] w-full overflow-hidden rounded-3xl bg-surface-container-low shadow-[0_12px_32px_rgb(59_130_166/0.12)] sm:max-h-[440px] lg:max-h-none lg:rounded-[2.5rem]">
            <img
              src={heroImage}
              alt="Criança sorrindo com a moldura do 1º dia de aula na Aquarela do Saber"
              className="size-full object-cover object-[center_30%]"
              fetchPriority="high"
            />
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md lg:bottom-5 lg:left-5">
              <Baby className="size-4 text-primary" aria-hidden />
              Berçário, Maternal e Jardim
            </span>
          </div>
        </div>

        <Button to="/matriculas" size="lg" className="w-full lg:hidden" icon={<CalendarDays className="size-5" />}>
          Agendar uma visita acolhedora
        </Button>
      </Container>
    </section>
  )
}
