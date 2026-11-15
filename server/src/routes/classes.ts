import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { visibleClassIds } from '../lib/access.ts'
import { requireAdmin, requireUser } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { HttpError, notFound } from '../lib/errors.ts'

export const classColumns = `c.id, c.name, c.segment_id as "segmentId", c.segment_name as "segmentName", c.shift,
  c.room, c.capacity, c.tone, c.teacher_id as "teacherId", coalesce(t.name, 'A definir') as "teacherName",
  (select count(*)::int from students s where s.class_id = c.id and s.status <> 'inativo') as "studentCount"`

const segmentNames = { bercario: 'Berçário', maternal: 'Maternal', jardim: 'Jardim' } as const

const classSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da turma.'),
  segmentId: z.enum(['bercario', 'maternal', 'jardim']),
  /** Ex.: "Maternal II", "Berçário A". Se vazio, usa o nome do segmento. */
  segmentName: z.string().trim().optional(),
  shift: z.enum(['manha', 'tarde', 'integral']),
  room: z.string().trim().default(''),
  capacity: z.number().int().min(1).max(60),
  tone: z.enum(['aqua', 'sage', 'sun', 'coral', 'lilac']).default('aqua'),
  teacherId: z.uuid().nullable().optional(),
})

async function assertTeacher(teacherId?: string | null) {
  if (!teacherId) return
  const row = await queryOne('select 1 from users where id = $1 and role = $2', [teacherId, 'teacher'])
  if (!row) throw new HttpError(422, 'A professora escolhida não existe ou não tem perfil de professora.')
}

export async function classRoutes(app: FastifyInstance) {
  app.get('/classes', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleClassIds(user)
    return query(
      `select ${classColumns} from classes c left join users t on t.id = c.teacher_id
       where ($1::uuid[] is null or c.id = any($1)) order by c.segment_id, c.segment_name, c.name`,
      [ids],
    )
  })

  app.get<{ Params: { id: string } }>('/classes/:id', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleClassIds(user)
    if (ids && !ids.includes(req.params.id)) throw notFound('Turma')
    const row = await queryOne(`select ${classColumns} from classes c left join users t on t.id = c.teacher_id where c.id = $1`, [
      req.params.id,
    ])
    if (!row) throw notFound('Turma')
    return row
  })

  app.post('/classes', async (req) => {
    await requireAdmin(req)
    const b = classSchema.parse(req.body)
    await assertTeacher(b.teacherId)
    const row = await queryOne<{ id: string }>(
      `insert into classes (name, segment_id, segment_name, shift, room, capacity, tone, teacher_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [b.name, b.segmentId, b.segmentName || segmentNames[b.segmentId], b.shift, b.room, b.capacity, b.tone, b.teacherId ?? null],
    )
    return queryOne(`select ${classColumns} from classes c left join users t on t.id = c.teacher_id where c.id = $1`, [row!.id])
  })

  app.put<{ Params: { id: string } }>('/classes/:id', async (req) => {
    await requireAdmin(req)
    const b = classSchema.parse(req.body)
    await assertTeacher(b.teacherId)
    const row = await queryOne(
      `update classes set name=$2, segment_id=$3, segment_name=$4, shift=$5, room=$6, capacity=$7, tone=$8, teacher_id=$9
       where id=$1 returning id`,
      [req.params.id, b.name, b.segmentId, b.segmentName || segmentNames[b.segmentId], b.shift, b.room, b.capacity, b.tone, b.teacherId ?? null],
    )
    if (!row) throw notFound('Turma')
    return queryOne(`select ${classColumns} from classes c left join users t on t.id = c.teacher_id where c.id = $1`, [req.params.id])
  })

  app.delete<{ Params: { id: string } }>('/classes/:id', async (req, reply) => {
    await requireAdmin(req)
    const inUse = await queryOne<{ n: number }>(
      `select count(*)::int as n from students where class_id = $1 and status <> 'inativo'`,
      [req.params.id],
    )
    if (inUse && inUse.n > 0) throw new HttpError(422, `A turma tem ${inUse.n} criança(s) ativa(s). Transfira-as antes de excluir.`)
    await query('delete from classes where id = $1', [req.params.id])
    return reply.status(204).send()
  })
}
