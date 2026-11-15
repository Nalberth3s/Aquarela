import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/format'
import { toneClasses, toneFromString } from '@/utils/tones'

const sizes = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-20 text-2xl',
}

export function Avatar({
  name,
  src,
  size = 'md',
  tone,
  className,
}: {
  name: string
  src?: string
  size?: keyof typeof sizes
  tone?: Tone
  className?: string
}) {
  const t = toneClasses[tone ?? toneFromString(name)]
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold',
        t.bg,
        t.text,
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
