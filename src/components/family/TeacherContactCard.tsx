import { useState } from 'react'
import { BadgeCheck, MessageSquareText, NotebookPen, Send } from 'lucide-react'
import { communicationService, getErrorMessage } from '@/services'
import type { MessageSubject } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { messageSubjectLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

/** Card da professora regente + recado direto da família. */
export function TeacherContactCard({
  teacherName,
  classLabel,
  studentId,
  onSent,
}: {
  teacherName: string
  classLabel: string
  studentId: string
  onSent?: () => void
}) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState<MessageSubject>('saida_antecipada')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const shortName = teacherName.split(' ')[0]

  async function send() {
    setSending(true)
    try {
      await communicationService.sendTeacherMessage({ studentId, subject, message })
      showToast(`Recado enviado com carinho para a Professora ${shortName}!`, 'success')
      setMessage('')
      setOpen(false)
      onSent?.()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-3xl bg-linear-to-br from-aqua-50 to-lilac-50 p-5">
      <div className="flex items-center gap-3">
        <Avatar name={teacherName} size="lg" className="ring-4 ring-white" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 font-semibold">
            Professora {shortName}
            <BadgeCheck className="size-4 text-primary" aria-label="Verificada" />
          </p>
          <p className="text-xs text-on-surface-variant">Pedagoga Regente • {classLabel}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-sage-600">
            <span className="size-2 rounded-full bg-sage-400" aria-hidden />
            Disponível para recados hoje até às 18h
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Dúvidas sobre o dia, alimentação ou comunicados pontuais? Envie uma mensagem direta com resposta em até 2 horas
        úteis.
      </p>
      <Button className="mt-4 w-full" onClick={() => setOpen(true)} icon={<MessageSquareText className="size-4" />}>
        Enviar recado para a professora
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Recado"
        subtitle={`Para Profª ${shortName} (${classLabel})`}
        icon={<NotebookPen className="size-5" />}
      >
        <p className="mb-2 text-sm font-semibold">Assunto rápido</p>
        <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Assunto">
          {(Object.keys(messageSubjectLabels) as MessageSubject[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={subject === key}
              onClick={() => setSubject(key)}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition',
                subject === key ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant',
              )}
            >
              {messageSubjectLabels[key]}
            </button>
          ))}
        </div>
        <label htmlFor="recado" className="mb-2 block text-sm font-semibold">
          Mensagem
        </label>
        <textarea
          id="recado"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva aqui seu recado…"
          className="w-full resize-none rounded-2xl bg-surface-container-low p-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
        />
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={send}
            loading={sending}
            disabled={!message.trim()}
            iconRight={<Send className="size-4" />}
          >
            Enviar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
