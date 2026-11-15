import { Pin } from 'lucide-react'
import type { Notice } from '@/types'
import { formatDate } from '@/utils/format'
import { noticeCategoryLabels } from '@/utils/labels'
import { Badge } from '@/components/ui/Badge'

export function NoticeCard({ notice, className, compact }: { notice: Notice; className?: string; compact?: boolean }) {
  const category = noticeCategoryLabels[notice.category]
  return (
    <article className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={category.tone} dot>
          {category.label}
        </Badge>
        {notice.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-outline">
            <Pin className="size-3" aria-hidden /> Fixado
          </span>
        )}
        <time dateTime={notice.date} className="ml-auto text-xs text-outline">
          {formatDate(notice.date, { day: '2-digit', month: 'short' })}
        </time>
      </div>
      <h3 className="mt-3 font-sans text-base font-bold tracking-normal">{notice.title}</h3>
      <p className={compact ? 'mt-1 line-clamp-2 text-sm text-on-surface-variant' : 'mt-2 leading-relaxed text-on-surface-variant'}>
        {notice.body}
      </p>
      {!compact && <p className="mt-3 text-sm text-outline">Por {notice.authorName}</p>}
    </article>
  )
}
