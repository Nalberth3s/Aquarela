/**
 * Ponto único de acesso aos dados da aplicação.
 *
 * Componentes e páginas importam SEMPRE daqui — nunca dos mocks nem do httpClient.
 * - VITE_USE_MOCKS=false (padrão no Docker): usa a API real em VITE_API_URL.
 * - VITE_USE_MOCKS=true: modo demonstração, com dados locais no navegador.
 */
import { apiConfig } from './config'
import type { AuthService } from './auth/authService'
import { authServiceHttp } from './auth/authService.http'
import { authServiceMock } from './auth/authService.mock'
import type { CalendarService } from './calendar/calendarService'
import { calendarServiceHttp } from './calendar/calendarService.http'
import { calendarServiceMock } from './calendar/calendarService.mock'
import type { CommunicationService } from './communication/communicationService'
import { communicationServiceHttp } from './communication/communicationService.http'
import { communicationServiceMock } from './communication/communicationService.mock'
import type { DashboardService } from './dashboard/dashboardService'
import { dashboardServiceHttp } from './dashboard/dashboardService.http'
import { dashboardServiceMock } from './dashboard/dashboardService.mock'
import type { DevService } from './dev/devService'
import { devServiceHttp } from './dev/devService.http'
import { devServiceMock } from './dev/devService.mock'
import type { DiaryService } from './diary/diaryService'
import { diaryServiceHttp } from './diary/diaryService.http'
import { diaryServiceMock } from './diary/diaryService.mock'
import type { EnrollmentService } from './enrollment/enrollmentService'
import { enrollmentServiceHttp } from './enrollment/enrollmentService.http'
import { enrollmentServiceMock } from './enrollment/enrollmentService.mock'
import type { LeadService } from './leads/leadService'
import { leadServiceHttp } from './leads/leadService.http'
import { leadServiceMock } from './leads/leadService.mock'
import type { ReportService } from './reports/reportService'
import { reportServiceHttp } from './reports/reportService.http'
import { reportServiceMock } from './reports/reportService.mock'
import type { SchoolService } from './school/schoolService'
import { schoolServiceHttp } from './school/schoolService.http'
import { schoolServiceMock } from './school/schoolService.mock'
import type { StaffService } from './staff/staffService'
import { staffServiceHttp } from './staff/staffService.http'
import { staffServiceMock } from './staff/staffService.mock'
import type { StudentService } from './students/studentService'
import { studentServiceHttp } from './students/studentService.http'
import { studentServiceMock } from './students/studentService.mock'
import type { UserService } from './users/userService'
import { userServiceHttp } from './users/userService.http'
import { userServiceMock } from './users/userService.mock'

const pick = <T>(http: T, mock: T): T => (apiConfig.useMocks ? mock : http)

export const authService: AuthService = pick(authServiceHttp, authServiceMock)
export const schoolService: SchoolService = pick(schoolServiceHttp, schoolServiceMock)
export const studentService: StudentService = pick(studentServiceHttp, studentServiceMock)
export const reportService: ReportService = pick(reportServiceHttp, reportServiceMock)
export const communicationService: CommunicationService = pick(communicationServiceHttp, communicationServiceMock)
export const enrollmentService: EnrollmentService = pick(enrollmentServiceHttp, enrollmentServiceMock)
export const dashboardService: DashboardService = pick(dashboardServiceHttp, dashboardServiceMock)
export const diaryService: DiaryService = pick(diaryServiceHttp, diaryServiceMock)
export const calendarService: CalendarService = pick(calendarServiceHttp, calendarServiceMock)
export const userService: UserService = pick(userServiceHttp, userServiceMock)
export const leadService: LeadService = pick(leadServiceHttp, leadServiceMock)
export const staffService: StaffService = pick(staffServiceHttp, staffServiceMock)
export const devService: DevService = pick(devServiceHttp, devServiceMock)

export const isDemoMode = apiConfig.useMocks

export type { DashboardSummary } from './dashboard/dashboardService'
export type { DemoAccount } from './auth/authService'
export type { TableStat } from './dev/devService'
export { ApiError, getErrorMessage } from './api/errors'
export { UNAUTHORIZED_EVENT } from './api/httpClient'
