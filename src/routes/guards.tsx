import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { LogoMark } from '@/components/layout/Logo'

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Carregando">
      <LogoMark className="size-12 animate-pulse" />
    </div>
  )
}

/** Exige usuário autenticado; caso contrário, envia para o login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <FullScreenLoader />
  if (!user) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  // Senha provisória: obriga a criar uma senha pessoal antes de usar o sistema.
  if (user.mustChangePassword && location.pathname !== '/area/senha') return <Navigate to="/area/senha" replace />
  return children
}

/**
 * Restringe a rota a perfis específicos. É uma proteção de interface —
 * a API continua responsável por negar o acesso aos dados.
 */
export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/area" replace />
  return children
}

/** Redireciona usuários já autenticados (ex.: página de login). */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  if (initializing) return <FullScreenLoader />
  if (user) return <Navigate to="/area" replace />
  return children
}
