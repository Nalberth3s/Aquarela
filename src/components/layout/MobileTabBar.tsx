import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface TabItem {
  label: string
  icon: LucideIcon
  to?: string
  href?: string
  onClick?: () => void
  end?: boolean
}

const itemClass = 'flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold'

/** Barra de navegação inferior (mobile), como nas telas do Stitch. */
export function MobileTabBar({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 bg-surface/85 shadow-[0_-4px_24px_rgb(59_130_166/0.08)] backdrop-blur-xl lg:hidden"
    >
      <ul className="flex h-16 items-center justify-around px-2">
        {items.map(({ label: text, icon: Icon, to, href, onClick, end }) => (
          <li key={text}>
            {to ? (
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(itemClass, isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface')
                }
              >
                <Icon className="size-[1.35rem]" aria-hidden />
                {text}
              </NavLink>
            ) : href ? (
              <a href={href} target="_blank" rel="noreferrer" className={cn(itemClass, 'text-on-surface-variant')}>
                <Icon className="size-[1.35rem]" aria-hidden />
                {text}
              </a>
            ) : (
              <button type="button" onClick={onClick} className={cn(itemClass, 'text-on-surface-variant')}>
                <Icon className="size-[1.35rem]" aria-hidden />
                {text}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
