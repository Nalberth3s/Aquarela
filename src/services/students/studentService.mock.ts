import { buildAttendanceMock, classesMock, studentsMock } from '@/mocks/students'
import { normalize } from '@/utils/format'
import { ApiError } from '../api/errors'
import { canViewClass, canViewStudent, mockSession } from '../mock/session'
import { notInDemo, respond } from '../mock/utils'
import type { StudentService } from './studentService'

function visibleStudents() {
  const user = mockSession.requireUser()
  return studentsMock.filter((s) => canViewStudent(user, s))
}

function findVisibleStudent(id: string) {
  const student = visibleStudents().find((s) => s.id === id)
  if (!student) throw new ApiError('Aluno não encontrado ou sem permissão de acesso.', 404, 'NOT_FOUND')
  return student
}

export const studentServiceMock: StudentService = {
  async list(filters = {}) {
    const term = filters.search ? normalize(filters.search) : ''
    const result = visibleStudents()
      .filter((s) => !filters.classId || s.classId === filters.classId)
      .filter((s) => !filters.status || s.status === filters.status)
      .filter((s) => !term || normalize(s.name).includes(term))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return respond(result)
  },

  async getById(id) {
    return respond(findVisibleStudent(id))
  },

  async listClasses() {
    const user = mockSession.requireUser()
    const ownClassIds = visibleStudents().map((s) => s.classId)
    return respond(classesMock.filter((c) => canViewClass(user, c.id, ownClassIds)))
  },

  async getClass(id) {
    const classes = await studentServiceMock.listClasses()
    const found = classes.find((c) => c.id === id)
    if (!found) throw new ApiError('Turma não encontrada.', 404, 'NOT_FOUND')
    return found
  },

  async getAttendance(studentId) {
    findVisibleStudent(studentId)
    return respond(buildAttendanceMock(studentId))
  },

  // Gestão: disponível apenas com o servidor.
  create: notInDemo,
  update: notInDemo,
  remove: notInDemo,
  createGuardianAccess: notInDemo,
  createClass: notInDemo,
  updateClass: notInDemo,
  deleteClass: notInDemo,
  uploadPhoto: notInDemo,
}
