import { readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { config } from '../config.ts'
import { checkPassword, requireAdmin, type SessionUser } from '../lib/auth.ts'
import { query, transaction } from '../lib/db.ts'
import { HttpError } from '../lib/errors.ts'
import { seedIfEmpty } from '../seed/seed.ts'

/** Tabelas de controle que nunca são apagadas (o schema continua aplicado). */
const KEEP_TABLES = new Set(['schema_migrations'])
const DEV_TOKEN_TTL = '15m'
const MAX_FAILURES = 5
const LOCK_MS = 15 * 60 * 1000

/** Tentativas erradas por conta de coordenação (em memória; zera ao reiniciar a API). */
const failures = new Map<string, { count: number; lockedUntil: number }>()

const devEnabled = () => Boolean(config.dev.email && config.dev.passwordHash)

async function dataTables(): Promise<string[]> {
  const rows = await query<{ tablename: string }>(
    `select tablename from pg_tables where schemaname = 'public' order by tablename`,
  )
  return rows.map((r) => r.tablename).filter((t) => !KEEP_TABLES.has(t))
}

async function tableStats() {
  const tables = await dataTables()
  if (!tables.length) return []
  const sql = tables.map((t) => `select '${t}' as name, count(*)::int as rows from public."${t}"`).join(' union all ')
  return query<{ name: string; rows: number }>(`${sql} order by name`)
}

/** Confere o token de desenvolvedor emitido em /dev/unlock para esta mesma conta. */
async function requireDev(app: FastifyInstance, req: FastifyRequest): Promise<SessionUser> {
  if (!devEnabled()) throw new HttpError(404, 'Acesso de desenvolvedor não configurado.', 'DEV_DISABLED')
  const user = await requireAdmin(req)
  const { devToken } = z.object({ devToken: z.string().min(1) }).parse(req.body)
  try {
    const payload = app.jwt.verify<{ sub: string; scope?: string }>(devToken)
    if (payload.scope !== 'dev' || payload.sub !== user.id) throw new Error('scope')
  } catch {
    throw new HttpError(403, 'Acesso de desenvolvedor expirado. Entre de novo na aba Banco.', 'DEV_LOCKED')
  }
  return user
}

/** Apaga todos os arquivos enviados (fotos do diário, eventos, equipe), mantendo a pasta. */
async function clearUploads() {
  const entries = await readdir(config.uploadsDir).catch(() => [])
  await Promise.all(entries.map((name) => rm(path.join(config.uploadsDir, name), { recursive: true, force: true })))
}

export async function devRoutes(app: FastifyInstance) {
  app.get('/dev/status', async (req) => {
    await requireAdmin(req)
    return { enabled: devEnabled() }
  })

  /** Login do desenvolvedor: e-mail e senha próprios, além da sessão de coordenação. */
  app.post('/dev/unlock', async (req) => {
    if (!devEnabled()) throw new HttpError(404, 'Acesso de desenvolvedor não configurado.', 'DEV_DISABLED')
    const user = await requireAdmin(req)
    const body = z.object({ email: z.string().trim().toLowerCase(), password: z.string() }).parse(req.body)

    const entry = failures.get(user.id)
    if (entry && entry.lockedUntil > Date.now()) {
      const minutes = Math.ceil((entry.lockedUntil - Date.now()) / 60000)
      throw new HttpError(429, `Muitas tentativas. Tente de novo em ${minutes} min.`, 'DEV_THROTTLED')
    }

    const ok = body.email === config.dev.email && (await checkPassword(body.password, config.dev.passwordHash))
    if (!ok) {
      const count = (entry?.count ?? 0) + 1
      failures.set(user.id, { count, lockedUntil: count >= MAX_FAILURES ? Date.now() + LOCK_MS : 0 })
      req.log.warn({ userId: user.id }, 'tentativa de acesso de desenvolvedor recusada')
      throw new HttpError(422, 'E-mail ou senha de desenvolvedor incorretos.', 'DEV_INVALID')
    }

    failures.delete(user.id)
    req.log.info({ userId: user.id }, 'acesso de desenvolvedor liberado')
    const devToken = app.jwt.sign({ sub: user.id, scope: 'dev' }, { expiresIn: DEV_TOKEN_TTL })
    return { devToken, tables: await tableStats() }
  })

  app.post('/dev/database', async (req) => {
    await requireDev(app, req)
    return { tables: await tableStats() }
  })

  /** Zera o banco inteiro (como `docker compose down -v`) e volta ao primeiro acesso. */
  app.post('/dev/database/reset', async (req) => {
    const user = await requireDev(app, req)
    z.object({ confirm: z.literal('APAGAR', 'Digite APAGAR para confirmar.') }).parse(req.body)

    const tables = await dataTables()
    await transaction(async (db) => {
      if (tables.length) {
        await db.query(`truncate table ${tables.map((t) => `public."${t}"`).join(', ')} restart identity cascade`)
      }
    })
    await clearUploads()
    await seedIfEmpty((m) => req.log.info(m))
    failures.clear()
    req.log.warn({ userId: user.id, tables: tables.length }, 'banco zerado pelo acesso de desenvolvedor')
    return { ok: true, tables: tables.length }
  })
}
