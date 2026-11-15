import type { ManagedUser, UserInput, UserRole } from '@/types'

/** Contas de acesso (coordenação, professoras, famílias). Somente coordenação. */
export interface UserService {
  list(role?: UserRole): Promise<ManagedUser[]>
  /** Cria a conta com senha provisória, que a pessoa troca no primeiro acesso. */
  create(input: UserInput): Promise<{ user: ManagedUser; temporaryPassword: string }>
  update(id: string, input: { name: string; email: string; active: boolean }): Promise<ManagedUser>
  resetPassword(id: string): Promise<{ temporaryPassword: string }>
  remove(id: string): Promise<void>
}
