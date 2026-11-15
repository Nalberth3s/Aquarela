import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useAuth'
import { DashboardSidebar } from './DashboardSidebar'
import { MobileTabBar } from './MobileTabBar'
import { dashboardNav } from './navigation'
import { DashboardTopbar } from './DashboardTopbar'

export function DashboardLayout() {
  const user = useCurrentUser()
  // Guarda a rota em que o menu foi aberto: ao navegar, ele fecha sozinho.
  const { pathname } = useLocation()
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null)
  const menuOpen = menuOpenAt === pathname
  const setMenuOpen = (value: boolean) => setMenuOpenAt(value ? pathname : null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpenAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh bg-surface-container-low lg:block">
        <DashboardSidebar user={user} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-on-surface/30"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] animate-fade-in bg-surface-container-low shadow-lift">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-4 flex size-9 items-center justify-center rounded-full hover:bg-white"
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
            <DashboardSidebar user={user} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <DashboardTopbar user={user} onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pt-6 pb-28 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileTabBar
        label="Área interna"
        items={[
          ...dashboardNav
            .filter((item) => item.mobile && item.roles.includes(user.role))
            .map((item) => ({
              label: (item.labelFor?.[user.role] ?? item.label).split(' ')[0],
              icon: item.icon,
              to: item.to,
              end: item.to === '/area',
            })),
          { label: 'Menu', icon: Menu, onClick: () => setMenuOpen(true) },
        ]}
      />
    </div>
  )
}
