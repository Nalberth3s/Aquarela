import type { SessionUser } from './auth.ts'
import { query, queryOne } from './db.ts'
import { forbidden, notFound } from './errors.ts'

/**
 * Regras de visibilidade por perfil:
 * - admin: tudo
 * - professora: crianças das turmas em que é regente
 * - família: apenas as crianças vinculadas
 * Retorna null quando não há restrição.
 */
export async function visibleStudentIds(user: SessionUser): Promise<string[] | null> {
  if (user.role === 'admin') return null
  if (user.role === 'guardian') return user.studentIds ?? []
  const rows = await query<{ id: string }>('select id from students where class_id = any($1::uuid[])', [user.classIds ?? []])
  return rows.map((r) => r.id)
}

export async function assertCanViewStudent(user: SessionUser, studentId: string) {
  const exists = await queryOne('select 1 from students where id = $1', [studentId])
  if (!exists) throw notFound('Aluno')
  const ids = await visibleStudentIds(user)
  if (ids && !ids.includes(studentId)) throw forbidden('Sem permissão para acessar esta criança.')
}

/** Turmas visíveis (null = todas). Famílias veem as turmas das suas crianças. */
export async function visibleClassIds(user: SessionUser): Promise<string[] | null> {
  if (user.role === 'admin') return null
  if (user.role === 'teacher') return user.classIds ?? []
  const rows = await query<{ class_id: string }>(
    'select distinct class_id from students where id = any($1::uuid[]) and class_id is not null',
    [user.studentIds ?? []],
  )
  return rows.map((r) => r.class_id)
}
