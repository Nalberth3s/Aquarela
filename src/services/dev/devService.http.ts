import { httpClient } from '../api/httpClient'
import type { DevService } from './devService'

export const devServiceHttp: DevService = {
  status: () => httpClient.get('/dev/status'),
  unlock: (email, password) => httpClient.post('/dev/unlock', { email, password }),
  tables: (devToken) => httpClient.post('/dev/database', { devToken }),
  resetDatabase: (devToken) => httpClient.post('/dev/database/reset', { devToken, confirm: 'APAGAR' }),
}
