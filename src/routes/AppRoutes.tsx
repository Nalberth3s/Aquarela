import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import HomePage from '@/pages/public/HomePage'
import { RedirectIfAuthenticated, RequireAuth, RequireRole } from './guards'

// Páginas carregadas sob demanda (a área interna fica fora do bundle inicial do site).
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const PedagogyPage = lazy(() => import('@/pages/public/PedagogyPage'))
const StructurePage = lazy(() => import('@/pages/public/StructurePage'))
const ActivitiesPage = lazy(() => import('@/pages/public/ActivitiesPage'))
const EnrollmentPage = lazy(() => import('@/pages/public/EnrollmentPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const GalleryPage = lazy(() => import('@/pages/public/GalleryPage'))
const CalendarPage = lazy(() => import('@/pages/public/CalendarPage'))
const EventDetailPage = lazy(() => import('@/pages/public/EventDetailPage'))
const CalendarAdminPage = lazy(() => import('@/pages/dashboard/CalendarAdminPage'))
const CalendarEventFormPage = lazy(() => import('@/pages/dashboard/CalendarEventFormPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

const LoginPage = lazy(() => import('@/pages/dashboard/LoginPage'))
const SetupPage = lazy(() => import('@/pages/dashboard/SetupPage'))
const ChangePasswordPage = lazy(() => import('@/pages/dashboard/ChangePasswordPage'))
const TeamAccessPage = lazy(() => import('@/pages/dashboard/TeamAccessPage'))
const DatabasePage = lazy(() => import('@/pages/dashboard/DatabasePage'))
const LeadsPage = lazy(() => import('@/pages/dashboard/LeadsPage'))
const LeadProfilePage = lazy(() => import('@/pages/dashboard/LeadProfilePage'))
const StaffPage = lazy(() => import('@/pages/dashboard/StaffPage'))
const StaffProfilePage = lazy(() => import('@/pages/dashboard/StaffProfilePage'))
const StudentFormPage = lazy(() => import('@/pages/dashboard/StudentFormPage'))
const ReportFormPage = lazy(() => import('@/pages/dashboard/ReportFormPage'))
const OverviewPage = lazy(() => import('@/pages/dashboard/OverviewPage'))
const StudentsPage = lazy(() => import('@/pages/dashboard/StudentsPage'))
const StudentDetailPage = lazy(() => import('@/pages/dashboard/StudentDetailPage'))
const ClassesPage = lazy(() => import('@/pages/dashboard/ClassesPage'))
const ReportsPage = lazy(() => import('@/pages/dashboard/ReportsPage'))
const ReportDetailPage = lazy(() => import('@/pages/dashboard/ReportDetailPage'))
const NoticesPage = lazy(() => import('@/pages/dashboard/NoticesPage'))
const AgendaPage = lazy(() => import('@/pages/dashboard/AgendaPage'))
const EnrollmentsPage = lazy(() => import('@/pages/dashboard/EnrollmentsPage'))
const DiaryPage = lazy(() => import('@/pages/dashboard/DiaryPage'))
const DiaryDetailPage = lazy(() => import('@/pages/dashboard/DiaryDetailPage'))
const DiaryEditorPage = lazy(() => import('@/pages/dashboard/DiaryEditorPage'))
const RollCallPage = lazy(() => import('@/pages/dashboard/RollCallPage'))

function PageFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Site institucional */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sobre" element={<AboutPage />} />
          <Route path="proposta-pedagogica" element={<PedagogyPage />} />
          <Route path="estrutura" element={<StructurePage />} />
          <Route path="atividades" element={<ActivitiesPage />} />
          <Route path="matriculas" element={<EnrollmentPage />} />
          <Route path="galeria" element={<GalleryPage />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="calendario/:id" element={<EventDetailPage />} />
          <Route path="contato" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Autenticação */}
        <Route path="primeiro-acesso" element={<SetupPage />} />
        <Route
          path="entrar"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />

        {/* Área interna */}
        <Route
          path="area"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="senha" element={<ChangePasswordPage />} />
          <Route path="mensagens" element={<Navigate to="/area/interessados" replace />} />
          <Route
            path="interessados"
            element={
              <RequireRole roles={['admin']}>
                <LeadsPage />
              </RequireRole>
            }
          />
          <Route
            path="interessados/:id"
            element={
              <RequireRole roles={['admin']}>
                <LeadProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="funcionarias"
            element={
              <RequireRole roles={['admin']}>
                <StaffPage />
              </RequireRole>
            }
          />
          <Route
            path="funcionarias/:id"
            element={
              <RequireRole roles={['admin']}>
                <StaffProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="equipe"
            element={
              <RequireRole roles={['admin']}>
                <TeamAccessPage />
              </RequireRole>
            }
          />
          <Route
            path="banco"
            element={
              <RequireRole roles={['admin']}>
                <DatabasePage />
              </RequireRole>
            }
          />
          {['alunos/novo', 'alunos/:id/editar'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireRole roles={['admin']}>
                  <StudentFormPage />
                </RequireRole>
              }
            />
          ))}
          {['relatorios/novo', 'relatorios/:id/editar'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireRole roles={['admin', 'teacher']}>
                  <ReportFormPage />
                </RequireRole>
              }
            />
          ))}
          <Route path="diario" element={<DiaryPage />} />
          <Route
            path="diario/novo"
            element={
              <RequireRole roles={['admin', 'teacher']}>
                <DiaryEditorPage />
              </RequireRole>
            }
          />
          <Route path="diario/:id" element={<DiaryDetailPage />} />
          <Route
            path="chamada"
            element={
              <RequireRole roles={['admin', 'teacher']}>
                <RollCallPage />
              </RequireRole>
            }
          />
          <Route path="alunos" element={<StudentsPage />} />
          <Route path="alunos/:id" element={<StudentDetailPage />} />
          <Route
            path="turmas"
            element={
              <RequireRole roles={['admin', 'teacher']}>
                <ClassesPage />
              </RequireRole>
            }
          />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="relatorios/:id" element={<ReportDetailPage />} />
          <Route path="comunicados" element={<NoticesPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          {['calendario', 'calendario/novo', 'calendario/:id'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireRole roles={['admin']}>
                  {path === 'calendario' ? <CalendarAdminPage /> : <CalendarEventFormPage />}
                </RequireRole>
              }
            />
          ))}
          <Route
            path="matriculas"
            element={
              <RequireRole roles={['admin']}>
                <EnrollmentsPage />
              </RequireRole>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  )
}
