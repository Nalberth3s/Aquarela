import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { assertCanViewStudent, visibleStudentIds } from '../lib/access.ts'
import { requireStaff, requireUser, type SessionUser } from '../lib/auth.ts'
import { query, queryOne, transaction } from '../lib/db.ts'
import { notFound } from '../lib/errors.ts'

const logColumns = `l.id, l.student_id as "studentId", to_char(l.date, 'YYYY-MM-DD') as date, l.author_name as "authorName",
  l.status, l.updated_at as "updatedAt", l.read_by_guardian as "readByGuardian", l.participation, l.interaction, l.meals,
  l.rest, l.rest_minutes as "restMinutes", l.day_note as "dayNote", l.internal_note as "internalNote", l.photos,
  l.activity, l.mood`

const summary = z.object({ title: z.string().trim().min(1), detail: z.string().trim().default('') }).nullable().optional()

const logSchema = z.object({
  studentId: z.uuid(),
  date: z.iso.date(),
  participation: z.enum(['excelente', 'boa', 'em_desenvolvimento']).nullable().optional(),
  interaction: z.enum(['colaborativa', 'normal', 'com_mediacao']).nullable().optional(),
  meals: z.enum(['comeu_tudo', 'comeu_bem', 'pouco_apetite']).nullable().optional(),
  rest: z.enum(['dormiu', 'relaxou', 'agitada']).nullable().optional(),
  restMinutes: z.number().int().min(0).max(600).nullable().optional(),
  dayNote: z.string().default(''),
  internalNote: z.string().nullable().optional(),
  photos: z
    .array(z.object({ id: z.string(), url: z.string(), title: z.string(), caption: z.string().optional(), time: z.string() }))
    .default([]),
  activity: summary,
  mood: summary,
})

/** Famílias recebem só registros enviados e sem a observação interna. */
function forViewer<T extends { internalNote?: unknown }>(user: SessionUser, rows: T[]): T[] {
  return user.role === 'guardian' ? rows.map((r) => ({ ...r, internalNote: undefined })) : rows
}

