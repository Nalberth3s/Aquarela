import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarHeart, CalendarPlus, ExternalLink, Pencil, Star, Trash } from 'lucide-react'
import { calendarService, getErrorMessage } from '@/services'
import type { CalendarEvent } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { eventTiming, formatEventDate } from '@/utils/calendar'
import { cn } from '@/utils/cn'
import { parseDate } from '@/utils/format'
import { toneClasses } from '@/utils/tones'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EventCover } from '@/components/calendar/EventCover'
import { eventCategories } from '@/components/calendar/eventCategories'

type Filter = 'proximos' | 'realizados' | 'rascunhos' | 'todos'

const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

/** Gestão do calendário público (coordenação). */
export default function CalendarAdminPage() {
  useDocumentTitle('Calendário da escola')
  const { showToast } = useToast()
  const [filter, setFilter] = useState<Filter>('proximos')
  const [toDelete, setToDelete] = useState<CalendarEvent | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { data: events = [], loading, error, reload, setData } = useAsync(() => calendarService.listAll(), [])

  const counts = {
    proximos: events.filter((e) => e.published && eventTiming(e) !== 'passado').length,
    realizados: events.filter((e) => e.published && eventTiming(e) === 'passado').length,
    rascunhos: events.filter((e) => !e.published).length,
    todos: events.length,
  }
  const visible = events.filter((e) =>
    filter === 'proximos'
      ? e.published && eventTiming(e) !== 'passado'
      : filter === 'realizados'
        ? e.published && eventTiming(e) === 'passado'
        : filter === 'rascunhos'
          ? !e.published
          : true,
  )

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await calendarService.remove(toDelete.id)
      setData(events.filter((e) => e.id !== toDelete.id))
      showToast('Evento excluído.', 'success')
      setToDelete(null)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Calendário da escola"
        description="Eventos que aparecem no site para todas as famílias e visitantes."
        actions={
          <>
            <Button to="/calendario" variant="secondary" icon={<ExternalLink className="size-4" />}>
              Ver no site
            </Button>
            <Button to="/area/calendario/novo" icon={<CalendarPlus className="size-4" />}>
              Novo evento
            </Button>
          </>
        }
      />
      <Tabs
        className="mb-6"
        label="Filtrar eventos"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'proximos', label: 'Próximos', count: counts.proximos },
          { value: 'realizados', label: 'Realizados', count: counts.realizados },
          { value: 'rascunhos', label: 'Rascunhos', count: counts.rascunhos },
          { value: 'todos', label: 'Todos', count: counts.todos },
        ]}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={5} />
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-3">
          {visible.map((e) => {
            const meta = eventCategories[e.category]
            const start = parseDate(e.date)
            return (
              <li key={e.id} className="flex items-center gap-4 rounded-3xl bg-surface-container-lowest p-3 shadow-soft sm:p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20">
                  <EventCover event={e} className="size-full" iconSize="size-5" />
                </div>
                <div className="w-12 shrink-0 text-center">
                  <p className="text-2xl leading-none font-bold">{start.getDate()}</p>
                  <p className="text-xs font-bold text-on-surface-variant uppercase">
                    {monthShort.format(start).replace('.', '')}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{e.title}</p>
                    {e.featured && <Star className="size-4 fill-sun-400 text-sun-400" aria-label="Destaque" />}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    <span className={cn('mr-2 font-semibold', toneClasses[meta.tone].text)}>{meta.label}</span>
                    <span>{formatEventDate(e)}</span>
                    {e.time && ` · ${e.time}`}
                  </p>
                  {!e.published && (
                    <span className="mt-1 inline-block rounded-full bg-sun-50 px-2 py-0.5 text-xs font-semibold text-sun-600">
                      Rascunho — não aparece no site
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {e.published && (
                    <Link
                      to={`/calendario/${e.id}`}
                      className="hidden size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low sm:flex"
                      aria-label={`Ver "${e.title}" no site`}
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  )}
                  <Link
                    to={`/area/calendario/${e.id}`}
                    className="flex size-10 items-center justify-center rounded-full text-primary hover:bg-aqua-50"
                    aria-label={`Editar "${e.title}"`}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(e)}
                    className="flex size-10 items-center justify-center rounded-full text-coral-600 hover:bg-coral-50"
                    aria-label={`Excluir "${e.title}"`}
                  >
                    <Trash className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<CalendarHeart className="size-5" />}
          title="Nenhum evento nesta lista"
          action={
            <Button to="/area/calendario/novo" size="sm">
              Criar evento
            </Button>
          }
        />
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir evento?"
        subtitle={toDelete?.title}
        icon={<Trash className="size-5" />}
      >
        <p className="text-on-surface-variant">
          O evento sai do calendário do site. Se quiser apenas escondê-lo por enquanto, edite e desligue “Publicar no
          site”.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={confirmDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  )
}
