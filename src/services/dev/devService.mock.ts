import { notInDemo, respond } from '../mock/utils'
import type { DevService } from './devService'

export const devServiceMock: DevService = {
  status: () => respond({ enabled: false }),
  unlock: notInDemo,
  tables: notInDemo,
  resetDatabase: notInDemo,
}
