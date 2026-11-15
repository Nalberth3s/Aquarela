import type { SchoolInfo } from '@/types'
import { httpClient } from '../api/httpClient'
import type { SchoolService } from './schoolService'

const content = <T>(key: string) => httpClient.get<T>(`/school/content/${key}`)

export const schoolServiceHttp: SchoolService = {
  getInfo: () => httpClient.get<SchoolInfo>('/school/info'),
  listSegments: () => content('segments'),
  listActivities: () => content('activities'),
  listStructure: () => content('structure'),
  getRoutine: () => content('routine'),
  listPillars: () => content('pillars'),
  listValues: () => content('values'),
  listFaq: () => content('faq'),
  listMedia: () => content('media'),
  listTeam: () => httpClient.get('/school/team'),
  sendContactMessage: (input) => httpClient.post('/contact', input),

  listTeamAdmin: () => httpClient.get('/admin/team'),
  createTeamMember: (input) => httpClient.post('/admin/team', input),
  updateTeamMember: (id, input) => httpClient.put(`/admin/team/${id}`, input),
  deleteTeamMember: (id) => httpClient.delete(`/admin/team/${id}`),
  uploadImage: (file) => httpClient.upload(file),
  listContactMessages: () => httpClient.get('/admin/contact-messages'),
  setContactMessageRead: (id, read) => httpClient.patch(`/admin/contact-messages/${id}`, { read }),
  deleteContactMessage: (id) => httpClient.delete(`/admin/contact-messages/${id}`),
}
