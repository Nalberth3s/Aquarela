import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkPassword, hashPassword, issueSession, loadSessionUser, requireUser } from '../lib/auth.ts'
import { queryOne } from '../lib/db.ts'
import { HttpError } from '../lib/errors.ts'

const password = z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.')

export async function authRoutes(app: FastifyInstance) {
  /** Primeiro acesso: o sistema ainda não tem nenhuma conta de coordenação. */
  app.get('/setup/status', async () => {
    const admin = await queryOne('select 1 from users where role = $1 limit 1', ['admin'])
    return { needsSetup: !admin }
  })

  app.post('/setup', async (req, reply) => {
    const body = z
      .object({
        name: z.string().trim().min(3, 'Informe seu nome completo.'),
        email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
        password,
      })
      .parse(req.body)

    const admin = await queryOne('select 1 from users where role = $1 limit 1', ['admin'])
    if (admin) throw new HttpError(409, 'O primeiro acesso já foi concluído. Entre com sua conta.', 'ALREADY_SETUP')

    const row = await queryOne<{ id: string }>(
      `insert into users (name, email, password_hash, role) values ($1, $2, $3, 'admin') returning id`,
      [body.name, body.email, await hashPassword(body.password)],
    )
    return issueSession(reply, (await loadSessionUser(row!.id))!)
  })

  app.post('/auth/login', async (req, reply) => {
    const body = z.object({ email: z.string().trim().toLowerCase(), password: z.string() }).parse(req.body)
    // Sem "@": entra pelo CPF (só dígitos).
    const byCpf = !body.email.includes('@')
    const row = await queryOne<{ id: string; password_hash: string; active: boolean }>(
      `select id, password_hash, active from users where ${byCpf ? 'cpf' : 'email'} = $1`,
      [byCpf ? body.email.replace(/\D/g, '') : body.email],
    )
    if (!row || !(await checkPassword(body.password, row.password_hash))) {
      throw new HttpError(401, 'E-mail/CPF ou senha incorretos.', 'INVALID_CREDENTIALS')
    }
    if (!row.active) throw new HttpError(403, 'Acesso desativado. Fale com a coordenação.', 'INACTIVE')
    await queryOne('update users set last_login_at = now() where id = $1', [row.id])
    return issueSession(reply, (await loadSessionUser(row.id))!)
  })

  app.get('/auth/me', async (req) => ({ user: await requireUser(req) }))

  app.post('/auth/change-password', async (req) => {
    const user = await requireUser(req)
    const body = z.object({ currentPassword: z.string(), newPassword: password }).parse(req.body)
    const row = await queryOne<{ password_hash: string }>('select password_hash from users where id = $1', [user.id])
    if (!row || !(await checkPassword(body.currentPassword, row.password_hash))) {
      throw new HttpError(422, 'A senha atual não confere.', 'INVALID_PASSWORD')
    }
    await queryOne('update users set password_hash = $1, must_change_password = false where id = $2', [
      await hashPassword(body.newPassword),
      user.id,
    ])
    return { user: await loadSessionUser(user.id) }
  })
}
