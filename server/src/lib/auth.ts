import bcrypt from 'bcryptjs'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { query, queryOne } from './db.ts'
import { forbidden, HttpError } from './errors.ts'

export type Role = 'admin' | 'teacher' | 'guardian'

/** Usuário autenticado, no formato esperado pelo front-end (tipo User). */
export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  mustChangePassword: boolean
  classIds?: string[]
  studentIds?: string[]
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    /** scope 'dev': token curto da aba Banco (acesso de desenvolvedor). */
    payload: { sub: string; scope?: 'dev' }
    user: { sub: string; scope?: 'dev' }
  }
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10)
export const checkPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash)

/** Senha provisória legível, para a coordenação repassar ao novo usuário. */
export function temporaryPassword(): string {
  const words = ['aquarela', 'girassol', 'arco', 'pincel', 'sol', 'lapis', 'ipe', 'jardim']
  const word = words[Math.floor(Math.random() * words.length)]
  return `${word}${Math.floor(1000 + Math.random() * 9000)}`
}

export async function loadSessionUser(id: string): Promise<SessionUser | undefined> {
  const row = await queryOne<{ id: string; name: string; email: string; role: Role; active: boolean; must_change_password: boolean }>(
    'select id, name, email, role, active, must_change_password from users where id = $1',
    [id],
  )
  if (!row || !row.active) return undefined
  const user: SessionUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    mustChangePassword: row.must_change_password,
  }
  if (row.role === 'teacher') {
    user.classIds = (await query<{ id: string }>('select id from classes where teacher_id = $1', [row.id])).map((r) => r.id)
  }
  if (row.role === 'guardian') {
    user.studentIds = (
      await query<{ student_id: string }>('select distinct student_id from guardians where user_id = $1', [row.id])
    ).map((r) => r.student_id)
  }
  return user
}

/** Exige token válido; carrega o usuário a cada requisição (permissões sempre atuais). */
export async function requireUser(req: FastifyRequest): Promise<SessionUser> {
  try {
    await req.jwtVerify()
  } catch {
    throw new HttpError(401, 'Sessão expirada. Entre novamente.', 'UNAUTHENTICATED')
  }
  // O token da aba Banco não vale como sessão.
  if (req.user.scope) throw new HttpError(401, 'Sessão inválida. Entre novamente.', 'UNAUTHENTICATED')
  const user = await loadSessionUser(req.user.sub)
  if (!user) throw new HttpError(401, 'Usuário inativo ou removido.', 'UNAUTHENTICATED')
  return user
}

export async function requireRole(req: FastifyRequest, roles: Role[]): Promise<SessionUser> {
  const user = await requireUser(req)
  if (!roles.includes(user.role)) throw forbidden()
  return user
}

export const requireAdmin = (req: FastifyRequest) => requireRole(req, ['admin'])
export const requireStaff = (req: FastifyRequest) => requireRole(req, ['admin', 'teacher'])

export async function issueSession(reply: FastifyReply, user: SessionUser) {
  const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '7d' })
  return { token, user }
}
