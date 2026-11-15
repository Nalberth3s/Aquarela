import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
  interactive?: boolean
}

export function Card({ children, className, padded = true, interactive, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-3xl bg-surface-container-lowest shadow-soft',
        padded && 'p-5 sm:p-7',
        interactive && 'transition duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, action, subtitle }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-sans text-base font-bold tracking-normal">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-outline">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
