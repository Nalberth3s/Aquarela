import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Baby,
  CalendarDays,
  ClipboardList,
  Mail,
  MessageCircle,
  NotebookPen,
  Phone,
  Save,
  Sparkles,
  Trash,
} from 'lucide-react'
import { getErrorMessage, leadService } from '@/services'
import type { LeadDetail, LeadStatus } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { formatAge, formatDate, formatRelativeDateTime, onlyDigits } from '@/utils/format'
import { enrollmentStatusLabels, shiftLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { whatsappLink } from '@/utils/whatsapp'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { BackLink } from '@/components/dashboard/PageHeader'

type TimelineItem =
  | { kind: 'mensagem'; at: string; data: LeadDetail['messages'][number] }
  | { kind: 'pre_matricula'; at: string; data: LeadDetail['enrollments'][number] }

const statuses = Object.keys(enrollmentStatusLabels) as LeadStatus[]

function Profile({ lead, onChanged }: { lead: LeadDetail; onChanged: () => void }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.notes)
  const [savingNotes, setSavingNotes] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const phone = lead.phone ? onlyDigits(lead.phone) : ''
  const waNumber = phone ? (phone.startsWith('55') ? phone : `55${phone}`) : ''
  const first = lead.name.split(' ')[0]
  const timeline: TimelineItem[] = [
    ...lead.messages.map((m) => ({ kind: 'mensagem' as const, at: m.createdAt, data: m })),
    ...lead.enrollments.map((e) => ({ kind: 'pre_matricula' as const, at: e.createdAt, data: e })),
  ].sort((a, b) => b.at.localeCompare(a.at))

  async function changeStatus(next: LeadStatus) {
    const previous = status
    setStatus(next)
    try {
      await leadService.update(lead.id, { status: next })
      showToast(`Situação: ${enrollmentStatusLabels[next].label}.`, 'success')
      onChanged()
    } catch (err) {
      setStatus(previous)
      showToast(getErrorMessage(err), 'error')
    }
  }

  async function saveNotes() {
    setSavingNotes(true)
    try {
      await leadService.update(lead.id, { notes })
      showToast('Anotações salvas.', 'success')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  async function remove() {
    try {
      await leadService.remove(lead.id)
      showToast('Interessado excluído.', 'success')
      navigate('/area/interessados', { replace: true })
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
      {/* Mini perfil */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="text-center">
          <Avatar name={lead.name} size="xl" className="mx-auto" />
          <h1 className="mt-3 text-2xl">{lead.name}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {lead.firstSource === 'pre_matricula' ? 'Chegou pela pré-matrícula' : 'Chegou pelo formulário de contato'} ·{' '}
            {formatDate(lead.createdAt.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          <div className="mt-5 grid gap-2 text-left">
            {lead.phone && (
              <p className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
                <Phone className="size-4 text-primary" aria-hidden /> <span className="font-semibold">{lead.phone}</span>
              </p>
            )}
            {lead.email && (
              <p className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
                <Mail className="size-4 text-primary" aria-hidden /> <span className="truncate font-semibold">{lead.email}</span>
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {waNumber && (
              <Button
                variant="whatsapp"
                href={whatsappLink(waNumber, `Olá, ${first}! Aqui é da Aquarela do Saber, tudo bem?`)}
                external
                icon={<MessageCircle className="size-4" />}
              >
                Conversar no WhatsApp
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {phone && (
                <Button variant="secondary" size="sm" href={`tel:${phone}`} icon={<Phone className="size-4" />}>
                  Ligar
                </Button>
              )}
              {lead.email && (
                <Button variant="secondary" size="sm" href={`mailto:${lead.email}?subject=Aquarela do Saber`} icon={<Mail className="size-4" />}>
                  E-mail
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Situação" subtitle="Em que etapa está esse contato" />
          <div className="grid gap-2">
            {statuses.map((s) => {
              const meta = enrollmentStatusLabels[s]
              const t = toneClasses[meta.tone]
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeStatus(s)}
                  aria-pressed={status === s}
                  className={cn(
                    'flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition',
                    status === s ? cn(t.bg, t.text, 'ring-2 ring-current') : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <span className={cn('size-2.5 rounded-full', t.dot)} aria-hidden />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </Card>
      </aside>

      <div className="space-y-6">
        {/* Anotações */}
        <Card>
          <CardHeader title="Anotações da coordenação" subtitle="Só a equipe vê. Ex.: visita marcada, idade do filho, dúvidas." />
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Ex.: ${first} quer vaga no Maternal para 2027, prefere período integral. Ligar na segunda.`}
            className="w-full resize-y rounded-2xl bg-surface-container-low p-4 text-sm leading-relaxed outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={saveNotes} loading={savingNotes} disabled={notes === lead.notes} icon={<Save className="size-4" />}>
              Salvar anotações
            </Button>
          </div>
        </Card>

        {/* Histórico */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg">
            <NotebookPen className="size-5 text-primary" aria-hidden /> Histórico de contatos
          </h2>
          <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[19px] before:border-l-2 before:border-dashed before:border-primary-fixed">
            {timeline.map((item) => (
              <li key={`${item.kind}-${item.data.id}`} className="relative flex gap-4">
                <span
                  className={cn(
                    'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-surface',
                    item.kind === 'mensagem' ? 'bg-aqua-100 text-primary' : 'bg-sage-100 text-sage-600',
                  )}
                >
                  {item.kind === 'mensagem' ? <MessageCircle className="size-4" aria-hidden /> : <ClipboardList className="size-4" aria-hidden />}
                </span>
                <div className="flex-1 rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-on-surface">
                      {item.kind === 'mensagem' ? 'Mensagem pelo site' : 'Pré-matrícula'}
                    </span>
                    <span className="text-outline">{formatRelativeDateTime(item.at)}</span>
                  </div>
                  {item.kind === 'mensagem' ? (
                    <>
                      <p className="mt-2 leading-relaxed whitespace-pre-line">{item.data.message}</p>
                      <p className="mt-2 text-xs text-outline">Protocolo {item.data.protocol}</p>
                    </>
                  ) : (
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="flex items-center gap-2 font-semibold">
                        <Baby className="size-4 text-sage-600" aria-hidden />
                        {item.data.childName} · {formatAge(item.data.childBirthDate)}
                      </p>
                      <p className="flex flex-wrap gap-x-4 gap-y-1 text-on-surface-variant">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="size-3.5" aria-hidden /> {item.data.suggestedSegment}
                        </span>
                        <span>{shiftLabels[item.data.preferredShift]}</span>
                        {item.data.wantsVisit && (
                          <span className="inline-flex items-center gap-1 text-lilac-600">
                            <CalendarDays className="size-3.5" aria-hidden /> Quer visitar a escola
                          </span>
                        )}
                        {item.data.howDidYouHear && <span>Conheceu por: {item.data.howDidYouHear}</span>}
                      </p>
                      {item.data.message && <p className="rounded-2xl bg-surface-container-low p-3 italic">“{item.data.message}”</p>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-coral-600 hover:bg-coral-50"
          >
            <Trash className="size-4" aria-hidden /> Excluir interessado
          </button>
        </div>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir interessado?" icon={<Trash className="size-5" />}>
        <p className="text-on-surface-variant">
          Apaga o perfil de {lead.name} e as mensagens enviadas pelo site. Pré-matrículas continuam na lista de pré-matrículas.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={remove}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/** Mini perfil de um interessado. Abrir o perfil marca as mensagens como lidas. */
export default function LeadProfilePage() {
  const { id = '' } = useParams()
  const { data, loading, error, reload } = useAsync(async () => {
    const lead = await leadService.get(id)
    if (lead.unreadCount > 0) await leadService.markRead(id).catch(() => undefined)
    return lead
  }, [id])
  useDocumentTitle(data?.name ?? 'Interessado')

  return (
    <>
      <BackLink to="/area/interessados" label="Interessados" />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : (
        <Profile key={data.id} lead={data} onChanged={() => undefined} />
      )}
    </>
  )
}
