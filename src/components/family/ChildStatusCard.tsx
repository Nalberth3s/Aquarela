import { School, SunMedium } from 'lucide-react'
import type { ClassGroup, Student } from '@/types'
import { formatDate, todayISO } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export function ChildStatusCard({
  student,
  classGroup,
  present,
}: {
  student: Student
  classGroup?: ClassGroup
  present: boolean
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-5 shadow-soft">
      <WatercolorBlob tone="aqua" variant={1} intensity={0.5} className="absolute -top-16 -right-16 w-52" />
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <Avatar name={student.name} src={student.photoUrl} size="lg" className="ring-4 ring-primary-fixed" />
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-white ring-2 ring-white">
            <School className="size-3.5" aria-hidden />
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl">{student.name}</h2>
            <span
              className={
                present
                  ? 'rounded-full bg-sage-50 px-2.5 py-0.5 text-xs font-semibold text-sage-600'
                  : 'rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant'
              }
            >
              {present ? 'Presença confirmada' : 'Ausente hoje'}
            </span>
          </div>
          {classGroup && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary">
              <SunMedium className="size-4" aria-hidden />
              {classGroup.segmentName} • Turma {classGroup.name}
            </p>
          )}
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {classGroup && `Profª ${classGroup.teacherName.split(' ')[0]} • `}Hoje,{' '}
            {formatDate(todayISO(), { day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </section>
  )
}
