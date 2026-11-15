import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../lib/auth.ts'
import { query, queryOne, transaction } from '../lib/db.ts'
import { upsertLead } from '../lib/leads.ts'
import { notFound } from '../lib/errors.ts'

const columns = `id, created_at as "createdAt", status, guardian_name as "guardianName", email, phone,
  child_name as "childName", to_char(child_birth_date, 'YYYY-MM-DD') as "childBirthDate", preferred_shift as "preferredShift",
  how_did_you_hear as "howDidYouHear", message, wants_visit as "wantsVisit", suggested_segment as "suggestedSegment",
  lead_id as "leadId"`

function suggestSegment(birthDate: string): string {
  const b = new Date(`${birthDate}T12:00:00`)
  const now = new Date()
  const months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth()
  if (months < 4) return 'A partir de 4 meses'
  if (months < 24) return 'Berçário'
  if (months < 48) return 'Maternal'
  if (months < 72) return 'Jardim'
  return 'Acima da faixa da Educação Infantil'
}

/** Pré-matrículas: envio público pelo site, gestão pela coordenação. */
export async function enrollmentRoutes(app: FastifyInstance) {
  app.post('/enrollments', async (req) => {
    const b = z
      .object({
        guardianName: z.string().trim().min(2, 'Informe seu nome.'),
        email: z.email('E-mail inválido.'),
        phone: z.string().trim().min(10, 'Informe um telefone com DDD.'),
        childName: z.string().trim().min(2, 'Informe o nome da criança.'),
        childBirthDate: z.iso.date('Data de nascimento inválida.'),
        preferredShift: z.enum(['manha', 'tarde', 'integral']),
        howDidYouHear: z.string().optional(),
        message: z.string().optional(),
        wantsVisit: z.boolean().default(false),
      })
      .parse(req.body)
    return transaction(async (db) => {
      const leadId = await upsertLead(db, { name: b.guardianName, email: b.email, phone: b.phone, source: 'pre_matricula' })
      const { rows } = await db.query(
        `insert into enrollment_requests (guardian_name, email, phone, child_name, child_birth_date, preferred_shift,
           how_did_you_hear, message, wants_visit, suggested_segment, lead_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         returning ${columns}`,
        [b.guardianName, b.email, b.phone, b.childName, b.childBirthDate, b.preferredShift, b.howDidYouHear || null,
          b.message || null, b.wantsVisit, suggestSegment(b.childBirthDate), leadId],
      )
      return rows[0]
    })
  })

  app.get('/enrollments', async (req) => {
    await requireAdmin(req)
    return query(`select ${columns} from enrollment_requests order by created_at desc`)
  })

  app.patch<{ Params: { id: string } }>('/enrollments/:id', async (req) => {
    await requireAdmin(req)
    const { status } = z
      .object({ status: z.enum(['novo', 'em_contato', 'visita_agendada', 'matriculado', 'arquivado']) })
      .parse(req.body)
    const row = await queryOne(`update enrollment_requests set status = $2 where id = $1 returning ${columns}`, [req.params.id, status])
    if (!row) throw notFound('Pedido')
    return row
  })
}
