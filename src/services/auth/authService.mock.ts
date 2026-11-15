import { DEMO_PASSWORD, usersMock } from '@/mocks/users'
import { ApiError } from '../api/errors'
import { mockSession } from '../mock/session'
import { notInDemo, respond } from '../mock/utils'
import type { AuthService } from './authService'

export const authServiceMock: AuthService = {
  async login({ email, password }) {
    const user = usersMock.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    await respond(null, 600)
    if (!user || password !== DEMO_PASSWORD) {
      throw new ApiError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS')
    }
    const session = { token: `demo-token-${user.id}`, user }
    mockSession.set(session)
    return structuredClone(session)
  },

  async logout() {
    mockSession.set(null)
    await respond(null, 150)
  },

  restoreSession: () => respond(mockSession.get(), 0),

  listDemoAccounts: () => respond(usersMock.map((user) => ({ user, password: DEMO_PASSWORD })), 0),

  getSetupStatus: () => respond({ needsSetup: false }, 0),
  // Gestão: disponível apenas com o servidor.
  completeSetup: notInDemo,
  changePassword: notInDemo,
}
