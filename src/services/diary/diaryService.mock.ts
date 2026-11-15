import { buildDailyLogsMock, schoolFeedMock } from '@/mocks/diary'
import { studentsMock } from '@/mocks/students'
import type { DailyLog, RollCallEntry, User } from '@/types'
import { ApiError } from '../api/errors'
import { canViewStudent, mockSession } from '../mock/session'
import { createId, respond, safeStorage } from '../mock/utils'
import type { DiaryService } from './diaryService'

const LOGS_KEY = 'aquarela.diary'
const ROLL_KEY = 'aquarela.rollcall'

// Fotos enviadas nesta sessão viram URLs temporárias (blob:); não são persistidas.
let logs: DailyLog[] = safeStorage.read<DailyLog[]>(LOGS_KEY) ?? buildDailyLogsMock()

function persist() {
  safeStorage.write(
    LOGS_KEY,
    logs.map((l) => ({ ...l, photos: l.photos.filter((p) => !p.url.startsWith('blob:')) })),
  )
}

function canView(user: User, log: DailyLog) {
  const student = studentsMock.find((s) => s.id === log.studentId)
  if (!student || !canViewStudent(user, student)) return false
  return user.role !== 'guardian' || log.status === 'enviado'
}

/** O que a família recebe: sem anotações internas da equipe. */
function forViewer(user: User, log: DailyLog): DailyLog {
  return user.role === 'guardian' ? { ...log, internalNote: undefined } : log
}

function requireStaff(user: User) {
  if (user.role === 'guardian') throw new ApiError('Apenas a equipe pode registrar o diário.', 403, 'FORBIDDEN')
}

export const diaryServiceMock: DiaryService = {
  async listLogs(filters = {}) {
    const user = mockSession.requireUser()
    const result = logs
      .filter((l) => canView(user, l))
      .filter((l) => !filters.studentId || l.studentId === filters.studentId)
      .filter((l) => !filters.date || l.date === filters.date)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((l) => forViewer(user, l))
    return respond(result)
  },

  async getLog(id) {
    const user = mockSession.requireUser()
    const log = logs.find((l) => l.id === id)
    if (!log || !canView(user, log)) throw new ApiError('Registro não encontrado.', 404, 'NOT_FOUND')
    return respond(forViewer(user, log))
  },

  async saveLog(input, status) {
    const user = mockSession.requireUser()
    requireStaff(user)
    const student = studentsMock.find((s) => s.id === input.studentId)
    if (!student || !canViewStudent(user, student)) throw new ApiError('Criança fora das suas turmas.', 403, 'FORBIDDEN')

    const existing = logs.find((l) => l.studentId === input.studentId && l.date === input.date)
    const saved: DailyLog = {
      ...input,
      id: existing?.id ?? createId('d'),
      authorName: user.name,
      status,
      updatedAt: new Date().toISOString(),
      readByGuardian: false,
    }
    logs = existing ? logs.map((l) => (l.id === existing.id ? saved : l)) : [saved, ...logs]
    persist()
    return respond(saved, 700)
  },

  async markAsRead(id) {
    const user = mockSession.requireUser()
    logs = logs.map((l) => (l.id === id && canView(user, l) ? { ...l, readByGuardian: true } : l))
    persist()
    await respond(null, 100)
  },

  async uploadPhoto(file, title) {
    mockSession.requireUser()
    if (!file.type.startsWith('image/')) throw new ApiError('Envie um arquivo de imagem.', 422, 'INVALID_FILE')
    const now = new Date()
    return respond(
      {
        id: createId('p'),
        url: URL.createObjectURL(file),
        title,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      },
      500,
    )
  },

  async listSchoolFeed() {
    requireStaff(mockSession.requireUser())
    return respond(schoolFeedMock)
  },

  async getRollCall(date) {
    const user = mockSession.requireUser()
    requireStaff(user)
    const saved = safeStorage.read<Record<string, RollCallEntry[]>>(ROLL_KEY)?.[date]
    const visible = studentsMock.filter((s) => s.status !== 'inativo' && canViewStudent(user, s))
    const result = visible.map(
      (s) => saved?.find((e) => e.studentId === s.id) ?? { studentId: s.id, present: s.id !== 's-10' },
    )
    return respond(result)
  },

  async saveRollCall(date, entries) {
    requireStaff(mockSession.requireUser())
    const all = safeStorage.read<Record<string, RollCallEntry[]>>(ROLL_KEY) ?? {}
    safeStorage.write(ROLL_KEY, { ...all, [date]: entries })
    await respond(null, 500)
  },
}
