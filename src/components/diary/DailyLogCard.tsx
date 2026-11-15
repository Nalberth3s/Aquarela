import { Link } from 'react-router-dom'
import { CheckCheck, ChevronRight, Image, NotebookPen } from 'lucide-react'
import type { DailyLog } from '@/types'
import { formatRelativeDateTime } from '@/utils/format'
import { mealLabels, participationLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

export function DailyLogCard({
  log,
  studentName,
  studentPhoto,
}: {
  log: DailyLog
  studentName?: string
  studentPhoto?: string
}) {
  return (
    <Link
      to={`/area/diario/${log.id}`}
      className="group flex gap-4 rounded-3xl bg-surface-container-lowest p-4 shadow-soft transition hover:shadow-lift sm:p-5"
    >
      {studentName ? (
        <Avatar name={studentName} src={studentPhoto} size="md" />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-aqua-50 text-primary">
          <NotebookPen className="size-5" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{studentName ?? formatRelativeDateTime(log.updatedAt)}</p>
          {log.status === 'rascunho' ? (
            <Badge tone="sun">Rascunho</Badge>
          ) : log.readByGuardian ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage-600">
              <CheckCheck className="size-3.5" aria-hidden /> Lido pela família
            </span>
          ) : null}
        </div>
        {studentName && <p className="text-xs text-on-surface-variant">{formatRelativeDateTime(log.updatedAt)}</p>}
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{log.dayNote}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {log.participation && <Badge tone="aqua">Participação: {participationLabels[log.participation]}</Badge>}
          {log.meals && <Badge tone="sage">{mealLabels[log.meals]}</Badge>}
          {log.photos.length > 0 && (
            <Badge tone="lilac">
              <Image className="size-3" aria-hidden /> {log.photos.length}
            </Badge>
          )}
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 self-center text-outline transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}
