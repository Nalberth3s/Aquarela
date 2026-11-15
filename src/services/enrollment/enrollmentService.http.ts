import { httpClient } from '../api/httpClient'
import type { EnrollmentService } from './enrollmentService'

export const enrollmentServiceHttp: EnrollmentService = {
  submit: (input) => httpClient.post('/enrollments', input),
  list: () => httpClient.get('/enrollments'),
  updateStatus: (id, status) => httpClient.patch(`/enrollments/${id}`, { status }),
}
