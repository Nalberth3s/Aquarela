import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, CheckCheck, MessageSquareText, Send } from 'lucide-react'
import { communicationService, getErrorMessage } from '@/services'
import type { TeacherMessage } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { formatRelativeDateTime } from '@/utils/format'
import { messageSubjectLabels } from '@/utils/labels'
import { hasUnread, seenLabel, type MessageViewer } from '@/utils/messages'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const quickReplies = ['Ciente, obrigada! 💙', 'Pode deixar, vou observar e te aviso.', 'Combinado!']

/** Conversa de um recado: mensagem da família, status de leitura e respostas dos dois lados. */
export function MessageThreadModal({
  message,
  viewer,
  onClose,
  onChanged,
}: {
  message: TeacherMessage | null
  viewer: MessageViewer
  onClose: () => void
  onChanged: () => void
}) {
  const { showToast } = useToast()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const id = message?.id

  // Abrir a conversa marca como visto (equipe) e as respostas do outro lado como lidas.
  useEffect(() => {
    if (!message || !hasUnread(message, viewer)) return
    void communicationService
      .markMessageRead(message.id)
      .then(onChanged)
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [id, message?.replies.length])

  async function send(body: string) {
    if (!message || !body.trim()) return
    setSending(true)
    try {
      await communicationService.replyMessage(message.id, body.trim())
      setText('')
      onChanged()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSending(false)
    }
  }

  const mine = (fromFamily: boolean) => fromFamily === (viewer === 'family')
  const seen = message && seenLabel(message)

  return (
    <Modal
      open={!!message}
      onClose={onClose}
      title={message ? messageSubjectLabels[message.subject] : ''}
      subtitle={message ? `Sobre ${message.studentName}` : undefined}
      icon={<MessageSquareText className="size-5" />}
    >
      {message && (
        <>
          <div className="-mx-1 max-h-[50vh] space-y-3 overflow-y-auto px-1 py-1">
            <Bubble mine={mine(true)} author={message.fromName} at={message.createdAt} body={message.message}>
              <span className={cn('inline-flex items-center gap-1', seen ? 'text-primary' : 'text-outline')}>
                {seen ? <CheckCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                {seen ?? 'Enviado — ainda não visto'}
              </span>
            </Bubble>
            {message.replies.map((r) => (
              <Bubble key={r.id} mine={mine(r.fromFamily)} author={r.authorName} at={r.createdAt} body={r.body}>
                {mine(r.fromFamily) && (
                  <span className={cn('inline-flex items-center gap-1', r.read ? 'text-primary' : 'text-outline')}>
                    {r.read ? <CheckCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                    {r.read ? 'Lida' : 'Enviada'}
                  </span>
                )}
              </Bubble>
            ))}
            <div ref={endRef} />
          </div>

          {viewer === 'staff' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={sending}
                  onClick={() => send(q)}
                  className="rounded-full bg-aqua-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-aqua-100 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            className="mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void send(text)
            }}
          >
            <label htmlFor="resposta-recado" className="sr-only">
              Resposta
            </label>
            <textarea
              id="resposta-recado"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(text)
                }
              }}
              placeholder={viewer === 'staff' ? 'Responder à família…' : 'Responder à professora…'}
              className="flex-1 resize-none rounded-2xl bg-surface-container-low p-3 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
            />
            <Button type="submit" loading={sending} disabled={!text.trim()} aria-label="Enviar resposta" icon={<Send className="size-4" />}>
              Enviar
            </Button>
          </form>
        </>
      )}
    </Modal>
  )
}

function Bubble({
  mine,
  author,
  at,
  body,
  children,
}: {
  mine: boolean
  author: string
  at: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
          mine ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-surface-container-low',
        )}
      >
        {body}
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 px-2 text-[0.7rem] text-on-surface-variant">
        <span>
          {author.split(' ')[0]} · {formatRelativeDateTime(at)}
        </span>
        {children}
      </p>
    </div>
  )
}
