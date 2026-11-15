import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { assertCanViewStudent, visibleStudentIds } from '../lib/access.ts'
import { hashPassword, requireAdmin, requireUser, temporaryPassword } from '../lib/auth.ts'
import { query, queryOne, transaction } from '../lib/db.ts'
import { HttpError, notFound } from '../lib/errors.ts'

/** Aluno no formato do front-end (tipo Student), com responsáveis agregados. */
export const studentSelect = `select s.id, s.name, s.birth_date as "birthDate", s.class_id as "classId", s.shift, s.status,
  s.enrolled_at as "enrolledAt", s.photo_url as "photoUrl", s.authorized_pickup as "authorizedPickup",
  json_build_object('allergies', s.allergies, 'dietaryRestrictions', s.dietary_restrictions, 'notes', s.health_notes) as health,
  coalesce((select json_agg(json_build_object('id', g.id, 'name', g.name, 'relationship', g.relationship, 'phone', g.phone,
      'email', g.email, 'userId', g.user_id) order by g.sort_order) from guardians g where g.student_id = s.id), '[]') as guardians
  from students s`

const guardianSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, 'Informe o nome do responsável.'),
  relationship: z.string().trim().min(2, 'Informe o parentesco.'),
  phone: z.string().trim().min(8, 'Informe o telefone do responsável.'),
  email: z.union([z.email('E-mail do responsável inválido.'), z.literal('')]).optional().nullable(),
})

const studentSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome completo da criança.'),
  birthDate: z.iso.date('Data de nascimento inválida.'),
  classId: z.uuid().nullable(),
  shift: z.enum(['manha', 'tarde', 'integral']),
  status: z.enum(['ativo', 'em_adaptacao', 'inativo']),
  enrolledAt: z.iso.date().optional(),
  photoUrl: z.string().nullable().optional(),
  authorizedPickup: z.array(z.string().trim().min(1)).default([]),
  health: z.object({
    allergies: z.array(z.string().trim().min(1)).default([]),
    dietaryRestrictions: z.array(z.string().trim().min(1)).default([]),
    notes: z.string().nullable().optional(),
  }),
  guardians: z.array(guardianSchema).min(1, 'Cadastre pelo menos um responsável.'),
})

type StudentInput = z.infer<typeof studentSchema>

async function saveGuardians(db: import('pg').PoolClient, studentId: string, guardians: StudentInput['guardians']) {
  const keep = guardians.filter((g) => g.id).map((g) => g.id)
  await db.query('delete from guardians where student_id = $1 and not (id = any($2::uuid[]))', [studentId, keep])
  for (const [i, g] of guardians.entries()) {
    if (g.id) {
      await db.query('update guardians set name=$2, relationship=$3, phone=$4, email=$5, sort_order=$6 where id=$1 and student_id=$7', [
        g.id, g.name, g.relationship, g.phone, g.email || null, i, studentId,
      ])
    } else {
      await db.query('insert into guardians (student_id, name, relationship, phone, email, sort_order) values ($1,$2,$3,$4,$5,$6)', [
        studentId, g.name, g.relationship, g.phone, g.email || null, i,
      ])
    }
  }
}

