import capoeiraRoda from '@/assets/images/escola/capoeira-roda.jpg'
import capoeiraEstrela from '@/assets/images/escola/capoeira-estrela.jpg'
import patioEscola from '@/assets/images/escola/patio-escola.jpg'
import sopaMenina from '@/assets/images/escola/sopa-menina.jpg'
import sopaTurma from '@/assets/images/escola/sopa-turma.jpg'
import { schoolService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SkeletonList } from '@/components/ui/States'
import { PageHero } from '@/components/layout/PageHero'
import { CtaBanner } from '@/components/school/CtaBanner'
import { PhotoFrame } from '@/components/school/PhotoFrame'
import { StructureCard } from '@/components/school/StructureCard'

export default function StructurePage() {
  useDocumentTitle(
    'Estrutura',
    'Salas amplas, pátio coberto, espaço do berçário, horta e cozinha própria: conheça a estrutura da Aquarela do Saber.',
  )
  const { data: spaces, loading } = useAsync(() => schoolService.listStructure(), [])

  return (
    <>
      <PageHero
        eyebrow="Estrutura"
        tone="sage"
        title="Ambientes que convidam a explorar"
        description="Cada espaço da escola foi pensado para que as crianças se movimentem com liberdade e segurança, sempre acompanhadas de perto."
      />

      <section className="pb-16">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
            <PhotoFrame
              src={patioEscola}
              alt="Pátio coberto da escola com o logo da Aquarela do Saber"
              className="col-span-2 row-span-2 aspect-square size-full md:aspect-auto"
            />
            <PhotoFrame src={capoeiraRoda} alt="Roda de capoeira no pátio" className="aspect-square size-full" />
            <PhotoFrame src={sopaTurma} alt="Espaço do berçário preparado para atividade sensorial" className="aspect-square size-full" />
            <PhotoFrame src={capoeiraEstrela} alt="Circuito com cones no pátio" className="aspect-square size-full" />
            <PhotoFrame src={sopaMenina} alt="Bebê explorando legumes no berçário" className="aspect-square size-full" />
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {spaces?.map((space, i) => (
                <Reveal key={space.id} delay={(i % 3) * 80}>
                  <StructureCard space={space} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CtaBanner title="Nada substitui uma visita" />
    </>
  )
}
