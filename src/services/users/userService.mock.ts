import { notInDemo } from '../mock/utils'
import type { UserService } from './userService'

export const userServiceMock: UserService = {
  list: notInDemo,
  create: notInDemo,
  update: notInDemo,
  resetPassword: notInDemo,
  remove: notInDemo,
}
