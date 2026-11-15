import { Link } from 'react-router-dom'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import type { ClassGroup, Student } from '@/types'
import { formatAge } from '@/utils/format'
import { shiftLabels, studentStatusLabels, studentStatusTone } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

export function StudentCard({ student, classGroup }: { student: Student; classGroup?: ClassGroup }) {
  const hasAlert = student.health.allergies.length > 0 || student.health.dietaryRestrictions.length > 0
  return (
    <Link
      to={`/area/alunos/${student.id}`}
      className="group flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-surface-container-high/80 transition hover:shadow-soft hover:ring-surface-container-high sm:p-5"
    >
      <Avatar name={student.name} src={student.photoUrl} size="md" tone={classGroup?.tone} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate font-semibold text-on-surface">{student.name}</p>
          {hasAlert && (
            <TriangleAlert className="size-4 text-coral-600" aria-label="Possui alergia ou restrição alimentar" />
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-outline">
          {formatAge(student.birthDate)}
          {classGroup && ` · Turma ${classGroup.name}`} · {shiftLabels[student.shift]}
        </p>
      </div>
      {student.status !== 'ativo' && (
        <span className="hidden sm:block">
          <Badge tone={studentStatusTone[student.status]}>{studentStatusLabels[student.status]}</Badge>
        </span>
      )}
      <ChevronRight className="size-5 shrink-0 text-outline transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}
