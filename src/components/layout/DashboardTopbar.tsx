import { Link, useNavigate } from 'react-router-dom'
import { CalendarPlus, KeyRound, LogOut, Menu } from 'lucide-react'
import { isDemoMode } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types'
import { roleLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LogoMark } from './Logo'

export function DashboardTopbar({ user, onOpenMenu }: { user: User; onOpenMenu: () => void }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/entrar', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/85 shadow-[0_4px_24px_rgb(59_130_166/0.06)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="-ml-2 flex size-10 items-center justify-center rounded-full hover:bg-surface-container-high lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
        <Link to="/area" className="flex items-center gap-2 lg:hidden" aria-label="Início da área interna">
          <LogoMark className="size-8" />
          <span className="text-sm leading-tight font-bold text-primary">
            Aquarela
            <span className="block text-[0.6rem] font-medium tracking-wider text-on-surface-variant uppercase">
              Escola Infantil
            </span>
          </span>
        </Link>

        {isDemoMode && (
          <span className="ml-4 hidden rounded-full bg-sun-50 px-3 py-1 text-xs font-semibold text-sun-600 xl:inline">
            Ambiente demonstrativo · dados fictícios
          </span>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user.role === 'admin' && (
            <Button to="/area/matriculas" variant="soft" size="sm" icon={<CalendarPlus className="size-4" />}>
              Pré-matrícula
            </Button>
          )}
          <div className="hidden text-right md:block">
            <p className="text-sm leading-tight font-semibold">{user.name}</p>
            <p className="text-xs text-on-surface-variant">{roleLabels[user.role]}</p>
          </div>
          <Avatar name={user.name} size="sm" tone="aqua" className="bg-primary! text-white!" />
          <Link
            to="/area/senha"
            className="hidden size-10 items-center justify-center rounded-full text-outline hover:bg-surface-container-high hover:text-on-surface sm:flex"
            aria-label="Trocar senha"
            title="Trocar senha"
          >
            <KeyRound className="size-[1.1rem]" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-10 items-center justify-center rounded-full text-outline hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-[1.1rem]" />
          </button>
        </div>
      </div>
    </header>
  )
}
