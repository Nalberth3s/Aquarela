import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Símbolo oficial do Centro Educacional Aquarela do Saber:
 * hexágono de seis facetas coloridas com o monograma "As" ao centro.
 * Versão vetorizada a partir do material do Stitch (docs/design/stitch).
 */
export function LogoMark({ className, monogram = true }: { className?: string; monogram?: boolean }) {
  return (
    <svg viewBox="108 72 284 256" className={cn('size-10', className)} aria-hidden>
      <path d="M185 77h130l-25 51h-80z" fill="#0072CE" />
      <path d="m322 81 65 114h-55l-38-62z" fill="#E3262A" />
      <path d="m387 205-65 114-28-52 38-62z" fill="#FBB800" />
      <path d="M315 323H185l25-51h80z" fill="#292062" />
      <path d="m178 319-65-114h55l38 62z" fill="#58B826" />
      <path d="m113 195 65-114 28 52-38 62z" fill="#EE7202" />
      {monogram && (
        <text
          x="250"
          y="226"
          textAnchor="middle"
          fontFamily="'Brush Script MT', 'Segoe Script', cursive"
          fontSize="92"
          fontStyle="italic"
          fontWeight="700"
          fill="#1C1917"
          letterSpacing="-4"
        >
          As
        </text>
      )}
    </svg>
  )
}

export function Logo({
  to = '/',
  className,
  inverted,
  compact,
}: {
  to?: string
  className?: string
  inverted?: boolean
  /** Esconde a linha "Centro Educacional Infantil". */
  compact?: boolean
}) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Aquarela do Saber — início">
      <LogoMark className="size-11 shrink-0 transition-transform duration-500 group-hover:rotate-[60deg]" />
      <span className="flex flex-col leading-none">
        <span className={cn('text-lg font-bold tracking-tight', inverted ? 'text-white' : 'text-primary')}>
          Aquarela do Saber
        </span>
        {!compact && (
          <span className={cn('mt-1 text-xs font-medium', inverted ? 'text-white/70' : 'text-on-surface-variant')}>
            Centro Educacional Infantil
          </span>
        )}
      </span>
    </Link>
  )
}
