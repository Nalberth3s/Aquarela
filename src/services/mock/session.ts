import type { AuthSession, User } from '@/types'
import { ApiError } from '../api/errors'
import { safeStorage } from './utils'

/**
 * Sessão simulada. Em produção, o backend identifica o usuário pelo token
 * e aplica as regras de acesso; aqui os serviços mock leem esta sessão
 * para reproduzir o mesmo comportamento.
 */
const SESSION_KEY = 'aquarela.session'

let current: AuthSession | null = safeStorage.read<AuthSession>(SESSION_KEY)

export const mockSession = {
  get(): AuthSession | null {
    return current
  },
  set(session: AuthSession | null) {
    current = session
    if (session) safeStorage.write(SESSION_KEY, session)
    else safeStorage.remove(SESSION_KEY)
  },
  /** Garante usuário autenticado (equivalente a um 401 da API). */
  requireUser(): User {
    if (!current) throw new ApiError('Sessão expirada. Entre novamente.', 401, 'UNAUTHENTICATED')
    return current.user
  },
}

/** Regras de visibilidade por perfil — espelham o que a API deverá aplicar. */
export function canViewStudent(user: User, student: { id: string; classId: string }): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'teacher') return user.classIds?.includes(student.classId) ?? false
  return user.studentIds?.includes(student.id) ?? false
}

export function canViewClass(user: User, classId: string, studentClassIds: string[] = []): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'teacher') return user.classIds?.includes(classId) ?? false
  return studentClassIds.includes(classId)
}
