import { Link } from 'react-router-dom'
import { ChevronRight, CheckCheck, NotebookPen, Plus, User } from 'lucide-react'
import type { ClassGroup, DailyLog, Student } from '@/types'
import { formatAge, formatRelativeDateTime, todayISO } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Avatar } from '@/components/ui/Avatar'

/** Linha do "Alunos da Escola": presença, responsável e último registro do diário. */
export function StudentRosterItem({
  student,
  classGroup,
  present,
  lastLog,
}: {
  student: Student
  classGroup?: ClassGroup
  present: boolean
  lastLog?: DailyLog
}) {
  const guardian = student.guardians[0]
  const hasToday = lastLog?.date === todayISO()
  const logStatus = !lastLog
    ? 'Sem registros ainda'
    : `${formatRelativeDateTime(lastLog.updatedAt)} • ${lastLog.readByGuardian ? 'Leitura confirmada' : 'Entregue'}`

  return (
    <li className="rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={student.name} src={student.photoUrl} size="lg" className="rounded-2xl" tone={classGroup?.tone} />
          <span
            className={cn(
              'absolute -top-1 -left-1 size-3.5 rounded-full ring-2 ring-white',
              present ? 'bg-sage-400' : 'bg-outline-variant',
            )}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link to={`/area/alunos/${student.id}`} className="truncate text-lg font-semibold hover:text-primary">
              {student.name}
            </Link>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                present ? 'bg-sage-50 text-sage-600' : 'bg-surface-container text-on-surface-variant',
              )}
            >
              {present ? '● Presente' : 'Ausente'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            {formatAge(student.birthDate)}
            {classGroup && (
              <>
                {' • '}
                <span className="font-medium text-primary">{classGroup.segmentName}</span>
              </>
            )}
          </p>
          {guardian && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-on-surface-variant">
              <User className="size-3.5" aria-hidden />
              {guardian.relationship}: {guardian.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
        {lastLog?.readByGuardian ? (
          <CheckCheck className="size-5 shrink-0 text-sage-600" aria-hidden />
        ) : (
          <NotebookPen className="size-5 shrink-0 text-primary" aria-hidden />
        )}
        <p className="min-w-0 flex-1 text-xs">
          <span className="block text-on-surface-variant">Último relatório:</span>
          <span className="block truncate font-medium">{logStatus}</span>
        </p>
        {hasToday && lastLog ? (
          <Link
            to={`/area/diario/${lastLog.id}`}
            className="flex items-center gap-1 rounded-full bg-aqua-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-aqua-100"
          >
            Abrir <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        ) : (
          <Link
            to={`/area/diario/novo?aluno=${student.id}`}
            className="flex items-center gap-1 rounded-full bg-aqua-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-aqua-100"
          >
            Criar <Plus className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </li>
  )
}
