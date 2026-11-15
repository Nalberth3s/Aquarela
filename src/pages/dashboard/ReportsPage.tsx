import { useState } from 'react'
import { FilePlus2, FileText } from 'lucide-react'
import { reportService, studentService } from '@/services'
import type { ReportStatus } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ReportCard } from '@/components/reports/ReportCard'

type Filter = ReportStatus | 'todos'

async function loadReports() {
  const [reports, students] = await Promise.all([reportService.list(), studentService.list()])
  return { reports, names: Object.fromEntries(students.map((s) => [s.id, s.name])) }
}

export default function ReportsPage() {
  useDocumentTitle('Relatórios')
  const user = useCurrentUser()
  const [filter, setFilter] = useState<Filter>('todos')
  const { data, loading, error, reload } = useAsync(loadReports, [])

  const reports = data?.reports ?? []
  const visible = filter === 'todos' ? reports : reports.filter((r) => r.status === filter)
  const canSeeDrafts = user.role !== 'guardian'

  return (
    <>
      <PageHeader
        title="Relatórios de desenvolvimento"
        description="Relatórios descritivos organizados pelos campos de experiência da BNCC."
        actions={
          canSeeDrafts && (
            <Button to="/area/relatorios/novo" icon={<FilePlus2 className="size-4" />}>
              Novo relatório
            </Button>
          )
        }
      />
      {canSeeDrafts && (
        <Tabs
          className="mb-6"
          label="Filtrar relatórios"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos', count: reports.length },
            { value: 'publicado', label: 'Publicados', count: reports.filter((r) => r.status === 'publicado').length },
            { value: 'rascunho', label: 'Rascunhos', count: reports.filter((r) => r.status === 'rascunho').length },
          ]}
        />
      )}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonList rows={4} />
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-3">
          {visible.map((r) => (
            <li key={r.id}>
              <ReportCard report={r} studentName={data.names[r.studentId]} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="Nenhum relatório por aqui"
          description="Os relatórios aparecem assim que forem publicados pelas educadoras."
        />
      )}
    </>
  )
}
