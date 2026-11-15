import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenText, ChevronRight, GraduationCap, IdCard, Phone, Search, UserPlus } from 'lucide-react'
import { staffService } from '@/services'
import type { StaffMember } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/utils/cn'
import { missingFields } from '@/utils/staff'
import { formatRelativeDateTime, maskPhone, normalize, onlyDigits } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'

function StaffCard({ m }: { m: StaffMember }) {
  const missing = missingFields(m)
  return (
    <Link
      to={`/area/funcionarias/${m.id}`}
      className={cn(
        'group flex h-full flex-col rounded-3xl bg-surface-container-lowest p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5',
        !m.active && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={m.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold group-hover:text-primary">{m.name}</p>
          <p className="text-sm text-on-surface-variant">{m.jobTitle ?? (m.role === 'admin' ? 'Coordenação' : 'Professora')}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone={m.role === 'admin' ? 'lilac' : 'aqua'}>{m.role === 'admin' ? 'Coordenação' : 'Professora'}</Badge>
            {!m.active && <Badge tone="neutral">Desativada</Badge>}
            {m.active && m.mustChangePassword && <Badge tone="sun">Aguardando 1º acesso</Badge>}
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-on-surface-variant">
        {m.phone && (
          <li className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" aria-hidden /> {maskPhone(m.phone)}
          </li>
        )}
        <li className="flex items-center gap-2">
          <GraduationCap className="size-3.5 shrink-0" aria-hidden />
          {m.classNames.length ? `${m.classNames.join(', ')} · ${m.studentCount} crianças` : 'Sem turma'}
        </li>
        <li className="flex items-center gap-2">
          <BookOpenText className="size-3.5 shrink-0" aria-hidden />
          {m.diaries30d} {m.diaries30d === 1 ? 'diário' : 'diários'} nos últimos 30 dias
        </li>
      </ul>

      {missing.length > 0 && (
        <p className="mt-3 rounded-2xl bg-sun-50 px-3 py-2 text-xs text-on-surface-variant">
          Falta preencher: {missing.join(', ')}
        </p>
      )}

      <div className="mt-auto flex items-center pt-3 text-xs text-outline">
        {m.lastLoginAt ? `Último acesso ${formatRelativeDateTime(m.lastLoginAt).toLowerCase()}` : 'Ainda não entrou no sistema'}
        <ChevronRight className="ml-auto size-4 transition group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  )
}

/** Funcionárias: ficha e acompanhamento de professoras e coordenação. */
export default function StaffPage() {
  useDocumentTitle('Funcionárias')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useAsync(() => staffService.list(), [])
  const term = normalize(search)
  const digits = onlyDigits(search)
  const visible = (data ?? []).filter(
    (m) =>
      !term ||
      normalize(m.name).includes(term) ||
      normalize(m.email).includes(term) ||
      (digits.length >= 3 && (onlyDigits(m.phone ?? '').includes(digits) || (m.cpf ?? '').includes(digits))),
  )

  return (
    <>
      <PageHeader
        title="Funcionárias"
        description="Ficha de cada professora e da coordenação: contato, documentos, turmas e como está o uso do sistema."
        actions={
          <Button to="/area/equipe" variant="secondary" icon={<UserPlus className="size-4" />}>
            Nova conta
          </Button>
        }
      />
      <label className="relative mb-5 block max-w-xl">
        <span className="sr-only">Buscar funcionária</span>
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-outline" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone ou CPF…"
          className="h-11 w-full rounded-full bg-surface-container-lowest pr-4 pl-11 text-sm shadow-soft outline-none focus:ring-4 focus:ring-aqua-400/20"
        />
      </label>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : visible.length ? (
        <ul className="grid animate-fade-in gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <li key={m.id}>
              <StaffCard m={m} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<IdCard className="size-5" />}
          title={data?.length ? 'Ninguém encontrado' : 'Nenhuma funcionária cadastrada'}
          description="Crie a conta em “Equipe e acessos” — ela aparece aqui com a ficha para completar."
        />
      )}
    </>
  )
}
