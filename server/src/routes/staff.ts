import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../lib/auth.ts'
import { query, queryOne } from '../lib/db.ts'
import { HttpError, notFound } from '../lib/errors.ts'
import { assertCpfFree, cpfField, phoneField } from './users.ts'

const staffColumns = `u.id, u.name, u.email, u.role, u.active, u.must_change_password as "mustChangePassword",
  u.phone, u.cpf, u.birth_date::text as "birthDate", u.job_title as "jobTitle", u.hire_date::text as "hireDate",
  u.address, u.emergency_contact as "emergencyContact", u.staff_notes as notes,
  u.last_login_at as "lastLoginAt", u.created_at as "createdAt",
  coalesce((select array_agg(c.name order by c.name) from classes c where c.teacher_id = u.id), '{}') as "classNames",
  (select count(*)::int from students s join classes c on c.id = s.class_id
     where c.teacher_id = u.id and s.status <> 'inativo') as "studentCount",
  (select count(*)::int from daily_logs d where d.author_id = u.id and d.date >= current_date - 30) as "diaries30d",
  (select max(d.updated_at) from daily_logs d where d.author_id = u.id) as "lastDiaryAt"`

const optionalText = z.string().trim().optional().transform((v) => v || null)
const optionalDate = z.iso.date().optional().or(z.literal('')).transform((v) => v || null)

/** Funcionárias (professoras e coordenação): ficha e acompanhamento. Somente administração. */
export async function staffRoutes(app: FastifyInstance) {
  app.get('/staff', async (req) => {
    await requireAdmin(req)
    return query(`select ${staffColumns} from users u where u.role in ('admin', 'teacher') order by u.active desc, u.name`)
  })

  app.get<{ Params: { id: string } }>('/staff/:id', async (req) => {
    await requireAdmin(req)
    const member = await queryOne(`select ${staffColumns} from users u where u.id = $1 and u.role in ('admin', 'teacher')`, [
      req.params.id,
    ])
    if (!member) throw notFound('Funcionária')
    const [classes, recentDiaries, stats] = await Promise.all([
      query(
        `select c.id, c.name, c.shift, c.segment_name as "segmentName", c.tone,
           (select count(*)::int from students s where s.class_id = c.id and s.status <> 'inativo') as "studentCount"
         from classes c where c.teacher_id = $1 order by c.name`,
        [req.params.id],
      ),
      query(
        `select d.id, d.date::text as date, d.status, d.updated_at as "updatedAt", s.id as "studentId", s.name as "studentName"
         from daily_logs d join students s on s.id = d.student_id
         where d.author_id = $1 order by d.updated_at desc limit 8`,
        [req.params.id],
      ),
      queryOne(
        `select
           (select count(distinct date)::int from roll_calls where recorded_by = $1 and date >= current_date - 30) as "rollCallDays30d",
           (select count(*)::int from daily_logs where author_id = $1) as "diariesTotal",
           (select count(*)::int from development_reports r join users u on u.name = r.author_name where u.id = $1) as "reportsTotal"`,
        [req.params.id],
      ),
    ])
    return { ...member, ...stats, classes, recentDiaries }
  })

  app.put<{ Params: { id: string } }>('/staff/:id', async (req) => {
    await requireAdmin(req)
    const body = z
      .object({
        name: z.string().trim().min(3, 'Informe o nome completo.'),
        email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
        phone: phoneField,
        cpf: cpfField,
        birthDate: optionalDate,
        jobTitle: optionalText,
        hireDate: optionalDate,
        address: optionalText,
        emergencyContact: optionalText,
        notes: z.string().trim().max(4000).default(''),
      })
      .parse(req.body)
    const emailTaken = await queryOne('select 1 from users where email = $1 and id <> $2', [body.email, req.params.id])
    if (emailTaken) throw new HttpError(409, 'Já existe uma conta com este e-mail.', 'CONFLICT')
    await assertCpfFree(body.cpf, req.params.id)
    const row = await queryOne(
      `update users set name=$2, email=$3, phone=$4, cpf=$5, birth_date=$6, job_title=$7, hire_date=$8, address=$9,
         emergency_contact=$10, staff_notes=$11
       where id=$1 and role in ('admin', 'teacher') returning id`,
      [
        req.params.id,
        body.name,
        body.email,
        body.phone,
        body.cpf,
        body.birthDate,
        body.jobTitle,
        body.hireDate,
        body.address,
        body.emergencyContact,
        body.notes,
      ],
    )
    if (!row) throw notFound('Funcionária')
    return queryOne(`select ${staffColumns} from users u where u.id = $1`, [req.params.id])
  })
}
