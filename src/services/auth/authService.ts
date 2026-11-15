import type { AuthSession, LoginCredentials, SetupInput, User } from '@/types'

/** Conta de acesso rápido exibida apenas no ambiente de demonstração. */
export interface DemoAccount {
  user: User
  password: string
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  logout(): Promise<void>
  /** Restaura a sessão persistida (ex.: token salvo) ao abrir a aplicação. */
  restoreSession(): Promise<AuthSession | null>
  /** Apenas para a demonstração. A implementação real deve retornar lista vazia. */
  listDemoAccounts(): Promise<DemoAccount[]>
  /** Primeiro acesso: true enquanto não existe conta de coordenação. */
  getSetupStatus(): Promise<{ needsSetup: boolean }>
  completeSetup(input: SetupInput): Promise<AuthSession>
  changePassword(currentPassword: string, newPassword: string): Promise<User>
}
