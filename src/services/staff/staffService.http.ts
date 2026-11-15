import { httpClient } from '../api/httpClient'
import type { StaffService } from './staffService'

export const staffServiceHttp: StaffService = {
  list: () => httpClient.get('/staff'),
  get: (id) => httpClient.get(`/staff/${id}`),
  update: (id, input) => httpClient.put(`/staff/${id}`, input),
}
