import type { ReactNode } from 'react'
import type { Tone } from '@/types'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

/** Cabeçalho das páginas internas do site institucional. */
export function PageHero({
  eyebrow,
  title,
  description,
  tone = 'aqua',
  children,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  tone?: Tone
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-20">
      <WatercolorBlob
        tone={tone}
        variant={0}
        intensity={0.6}
        className="absolute -top-24 -right-32 w-[26rem] animate-fade-in sm:w-[34rem]"
      />
      <WatercolorBlob tone="sun" variant={2} intensity={0.35} className="absolute top-40 -right-10 hidden w-40 md:block" />
      <Container className="relative animate-fade-up">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} tone={tone} />
        {children}
      </Container>
    </section>
  )
}
