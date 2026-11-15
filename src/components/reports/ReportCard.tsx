import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import type { DevelopmentReport } from '@/types'
import { formatDate } from '@/utils/format'
import { reportStatusLabels } from '@/utils/labels'
import { Badge } from '@/components/ui/Badge'

export function ReportCard({ report, studentName }: { report: DevelopmentReport; studentName?: string }) {
  return (
    <Link
      to={`/area/relatorios/${report.id}`}
      className="group flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-surface-container-high/80 transition hover:shadow-soft"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600">
        <FileText className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-on-surface">{studentName ?? 'Relatório de desenvolvimento'}</p>
        <p className="truncate text-sm text-outline">
          {report.period} · {report.authorName} · {formatDate(report.createdAt, { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <span className="hidden sm:block">
        <Badge tone={report.status === 'publicado' ? 'sage' : 'sun'}>{reportStatusLabels[report.status]}</Badge>
      </span>
      <ChevronRight className="size-5 shrink-0 text-outline transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}
