import { useState } from 'react'
import { CalendarDays, CircleCheck, Download, UserCheck, Utensils } from 'lucide-react'
import { communicationService, getErrorMessage } from '@/services'
import type { Notice } from '@/types'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { IconTile } from '@/components/ui/IconTile'

/** Comunicado na Área da Família, com confirmação de presença quando houver evento. */
export function FamilyNoticeCard({ notice }: { notice: Notice }) {
  const { showToast } = useToast()
  const [confirmed, setConfirmed] = useState(!!notice.rsvpConfirmed)
  const [saving, setSaving] = useState(false)

  async function toggleAttendance() {
    const next = !confirmed
    setConfirmed(next)
    setSaving(true)
    try {
      await communicationService.setAttendance(notice.id, next)
      showToast(next ? 'Presença confirmada. Obrigado!' : 'Confirmação desfeita.', next ? 'success' : 'info')
    } catch (err) {
      setConfirmed(!next)
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (notice.category === 'cardapio') {
    return (
      <article className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-soft">
        <IconTile icon={Utensils} tone="sage" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{notice.title}</h3>
          <p className="text-xs text-on-surface-variant">Elaborado pela nutricionista escolar</p>
        </div>
        <button
          type="button"
          onClick={() => showToast(`Download de "${notice.attachmentName ?? 'cardápio'}" disponível com a integração.`)}
          className="flex size-10 items-center justify-center rounded-full bg-sage-50 text-sage-600 hover:bg-sage-100"
          aria-label="Baixar cardápio"
        >
          <Download className="size-4" />
        </button>
      </article>
    )
  }

  return (
    <article className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-5 shadow-soft">
      {notice.pinned && <span className="absolute inset-y-0 left-0 w-1 bg-coral-400" aria-hidden />}
      <div className="flex items-start gap-3">
        <IconTile icon={CalendarDays} tone={notice.pinned ? 'coral' : 'aqua'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {notice.pinned && <span className="rounded-full bg-coral-50 px-2 py-0.5 text-coral-600">Importante</span>}
            <span className="text-on-surface-variant">
              {notice.rsvp ? 'Próxima semana' : formatDate(notice.date, { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <h3 className="mt-1.5 text-lg leading-snug">{notice.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{notice.body}</p>
        </div>
      </div>
      {notice.rsvp && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant={confirmed ? 'soft' : 'primary'}
            onClick={toggleAttendance}
            disabled={saving}
            className={cn('flex-1', confirmed && 'bg-sage-50 text-sage-600 hover:bg-sage-100')}
            icon={confirmed ? <CircleCheck className="size-4" /> : <UserCheck className="size-4" />}
          >
            {confirmed ? 'Presença Confirmada!' : 'Confirmar Presença'}
          </Button>
          <Button size="sm" variant="secondary" to="/area/agenda">
            Detalhes
          </Button>
        </div>
      )}
    </article>
  )
}
