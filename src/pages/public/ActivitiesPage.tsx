import { useMemo, useState } from 'react'
import { schoolService } from '@/services'
import type { ActivityCategory } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { activityCategoryLabels } from '@/utils/labels'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { Skeleton } from '@/components/ui/States'
import { Tabs, type TabOption } from '@/components/ui/Tabs'
import { PageHero } from '@/components/layout/PageHero'
import { ActivityCard } from '@/components/school/ActivityCard'
import { CtaBanner } from '@/components/school/CtaBanner'

type Filter = ActivityCategory | 'todas'

export default function ActivitiesPage() {
  useDocumentTitle(
    'Atividades',
    'Capoeira, musicalização, ateliê de artes, horta, culinária e inglês lúdico: as atividades da Educação Infantil na Aquarela do Saber.',
  )
  const [filter, setFilter] = useState<Filter>('todas')
  const { data: activities = [], loading } = useAsync(() => schoolService.listActivities(), [])

  const options = useMemo<TabOption<Filter>[]>(
    () => [
      { value: 'todas', label: 'Todas', count: activities.length },
      ...(Object.keys(activityCategoryLabels) as ActivityCategory[]).map((c) => ({
        value: c,
        label: activityCategoryLabels[c],
        count: activities.filter((a) => a.category === c).length,
      })),
    ],
    [activities],
  )

  const visible = filter === 'todas' ? activities : activities.filter((a) => a.category === filter)

  return (
    <>
      <PageHero
        eyebrow="Atividades"
        tone="lilac"
        title="O que acontece por aqui"
        description="Além dos projetos de cada turma, as crianças participam de oficinas e experiências que ampliam seu repertório de linguagens."
      />
      <section className="pb-8">
        <Container>
          <Tabs label="Filtrar atividades por categoria" options={options} value={filter} onChange={setFilter} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)
              : visible.map((a, i) => (
                  <Reveal key={a.id} delay={(i % 3) * 80}>
                    <ActivityCard activity={a} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>
      <CtaBanner />
    </>
  )
}
