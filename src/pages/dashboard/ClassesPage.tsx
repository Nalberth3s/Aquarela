import { useState } from 'react'
import { GraduationCap, Pencil, Plus } from 'lucide-react'
import { studentService, userService } from '@/services'
import type { ClassGroup } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ClassCard } from '@/components/students/ClassCard'
import { ClassFormModal } from '@/components/students/ClassFormModal'

export default function ClassesPage() {
  useDocumentTitle('Turmas')
  const user = useCurrentUser()
  const isAdmin = user.role === 'admin'
  const { data: classes, loading, error, reload } = useAsync(() => studentService.listClasses(), [])
  const teachers = useAsync(() => (isAdmin ? userService.list('teacher') : Promise.resolve([])), [isAdmin])
  const [editing, setEditing] = useState<{ open: boolean; classGroup?: ClassGroup }>({ open: false })

  return (
    <>
      <PageHeader
        title="Turmas"
        description="Organização das turmas, professoras e ocupação."
        actions={
          isAdmin && (
            <Button onClick={() => setEditing({ open: true })} icon={<Plus className="size-4" />}>
              Nova turma
            </Button>
          )
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !classes ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-3xl" />
          ))}
        </div>
      ) : classes.length ? (
        <div className="grid animate-fade-in gap-5 md:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="relative">
              <ClassCard classGroup={c} studentCount={c.studentCount ?? 0} />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditing({ open: true, classGroup: c })}
                  className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft hover:bg-white"
                  aria-label={`Editar turma ${c.name}`}
                >
                  <Pencil className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GraduationCap className="size-5" />}
          title="Nenhuma turma cadastrada"
          description={isAdmin ? 'Crie as turmas (ex.: Berçário A, Maternal II) para organizar as crianças.' : 'Você ainda não é regente de nenhuma turma.'}
          action={
            isAdmin && (
              <Button size="sm" onClick={() => setEditing({ open: true })} icon={<Plus className="size-4" />}>
                Criar turma
              </Button>
            )
          }
        />
      )}
      {editing.open && (
        <ClassFormModal
          classGroup={editing.classGroup}
          teachers={teachers.data ?? []}
          onClose={() => setEditing({ open: false })}
          onSaved={() => {
            setEditing({ open: false })
            void reload()
          }}
        />
      )}
    </>
  )
}
