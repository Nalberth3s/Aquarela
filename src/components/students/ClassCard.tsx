import { Link } from 'react-router-dom'
import type { ClassGroup } from '@/types'
import { cn } from '@/utils/cn'
import { shiftLabels } from '@/utils/labels'
import { toneClasses } from '@/utils/tones'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export function ClassCard({ classGroup, studentCount }: { classGroup: ClassGroup; studentCount: number }) {
  const t = toneClasses[classGroup.tone]
  return (
    <Link
      to={`/area/alunos?turma=${classGroup.id}`}
      className="group relative block overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-surface-container-high/80 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <WatercolorBlob tone={classGroup.tone} variant={1} intensity={0.55} className="absolute -top-12 -right-12 w-40" />
      <p className={cn('relative text-sm font-semibold', t.text)}>{classGroup.segmentName}</p>
      <h2 className="relative mt-1 text-2xl">Turma {classGroup.name}</h2>
      <dl className="relative mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-outline">Professora</dt>
          <dd className="font-semibold">{classGroup.teacherName}</dd>
        </div>
        <div>
          <dt className="text-outline">Turno · Sala</dt>
          <dd className="font-semibold">
            {shiftLabels[classGroup.shift]} · {classGroup.room}
          </dd>
        </div>
      </dl>
      <div className="relative mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-outline">Ocupação</span>
          <span className="font-semibold">
            {studentCount}/{classGroup.capacity}
          </span>
        </div>
        <ProgressBar value={studentCount} max={classGroup.capacity} tone={classGroup.tone} label="Ocupação da turma" />
      </div>
    </Link>
  )
}
