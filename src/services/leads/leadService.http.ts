import { httpClient, qs } from '../api/httpClient'
import type { LeadService } from './leadService'

export const leadServiceHttp: LeadService = {
  list: (filters = {}) => httpClient.get(`/admin/leads${qs({ status: filters.status, search: filters.search })}`),
  get: (id) => httpClient.get(`/admin/leads/${id}`),
  update: (id, patch) => httpClient.patch(`/admin/leads/${id}`, patch),
  markRead: (id) => httpClient.post(`/admin/leads/${id}/read`),
  remove: (id) => httpClient.delete(`/admin/leads/${id}`),
}
