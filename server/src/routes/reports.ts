import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { assertCanViewStudent, visibleStudentIds } from '../lib/access.ts'
import { requireStaff, requireUser } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { notFound } from '../lib/errors.ts'

const reportColumns = `r.id, r.student_id as "studentId", r.period, to_char(r.created_at, 'YYYY-MM-DD') as "createdAt",
  r.author_name as "authorName", r.status, r.summary, r.assessments, r.highlights, r.next_steps as "nextSteps"`

const field = z.enum(['eu_outro_nos', 'corpo_gestos', 'tracos_sons_cores', 'escuta_fala', 'espacos_tempos'])

const reportSchema = z.object({
  studentId: z.uuid(),
  period: z.string().trim().min(3, 'Informe o período (ex.: 2º semestre de 2026).'),
  status: z.enum(['rascunho', 'publicado']),
  summary: z.string().trim().min(10, 'Escreva o parecer geral.'),
  assessments: z
    .array(z.object({ field, level: z.number().int().min(1).max(4), comment: z.string().trim().default('') }))
    .length(5, 'Avalie os cinco campos de experiência.'),
  highlights: z.array(z.string().trim().min(1)).default([]),
  nextSteps: z.array(z.string().trim().min(1)).default([]),
})

export async function reportRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { studentId?: string; status?: string } }>('/reports', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    return query(
      `select ${reportColumns} from development_reports r
       where ($1::uuid[] is null or r.student_id = any($1)) and ($2::uuid is null or r.student_id = $2)
         and ($3::text is null or r.status = $3) and ($4::boolean = false or r.status = 'publicado')
       order by r.created_at desc`,
      [ids, req.query.studentId || null, req.query.status || null, user.role === 'guardian'],
    )
  })

  app.get<{ Params: { id: string } }>('/reports/:id', async (req) => {
    const user = await requireUser(req)
    const row = await queryOne<{ studentId: string; status: string }>(
      `select ${reportColumns} from development_reports r where r.id = $1`,
      [req.params.id],
    )
    if (!row || (user.role === 'guardian' && row.status !== 'publicado')) throw notFound('Relatório')
    await assertCanViewStudent(user, row.studentId)
    return row
  })

  app.post('/reports', async (req) => {
    const user = await requireStaff(req)
    const b = reportSchema.parse(req.body)
    await assertCanViewStudent(user, b.studentId)
    const row = await queryOne<{ id: string }>(
      `insert into development_reports (student_id, period, author_name, status, summary, assessments, highlights, next_steps)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [b.studentId, b.period, user.name, b.status, b.summary, JSON.stringify(b.assessments), b.highlights, b.nextSteps],
    )
    return queryOne(`select ${reportColumns} from development_reports r where r.id = $1`, [row!.id])
  })

  app.put<{ Params: { id: string } }>('/reports/:id', async (req) => {
    const user = await requireStaff(req)
    const b = reportSchema.parse(req.body)
    await assertCanViewStudent(user, b.studentId)
    const row = await queryOne(
      `update development_reports set period=$2, status=$3, summary=$4, assessments=$5, highlights=$6, next_steps=$7,
         author_name=$8 where id=$1 returning id`,
      [req.params.id, b.period, b.status, b.summary, JSON.stringify(b.assessments), b.highlights, b.nextSteps, user.name],
    )
    if (!row) throw notFound('Relatório')
    return queryOne(`select ${reportColumns} from development_reports r where r.id = $1`, [req.params.id])
  })

  app.get<{ Querystring: { studentId?: string } }>('/observations', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    return query(
      `select id, student_id as "studentId", to_char(date, 'YYYY-MM-DD') as date, author_name as "authorName", kind, field, text
       from observations where ($1::uuid[] is null or student_id = any($1)) and ($2::uuid is null or student_id = $2)
       order by date desc limit 100`,
      [ids, req.query.studentId || null],
    )
  })

  app.get<{ Params: { id: string } }>('/students/:id/milestones', async (req) => {
    const user = await requireUser(req)
    await assertCanViewStudent(user, req.params.id)
    return query(
      `select id, student_id as "studentId", month, status, title, description from milestones
       where student_id = $1 order by sort_order desc`,
      [req.params.id],
    )
  })
}
