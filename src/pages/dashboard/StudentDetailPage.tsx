import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FilePlus2, NotebookPen, Pencil } from 'lucide-react'
import { diaryService, getErrorMessage, reportService, studentService } from '@/services'
import type { Guardian } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState, Skeleton, SkeletonList } from '@/components/ui/States'
import { CredentialsModal, type Credentials } from '@/components/dashboard/CredentialsModal'
import { BackLink, PageHeader } from '@/components/dashboard/PageHeader'
import { DailyLogCard } from '@/components/diary/DailyLogCard'
import { FieldAssessmentList, LevelLegend } from '@/components/reports/FieldAssessmentList'
import { ObservationTimeline } from '@/components/reports/ObservationTimeline'
import { ReportCard } from '@/components/reports/ReportCard'
import { AttendanceCard } from '@/components/students/AttendanceCard'
import { GuardianList } from '@/components/students/GuardianList'
import { HealthCard } from '@/components/students/HealthCard'
import { StudentProfileHeader } from '@/components/students/StudentProfileHeader'

async function loadStudent(id: string) {
  const student = await studentService.getById(id)
  const [classGroup, attendance, reports, observations, logs] = await Promise.all([
    student.classId ? studentService.getClass(student.classId).catch(() => undefined) : Promise.resolve(undefined),
    studentService.getAttendance(id),
    reportService.list({ studentId: id }),
    reportService.listObservations(id),
    diaryService.listLogs({ studentId: id }),
  ])
  return { student, classGroup, attendance, reports, observations, logs }
}

export default function StudentDetailPage() {
  const { id = '' } = useParams()
  const user = useCurrentUser()
  const { showToast } = useToast()
  const { data, loading, error, reload } = useAsync(() => loadStudent(id), [id])
  const [creatingId, setCreatingId] = useState<string>()
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  useDocumentTitle(data?.student.name ?? 'Aluno')

  const isStaff = user.role !== 'guardian'
  const isAdmin = user.role === 'admin'
  const backLabel = isStaff ? 'Alunos' : 'Minha criança'
  const latestPublished = data?.reports.find((r) => r.status === 'publicado')

  async function createAccess(g: Guardian) {
    if (!g.id) return
    setCreatingId(g.id)
    try {
      const result = await studentService.createGuardianAccess(id, g.id)
      if (result.temporaryPassword) setCredentials({ name: g.name, email: result.email, temporaryPassword: result.temporaryPassword })
      else showToast(`${g.name} já tinha conta: a criança foi vinculada ao acesso existente.`, 'success')
      void reload()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setCreatingId(undefined)
    }
  }

  if (error) {
    return (
      <>
        <PageHeader title="Aluno" backTo="/area/alunos" backLabel={backLabel} />
        <ErrorState message={error} onRetry={reload} />
      </>
    )
  }

  if (loading || !data) {
    return (
      <div className="space-y-6" role="status" aria-label="Carregando">
        <Skeleton className="h-56 rounded-[2rem]" />
        <SkeletonList rows={3} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to="/area/alunos" label={backLabel} />
        {isStaff && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button to={`/area/diario/novo?aluno=${id}`} size="sm" icon={<NotebookPen className="size-4" />}>
              Registro do dia
            </Button>
            <Button to={`/area/relatorios/novo?aluno=${id}`} size="sm" variant="secondary" icon={<FilePlus2 className="size-4" />}>
              Novo relatório
            </Button>
            {isAdmin && (
              <Button to={`/area/alunos/${id}/editar`} size="sm" variant="soft" icon={<Pencil className="size-4" />}>
                Editar cadastro
              </Button>
            )}
          </div>
        )}
      </div>
      <StudentProfileHeader student={data.student} classGroup={data.classGroup} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Desenvolvimento"
              subtitle={latestPublished ? `Com base no relatório do ${latestPublished.period}` : 'Ainda sem relatório publicado'}
            />
            {latestPublished ? (
              <>
                <FieldAssessmentList assessments={latestPublished.assessments} showComments={false} />
                <div className="mt-6 border-t border-surface-container-high pt-4">
                  <LevelLegend />
                </div>
              </>
            ) : (
              <p className="text-sm text-outline">O primeiro relatório aparece aqui quando for publicado.</p>
            )}
          </Card>

          <section>
            <h2 className="mb-3 text-lg">Diário de Bordo</h2>
            {data.logs.length ? (
              <ul className="space-y-3">
                {data.logs.slice(0, 6).map((log) => (
                  <li key={log.id}>
                    <DailyLogCard log={log} />
                  </li>
                ))}
              </ul>
            ) : (
              <Card>
                <p className="text-sm text-outline">Nenhum registro no diário ainda.</p>
              </Card>
            )}
          </section>

          {data.observations.length > 0 && (
            <Card>
              <CardHeader title="Observações" />
              <ObservationTimeline observations={data.observations} />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <AttendanceCard records={data.attendance} />
          <HealthCard health={data.student.health} />
          <GuardianList student={data.student} onCreateAccess={isAdmin ? createAccess : undefined} creatingId={creatingId} />
          {data.reports.length > 0 && (
            <section>
              <h2 className="mb-3 font-sans text-sm font-bold tracking-wide text-outline uppercase">Relatórios</h2>
              <div className="space-y-3">
                {data.reports.map((r) => (
                  <ReportCard key={r.id} report={r} studentName={r.period} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  )
}