export async function diaryRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { studentId?: string; date?: string } }>('/diary', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    const rows = await query<{ internalNote?: string }>(
      `select ${logColumns} from daily_logs l
       where ($1::uuid[] is null or l.student_id = any($1))
         and ($2::uuid is null or l.student_id = $2)
         and ($3::date is null or l.date = $3)
         and ($4::boolean = false or l.status = 'enviado')
       order by l.updated_at desc limit 300`,
      [ids, req.query.studentId || null, req.query.date || null, user.role === 'guardian'],
    )
    return forViewer(user, rows)
  })

  app.get<{ Params: { id: string } }>('/diary/:id', async (req) => {
    const user = await requireUser(req)
    const row = await queryOne<{ studentId: string; status: string; internalNote?: string }>(
      `select ${logColumns} from daily_logs l where l.id = $1`,
      [req.params.id],
    )
    if (!row || (user.role === 'guardian' && row.status !== 'enviado')) throw notFound('Registro')
    await assertCanViewStudent(user, row.studentId)
    return forViewer(user, [row])[0]
  })

  /** Cria ou atualiza o registro da criança na data (um por dia). */
  app.put<{ Querystring: { status?: string } }>('/diary', async (req) => {
    const user = await requireStaff(req)
    const status = z.enum(['rascunho', 'enviado']).parse(req.query.status)
    const b = logSchema.parse(req.body)
    await assertCanViewStudent(user, b.studentId)
    const row = await queryOne<{ id: string }>(
      `insert into daily_logs (student_id, date, author_id, author_name, status, participation, interaction, meals, rest,
         rest_minutes, day_note, internal_note, photos, activity, mood, read_by_guardian, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,false,now())
       on conflict (student_id, date) do update set author_id=excluded.author_id, author_name=excluded.author_name,
         status=excluded.status, participation=excluded.participation, interaction=excluded.interaction,
         meals=excluded.meals, rest=excluded.rest, rest_minutes=excluded.rest_minutes, day_note=excluded.day_note,
         internal_note=excluded.internal_note, photos=excluded.photos, activity=excluded.activity, mood=excluded.mood,
         read_by_guardian=false, updated_at=now()
       returning id`,
      [b.studentId, b.date, user.id, user.name, status, b.participation ?? null, b.interaction ?? null, b.meals ?? null,
        b.rest ?? null, b.restMinutes ?? null, b.dayNote, b.internalNote ?? null, JSON.stringify(b.photos),
        b.activity ? JSON.stringify(b.activity) : null, b.mood ? JSON.stringify(b.mood) : null],
    )
    return queryOne(`select ${logColumns} from daily_logs l where l.id = $1`, [row!.id])
  })

  app.post<{ Params: { id: string } }>('/diary/:id/read', async (req, reply) => {
    const user = await requireUser(req)
    const row = await queryOne<{ student_id: string }>('select student_id from daily_logs where id = $1', [req.params.id])
    if (!row) throw notFound('Registro')
    await assertCanViewStudent(user, row.student_id)
    if (user.role === 'guardian') await query('update daily_logs set read_by_guardian = true where id = $1', [req.params.id])
    return reply.status(204).send()
  })

  // ---- Chamada do dia ----
  app.get<{ Params: { date: string } }>('/rollcall/:date', async (req) => {
    const user = await requireStaff(req)
    const date = z.iso.date().parse(req.params.date)
    const ids = await visibleStudentIds(user)
    return query(
      `select s.id as "studentId", coalesce(r.present, true) as present
       from students s left join roll_calls r on r.student_id = s.id and r.date = $2
       where s.status <> 'inativo' and ($1::uuid[] is null or s.id = any($1)) order by s.name`,
      [ids, date],
    )
  })

  app.put<{ Params: { date: string } }>('/rollcall/:date', async (req, reply) => {
    const user = await requireStaff(req)
    const date = z.iso.date().parse(req.params.date)
    const entries = z.array(z.object({ studentId: z.uuid(), present: z.boolean() })).parse(req.body)
    const ids = await visibleStudentIds(user)
    await transaction(async (db) => {
      for (const e of entries) {
        if (ids && !ids.includes(e.studentId)) continue
        await db.query(
          `insert into roll_calls (date, student_id, present, recorded_by) values ($1,$2,$3,$4)
           on conflict (date, student_id) do update set present = excluded.present, recorded_by = excluded.recorded_by`,
          [date, e.studentId, e.present, user.id],
        )
      }
    })
    return reply.status(204).send()
  })

  /** "Atividades recentes da escola": resumo dos diários enviados hoje por turma. */
  app.get('/feed', async (req) => {
    const user = await requireStaff(req)
    const ids = await visibleStudentIds(user)
    const rows = await query<{
      classId: string | null
      segmentName: string | null
      className: string | null
      authors: string
      total: number
      read: number
      photos: number
      lastAt: string
    }>(
      `select c.id as "classId", c.segment_name as "segmentName", c.name as "className",
              string_agg(distinct l.author_name, ', ') as authors, count(*)::int as total,
              count(*) filter (where l.read_by_guardian)::int as read,
              coalesce(sum(jsonb_array_length(l.photos)), 0)::int as photos, max(l.updated_at) as "lastAt"
       from daily_logs l join students s on s.id = l.student_id left join classes c on c.id = s.class_id
       where l.date = current_date and l.status = 'enviado' and ($1::uuid[] is null or l.student_id = any($1))
       group by c.id order by max(l.updated_at) desc`,
      [ids],
    )
    return rows.map((r) => ({
      id: r.classId ?? 'sem-turma',
      icon: r.photos > 0 ? 'arte' : 'leitura',
      title: `Diário de Bordo · ${r.segmentName ?? 'Sem turma'}${r.className ? ` (${r.className})` : ''}`,
      time: new Date(r.lastAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
      description: `${r.authors} registrou o diário de ${r.total} ${r.total === 1 ? 'criança' : 'crianças'}${r.photos ? ` com ${r.photos} foto(s)` : ''}.`,
      status: r.read === r.total ? 'Todas as famílias leram' : 'Entregue às famílias',
      meta: `${r.read} de ${r.total} leituras confirmadas`,
    }))
  })
}
