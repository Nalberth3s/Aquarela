import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { notFound } from '../lib/errors.ts'

const status = z.enum(['novo', 'em_contato', 'visita_agendada', 'matriculado', 'arquivado'])

const leadColumns = `l.id, l.name, l.email, l.phone, l.status, l.notes, l.first_source as "firstSource",
  l.created_at as "createdAt", l.last_contact_at as "lastContactAt",
  (select count(*)::int from contact_messages m where m.lead_id = l.id) as "messageCount",
  (select count(*)::int from contact_messages m where m.lead_id = l.id and not m.read) as "unreadCount",
  (select count(*)::int from enrollment_requests e where e.lead_id = l.id) as "enrollmentCount",
  (select m.message from contact_messages m where m.lead_id = l.id order by m.created_at desc limit 1) as "lastMessage"`

/** Interessados (mini CRM): quem entrou em contato pelo site. Somente coordenação. */
export async function leadRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { status?: string; search?: string } }>('/admin/leads', async (req) => {
    await requireAdmin(req)
    const s = req.query.status ? status.parse(req.query.status) : null
    const term = req.query.search?.trim() || null
    return query(
      `select ${leadColumns} from leads l
        where ($1::text is null or l.status = $1)
          and ($2::text is null or unaccent_lower(l.name) like '%' || unaccent_lower($2) || '%'
               or lower(coalesce(l.email, '')) like '%' || lower($2) || '%'
               or l.phone_digits like '%' || regexp_replace($2, '\\D', '', 'g') || '%' and regexp_replace($2, '\\D', '', 'g') <> '')
        order by l.last_contact_at desc limit 500`,
      [s, term],
    )
  })

  /** Perfil completo: dados + todas as mensagens e pré-matrículas da pessoa. */
  app.get<{ Params: { id: string } }>('/admin/leads/:id', async (req) => {
    await requireAdmin(req)
    const lead = await queryOne(`select ${leadColumns} from leads l where l.id = $1`, [req.params.id])
    if (!lead) throw notFound('Interessado')
    const [messages, enrollments] = await Promise.all([
      query(
        `select id, name, email, phone, message, protocol, read, lead_id as "leadId", created_at as "createdAt"
           from contact_messages where lead_id = $1 order by created_at desc`,
        [req.params.id],
      ),
      query(
        `select id, created_at as "createdAt", status, guardian_name as "guardianName", email, phone, child_name as "childName",
                to_char(child_birth_date, 'YYYY-MM-DD') as "childBirthDate", preferred_shift as "preferredShift",
                how_did_you_hear as "howDidYouHear", message, wants_visit as "wantsVisit", suggested_segment as "suggestedSegment",
                lead_id as "leadId"
           from enrollment_requests where lead_id = $1 order by created_at desc`,
        [req.params.id],
      ),
    ])
    return { ...lead, messages, enrollments }
  })

  app.patch<{ Params: { id: string } }>('/admin/leads/:id', async (req) => {
    await requireAdmin(req)
    const b = z
      .object({
        name: z.string().trim().min(2).optional(),
        status: status.optional(),
        notes: z.string().max(5000).optional(),
      })
      .parse(req.body)
    const row = await queryOne(
      `update leads set name = coalesce($2, name), status = coalesce($3, status), notes = coalesce($4, notes)
        where id = $1 returning id`,
      [req.params.id, b.name ?? null, b.status ?? null, b.notes ?? null],
    )
    if (!row) throw notFound('Interessado')
    return queryOne(`select ${leadColumns} from leads l where l.id = $1`, [req.params.id])
  })

  /** Marca todas as mensagens da pessoa como lidas. */
  app.post<{ Params: { id: string } }>('/admin/leads/:id/read', async (req, reply) => {
    await requireAdmin(req)
    await query('update contact_messages set read = true where lead_id = $1', [req.params.id])
    return reply.status(204).send()
  })

  app.delete<{ Params: { id: string } }>('/admin/leads/:id', async (req, reply) => {
    await requireAdmin(req)
    await query('delete from contact_messages where lead_id = $1', [req.params.id])
    await query('delete from leads where id = $1', [req.params.id])
    return reply.status(204).send()
  })
}
