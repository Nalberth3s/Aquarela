import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { diaryService, studentService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { todayISO } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { BackLink } from '@/components/dashboard/PageHeader'
import { DiaryEditor } from '@/components/diary/DiaryEditor'

async function loadEditor(studentId: string | null, date: string) {
  const [students, classes] = await Promise.all([studentService.list(), studentService.listClasses()])
  const active = students.filter((s) => s.status !== 'inativo')
  const student = active.find((s) => s.id === studentId) ?? active[0]
  const existing = student ? (await diaryService.listLogs({ studentId: student.id, date }))[0] : undefined
  return { students: active, classes, student, existing }
}

/** /area/diario/novo?aluno=ID&data=YYYY-MM-DD */
export default function DiaryEditorPage() {
  useDocumentTitle('Novo Registro Diário')
  const [params, setParams] = useSearchParams()
  const studentId = params.get('aluno')
  const date = params.get('data') ?? todayISO()
  const [pickerOpen, setPickerOpen] = useState(false)
  const { data, loading, error, reload } = useAsync(() => loadEditor(studentId, date), [studentId, date])

  function selectStudent(id: string) {
    const next = new URLSearchParams(params)
    next.set('aluno', id)
    setParams(next, { replace: true })
    setPickerOpen(false)
  }

  return (
    <>
      <BackLink to="/area/diario" label="Diário de Bordo" />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data?.student ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-28 rounded-[2rem]" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : (
        <DiaryEditor
          key={`${data.student.id}-${date}-${data.existing?.id ?? 'novo'}`}
          student={data.student}
          classGroup={data.classes.find((c) => c.id === data.student!.classId)}
          date={date}
          existing={data.existing}
          onSwapStudent={() => setPickerOpen(true)}
        />
      )}

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Escolher criança"
        subtitle="Registro de hoje"
        icon={<Users className="size-5" />}
      >
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {data?.students.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => selectStudent(s.id)}
                className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left hover:bg-surface-container-low aria-[current=true]:bg-aqua-50"
                aria-current={s.id === data.student?.id}
              >
                <Avatar name={s.name} src={s.photoUrl} size="sm" />
                <span className="flex-1">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-xs text-on-surface-variant">
                    {data.classes.find((c) => c.id === s.classId)?.segmentName}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
