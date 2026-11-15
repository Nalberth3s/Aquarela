import { milestonesMock, observationsMock, reportsMock } from '@/mocks/reports'
import { studentsMock } from '@/mocks/students'
import type { User } from '@/types'
import { ApiError } from '../api/errors'
import { canViewStudent, mockSession } from '../mock/session'
import { notInDemo, respond } from '../mock/utils'
import type { ReportService } from './reportService'

function canViewStudentId(user: User, studentId: string) {
  const student = studentsMock.find((s) => s.id === studentId)
  return student ? canViewStudent(user, student) : false
}

function visibleReports() {
  const user = mockSession.requireUser()
  return reportsMock.filter(
    (r) => canViewStudentId(user, r.studentId) && (user.role !== 'guardian' || r.status === 'publicado'),
  )
}

export const reportServiceMock: ReportService = {
  async list(filters = {}) {
    const result = visibleReports()
      .filter((r) => !filters.studentId || r.studentId === filters.studentId)
      .filter((r) => !filters.status || r.status === filters.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return respond(result)
  },

  async getById(id) {
    const report = visibleReports().find((r) => r.id === id)
    if (!report) throw new ApiError('Relatório não encontrado ou sem permissão de acesso.', 404, 'NOT_FOUND')
    return respond(report)
  },

  async listObservations(studentId) {
    const user = mockSession.requireUser()
    const result = observationsMock
      .filter((o) => canViewStudentId(user, o.studentId))
      .filter((o) => !studentId || o.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date))
    return respond(result)
  },

  async listMilestones(studentId) {
    const user = mockSession.requireUser()
    if (!canViewStudentId(user, studentId)) throw new ApiError('Sem permissão de acesso.', 403, 'FORBIDDEN')
    return respond(milestonesMock.filter((m) => m.studentId === studentId))
  },

  // Gestão: disponível apenas com o servidor.
  create: notInDemo,
  update: notInDemo,
}
