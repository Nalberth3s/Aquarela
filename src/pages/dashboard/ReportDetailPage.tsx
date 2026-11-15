import { Link, useParams } from 'react-router-dom'
import { Pencil, Printer } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useAuth'
import { reportService, studentService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatAge, formatDate } from '@/utils/format'
import { reportStatusLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { FieldAssessmentList, LevelLegend } from '@/components/reports/FieldAssessmentList'

async function loadReport(id: string) {
  const report = await reportService.getById(id)
  const student = await studentService.getById(report.studentId)
  return { report, student }
}

export default function ReportDetailPage() {
  const user = useCurrentUser()
  const { id = '' } = useParams()
  const { data, loading, error, reload } = useAsync(() => loadReport(id), [id])
  useDocumentTitle(data ? `Relatório · ${data.student.name}` : 'Relatório')

  if (error) {
    return (
      <>
        <PageHeader title="Relatório" backTo="/area/relatorios" backLabel="Relatórios" />
        <ErrorState message={error} onRetry={reload} />
      </>
    )
  }
  if (loading || !data) return <Skeleton className="h-96 rounded-[2rem]" />

  const { report, student } = data
  return (
    <div className="animate-fade-in">
      <PageHeader
        backTo="/area/relatorios"
        backLabel="Relatórios"
        title="Relatório de desenvolvimento"
        description={report.period}
        actions={
          <>
            {user.role !== 'guardian' && (
              <Button to={`/area/relatorios/${report.id}/editar`} variant="soft" size="sm" icon={<Pencil className="size-4" />}>
                Editar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="size-4" />}>
              Imprimir
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <p className="text-xs font-bold tracking-[0.16em] text-outline uppercase">Parecer geral</p>
            <p className="mt-3 font-display text-xl leading-relaxed">{report.summary}</p>
          </Card>
          <Card>
            <CardHeader title="Campos de experiência" subtitle="Base Nacional Comum Curricular" />
            <FieldAssessmentList assessments={report.assessments} />
            <div className="mt-7 border-t border-surface-container-high pt-4">
              <LevelLegend />
            </div>
          </Card>
          {(report.highlights.length > 0 || report.nextSteps.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {report.highlights.length > 0 && (
                <Card>
                  <CardHeader title="Destaques do período" />
                  <ul className="space-y-2.5 text-on-surface-variant">
                    {report.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {report.nextSteps.length > 0 && (
                <Card>
                  <CardHeader title="Próximos passos" />
                  <ul className="space-y-2.5 text-on-surface-variant">
                    {report.nextSteps.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aqua-400" aria-hidden />
                        {h}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>

        <aside>
          <Card className="lg:sticky lg:top-24">
            <Link to={`/area/alunos/${student.id}`} className="flex items-center gap-3 hover:opacity-80">
              <Avatar name={student.name} size="md" />
              <div>
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-outline">{formatAge(student.birthDate)}</p>
              </div>
            </Link>
            <dl className="mt-6 space-y-4 border-t border-surface-container-high pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-outline">Situação</dt>
                <dd>
                  <Badge tone={report.status === 'publicado' ? 'sage' : 'sun'}>{reportStatusLabels[report.status]}</Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-outline">Educadora</dt>
                <dd className="text-right font-semibold">{report.authorName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-outline">Data</dt>
                <dd className="font-semibold">{formatDate(report.createdAt, { dateStyle: 'medium' })}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  )
}
