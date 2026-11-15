import type { Observation } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { experienceFields, observationKindLabels } from '@/utils/labels'
import { toneClasses } from '@/utils/tones'
import { Badge } from '@/components/ui/Badge'

export function ObservationTimeline({
  observations,
  studentNames,
}: {
  observations: Observation[]
  /** Quando informado, exibe o nome da criança em cada registro. */
  studentNames?: Record<string, string>
}) {
  return (
    <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-surface-container-high">
      {observations.map((o) => {
        const kind = observationKindLabels[o.kind]
        return (
          <li key={o.id} className="relative pl-7">
            <span
              className={cn('absolute top-1.5 left-0 size-[11px] rounded-full ring-4 ring-white', toneClasses[kind.tone].dot)}
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <time dateTime={o.date} className="font-semibold text-on-surface">
                {formatDate(o.date, { day: '2-digit', month: 'long' })}
              </time>
              <Badge tone={kind.tone}>{kind.label}</Badge>
              {o.field && <span className="text-outline">· {experienceFields[o.field].short}</span>}
            </div>
            {studentNames?.[o.studentId] && <p className="mt-1 text-sm font-semibold text-on-surface-variant">{studentNames[o.studentId]}</p>}
            <p className="mt-1.5 leading-relaxed text-on-surface-variant">{o.text}</p>
            <p className="mt-1 text-xs text-outline">{o.authorName}</p>
          </li>
        )
      })}
    </ol>
  )
}
