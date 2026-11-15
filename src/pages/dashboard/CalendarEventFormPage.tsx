import { useNavigate, useParams } from 'react-router-dom'
import { calendarService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EventForm } from '@/components/calendar/EventForm'

/** /area/calendario/novo e /area/calendario/:id */
export default function CalendarEventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  useDocumentTitle(isNew ? 'Novo evento' : 'Editar evento')
  const { data, loading, error, reload } = useAsync(
    () => (id ? calendarService.getById(id) : Promise.resolve(undefined)),
    [id],
  )

  return (
    <>
      <PageHeader
        backTo="/area/calendario"
        backLabel="Calendário da escola"
        title={isNew ? 'Novo evento' : 'Editar evento'}
        description="Preencha as informações. A prévia ao lado mostra como o evento aparece no site."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-[40rem] rounded-[2rem]" />
      ) : (
        <EventForm key={id ?? 'novo'} initial={data} onSaved={() => navigate('/area/calendario')} />
      )}
    </>
  )
}
