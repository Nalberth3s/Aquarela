import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

const sizes = { sm: 'size-9 rounded-xl [&>svg]:size-4', md: 'size-11 rounded-2xl [&>svg]:size-5', lg: 'size-12 rounded-2xl [&>svg]:size-6' }

/** Ícone sobre lavagem de cor — padrão dos cards do Stitch. */
export function IconTile({
  icon: Icon,
  tone = 'aqua',
  size = 'md',
  className,
}: {
  icon: LucideIcon
  tone?: Tone
  size?: keyof typeof sizes
  className?: string
}) {
  const t = toneClasses[tone]
  return (
    <span className={cn('flex shrink-0 items-center justify-center', sizes[size], t.bg, t.text, className)}>
      <Icon aria-hidden />
    </span>
  )
}

/** Rótulo de seção em caixa alta (ex.: "QUEM SOMOS"). */
export function Eyebrow({ children, tone = 'aqua', className }: { children: string; tone?: Tone; className?: string }) {
  return (
    <p className={cn('text-xs font-semibold tracking-wider uppercase', toneClasses[tone].text, className)}>{children}</p>
  )
}
