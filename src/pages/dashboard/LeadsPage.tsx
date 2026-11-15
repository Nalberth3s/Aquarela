import { useDeferredValue, useState } from 'react'
import { Search, UsersRound } from 'lucide-react'
import { leadService } from '@/services'
import type { LeadStatus } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { enrollmentStatusLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContactInbox } from '@/components/leads/ContactInbox'
import { LeadCard } from '@/components/leads/LeadCard'

type View = 'pessoas' | 'caixa'
type StatusFilter = LeadStatus | 'ativos' | 'todos'

/** Interessados: quem entrou em contato pelo site (mini CRM da coordenação). */
export default function LeadsPage() {
  useDocumentTitle('Interessados')
  const [view, setView] = useState<View>('pessoas')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativos')
  const [search, setSearch] = useState('')
  const term = useDeferredValue(search)
  const { data: leads, loading, error, reload } = useAsync(() => leadService.list({ search: term || undefined }), [term])

  const all = leads ?? []
  const visible = all.filter((l) =>
    statusFilter === 'todos' ? true : statusFilter === 'ativos' ? l.status !== 'arquivado' && l.status !== 'matriculado' : l.status === statusFilter,
  )
  const unread = all.reduce((n, l) => n + l.unreadCount, 0)
  const count = (s: StatusFilter) =>
    s === 'todos' ? all.length : s === 'ativos' ? all.filter((l) => l.status !== 'arquivado' && l.status !== 'matriculado').length : all.filter((l) => l.status === s).length

  return (
    <>
      <PageHeader
        title="Interessados"
        description="Cada pessoa que escreveu pelo site ou fez pré-matrícula ganha um perfil. As mensagens também chegam no WhatsApp."
      />
      <Tabs
        className="mb-6"
        label="Visualização"
        value={view}
        onChange={setView}
        options={[
          { value: 'pessoas', label: 'Pessoas', count: all.length },
          { value: 'caixa', label: 'Caixa de entrada', count: unread || undefined },
        ]}
      />

      {view === 'caixa' ? (
        <ContactInbox onChange={reload} />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3">
            <label className="relative max-w-xl">
              <span className="sr-only">Buscar interessado</span>
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-outline" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, telefone ou e-mail…"
                className="h-11 w-full rounded-full bg-surface-container-lowest pr-4 pl-11 text-sm shadow-soft outline-none focus:ring-4 focus:ring-aqua-400/20"
              />
            </label>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
              {(['ativos', 'novo', 'em_contato', 'visita_agendada', 'matriculado', 'arquivado', 'todos'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition',
                    statusFilter === s ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant shadow-soft',
                  )}
                >
                  {s === 'ativos' ? 'Em aberto' : s === 'todos' ? 'Todos' : enrollmentStatusLabels[s].label} ({count(s)})
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !leads ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-52 rounded-3xl" />
              ))}
            </div>
          ) : visible.length ? (
            <ul className="grid animate-fade-in gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((l) => (
                <li key={l.id}>
                  <LeadCard lead={l} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<UsersRound className="size-5" />}
              title={all.length ? 'Ninguém nesta situação' : 'Nenhum interessado ainda'}
              description="Quando alguém enviar mensagem pela página Contato ou fizer pré-matrícula, aparece aqui."
            />
          )}
        </>
      )}
    </>
  )
}
