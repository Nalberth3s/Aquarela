import type { FastifyInstance } from 'fastify'
import { visibleClassIds, visibleStudentIds } from '../lib/access.ts'
import { requireUser } from '../lib/auth.ts'
import { queryOne } from '../lib/db.ts'

/** Indicadores da visão geral, calculados conforme o perfil. */
export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/summary', async (req) => {
    const user = await requireUser(req)
    const ids = await visibleStudentIds(user)
    const classIds = await visibleClassIds(user)
    const row = await queryOne<Record<string, number>>(
      `select
         (select count(*)::int from students where status <> 'inativo' and ($1::uuid[] is null or id = any($1))) as students,
         (select count(*)::int from classes where $2::uuid[] is null or id = any($2)) as classes,
         (select count(*)::int from students where status = 'em_adaptacao' and ($1::uuid[] is null or id = any($1))) as "studentsInAdaptation",
         (select count(*)::int from development_reports where status = 'publicado' and ($1::uuid[] is null or student_id = any($1))) as "publishedReports",
         (select count(*)::int from development_reports where status = 'rascunho' and ($1::uuid[] is null or student_id = any($1))) as "draftReports",
         (select count(*)::int from daily_logs where date = current_date and status = 'enviado' and ($1::uuid[] is null or student_id = any($1))) as "dailyLogsToday",
         (select count(*)::int from notices where date >= current_date - 30 and (class_id is null or $2::uuid[] is null or class_id = any($2))) as "activeNotices",
         (select coalesce(round(100.0 * count(*) filter (where present) / nullif(count(*), 0)), 100)::int
            from roll_calls where date >= date_trunc('month', current_date) and ($1::uuid[] is null or student_id = any($1))) as "attendanceRate",
         (select count(*)::int from enrollment_requests where status = 'novo') as "newEnrollments",
         (select count(*)::int from contact_messages where not read) as "newContactMessages",
         (select count(*)::int from leads where status = 'novo') as "newLeads"`,
      [ids, classIds],
    )
    return {
      ...row,
      draftReports: user.role === 'guardian' ? 0 : row?.draftReports,
      newEnrollments: user.role === 'admin' ? row?.newEnrollments : undefined,
      newContactMessages: user.role === 'admin' ? row?.newContactMessages : undefined,
      newLeads: user.role === 'admin' ? row?.newLeads : undefined,
    }
  })
}
