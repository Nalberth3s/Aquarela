import type { ReactNode } from 'react'
import { CircleAlert, Inbox, RotateCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-surface-container-low', className)} aria-hidden />
}

export function SkeletonList({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-surface-container-high px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-container-low text-outline">
        {icon ?? <Inbox className="size-5" />}
      </span>
      <p className="font-semibold text-on-surface">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-outline">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-coral-50 px-6 py-10 text-center ring-1 ring-coral-100">
      <CircleAlert className="mb-3 size-6 text-coral-600" />
      <p className="font-semibold text-coral-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry} icon={<RotateCw className="size-4" />}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
