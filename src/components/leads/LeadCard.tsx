import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList, Mail, MessageCircle, Phone } from 'lucide-react'
import type { Lead } from '@/types'
import { cn } from '@/utils/cn'
import { formatRelativeDateTime } from '@/utils/format'
import { enrollmentStatusLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

/** Cartão de um interessado na lista. */
export function LeadCard({ lead }: { lead: Lead }) {
  const status = enrollmentStatusLabels[lead.status]
  return (
    <Link
      to={`/area/interessados/${lead.id}`}
      className={cn(
        'group flex h-full flex-col rounded-3xl bg-surface-container-lowest p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5',
        lead.unreadCount > 0 && 'ring-2 ring-coral-200',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={lead.name} size="md" />
          {lead.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-coral-400 text-[0.65rem] font-bold text-white">
              {lead.unreadCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold group-hover:text-primary">{lead.name}</p>
          <p className="text-xs text-outline">Último contato {formatRelativeDateTime(lead.lastContactAt).toLowerCase()}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-on-surface-variant">
        {lead.phone && (
          <li className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" aria-hidden /> {lead.phone}
          </li>
        )}
        {lead.email && (
          <li className="flex items-center gap-2 truncate">
            <Mail className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{lead.email}</span>
          </li>
        )}
      </ul>

      {lead.lastMessage && (
        <p className="mt-3 line-clamp-2 rounded-2xl bg-surface-container-low px-3 py-2 text-sm italic">“{lead.lastMessage}”</p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-3 text-xs font-semibold text-on-surface-variant">
        {lead.messageCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden /> {lead.messageCount} {lead.messageCount === 1 ? 'mensagem' : 'mensagens'}
          </span>
        )}
        {lead.enrollmentCount > 0 && (
          <span className="inline-flex items-center gap-1 text-sage-600">
            <ClipboardList className="size-3.5" aria-hidden /> Pré-matrícula
          </span>
        )}
        <ChevronRight className="ml-auto size-4 text-outline transition group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  )
}
