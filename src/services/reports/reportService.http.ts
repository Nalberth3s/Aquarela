import { httpClient, qs } from '../api/httpClient'
import type { ReportService } from './reportService'

export const reportServiceHttp: ReportService = {
  list: (filters = {}) => httpClient.get(`/reports${qs({ studentId: filters.studentId, status: filters.status })}`),
  getById: (id) => httpClient.get(`/reports/${id}`),
  listObservations: (studentId) => httpClient.get(`/observations${qs({ studentId })}`),
  listMilestones: (studentId) => httpClient.get(`/students/${studentId}/milestones`),
  create: (input) => httpClient.post('/reports', input),
  update: (id, input) => httpClient.put(`/reports/${id}`, input),
}
