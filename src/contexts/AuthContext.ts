import { createContext } from 'react'
import type { LoginCredentials, User } from '@/types'

export interface AuthContextValue {
  user: User | null
  /** true enquanto a sessão salva está sendo restaurada. */
  initializing: boolean
  login(credentials: LoginCredentials): Promise<User>
  logout(): Promise<void>
  /** Atualiza o usuário da sessão (ex.: após o primeiro acesso ou troca de senha). */
  setUser(user: User | null): void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
