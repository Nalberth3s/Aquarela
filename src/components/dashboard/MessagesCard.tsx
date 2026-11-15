import { useState } from 'react'
import { CheckCheck, MessageSquareText, Reply } from 'lucide-react'
import type { TeacherMessage } from '@/types'
import { formatRelativeDateTime } from '@/utils/format'
import { messageSubjectLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { hasUnread } from '@/utils/messages'
import { MessageThreadModal } from '@/components/messages/MessageThreadModal'

/** Recados enviados pelas famílias. Abrir marca como visto (a família vê) e permite responder. */
export function MessagesCard({ messages, onChanged }: { messages: TeacherMessage[]; onChanged: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null)
  if (!messages.length) return null
  const unread = messages.filter((m) => hasUnread(m, 'staff')).length
  const open = messages.find((m) => m.id === openId) ?? null

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xl">
        <MessageSquareText className="size-5 text-primary" aria-hidden />
        Recados das famílias
        {unread > 0 && <span className="rounded-full bg-coral-400 px-2 py-0.5 text-xs font-bold text-white">{unread} novo(s)</span>}
      </h2>
      <ul className="space-y-2">
        {messages.slice(0, 6).map((m) => {
          const isNew = hasUnread(m, 'staff')
          const last = m.replies.at(-1)
          const newReply = m.read && m.replies.some((r) => r.fromFamily && !r.read)
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setOpenId(m.id)}
                className={cn(
                  'w-full rounded-2xl bg-surface-container-lowest p-4 text-left shadow-soft transition hover:shadow-lift',
                  isNew && 'ring-2 ring-coral-200',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-aqua-50 px-2 py-0.5 font-semibold text-primary">{messageSubjectLabels[m.subject]}</span>
                  <span className="text-outline">{formatRelativeDateTime(last?.createdAt ?? m.createdAt)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed">{m.message}</p>
                {last && (
                  <p className="mt-1.5 line-clamp-1 border-l-2 border-primary-fixed pl-2 text-xs text-on-surface-variant">
                    <span className="font-semibold">{last.fromFamily ? last.authorName.split(' ')[0] : 'Você'}:</span> {last.body}
                  </p>
                )}
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-on-surface-variant">
                  <span>
                    {m.fromName} · sobre {m.studentName}
                  </span>
                  {!m.read ? (
                    <span className="font-semibold text-coral-600">· toque para ver e responder</span>
                  ) : newReply ? (
                    <span className="font-semibold text-coral-600">· nova resposta da família</span>
                  ) : m.replies.some((r) => !r.fromFamily) ? (
                    <span className="inline-flex items-center gap-1 text-sage-600">
                      <Reply className="size-3.5" aria-hidden /> Respondido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <CheckCheck className="size-3.5" aria-hidden /> Visto
                    </span>
                  )}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
      <MessageThreadModal message={open} viewer="staff" onClose={() => setOpenId(null)} onChanged={onChanged} />
    </section>
  )
}
