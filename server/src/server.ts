import { mkdir } from 'node:fs/promises'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { config } from './config.ts'
import { pool } from './lib/db.ts'
import { registerErrorHandler } from './lib/errors.ts'
import { runMigrations } from './lib/migrate.ts'
import { authRoutes } from './routes/auth.ts'
import { calendarRoutes } from './routes/calendar.ts'
import { classRoutes } from './routes/classes.ts'
import { communicationRoutes } from './routes/communication.ts'
import { dashboardRoutes } from './routes/dashboard.ts'
import { devRoutes } from './routes/dev.ts'
import { diaryRoutes } from './routes/diary.ts'
import { enrollmentRoutes } from './routes/enrollment.ts'
import { leadRoutes } from './routes/leads.ts'
import { staffRoutes } from './routes/staff.ts'
import { reportRoutes } from './routes/reports.ts'
import { schoolRoutes } from './routes/school.ts'
import { studentRoutes } from './routes/students.ts'
import { uploadRoutes } from './routes/uploads.ts'
import { userRoutes } from './routes/users.ts'
import { seedIfEmpty } from './seed/seed.ts'

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } })

await app.register(cors, { origin: config.corsOrigins, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
await app.register(jwt, { secret: config.jwtSecret })
await app.register(multipart, { limits: { fileSize: config.maxUploadBytes, files: 1 } })
await mkdir(config.uploadsDir, { recursive: true })
await app.register(fastifyStatic, { root: config.uploadsDir, prefix: '/uploads/', decorateReply: false })
registerErrorHandler(app)

app.get('/api/health', async () => {
  await pool.query('select 1')
  return { ok: true }
})

for (const routes of [
  authRoutes,
  schoolRoutes,
  userRoutes,
  classRoutes,
  studentRoutes,
  diaryRoutes,
  reportRoutes,
  communicationRoutes,
  calendarRoutes,
  enrollmentRoutes,
  leadRoutes,
  staffRoutes,
  dashboardRoutes,
  uploadRoutes,
  devRoutes,
]) {
  await app.register(routes, { prefix: '/api' })
}

// Aguarda o banco (útil quando o container sobe junto com o Postgres).
for (let attempt = 1; ; attempt++) {
  try {
    await pool.query('select 1')
    break
  } catch (err) {
    if (attempt >= 30) throw err
    app.log.info(`aguardando o banco de dados (${attempt})…`)
    await new Promise((r) => setTimeout(r, 1000))
  }
}
await runMigrations((m) => app.log.info(m))
await seedIfEmpty((m) => app.log.info(m))

await app.listen({ port: config.port, host: '0.0.0.0' })
