import { notInDemo, respond } from '../mock/utils'
import type { StaffService } from './staffService'

export const staffServiceMock: StaffService = {
  list: () => respond([]),
  get: notInDemo,
  update: notInDemo,
}
