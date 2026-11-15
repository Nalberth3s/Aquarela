import { useState } from 'react'
import { Check, CheckCheck, MessagesSquare } from 'lucide-react'
import { communicationService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/utils/cn'
import { formatRelativeDateTime } from '@/utils/format'
import { messageSubjectLabels } from '@/utils/labels'
import { hasUnread, seenLabel } from '@/utils/messages'
import { MessageThreadModal } from '@/components/messages/MessageThreadModal'

/** "Meus recados": a família acompanha se a professora viu e conversa com ela. */
export function FamilyMessagesCard({ studentId, refreshKey }: { studentId: string; refreshKey: number }) {
  const { data, reload } = useAsync(() => communicationService.listMessages(), [refreshKey])
  const [openId, setOpenId] = useState<string | null>(null)
  const messages = (data ?? []).filter((m) => m.studentId === studentId)
  if (!messages.length) return null
  const open = messages.find((m) => m.id === openId) ?? null

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg">
        <MessagesSquare className="size-5 text-primary" aria-hidden /> Meus recados
      </h2>
      <ul className="space-y-2">
        {messages.slice(0, 5).map((m) => {
          const seen = seenLabel(m)
          const newReply = hasUnread(m, 'family')
          const lastStaff = [...m.replies].reverse().find((r) => !r.fromFamily)
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setOpenId(m.id)}
                className={cn(
                  'w-full rounded-2xl bg-surface-container-lowest p-4 text-left shadow-soft transition hover:shadow-lift',
                  newReply && 'ring-2 ring-sage-200',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-aqua-50 px-2 py-0.5 font-semibold text-primary">{messageSubjectLabels[m.subject]}</span>
                  <span className="text-outline">{formatRelativeDateTime(m.createdAt)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm">{m.message}</p>
                <p className={cn('mt-1.5 flex items-center gap-1 text-xs', seen ? 'text-primary' : 'text-outline')}>
                  {seen ? <CheckCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                  {seen ?? 'Enviado — a professora ainda não viu'}
                </p>
                {lastStaff && (
                  <div className="mt-2 rounded-2xl bg-sage-50 px-3 py-2 text-sm">
                    <p className="text-xs font-semibold text-sage-600">
                      {newReply ? 'Nova resposta de ' : 'Resposta de '}
                      {lastStaff.authorName.split(' ')[0]}
                    </p>
                    <p className="line-clamp-2">{lastStaff.body}</p>
                  </div>
                )}
                <p className="mt-2 text-xs font-semibold text-primary">{lastStaff ? 'Abrir conversa e responder' : 'Abrir conversa'}</p>
              </button>
            </li>
          )
        })}
      </ul>
      <MessageThreadModal message={open} viewer="family" onClose={() => setOpenId(null)} onChanged={() => void reload()} />
    </section>
  )
}
