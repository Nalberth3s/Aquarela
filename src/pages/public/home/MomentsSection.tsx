import { ArrowRight } from 'lucide-react'
import type { SchoolMedia } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/IconTile'
import { MediaGallery } from '@/components/school/MediaGallery'

/** Fotos e vídeos reais do dia a dia da escola. */
export function MomentsSection({ media }: { media: SchoolMedia[] }) {
  const featured = media.filter((m) => m.featured)
  return (
    <section id="momentos" className="py-10 lg:py-24">
      <Container>
        <div className="mb-6 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-1 lg:gap-4">
            <Eyebrow tone="coral">Nosso dia a dia</Eyebrow>
            <h2 className="text-[1.75rem] leading-9 tracking-[-0.01em] lg:text-[2.5rem] lg:leading-[3rem]">
              A Aquarela em movimento
            </h2>
            <p className="leading-relaxed text-on-surface-variant lg:text-lg">
              Capoeira no pátio, descobertas no berçário, primeiro dia de aula: um pouco do que vivemos por aqui.
            </p>
          </div>
          <Button to="/galeria" variant="soft" className="self-start" iconRight={<ArrowRight className="size-4" />}>
            Ver galeria completa
          </Button>
        </div>
        <MediaGallery items={featured} />
      </Container>
    </section>
  )
}
