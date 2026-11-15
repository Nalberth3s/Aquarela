import { notInDemo, respond } from '../mock/utils'
import type { LeadService } from './leadService'

export const leadServiceMock: LeadService = {
  list: () => respond([]),
  get: notInDemo,
  update: notInDemo,
  markRead: notInDemo,
  remove: notInDemo,
}
