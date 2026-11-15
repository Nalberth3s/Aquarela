import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hashPassword, requireAdmin, temporaryPassword } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { isValidCpf } from '../lib/cpf.ts'
import { HttpError, notFound } from '../lib/errors.ts'

/** Campos opcionais de contato/documento — CPF guardado só com dígitos. */
export const phoneField = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)
  .refine((v) => !v || [10, 11].includes(v.replace(/\D/g, '').length), 'Telefone inválido — use DDD + número.')
export const cpfField = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/\D/g, '') : null))
  .refine((v) => !v || isValidCpf(v), 'CPF inválido.')

export async function assertCpfFree(cpf: string | null, exceptId?: string) {
  if (!cpf) return
  const taken = await queryOne('select 1 from users where cpf = $1 and id <> coalesce($2::uuid, gen_random_uuid())', [cpf, exceptId ?? null])
  if (taken) throw new HttpError(409, 'Já existe uma conta com este CPF.', 'CONFLICT')
}

const userColumns = `u.id, u.name, u.email, u.role, u.active, u.must_change_password as "mustChangePassword",
  u.phone, u.cpf, u.created_at as "createdAt",
  coalesce((select array_agg(c.id) from classes c where c.teacher_id = u.id), '{}') as "classIds",
  coalesce((select array_agg(distinct g.student_id) from guardians g where g.user_id = u.id), '{}') as "studentIds"`

/** Contas de acesso (coordenação, professoras e famílias). Somente administração. */
export async function userRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { role?: string } }>('/users', async (req) => {
    await requireAdmin(req)
    const role = req.query.role ? z.enum(['admin', 'teacher', 'guardian']).parse(req.query.role) : null
    return query(`select ${userColumns} from users u where ($1::text is null or u.role = $1) order by u.role, u.name`, [
      role,
    ])
  })

  /** Cria a conta com senha provisória (a pessoa troca no primeiro acesso). */
  app.post('/users', async (req) => {
    await requireAdmin(req)
    const body = z
      .object({
        name: z.string().trim().min(3, 'Informe o nome completo.'),
        email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
        role: z.enum(['admin', 'teacher', 'guardian']),
        phone: phoneField,
        cpf: cpfField,
        jobTitle: z.string().trim().optional().transform((v) => v || null),
        hireDate: z.iso.date().optional().or(z.literal('')).transform((v) => v || null),
      })
      .parse(req.body)
    const exists = await queryOne('select 1 from users where email = $1', [body.email])
    if (exists) throw new HttpError(409, 'Já existe uma conta com este e-mail.', 'CONFLICT')
    await assertCpfFree(body.cpf)
    const password = temporaryPassword()
    const row = await queryOne<{ id: string }>(
      `insert into users (name, email, password_hash, role, must_change_password, phone, cpf, job_title, hire_date)
       values ($1,$2,$3,$4,true,$5,$6,$7,$8) returning id`,
      [body.name, body.email, await hashPassword(password), body.role, body.phone, body.cpf, body.jobTitle, body.hireDate],
    )
    const user = await queryOne(`select ${userColumns} from users u where u.id = $1`, [row!.id])
    return { user, temporaryPassword: password }
  })

  app.put<{ Params: { id: string } }>('/users/:id', async (req) => {
    const me = await requireAdmin(req)
    const body = z
      .object({
        name: z.string().trim().min(3),
        email: z.email().transform((e) => e.toLowerCase()),
        active: z.boolean(),
      })
      .parse(req.body)
    if (req.params.id === me.id && !body.active) throw new HttpError(422, 'Você não pode desativar a própria conta.')
    const row = await queryOne(
      `update users set name=$2, email=$3, active=$4 where id=$1 returning id`,
      [req.params.id, body.name, body.email, body.active],
    )
    if (!row) throw notFound('Usuário')
    return queryOne(`select ${userColumns} from users u where u.id = $1`, [req.params.id])
  })

  app.post<{ Params: { id: string } }>('/users/:id/reset-password', async (req) => {
    await requireAdmin(req)
    const password = temporaryPassword()
    const row = await queryOne('update users set password_hash=$2, must_change_password=true where id=$1 returning id', [
      req.params.id,
      await hashPassword(password),
    ])
    if (!row) throw notFound('Usuário')
    return { temporaryPassword: password }
  })

  app.delete<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    const me = await requireAdmin(req)
    if (req.params.id === me.id) throw new HttpError(422, 'Você não pode excluir a própria conta.')
    await query('delete from users where id = $1', [req.params.id])
    return reply.status(204).send()
  })
}
