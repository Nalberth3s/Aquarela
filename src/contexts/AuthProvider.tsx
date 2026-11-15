import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService, UNAUTHORIZED_EVENT } from '@/services'
import type { LoginCredentials, User } from '@/types'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    authService
      .restoreSession()
      .then((session) => setUser(session?.user ?? null))
      .finally(() => setInitializing(false))
  }, [])

  // Token recusado pela API (expirado/removido): volta para o login.
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  // Login/logout em outra aba troca o token compartilhado: recarrega a sessão desta aba
  // para a tela não continuar mostrando a pessoa anterior.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== 'aquarela.token') return
      void authService.restoreSession().then((session) => setUser(session?.user ?? null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials)
    setUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, logout, setUser }),
    [user, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
