import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, Mail, MailOpen, MessageCircle, Trash, UserRound } from 'lucide-react'
import { getErrorMessage, schoolService } from '@/services'
import type { ContactMessage } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { formatRelativeDateTime, onlyDigits } from '@/utils/format'
import { cn } from '@/utils/cn'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'

type Filter = 'novas' | 'todas'

/** Caixa de entrada: mensagens do formulário "Envie uma mensagem", em ordem de chegada. */
export function ContactInbox({ onChange }: { onChange?: () => void }) {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<Filter>('novas')
  const { data, loading, error, reload, setData } = useAsync(() => schoolService.listContactMessages(), [])
  const all = data ?? []
  const unread = all.filter((m) => !m.read)
  const visible = filter === 'novas' ? unread : all

  async function setRead(m: ContactMessage, read: boolean) {
    setData(all.map((x) => (x.id === m.id ? { ...x, read } : x)))
    try {
      await schoolService.setContactMessageRead(m.id, read)
      onChange?.()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
      void reload()
    }
  }

  async function remove(m: ContactMessage) {
    try {
      await schoolService.deleteContactMessage(m.id)
      setData(all.filter((x) => x.id !== m.id))
      showToast('Mensagem excluída.', 'success')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <>
      <Tabs
        className="mb-6"
        label="Filtrar mensagens"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'novas', label: 'Não lidas', count: unread.length },
          { value: 'todas', label: 'Todas', count: all.length },
        ]}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <SkeletonList rows={4} />
      ) : visible.length ? (
        <ul className="grid gap-3">
          {visible.map((m) => {
            const phone = m.phone ? onlyDigits(m.phone) : ''
            return (
              <li
                key={m.id}
                className={cn('rounded-3xl bg-surface-container-lowest p-5 shadow-soft', !m.read && 'ring-2 ring-coral-200')}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      {!m.read && <span className="size-2 rounded-full bg-coral-400" aria-label="Não lida" />}
                      {m.name}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {m.email}
                      {m.phone && ` · ${m.phone}`}
                    </p>
                  </div>
                  <p className="text-xs text-outline">
                    {formatRelativeDateTime(m.createdAt)} · {m.protocol}
                  </p>
                </div>
                <p className="mt-3 rounded-2xl bg-surface-container-low p-3.5 leading-relaxed whitespace-pre-line">{m.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {phone && (
                    <Button
                      size="sm"
                      variant="whatsapp"
                      href={whatsappLink(`55${phone}`, `Olá, ${m.name.split(' ')[0]}! Aqui é da Aquarela do Saber, recebemos sua mensagem pelo site.`)}
                      external
                      icon={<MessageCircle className="size-4" />}
                    >
                      Responder no WhatsApp
                    </Button>
                  )}
                  <Button size="sm" variant="soft" href={`mailto:${m.email}?subject=Aquarela do Saber`} icon={<Mail className="size-4" />}>
                    Responder por e-mail
                  </Button>
                  {m.leadId && (
                    <Link
                      to={`/area/interessados/${m.leadId}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lilac-50 px-4 text-sm font-semibold text-lilac-600 hover:bg-lilac-100"
                    >
                      <UserRound className="size-4" aria-hidden /> Ver perfil
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRead(m, !m.read)}
                    icon={<MailOpen className="size-4" />}
                  >
                    {m.read ? 'Marcar como não lida' : 'Marcar como lida'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className="ml-auto flex size-9 items-center justify-center rounded-full text-coral-600 hover:bg-coral-50"
                    aria-label={`Excluir mensagem de ${m.name}`}
                  >
                    <Trash className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<Inbox className="size-5" />}
          title={filter === 'novas' ? 'Nenhuma mensagem nova' : 'Nenhuma mensagem ainda'}
          description="As mensagens enviadas pela página Contato aparecem aqui."
        />
      )}
    </>
  )
}
