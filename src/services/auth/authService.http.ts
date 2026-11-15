import type { AuthSession, User } from '@/types'
import { httpClient, tokenStore } from '../api/httpClient'
import type { AuthService } from './authService'

function keep(session: AuthSession): AuthSession {
  tokenStore.set(session.token)
  return session
}

export const authServiceHttp: AuthService = {
  login: async (credentials) => keep(await httpClient.post<AuthSession>('/auth/login', credentials)),

  async logout() {
    tokenStore.set(null)
  },

  async restoreSession() {
    const token = tokenStore.get()
    if (!token) return null
    try {
      const { user } = await httpClient.get<{ user: User }>('/auth/me')
      return { token, user }
    } catch {
      tokenStore.set(null)
      return null
    }
  },

  // Com o servidor real não existem contas de demonstração.
  listDemoAccounts: async () => [],

  getSetupStatus: () => httpClient.get('/setup/status'),
  completeSetup: async (input) => keep(await httpClient.post<AuthSession>('/setup', input)),
  changePassword: async (currentPassword, newPassword) =>
    (await httpClient.post<{ user: User }>('/auth/change-password', { currentPassword, newPassword })).user,
}
