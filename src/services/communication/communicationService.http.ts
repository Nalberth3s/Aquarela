import { httpClient } from '../api/httpClient'
import type { CommunicationService } from './communicationService'

export const communicationServiceHttp: CommunicationService = {
  listNotices: () => httpClient.get('/notices'),
  listEvents: () => httpClient.get('/events'),
  setAttendance: (noticeId, confirmed) => httpClient.put(`/notices/${noticeId}/rsvp`, { confirmed }),
  sendTeacherMessage: (input) => httpClient.post('/messages', input),
  createNotice: (input) => httpClient.post('/notices', input),
  deleteNotice: (id) => httpClient.delete(`/notices/${id}`),
  listMessages: () => httpClient.get('/messages'),
  markMessageRead: (id) => httpClient.post(`/messages/${id}/read`),
  replyMessage: (id, body) => httpClient.post(`/messages/${id}/replies`, { body }),
}
