import { useState } from 'react'
import { Megaphone, Plus, Trash } from 'lucide-react'
import { communicationService, getErrorMessage, studentService } from '@/services'
import type { NoticeCategory } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { noticeCategoryLabels } from '@/utils/labels'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs, type TabOption } from '@/components/ui/Tabs'
import { NoticeCard } from '@/components/dashboard/NoticeCard'
import { NoticeFormModal } from '@/components/dashboard/NoticeFormModal'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { FamilyNoticeCard } from '@/components/family/FamilyNoticeCard'

type Filter = NoticeCategory | 'todos'

export default function NoticesPage() {
  useDocumentTitle('Comunicados')
  const user = useCurrentUser()
  const { showToast } = useToast()
  const isStaff = user.role !== 'guardian'
  const [filter, setFilter] = useState<Filter>('todos')
  const [creating, setCreating] = useState(false)
  const { data: notices, loading, error, reload } = useAsync(() => communicationService.listNotices(), [])
  const classes = useAsync(() => (isStaff ? studentService.listClasses() : Promise.resolve([])), [isStaff])

  const all = notices ?? []
  const options: TabOption<Filter>[] = [
    { value: 'todos', label: 'Todos', count: all.length },
    ...(Object.keys(noticeCategoryLabels) as NoticeCategory[]).map((c) => ({
      value: c,
      label: noticeCategoryLabels[c].label,
      count: all.filter((n) => n.category === c).length,
    })),
  ]
  const visible = filter === 'todos' ? all : all.filter((n) => n.category === filter)
  const canDelete = (classId?: string | null) => user.role === 'admin' || (!!classId && user.classIds?.includes(classId))

  async function remove(id: string) {
    try {
      await communicationService.deleteNotice(id)
      showToast('Comunicado removido.', 'success')
      void reload()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Comunicados"
        description="Avisos da escola e das turmas."
        actions={
          isStaff && (
            <Button onClick={() => setCreating(true)} disabled={!classes.data} icon={<Plus className="size-4" />}>
              Novo comunicado
            </Button>
          )
        }
      />
      <Tabs className="mb-6" label="Filtrar comunicados" options={options} value={filter} onChange={setFilter} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !notices ? (
        <SkeletonList rows={4} />
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-4">
          {visible.map((n) =>
            isStaff ? (
              <li key={n.id} className="relative rounded-3xl bg-surface-container-lowest p-6 shadow-soft">
                <NoticeCard notice={n} />
                {canDelete(n.classId) && (
                  <button
                    type="button"
                    onClick={() => remove(n.id)}
                    className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full text-coral-600 hover:bg-coral-50"
                    aria-label={`Remover comunicado ${n.title}`}
                  >
                    <Trash className="size-4" />
                  </button>
                )}
              </li>
            ) : (
              <li key={n.id}>
                <FamilyNoticeCard notice={n} />
              </li>
            ),
          )}
        </ul>
      ) : (
        <EmptyState icon={<Megaphone className="size-5" />} title="Nenhum comunicado por aqui" />
      )}
      {creating && classes.data && (
        <NoticeFormModal
          user={user}
          classes={classes.data}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            void reload()
          }}
        />
      )}
    </>
  )
}
