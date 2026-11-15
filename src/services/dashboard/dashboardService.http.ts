import { httpClient } from '../api/httpClient'
import type { DashboardService } from './dashboardService'

export const dashboardServiceHttp: DashboardService = {
  getSummary: () => httpClient.get('/dashboard/summary'),
}
