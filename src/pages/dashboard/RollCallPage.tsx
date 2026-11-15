import { useState } from 'react'
import { Check, ClipboardCheck, X } from 'lucide-react'
import { diaryService, getErrorMessage, studentService } from '@/services'
import type { RollCallEntry } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { formatDate, todayISO } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ErrorState, SkeletonList } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'

async function loadRollCall(date: string) {
  const [entries, students, classes] = await Promise.all([
    diaryService.getRollCall(date),
    studentService.list(),
    studentService.listClasses(),
  ])
  return { entries, students, classes }
}

/** Chamada do Dia — marca presença das crianças das turmas do usuário. */
export default function RollCallPage() {
  useDocumentTitle('Chamada do Dia')
  const date = todayISO()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const { data, loading, error, reload, setData } = useAsync(() => loadRollCall(date), [date])

  function toggle(studentId: string, present: boolean) {
    if (!data) return
    setData({ ...data, entries: data.entries.map((e) => (e.studentId === studentId ? { ...e, present } : e)) })
  }

  async function save(entries: RollCallEntry[]) {
    setSaving(true)
    try {
      await diaryService.saveRollCall(date, entries)
      showToast('Chamada registrada com sucesso.', 'success')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const presentCount = data?.entries.filter((e) => e.present).length ?? 0

  return (
    <>
      <PageHeader title="Chamada do Dia" description={<span className="capitalize">{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonList rows={5} />
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between rounded-3xl bg-surface-container-lowest p-5 shadow-soft">
            <div>
              <p className="text-3xl font-bold">
                {presentCount}
                <span className="text-lg font-medium text-on-surface-variant">/{data.entries.length}</span>
              </p>
              <p className="text-sm text-on-surface-variant">crianças presentes</p>
            </div>
            <ClipboardCheck className="size-8 text-sage-600" aria-hidden />
          </div>

          {data.classes.map((cls) => {
            const rows = data.entries.filter((e) => data.students.find((s) => s.id === e.studentId)?.classId === cls.id)
            if (!rows.length) return null
            return (
              <section key={cls.id}>
                <h2 className="mb-2 text-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                  {cls.segmentName} · Turma {cls.name}
                </h2>
                <ul className="divide-y divide-surface-container rounded-3xl bg-surface-container-lowest px-4 shadow-soft">
                  {rows.map((entry) => {
                    const student = data.students.find((s) => s.id === entry.studentId)!
                    return (
                      <li key={entry.studentId} className="flex items-center gap-3 py-3">
                        <Avatar name={student.name} src={student.photoUrl} size="sm" />
                        <span className="flex-1 font-semibold">{student.name}</span>
                        <div className="flex gap-1.5" role="radiogroup" aria-label={`Presença de ${student.name}`}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={entry.present}
                            onClick={() => toggle(entry.studentId, true)}
                            className={cn(
                              'flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold transition',
                              entry.present ? 'bg-sage-600 text-white' : 'bg-surface-container-low text-on-surface-variant',
                            )}
                          >
                            <Check className="size-4" aria-hidden /> Presente
                          </button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={!entry.present}
                            onClick={() => toggle(entry.studentId, false)}
                            className={cn(
                              'flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold transition',
                              !entry.present ? 'bg-coral-600 text-white' : 'bg-surface-container-low text-on-surface-variant',
                            )}
                          >
                            <X className="size-4" aria-hidden />
                            <span className="sr-only sm:not-sr-only">Ausente</span>
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          <Button size="lg" className="w-full" loading={saving} onClick={() => save(data.entries)} icon={<Check className="size-5" />}>
            Salvar chamada
          </Button>
        </div>
      )}
    </>
  )
}
