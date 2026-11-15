import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'inverse' | 'inverseGhost' | 'whatsapp' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  // Botão principal: pílula com leve sangria de cor vertical e brilho aquarela no hover.
  primary:
    'bg-linear-to-b from-[#1a7299] to-primary text-on-primary shadow-primary hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgb(12_99_133/0.36)]',
  secondary: 'bg-surface-container-lowest text-on-surface shadow-soft hover:shadow-lift',
  soft: 'bg-aqua-50 text-primary hover:bg-aqua-100',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  inverse: 'bg-white text-primary hover:bg-aqua-50',
  inverseGhost: 'text-white ring-1 ring-white/30 hover:bg-white/10',
  whatsapp: 'bg-whatsapp text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
  danger: 'bg-coral-600 text-white hover:bg-coral-800',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] gap-2',
  lg: 'h-14 px-7 text-base gap-2',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  icon?: ReactNode
  iconRight?: ReactNode
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    to?: undefined
    href?: undefined
    loading?: boolean
  }
type LinkProps = CommonProps & { to: string; href?: undefined; state?: unknown }
type AnchorProps = CommonProps & { href: string; to?: undefined; external?: boolean }

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children, icon, iconRight } = props
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )
  const content = (
    <>
      {icon}
      {children}
      {iconRight}
    </>
  )

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} state={props.state} className={classes}>
        {content}
      </Link>
    )
  }
  if ('href' in props && props.href) {
    const external = 'external' in props && props.external
    return (
      <a href={props.href} className={classes} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </a>
    )
  }

  const { variant: _v, size: _s, className: _c, children: _ch, icon: _i, iconRight: _ir, loading, ...rest } =
    props as ButtonProps
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} className={classes}>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}
