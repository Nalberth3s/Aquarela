import { useState } from 'react'
import { schoolService } from '@/services'
import type { MediaKind } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHero } from '@/components/layout/PageHero'
import { MediaGallery } from '@/components/school/MediaGallery'
import { VisitSection } from './home/VisitSection'

type Filter = MediaKind | 'todos'

export default function GalleryPage() {
  useDocumentTitle('Galeria', 'Fotos e vídeos do dia a dia das crianças na Aquarela do Saber: capoeira, berçário, projetos e muito afeto.')
  const [filter, setFilter] = useState<Filter>('todos')
  const { data: media = [], loading } = useAsync(() => schoolService.listMedia(), [])
  const visible = filter === 'todos' ? media : media.filter((m) => m.kind === filter)

  return (
    <>
      <PageHero
        eyebrow="Galeria"
        tone="coral"
        title="Momentos da Aquarela"
        description="Fotos e vídeos do nosso cotidiano: brincadeiras, descobertas, projetos e muito afeto."
      />
      <section className="pb-8">
        <Container>
          <Tabs
            className="mb-8"
            label="Filtrar galeria"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todos', label: 'Tudo', count: media.length },
              { value: 'video', label: 'Vídeos', count: media.filter((m) => m.kind === 'video').length },
              { value: 'foto', label: 'Fotos', count: media.filter((m) => m.kind === 'foto').length },
            ]}
          />
          {loading ? (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
              ))}
            </div>
          ) : (
            <MediaGallery key={filter} items={visible} />
          )}
        </Container>
      </section>
      <VisitSection />
    </>
  )
}
