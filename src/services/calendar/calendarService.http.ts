import { httpClient } from '../api/httpClient'
import type { CalendarService } from './calendarService'

export const calendarServiceHttp: CalendarService = {
  listPublished: () => httpClient.get('/calendar'),
  getPublished: (id) => httpClient.get(`/calendar/${id}`),
  listAll: () => httpClient.get('/admin/calendar'),
  getById: (id) => httpClient.get(`/admin/calendar/${id}`),
  create: (input) => httpClient.post('/admin/calendar', input),
  update: (id, input) => httpClient.put(`/admin/calendar/${id}`, input),
  remove: (id) => httpClient.delete(`/admin/calendar/${id}`),
  uploadImage: (file) => httpClient.upload(file),
}
