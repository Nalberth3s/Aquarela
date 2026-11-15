import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function BackLink({ to, label = 'Voltar' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-outline hover:text-on-surface">
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </Link>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  backTo,
  backLabel = 'Voltar',
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  backTo?: string
  backLabel?: string
}) {
  return (
    <div className="mb-8 animate-fade-up">
      {backTo && <BackLink to={backTo} label={backLabel} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-[2.1rem]">{title}</h1>
          {description && <p className="mt-2 text-on-surface-variant">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </div>
  )
}
