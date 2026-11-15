import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

/** Retorna o usuário autenticado; use apenas em rotas protegidas. */
export function useCurrentUser() {
  const { user } = useAuth()
  if (!user) throw new Error('Nenhum usuário autenticado')
  return user
}
