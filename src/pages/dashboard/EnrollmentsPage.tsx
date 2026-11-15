import { useState } from 'react'
import { CalendarCheck, ClipboardList, Mail, Phone } from 'lucide-react'
import { enrollmentService, getErrorMessage } from '@/services'
import type { EnrollmentRequest, EnrollmentStatus } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatAge, formatDateTime } from '@/utils/format'
import { enrollmentStatusLabels, shiftLabels } from '@/utils/labels'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs, type TabOption } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/dashboard/PageHeader'

type Filter = EnrollmentStatus | 'todos'

function EnrollmentRow({
  request,
  onStatusChange,
}: {
  request: EnrollmentRequest
  onStatusChange: (status: EnrollmentStatus) => void
}) {
  const status = enrollmentStatusLabels[request.status]
  return (
    <li className="rounded-3xl bg-white p-5 ring-1 ring-surface-container-high/80 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-on-surface">{request.childName}</p>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-outline">
            {formatAge(request.childBirthDate)} · {request.suggestedSegment} · {shiftLabels[request.preferredShift]}
            {request.wantsVisit && (
              <span className="ml-2 inline-flex items-center gap-1 text-lilac-600">
                <CalendarCheck className="size-3.5" aria-hidden /> quer visitar
              </span>
            )}
          </p>
          <p className="mt-3 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{request.guardianName}</span>
            <span className="mx-2 text-surface-container-high">|</span>
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3.5" aria-hidden /> {request.phone}
            </span>
            <span className="mx-2 text-surface-container-high">|</span>
            <span className="inline-flex items-center gap-1 break-all">
              <Mail className="size-3.5" aria-hidden /> {request.email}
            </span>
          </p>
          {request.message && <p className="mt-3 rounded-2xl bg-surface-container-low/70 p-3 text-sm text-on-surface-variant">“{request.message}”</p>}
        </div>
        <div className="flex shrink-0 flex-row items-center gap-3 md:flex-col md:items-end">
          <select
            aria-label={`Situação do pedido de ${request.childName}`}
            value={request.status}
            onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus)}
            className="h-10 rounded-full border border-surface-container-high bg-white px-4 text-sm font-semibold text-on-surface-variant outline-none focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100"
          >
            {Object.entries(enrollmentStatusLabels).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-outline">{formatDateTime(request.createdAt)}</p>
        </div>
      </div>
    </li>
  )
}

export default function EnrollmentsPage() {
  useDocumentTitle('Matrículas')
  const [filter, setFilter] = useState<Filter>('todos')
  const [actionError, setActionError] = useState<string | null>(null)
  const { data: requests, loading, error, reload, setData } = useAsync(() => enrollmentService.list(), [])

  const all = requests ?? []
  const options: TabOption<Filter>[] = [
    { value: 'todos', label: 'Todos', count: all.length },
    ...(Object.keys(enrollmentStatusLabels) as EnrollmentStatus[]).map((s) => ({
      value: s,
      label: enrollmentStatusLabels[s].label,
      count: all.filter((r) => r.status === s).length,
    })),
  ]
  const visible = filter === 'todos' ? all : all.filter((r) => r.status === filter)

  async function changeStatus(id: string, status: EnrollmentStatus) {
    setActionError(null)
    const previous = all
    setData(all.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await enrollmentService.updateStatus(id, status)
    } catch (err) {
      setData(previous)
      setActionError(getErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Matrículas"
        description="Pedidos de interesse enviados pelo site. Novos envios do formulário aparecem aqui."
      />
      <Tabs className="mb-6" label="Filtrar por situação" options={options} value={filter} onChange={setFilter} />
      {actionError && (
        <p className="mb-4 rounded-2xl bg-coral-50 p-3 text-sm text-coral-800" role="alert">
          {actionError}
        </p>
      )}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !requests ? (
        <SkeletonList rows={4} />
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-3">
          {visible.map((r) => (
            <EnrollmentRow key={r.id} request={r} onStatusChange={(s) => changeStatus(r.id, s)} />
          ))}
        </ul>
      ) : (
        <EmptyState icon={<ClipboardList className="size-5" />} title="Nenhum pedido nesta situação" />
      )}
    </>
  )
}
