export interface DashboardSummary {
  students: number
  classes: number
  studentsInAdaptation: number
  publishedReports: number
  /** Registros do Diário de Bordo enviados hoje. */
  dailyLogsToday: number
  activeNotices: number
  draftReports: number
  /** Frequência média do mês corrente, em %. */
  attendanceRate: number
  /** Apenas para administração. */
  newEnrollments?: number
  /** Mensagens do site ainda não lidas (administração). */
  newContactMessages?: number
  /** Interessados com situação "novo" (administração). */
  newLeads?: number
}

/** Indicadores da visão geral — calculados no servidor conforme o perfil. */
export interface DashboardService {
  getSummary(): Promise<DashboardSummary>
}
