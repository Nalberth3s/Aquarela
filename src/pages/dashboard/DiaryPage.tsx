import { useState } from 'react'
import { BookOpenText, CirclePlus } from 'lucide-react'
import { diaryService, studentService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { todayISO } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { DailyLogCard } from '@/components/diary/DailyLogCard'

type Filter = 'hoje' | 'todos' | 'rascunhos'

async function loadDiary() {
  const [logs, students] = await Promise.all([diaryService.listLogs(), studentService.list()])
  return { logs, students: new Map(students.map((s) => [s.id, s])) }
}

/** Diário de Bordo — histórico de registros (família) ou gestão dos registros (equipe). */
export default function DiaryPage() {
  useDocumentTitle('Diário de Bordo')
  const user = useCurrentUser()
  const isGuardian = user.role === 'guardian'
  const [filter, setFilter] = useState<Filter>(isGuardian ? 'todos' : 'hoje')
  const { data, loading, error, reload } = useAsync(loadDiary, [])

  const logs = data?.logs ?? []
  const visible = logs.filter((l) =>
    filter === 'hoje' ? l.date === todayISO() : filter === 'rascunhos' ? l.status === 'rascunho' : true,
  )
  const singleChild = isGuardian && (data?.students.size ?? 0) <= 1

  return (
    <>
      <PageHeader
        title="Diário de Bordo"
        description={
          isGuardian
            ? 'Todos os registros enviados pela professora, com fotos e recados do dia.'
            : 'Registros diários das crianças: participação, alimentação, descanso e fotos.'
        }
        actions={
          !isGuardian && (
            <Button to="/area/diario/novo" icon={<CirclePlus className="size-4" />}>
              Novo registro
            </Button>
          )
        }
      />
      {!isGuardian && (
        <Tabs
          className="mb-6"
          label="Filtrar registros"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'hoje', label: 'Hoje', count: logs.filter((l) => l.date === todayISO()).length },
            { value: 'todos', label: 'Todos', count: logs.length },
            { value: 'rascunhos', label: 'Rascunhos', count: logs.filter((l) => l.status === 'rascunho').length },
          ]}
        />
      )}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonList rows={4} />
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-3 lg:grid-cols-2">
          {visible.map((log) => {
            const student = data.students.get(log.studentId)
            return (
              <li key={log.id}>
                <DailyLogCard
                  log={log}
                  studentName={singleChild ? undefined : student?.name}
                  studentPhoto={student?.photoUrl}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<BookOpenText className="size-5" />}
          title="Nenhum registro por aqui"
          description={isGuardian ? 'Os registros aparecem assim que a professora enviar.' : 'Crie o primeiro registro do dia.'}
          action={!isGuardian && <Button to="/area/diario/novo" size="sm">Novo registro</Button>}
        />
      )}
    </>
  )
}
