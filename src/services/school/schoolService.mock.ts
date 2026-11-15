import {
  activitiesMock,
  faqMock,
  pillarsMock,
  routineMock,
  schoolInfoMock,
  segmentsMock,
  structureMock,
  teamMock,
  valuesMock,
} from '@/mocks/school'
import { mediaMock } from '@/mocks/media'
import { notInDemo, respond } from '../mock/utils'
import type { SchoolService } from './schoolService'

export const schoolServiceMock: SchoolService = {
  getInfo: () => respond(schoolInfoMock, 0),
  listSegments: () => respond(segmentsMock),
  listActivities: () => respond(activitiesMock),
  listStructure: () => respond(structureMock),
  getRoutine: () => respond(routineMock),
  listPillars: () => respond(pillarsMock),
  listValues: () => respond(valuesMock),
  listTeam: () => respond(teamMock),
  listFaq: () => respond(faqMock),
  listMedia: () => respond(mediaMock),
  sendContactMessage: () => respond({ protocol: `CT${Date.now().toString().slice(-6)}` }, 900),

  // Gestão: disponível apenas com o servidor.
  listTeamAdmin: notInDemo,
  createTeamMember: notInDemo,
  updateTeamMember: notInDemo,
  deleteTeamMember: notInDemo,
  uploadImage: notInDemo,
  listContactMessages: () => respond([]),
  setContactMessageRead: notInDemo,
  deleteContactMessage: notInDemo,
}
