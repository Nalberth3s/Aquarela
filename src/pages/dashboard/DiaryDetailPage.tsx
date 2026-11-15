import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Brain, HeartHandshake, Lightbulb, Lock, PenLine } from 'lucide-react'
import { diaryService, studentService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/utils/format'
import { interactionLabels, participationLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { BackLink } from '@/components/dashboard/PageHeader'
import { DayMomentsGallery } from '@/components/diary/DayMomentsGallery'
import { TodayDiaryCard } from '@/components/diary/TodayDiaryCard'

async function loadLog(id: string) {
  const log = await diaryService.getLog(id)
  const [student, classes] = await Promise.all([studentService.getById(log.studentId), studentService.listClasses()])
  return { log, student, classGroup: classes.find((c) => c.id === student.classId) }
}

export default function DiaryDetailPage() {
  const { id = '' } = useParams()
  const user = useCurrentUser()
  const { data, loading, error, reload } = useAsync(() => loadLog(id), [id])
  useDocumentTitle(data ? `Diário · ${data.student.name}` : 'Diário de Bordo')

  // A família confirma a leitura ao abrir o registro.
  useEffect(() => {
    if (user.role === 'guardian' && data && !data.log.readByGuardian) void diaryService.markAsRead(data.log.id)
  }, [user.role, data])

  if (error) {
    return (
      <>
        <BackLink to="/area/diario" label="Diário de Bordo" />
        <ErrorState message={error} onRetry={reload} />
      </>
    )
  }
  if (loading || !data) return <Skeleton className="h-96 rounded-3xl" />

  const { log, student, classGroup } = data
  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <BackLink to="/area/diario" label="Diário de Bordo" />
      <div className="flex items-center gap-4">
        <Avatar name={student.name} src={student.photoUrl} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl">{student.name}</h1>
          <p className="text-sm text-on-surface-variant capitalize">
            {formatDate(log.date, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {user.role !== 'guardian' && (
          <Button
            to={`/area/diario/novo?aluno=${student.id}&data=${log.date}`}
            variant="soft"
            size="sm"
            icon={<PenLine className="size-4" />}
          >
            Editar
          </Button>
        )}
      </div>

      <TodayDiaryCard log={log} teacherName={classGroup?.teacherName ?? log.authorName} />

      {(log.participation || log.interaction) && (
        <div className="grid grid-cols-2 gap-3">
          {log.participation && (
            <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Brain className="size-4" aria-hidden /> Participação
              </p>
              <p className="mt-1 font-semibold">{participationLabels[log.participation]}</p>
            </div>
          )}
          {log.interaction && (
            <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-lilac-600">
                <HeartHandshake className="size-4" aria-hidden /> Convivência
              </p>
              <p className="mt-1 font-semibold">{interactionLabels[log.interaction]}</p>
            </div>
          )}
        </div>
      )}

      {log.photos.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg">Momentos do dia</h2>
          <DayMomentsGallery photos={log.photos} />
        </section>
      )}

      {log.internalNote && (
        <section className="rounded-3xl bg-sun-50 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4" aria-hidden /> Observação interna · apenas equipe
          </p>
          <p className="mt-2 flex gap-2 text-on-surface-variant">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-sun-600" aria-hidden />
            {log.internalNote}
          </p>
        </section>
      )}
    </div>
  )
}
