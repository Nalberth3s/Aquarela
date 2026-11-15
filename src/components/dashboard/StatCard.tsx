import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/types'
import { IconTile } from '@/components/ui/IconTile'

/** Indicador do Painel Pedagógico: ícone, número grande e um selo de contexto. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: string | number
  hint?: ReactNode
  icon: LucideIcon
  tone: Tone
}) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-soft sm:p-5">
      <IconTile icon={icon} tone={tone} size="sm" />
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm font-medium text-on-surface">{label}</p>
      {hint && <div className="mt-2 text-xs">{hint}</div>}
    </div>
  )
}
