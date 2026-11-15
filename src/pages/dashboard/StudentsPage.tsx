import { useDeferredValue, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { studentService } from '@/services'
import type { StudentFilters as Filters, StudentStatus } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StudentCard } from '@/components/students/StudentCard'
import { StudentFilters } from '@/components/students/StudentFilters'

export default function StudentsPage() {
  const user = useCurrentUser()
  const isGuardian = user.role === 'guardian'
  useDocumentTitle(isGuardian ? 'Minhas crianças' : 'Alunos')

  // Filtros ficam na URL: compartilháveis e preservados ao voltar.
  const [params, setParams] = useSearchParams()
  const filters: Filters = {
    search: params.get('busca') ?? '',
    classId: params.get('turma') ?? undefined,
    status: (params.get('situacao') as StudentStatus | null) ?? undefined,
  }
  const search = useDeferredValue(filters.search)

  function updateFilters(next: Filters) {
    const p = new URLSearchParams()
    if (next.search) p.set('busca', next.search)
    if (next.classId) p.set('turma', next.classId)
    if (next.status) p.set('situacao', next.status)
    setParams(p, { replace: true })
  }

  const { data: classes = [] } = useAsync(() => studentService.listClasses(), [])
  const { data: students, loading, error, reload } = useAsync(
    () => studentService.list({ search, classId: filters.classId, status: filters.status }),
    [search, filters.classId, filters.status],
  )
  const classById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes])

  return (
    <>
      <PageHeader
        title={isGuardian ? 'Minhas crianças' : 'Alunos'}
        description={
          isGuardian
            ? 'Acompanhe o perfil, os registros e o desenvolvimento.'
            : user.role === 'teacher'
              ? 'Crianças das suas turmas.'
              : 'Todas as crianças matriculadas na escola.'
        }
        actions={
          user.role === 'admin' && (
            <Button to="/area/alunos/novo" icon={<UserPlus className="size-4" />}>
              Nova criança
            </Button>
          )
        }
      />

      {!isGuardian && (
        <div className="mb-6">
          <StudentFilters value={filters} onChange={updateFilters} classes={classes} />
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !students ? (
        <SkeletonList rows={5} />
      ) : students?.length ? (
        <>
          {!isGuardian && (
            <p className="mb-3 text-sm text-outline" aria-live="polite">
              {students.length} {students.length === 1 ? 'criança' : 'crianças'}
            </p>
          )}
          <ul className="grid gap-3 md:grid-cols-2">
            {students.map((s) => (
              <li key={s.id}>
                <StudentCard student={s} classGroup={classById.get(s.classId)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon={<Users className="size-5" />}
          title={filters.search || filters.classId || filters.status ? 'Nenhuma criança encontrada' : 'Nenhuma criança cadastrada ainda'}
          description={
            filters.search || filters.classId || filters.status
              ? 'Ajuste a busca ou os filtros para ver outros resultados.'
              : user.role === 'admin'
                ? 'Comece cadastrando a primeira criança e seus responsáveis.'
                : 'As crianças aparecem aqui assim que a coordenação fizer o cadastro.'
          }
          action={
            user.role === 'admin' && (
              <Button to="/area/alunos/novo" size="sm" icon={<UserPlus className="size-4" />}>
                Cadastrar criança
              </Button>
            )
          }
        />
      )}
    </>
  )
}