export async function studentRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { search?: string; classId?: string; status?: string } }>('/students', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    const { search, classId, status } = req.query
    return query(
      `${studentSelect}
       where ($1::uuid[] is null or s.id = any($1))
         and ($2::uuid is null or s.class_id = $2)
         and ($3::text is null or s.status = $3)
         and ($4::text is null or unaccent_lower(s.name) like '%' || unaccent_lower($4) || '%')
       order by s.name`,
      [ids, classId || null, status || null, search?.trim() || null],
    )
  })

  app.get<{ Params: { id: string } }>('/students/:id', async (req) => {
    const user = await requireUser(req)
    await assertCanViewStudent(user, req.params.id)
    return queryOne(`${studentSelect} where s.id = $1`, [req.params.id])
  })

  app.post('/students', async (req) => {
    await requireAdmin(req)
    const b = studentSchema.parse(req.body)
    const id = await transaction(async (db) => {
      const { rows } = await db.query(
        `insert into students (name, birth_date, class_id, shift, status, enrolled_at, photo_url, allergies,
           dietary_restrictions, health_notes, authorized_pickup)
         values ($1,$2,$3,$4,$5,coalesce($6::date, current_date),$7,$8,$9,$10,$11) returning id`,
        [b.name, b.birthDate, b.classId, b.shift, b.status, b.enrolledAt ?? null, b.photoUrl ?? null,
          b.health.allergies, b.health.dietaryRestrictions, b.health.notes ?? null, b.authorizedPickup],
      )
      await saveGuardians(db, rows[0].id, b.guardians)
      return rows[0].id as string
    })
    return queryOne(`${studentSelect} where s.id = $1`, [id])
  })

  app.put<{ Params: { id: string } }>('/students/:id', async (req) => {
    await requireAdmin(req)
    const b = studentSchema.parse(req.body)
    await transaction(async (db) => {
      const { rowCount } = await db.query(
        `update students set name=$2, birth_date=$3, class_id=$4, shift=$5, status=$6,
           enrolled_at=coalesce($7::date, enrolled_at), photo_url=$8, allergies=$9, dietary_restrictions=$10,
           health_notes=$11, authorized_pickup=$12 where id=$1`,
        [req.params.id, b.name, b.birthDate, b.classId, b.shift, b.status, b.enrolledAt ?? null, b.photoUrl ?? null,
          b.health.allergies, b.health.dietaryRestrictions, b.health.notes ?? null, b.authorizedPickup],
      )
      if (!rowCount) throw notFound('Aluno')
      await saveGuardians(db, req.params.id, b.guardians)
    })
    return queryOne(`${studentSelect} where s.id = $1`, [req.params.id])
  })

  app.delete<{ Params: { id: string } }>('/students/:id', async (req, reply) => {
    await requireAdmin(req)
    await query('delete from students where id = $1', [req.params.id])
    return reply.status(204).send()
  })

  /**
   * Cria (ou vincula) o acesso do responsável ao Portal da Família.
   * Se já existir conta com o mesmo e-mail, apenas vincula a criança.
   */
  app.post<{ Params: { id: string; guardianId: string } }>('/students/:id/guardians/:guardianId/access', async (req) => {
    await requireAdmin(req)
    const g = await queryOne<{ name: string; email: string | null; user_id: string | null }>(
      'select name, email, user_id from guardians where id = $1 and student_id = $2',
      [req.params.guardianId, req.params.id],
    )
    if (!g) throw notFound('Responsável')
    if (!g.email) throw new HttpError(422, 'Cadastre o e-mail do responsável antes de criar o acesso.')
    if (g.user_id) throw new HttpError(409, 'Este responsável já tem acesso ao Portal da Família.')

    const email = g.email.toLowerCase()
    const existing = await queryOne<{ id: string; role: string }>('select id, role from users where email = $1', [email])
    if (existing && existing.role !== 'guardian') throw new HttpError(409, 'Este e-mail já pertence a uma conta da equipe.')

    let password: string | null = null
    let userId = existing?.id
    if (!userId) {
      password = temporaryPassword()
      const row = await queryOne<{ id: string }>(
        `insert into users (name, email, password_hash, role, must_change_password) values ($1,$2,$3,'guardian',true) returning id`,
        [g.name, email, await hashPassword(password)],
      )
      userId = row!.id
    }
    await query('update guardians set user_id = $1 where id = $2', [userId, req.params.guardianId])
    return { email, temporaryPassword: password, linkedExisting: !password }
  })

  /** Frequência mensal calculada a partir da chamada do dia. */
  app.get<{ Params: { id: string } }>('/students/:id/attendance', async (req) => {
    const user = await requireUser(req)
    await assertCanViewStudent(user, req.params.id)
    const rows = await query<{ month: string; present: number; schoolDays: number }>(
      `select to_char(date_trunc('month', date), 'YYYY-MM') as month,
              count(*) filter (where present)::int as present, count(*)::int as "schoolDays"
       from roll_calls where student_id = $1 and date >= (current_date - interval '5 months')
       group by 1 order by 1`,
      [req.params.id],
    )
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return rows.map((r) => ({ ...r, month: names[Number(r.month.slice(5)) - 1] }))
  })
}
