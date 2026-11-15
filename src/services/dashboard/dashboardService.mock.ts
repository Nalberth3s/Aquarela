import { noticesMock } from '@/mocks/communication'
import { buildDailyLogsMock } from '@/mocks/diary'
import { enrollmentRequestsMock } from '@/mocks/enrollment'
import { reportsMock } from '@/mocks/reports'
import { buildAttendanceMock, classesMock, studentsMock } from '@/mocks/students'
import type { DailyLog, EnrollmentRequest } from '@/types'
import { percent, todayISO } from '@/utils/format'
import { canViewClass, canViewStudent, mockSession } from '../mock/session'
import { respond, safeStorage } from '../mock/utils'
import type { DashboardService } from './dashboardService'

export const dashboardServiceMock: DashboardService = {
  async getSummary() {
    const user = mockSession.requireUser()
    const students = studentsMock.filter((s) => s.status !== 'inativo' && canViewStudent(user, s))
    const ids = new Set(students.map((s) => s.id))
    const reports = reportsMock.filter((r) => ids.has(r.studentId))
    const classes = classesMock.filter((c) => canViewClass(user, c.id, students.map((s) => s.classId)))

    const current = students.map((s) => buildAttendanceMock(s.id).at(-1)!)
    const present = current.reduce((acc, r) => acc + r.present, 0)
    const total = current.reduce((acc, r) => acc + r.schoolDays, 0)

    const enrollments = safeStorage.read<EnrollmentRequest[]>('aquarela.enrollments') ?? enrollmentRequestsMock

    const logs = safeStorage.read<DailyLog[]>('aquarela.diary') ?? buildDailyLogsMock()
    const dailyLogsToday = logs.filter((l) => ids.has(l.studentId) && l.date === todayISO() && l.status === 'enviado').length

    return respond({
      dailyLogsToday,
      activeNotices: noticesMock.filter((n) => !n.classId || classes.some((c) => c.id === n.classId)).length,
      students: students.length,
      classes: classes.length,
      studentsInAdaptation: students.filter((s) => s.status === 'em_adaptacao').length,
      publishedReports: reports.filter((r) => r.status === 'publicado').length,
      draftReports: user.role === 'guardian' ? 0 : reports.filter((r) => r.status === 'rascunho').length,
      attendanceRate: percent(present, total),
      newEnrollments: user.role === 'admin' ? enrollments.filter((e) => e.status === 'novo').length : undefined,
    })
  },
}
