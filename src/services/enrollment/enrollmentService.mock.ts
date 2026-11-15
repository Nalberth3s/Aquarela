import { enrollmentRequestsMock } from '@/mocks/enrollment'
import type { EnrollmentRequest } from '@/types'
import { suggestSegment } from '@/utils/school'
import { ApiError } from '../api/errors'
import { mockSession } from '../mock/session'
import { createId, respond, safeStorage } from '../mock/utils'
import type { EnrollmentService } from './enrollmentService'

/**
 * Pedidos enviados pelo formulário do site ficam salvos no navegador,
 * para que apareçam na área administrativa durante a demonstração.
 */
const STORAGE_KEY = 'aquarela.enrollments'

function loadAll(): EnrollmentRequest[] {
  return safeStorage.read<EnrollmentRequest[]>(STORAGE_KEY) ?? enrollmentRequestsMock
}

function requireAdmin() {
  const user = mockSession.requireUser()
  if (user.role !== 'admin') throw new ApiError('Acesso restrito à administração.', 403, 'FORBIDDEN')
}

export const enrollmentServiceMock: EnrollmentService = {
  async submit(input) {
    const request: EnrollmentRequest = {
      ...input,
      id: createId('m'),
      createdAt: new Date().toISOString(),
      status: 'novo',
      suggestedSegment: suggestSegment(input.childBirthDate).name,
    }
    safeStorage.write(STORAGE_KEY, [request, ...loadAll()])
    return respond(request, 900)
  },

  async list() {
    requireAdmin()
    return respond([...loadAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async updateStatus(id, status) {
    requireAdmin()
    const all = loadAll()
    const target = all.find((r) => r.id === id)
    if (!target) throw new ApiError('Pedido não encontrado.', 404, 'NOT_FOUND')
    target.status = status
    safeStorage.write(STORAGE_KEY, all)
    return respond(target, 200)
  },
}
