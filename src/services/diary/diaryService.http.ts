import type { DailyLog } from '@/types'
import { httpClient, qs } from '../api/httpClient'
import type { DiaryService } from './diaryService'

export const diaryServiceHttp: DiaryService = {
  listLogs: (filters = {}) => httpClient.get(`/diary${qs({ studentId: filters.studentId, date: filters.date })}`),
  getLog: (id) => httpClient.get(`/diary/${id}`),
  saveLog: (input, status) => httpClient.put<DailyLog>(`/diary?status=${status}`, input),
  markAsRead: (id) => httpClient.post(`/diary/${id}/read`),

  async uploadPhoto(file, title) {
    const url = await httpClient.upload(file)
    const now = new Date()
    return {
      id: crypto.randomUUID(),
      url,
      title,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    }
  },

  listSchoolFeed: () => httpClient.get('/feed'),
  getRollCall: (date) => httpClient.get(`/rollcall/${date}`),
  saveRollCall: (date, entries) => httpClient.put(`/rollcall/${date}`, entries),
}
