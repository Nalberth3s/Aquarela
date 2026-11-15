import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { assertCanViewStudent, visibleClassIds, visibleStudentIds } from '../lib/access.ts'
import { requireRole, requireStaff, requireUser, type SessionUser } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { forbidden, notFound } from '../lib/errors.ts'

const noticeSchema = z.object({
  title: z.string().trim().min(3, 'Informe o título.'),
  body: z.string().trim().min(5, 'Escreva o comunicado.'),
  category: z.enum(['aviso', 'evento', 'cardapio', 'pedagogico']),
  classId: z.uuid().nullable().optional(),
  pinned: z.boolean().default(false),
  rsvp: z
    .object({ eventDate: z.iso.date(), eventTime: z.string().optional(), location: z.string().optional() })
    .nullable()
    .optional(),
})

export async function communicationRoutes(app: FastifyInstance) {
  app.get('/notices', async (req) => {
    const user = await requireUser(req)
    const classIds = await visibleClassIds(user)
    return query(
      `select n.id, n.title, n.body, to_char(n.date, 'YYYY-MM-DD') as date, n.author_name as "authorName", n.category,
              n.class_id as "classId", n.pinned, n.rsvp, n.attachment_name as "attachmentName",
              exists(select 1 from notice_rsvps r where r.notice_id = n.id and r.user_id = $2) as "rsvpConfirmed"
       from notices n
       where n.class_id is null or $1::uuid[] is null or n.class_id = any($1)
       order by n.pinned desc, n.date desc, n.created_at desc limit 100`,
      [classIds, user.id],
    )
  })

  app.post('/notices', async (req) => {
    const user = await requireStaff(req)
    const b = noticeSchema.parse(req.body)
    if (user.role === 'teacher' && (!b.classId || !user.classIds?.includes(b.classId))) {
      throw forbidden('Professoras publicam comunicados apenas para as próprias turmas.')
    }
    const row = await queryOne<{ id: string }>(
      `insert into notices (title, body, author_name, category, class_id, pinned, rsvp) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
      [b.title, b.body, user.name, b.category, b.classId ?? null, b.pinned, b.rsvp ? JSON.stringify(b.rsvp) : null],
    )
    return { id: row!.id }
  })

  app.delete<{ Params: { id: string } }>('/notices/:id', async (req, reply) => {
    const user = await requireStaff(req)
    const notice = await queryOne<{ class_id: string | null }>('select class_id from notices where id = $1', [req.params.id])
    if (!notice) throw notFound('Comunicado')
    if (user.role === 'teacher' && (!notice.class_id || !user.classIds?.includes(notice.class_id))) throw forbidden()
    await query('delete from notices where id = $1', [req.params.id])
    return reply.status(204).send()
  })

  app.put<{ Params: { id: string } }>('/notices/:id/rsvp', async (req, reply) => {
    const user = await requireUser(req)
    const { confirmed } = z.object({ confirmed: z.boolean() }).parse(req.body)
    if (confirmed) {
      await query('insert into notice_rsvps (notice_id, user_id) values ($1,$2) on conflict do nothing', [req.params.id, user.id])
    } else {
      await query('delete from notice_rsvps where notice_id = $1 and user_id = $2', [req.params.id, user.id])
    }
    return reply.status(204).send()
  })

  /** Agenda da área interna: eventos publicados do calendário da escola. */
  app.get('/events', async (req) => {
    await requireUser(req)
    return query(
      `select id, title, to_char(date, 'YYYY-MM-DD') as date, time, summary as description, location
       from calendar_events where published and coalesce(end_date, date) >= current_date - 7 order by date limit 50`,
    )
  })

  // ---- Recados da família para a professora ----
  app.post('/messages', async (req) => {
    const user = await requireRole(req, ['guardian'])
    const b = z
      .object({
        studentId: z.uuid(),
        subject: z.enum(['saida_antecipada', 'alimentacao_remedio', 'outro']),
        message: z.string().trim().min(1, 'Escreva a mensagem do recado.'),
      })
      .parse(req.body)
    await assertCanViewStudent(user, b.studentId)
    await query('insert into teacher_messages (student_id, from_user_id, subject, message) values ($1,$2,$3,$4)', [
      b.studentId, user.id, b.subject, b.message,
    ])
    return { protocol: `RC${Date.now().toString().slice(-6)}` }
  })

  /** Equipe vê os recados das suas turmas; a família vê os das suas crianças (com status e respostas). */
  app.get('/messages', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    return query(
      `select m.id, m.subject, m.message, m.read, m.read_at as "readAt", m.read_by_name as "readByName",
              m.created_at as "createdAt", s.id as "studentId", s.name as "studentName",
              coalesce(u.name, 'Responsável') as "fromName",
              coalesce((select json_agg(json_build_object('id', r.id, 'authorName', r.author_name, 'fromFamily', r.from_family,
                  'body', r.body, 'read', r.read, 'createdAt', r.created_at) order by r.created_at)
                from message_replies r where r.message_id = m.id), '[]') as replies
       from teacher_messages m join students s on s.id = m.student_id left join users u on u.id = m.from_user_id
       where $1::uuid[] is null or m.student_id = any($1)
       order by greatest(m.created_at, (select max(r.created_at) from message_replies r where r.message_id = m.id)) desc
       limit 50`,
      [ids],
    )
  })

  async function loadMessageFor(user: SessionUser, id: string) {
    const row = await queryOne<{ student_id: string }>('select student_id from teacher_messages where id = $1', [id])
    if (!row) throw notFound('Recado')
    await assertCanViewStudent(user, row.student_id)
  }

  /** Abrir o recado: equipe marca como visto (a família passa a ver "Visto por…"); cada lado marca as respostas do outro como lidas. */
  app.post<{ Params: { id: string } }>('/messages/:id/read', async (req, reply) => {
    const user = await requireUser(req)
    await loadMessageFor(user, req.params.id)
    const family = user.role === 'guardian'
    if (!family) {
      await query(
        `update teacher_messages set read = true, read_at = coalesce(read_at, now()), read_by_name = coalesce(read_by_name, $2)
         where id = $1`,
        [req.params.id, user.name],
      )
    }
    await query('update message_replies set read = true where message_id = $1 and from_family = $2 and not read', [
      req.params.id,
      !family,
    ])
    return reply.status(204).send()
  })

  app.post<{ Params: { id: string } }>('/messages/:id/replies', async (req, reply) => {
    const user = await requireUser(req)
    await loadMessageFor(user, req.params.id)
    const b = z.object({ body: z.string().trim().min(1, 'Escreva a resposta.').max(2000) }).parse(req.body)
    const family = user.role === 'guardian'
    await query(
      'insert into message_replies (message_id, author_id, author_name, from_family, body) values ($1,$2,$3,$4,$5)',
      [req.params.id, user.id, user.name, family, b.body],
    )
    // Quem responde já leu tudo do outro lado.
    if (!family) {
      await query(
        `update teacher_messages set read = true, read_at = coalesce(read_at, now()), read_by_name = coalesce(read_by_name, $2)
         where id = $1`,
        [req.params.id, user.name],
      )
    }
    await query('update message_replies set read = true where message_id = $1 and from_family = $2 and not read', [
      req.params.id,
      !family,
    ])
    return reply.status(204).send()
  })
}
