import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../lib/auth.ts'
import { query, queryOne, transaction } from '../lib/db.ts'
import { upsertLead } from '../lib/leads.ts'
import { notFound } from '../lib/errors.ts'

const CONTENT_KEYS = ['segments', 'activities', 'structure', 'routine', 'pillars', 'values', 'faq', 'media'] as const
const tone = z.enum(['aqua', 'sage', 'sun', 'coral', 'lilac'])

const teamSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome.'),
  role: z.string().trim().min(2, 'Informe a função.'),
  bio: z.string().trim().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  tone: tone.default('aqua'),
  sortOrder: z.number().int().default(0),
  visible: z.boolean().default(true),
})

const teamColumns = `id, name, role, bio, photo_url as "photoUrl", tone, sort_order as "sortOrder", visible`

/** Conteúdo público do site + gestão da equipe e dos dados da escola. */
export async function schoolRoutes(app: FastifyInstance) {
  app.get('/school/info', async () => {
    const row = await queryOne<{ info: unknown }>('select info from school_settings where id = 1')
    return row?.info ?? {}
  })

  app.put('/school/info', async (req) => {
    await requireAdmin(req)
    const info = z.record(z.string(), z.unknown()).parse(req.body)
    await query('update school_settings set info = info || $1::jsonb, updated_at = now() where id = 1', [info])
    return (await queryOne<{ info: unknown }>('select info from school_settings where id = 1'))?.info
  })

  app.get<{ Params: { key: string } }>('/school/content/:key', async (req) => {
    const key = z.enum(CONTENT_KEYS).parse(req.params.key)
    const row = await queryOne<{ data: unknown }>('select data from site_content where key = $1', [key])
    return row?.data ?? []
  })

  app.put<{ Params: { key: string } }>('/school/content/:key', async (req) => {
    await requireAdmin(req)
    const key = z.enum(CONTENT_KEYS).parse(req.params.key)
    const data = z.array(z.record(z.string(), z.unknown())).parse(req.body)
    await query(
      `insert into site_content (key, data) values ($1, $2)
       on conflict (key) do update set data = excluded.data, updated_at = now()`,
      [key, JSON.stringify(data)],
    )
    return data
  })

  // ---- Equipe exibida no site ----
  app.get('/school/team', async () =>
    query(`select ${teamColumns} from team_members where visible order by sort_order, name`),
  )

  app.get('/admin/team', async (req) => {
    await requireAdmin(req)
    return query(`select ${teamColumns} from team_members order by sort_order, name`)
  })

  app.post('/admin/team', async (req) => {
    await requireAdmin(req)
    const m = teamSchema.parse(req.body)
    return queryOne(
      `insert into team_members (name, role, bio, photo_url, tone, sort_order, visible)
       values ($1,$2,$3,$4,$5,$6,$7) returning ${teamColumns}`,
      [m.name, m.role, m.bio ?? null, m.photoUrl ?? null, m.tone, m.sortOrder, m.visible],
    )
  })

  app.put<{ Params: { id: string } }>('/admin/team/:id', async (req) => {
    await requireAdmin(req)
    const m = teamSchema.parse(req.body)
    const row = await queryOne(
      `update team_members set name=$2, role=$3, bio=$4, photo_url=$5, tone=$6, sort_order=$7, visible=$8
       where id = $1 returning ${teamColumns}`,
      [req.params.id, m.name, m.role, m.bio ?? null, m.photoUrl ?? null, m.tone, m.sortOrder, m.visible],
    )
    if (!row) throw notFound('Profissional')
    return row
  })

  app.delete<{ Params: { id: string } }>('/admin/team/:id', async (req, reply) => {
    await requireAdmin(req)
    await query('delete from team_members where id = $1', [req.params.id])
    return reply.status(204).send()
  })

  // ---- Fale conosco ----
  app.post('/contact', async (req) => {
    const body = z
      .object({
        name: z.string().trim().min(2, 'Informe seu nome.'),
        email: z.email('E-mail inválido.'),
        phone: z.string().optional().default(''),
        message: z.string().trim().min(10, 'Mensagem muito curta.'),
      })
      .parse(req.body)
    const protocol = `CT${Date.now().toString().slice(-6)}`
    await transaction(async (db) => {
      const leadId = await upsertLead(db, { name: body.name, email: body.email, phone: body.phone, source: 'contato' })
      await db.query(
        'insert into contact_messages (name, email, phone, message, protocol, lead_id) values ($1,$2,$3,$4,$5,$6)',
        [body.name, body.email, body.phone, body.message, protocol, leadId],
      )
    })
    return { protocol }
  })

  app.get('/admin/contact-messages', async (req) => {
    await requireAdmin(req)
    return query(
      `select id, name, email, phone, message, protocol, read, lead_id as "leadId", created_at as "createdAt"
       from contact_messages order by created_at desc limit 500`,
    )
  })

  app.patch<{ Params: { id: string } }>('/admin/contact-messages/:id', async (req, reply) => {
    await requireAdmin(req)
    const { read } = z.object({ read: z.boolean() }).parse(req.body)
    const row = await queryOne('update contact_messages set read =  where id =  returning id', [req.params.id, read])
    if (!row) throw notFound('Mensagem')
    return reply.status(204).send()
  })

  app.delete<{ Params: { id: string } }>('/admin/contact-messages/:id', async (req, reply) => {
    await requireAdmin(req)
    await query('delete from contact_messages where id = ', [req.params.id])
    return reply.status(204).send()
  })
}
