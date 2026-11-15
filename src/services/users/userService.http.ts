import { httpClient, qs } from '../api/httpClient'
import type { UserService } from './userService'

export const userServiceHttp: UserService = {
  list: (role) => httpClient.get(`/users${qs({ role })}`),
  create: (input) => httpClient.post('/users', input),
  update: (id, input) => httpClient.put(`/users/${id}`, input),
  resetPassword: (id) => httpClient.post(`/users/${id}/reset-password`),
  remove: (id) => httpClient.delete(`/users/${id}`),
}
