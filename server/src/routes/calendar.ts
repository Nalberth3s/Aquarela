import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { notFound } from '../lib/errors.ts'

const columns = `id, title, category, to_char(date, 'YYYY-MM-DD') as date, to_char(end_date, 'YYYY-MM-DD') as "endDate",
  time, location, summary, description, what_to_bring as "whatToBring", audience, image_url as "imageUrl", featured,
  published, updated_at as "updatedAt"`

const optionalText = z.string().trim().optional().nullable().transform((v) => v || null)

const eventSchema = z
  .object({
    title: z.string().trim().min(2, 'Informe o nome do evento.'),
    category: z.enum(['festa', 'comemorativa', 'cultural', 'passeio', 'reuniao', 'feriado', 'ferias']),
    date: z.iso.date('Informe a data do evento.'),
    endDate: z.iso.date().optional().nullable().or(z.literal('')).transform((v) => v || null),
    time: optionalText,
    location: optionalText,
    summary: z.string().trim().min(3, 'Escreva uma frase curta sobre o evento.').max(160),
    description: z.string().trim().default(''),
    whatToBring: z.array(z.string().trim().min(1)).default([]),
    audience: optionalText,
    imageUrl: optionalText,
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
  })
  .refine((e) => !e.endDate || e.endDate >= e.date, { message: 'A data final deve ser depois da inicial.', path: ['endDate'] })

type EventInput = z.infer<typeof eventSchema>
const values = (e: EventInput) => [
  e.title, e.category, e.date, e.endDate, e.time, e.location, e.summary, e.description || e.summary, e.whatToBring,
  e.audience, e.imageUrl, e.featured, e.published,
]

/** Calendário público: leitura aberta, edição pela coordenação. */
export async function calendarRoutes(app: FastifyInstance) {
  app.get('/calendar', async () => query(`select ${columns} from calendar_events where published order by date`))

  app.get<{ Params: { id: string } }>('/calendar/:id', async (req) => {
    const row = await queryOne(`select ${columns} from calendar_events where id = $1 and published`, [req.params.id])
    if (!row) throw notFound('Evento')
    return row
  })

  app.get('/admin/calendar', async (req) => {
    await requireAdmin(req)
    return query(`select ${columns} from calendar_events order by date`)
  })

  app.get<{ Params: { id: string } }>('/admin/calendar/:id', async (req) => {
    await requireAdmin(req)
    const row = await queryOne(`select ${columns} from calendar_events where id = $1`, [req.params.id])
    if (!row) throw notFound('Evento')
    return row
  })

  app.post('/admin/calendar', async (req) => {
    await requireAdmin(req)
    const e = eventSchema.parse(req.body)
    return queryOne(
      `insert into calendar_events (title, category, date, end_date, time, location, summary, description, what_to_bring,
         audience, image_url, featured, published) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning ${columns}`,
      values(e),
    )
  })

  app.put<{ Params: { id: string } }>('/admin/calendar/:id', async (req) => {
    await requireAdmin(req)
    const e = eventSchema.parse(req.body)
    const row = await queryOne(
      `update calendar_events set title=$2, category=$3, date=$4, end_date=$5, time=$6, location=$7, summary=$8,
         description=$9, what_to_bring=$10, audience=$11, image_url=$12, featured=$13, published=$14, updated_at=now()
       where id=$1 returning ${columns}`,
      [req.params.id, ...values(e)],
    )
    if (!row) throw notFound('Evento')
    return row
  })

  app.delete<{ Params: { id: string } }>('/admin/calendar/:id', async (req, reply) => {
    await requireAdmin(req)
    await query('delete from calendar_events where id = $1', [req.params.id])
    return reply.status(204).send()
  })
}
