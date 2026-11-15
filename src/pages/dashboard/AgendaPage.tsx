import { communicationService } from '@/services'
import type { SchoolEvent } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { parseDate } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { ErrorState, SkeletonList } from '@/components/ui/States'
import { EventList } from '@/components/dashboard/EventList'
import { PageHeader } from '@/components/dashboard/PageHeader'

const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

function groupByMonth(events: SchoolEvent[]) {
  const groups = new Map<string, SchoolEvent[]>()
  for (const e of events) {
    const key = monthLabel.format(parseDate(e.date))
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups.entries()]
}

export default function AgendaPage() {
  useDocumentTitle('Agenda')
  const { data: events, loading, error, reload } = useAsync(() => communicationService.listEvents(), [])

  return (
    <>
      <PageHeader title="Agenda" description="Eventos, reuniões e datas importantes." />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !events ? (
        <SkeletonList rows={4} />
      ) : (
        <div className="grid animate-fade-in gap-6">
          {groupByMonth(events).map(([month, items]) => (
            <Card key={month}>
              <h2 className="mb-5 text-xl capitalize">{month}</h2>
              <EventList events={items} detailed />
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
