import { BookOpenText, Heart, House, type LucideIcon } from 'lucide-react'
import type { Tone } from '@/types'
import { Container } from '@/components/ui/Container'
import { Eyebrow, IconTile } from '@/components/ui/IconTile'
import { Reveal } from '@/components/ui/Reveal'

const highlights: { title: string; text: string; icon: LucideIcon; tone: Tone }[] = [
  {
    title: 'Acolhimento Afetuoso',
    text: 'Olhar individualizado, carinho e respeito ao tempo natural de desenvolvimento da criança.',
    icon: Heart,
    tone: 'aqua',
  },
  {
    title: 'Acompanhamento Próximo',
    text: 'Comunicação diária transparente e relatórios pedagógicos para a família acompanhar tudo.',
    icon: BookOpenText,
    tone: 'sun',
  },
  {
    title: 'Espaço Seguro & Lúdico',
    text: 'Salas amplas, materiais não estruturados, brinquedos de madeira e proteção integral.',
    icon: House,
    tone: 'lilac',
  },
]

export function HighlightsSection() {
  return (
    <section id="diferenciais" className="py-10 lg:py-24">
      <Container>
        <div className="flex flex-col gap-1 lg:items-center lg:text-center">
          <Eyebrow>Diferenciais</Eyebrow>
          <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
            O que torna nossa escola única
          </h2>
        </div>
        <div className="mt-5 grid gap-3 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {highlights.map((h, i) => (
            <Reveal
              key={h.title}
              delay={i * 80}
              className="flex items-start gap-3.5 rounded-2xl bg-surface-container-lowest p-4 shadow-soft lg:flex-col lg:gap-5 lg:rounded-3xl lg:p-8"
            >
              <IconTile icon={h.icon} tone={h.tone} className="lg:size-12" />
              <div>
                <h3 className="text-lg leading-[1.625rem] tracking-normal">{h.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant lg:mt-2 lg:text-base">{h.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
