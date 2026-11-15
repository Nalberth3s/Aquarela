import { NavLink } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { User } from '@/types'
import { cn } from '@/utils/cn'
import { Logo } from './Logo'
import { dashboardNav } from './navigation'

export function DashboardSidebar({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const items = dashboardNav.filter((item) => item.roles.includes(user.role))

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-8">
        <Logo to="/area" />
      </div>
      <nav aria-label="Área interna" className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/area'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-surface-container-lowest text-primary shadow-soft'
                      : 'text-on-surface-variant hover:bg-surface-container-lowest/60 hover:text-on-surface',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('size-[1.15rem]', isActive ? 'text-primary' : 'text-outline')} aria-hidden />
                    {item.labelFor?.[user.role] ?? item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-outline hover:text-on-surface"
        >
          <ExternalLink className="size-4" aria-hidden />
          Ver site da escola
        </NavLink>
      </div>
    </div>
  )
}
