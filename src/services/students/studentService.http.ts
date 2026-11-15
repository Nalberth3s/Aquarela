import { httpClient, qs } from '../api/httpClient'
import type { StudentService } from './studentService'

export const studentServiceHttp: StudentService = {
  list: (filters = {}) =>
    httpClient.get(`/students${qs({ search: filters.search, classId: filters.classId, status: filters.status })}`),
  getById: (id) => httpClient.get(`/students/${id}`),
  listClasses: () => httpClient.get('/classes'),
  getClass: (id) => httpClient.get(`/classes/${id}`),
  getAttendance: (id) => httpClient.get(`/students/${id}/attendance`),

  create: (input) => httpClient.post('/students', input),
  update: (id, input) => httpClient.put(`/students/${id}`, input),
  remove: (id) => httpClient.delete(`/students/${id}`),
  createGuardianAccess: (studentId, guardianId) => httpClient.post(`/students/${studentId}/guardians/${guardianId}/access`),
  createClass: (input) => httpClient.post('/classes', input),
  updateClass: (id, input) => httpClient.put(`/classes/${id}`, input),
  deleteClass: (id) => httpClient.delete(`/classes/${id}`),
  uploadPhoto: (file) => httpClient.upload(file),
}
