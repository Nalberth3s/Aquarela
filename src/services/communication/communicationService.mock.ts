import { eventsMock, noticesMock } from '@/mocks/communication'
import { studentsMock } from '@/mocks/students'
import { ApiError } from '../api/errors'
import { canViewClass, canViewStudent, mockSession } from '../mock/session'
import { notInDemo, respond, safeStorage } from '../mock/utils'
import type { CommunicationService } from './communicationService'

const RSVP_KEY = 'aquarela.rsvp'

function confirmedIds(userId: string): string[] {
  return safeStorage.read<Record<string, string[]>>(RSVP_KEY)?.[userId] ?? []
}

function classFilter() {
  const user = mockSession.requireUser()
  const ownClassIds = studentsMock.filter((s) => canViewStudent(user, s)).map((s) => s.classId)
  return (classId?: string) => !classId || canViewClass(user, classId, ownClassIds)
}

export const communicationServiceMock: CommunicationService = {
  async listNotices() {
    const allowed = classFilter()
    const confirmed = confirmedIds(mockSession.requireUser().id)
    const result = noticesMock
      .filter((n) => allowed(n.classId))
      .map((n) => (n.rsvp ? { ...n, rsvpConfirmed: confirmed.includes(n.id) } : n))
      .sort((a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0) || b.date.localeCompare(a.date))
    return respond(result)
  },

  async listEvents() {
    const allowed = classFilter()
    const result = eventsMock.filter((e) => allowed(e.classId)).sort((a, b) => a.date.localeCompare(b.date))
    return respond(result)
  },

  async setAttendance(noticeId, confirmed) {
    const user = mockSession.requireUser()
    const all = safeStorage.read<Record<string, string[]>>(RSVP_KEY) ?? {}
    const current = new Set(all[user.id] ?? [])
    if (confirmed) current.add(noticeId)
    else current.delete(noticeId)
    safeStorage.write(RSVP_KEY, { ...all, [user.id]: [...current] })
    await respond(null, 400)
  },

  async sendTeacherMessage(input) {
    const user = mockSession.requireUser()
    if (user.role !== 'guardian') throw new ApiError('Recados são enviados pela família.', 403, 'FORBIDDEN')
    if (!input.message.trim()) throw new ApiError('Escreva a mensagem do recado.', 422, 'EMPTY_MESSAGE')
    return respond({ protocol: `RC${Date.now().toString().slice(-6)}` }, 700)
  },

  listMessages: () => respond([]),
  // Gestão: disponível apenas com o servidor.
  createNotice: notInDemo,
  deleteNotice: notInDemo,
  markMessageRead: notInDemo,
  replyMessage: notInDemo,
}
