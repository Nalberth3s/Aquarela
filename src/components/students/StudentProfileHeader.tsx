import type { ClassGroup, Student } from '@/types'
import { formatAge, formatDate } from '@/utils/format'
import { shiftLabels, studentStatusLabels, studentStatusTone } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export function StudentProfileHeader({ student, classGroup }: { student: Student; classGroup?: ClassGroup }) {
  const facts = [
    { label: 'Idade', value: formatAge(student.birthDate) },
    { label: 'Nascimento', value: formatDate(student.birthDate, { dateStyle: 'short' }) },
    { label: 'Turno', value: shiftLabels[student.shift] },
    { label: 'Na escola desde', value: formatDate(student.enrolledAt, { month: 'short', year: 'numeric' }) },
  ]
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-surface-container-high/80 shadow-soft sm:p-8">
      <WatercolorBlob
        tone={classGroup?.tone ?? 'aqua'}
        variant={0}
        intensity={0.5}
        className="absolute -top-20 -right-16 w-72"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar name={student.name} src={student.photoUrl} size="xl" tone={classGroup?.tone} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl">{student.name}</h1>
            <Badge tone={studentStatusTone[student.status]} dot>
              {studentStatusLabels[student.status]}
            </Badge>
          </div>
          {classGroup && (
            <p className="mt-1 text-on-surface-variant">
              Turma {classGroup.name} · {classGroup.segmentName} · Prof.ª {classGroup.teacherName}
            </p>
          )}
        </div>
      </div>
      <dl className="relative mt-7 grid grid-cols-2 gap-4 border-t border-surface-container-high pt-6 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs font-semibold text-outline uppercase">{f.label}</dt>
            <dd className="mt-1 font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
