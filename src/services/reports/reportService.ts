import type { DevelopmentReport, DevelopmentReportInput, Milestone, Observation, ReportFilters } from '@/types'

/** Relatórios de desenvolvimento e registros diários de observação. */
export interface ReportService {
  list(filters?: ReportFilters): Promise<DevelopmentReport[]>
  getById(id: string): Promise<DevelopmentReport>
  listObservations(studentId?: string): Promise<Observation[]>
  /** Jornada pedagógica: marcos do trimestre. */
  listMilestones(studentId: string): Promise<Milestone[]>
  create(input: DevelopmentReportInput): Promise<DevelopmentReport>
  update(id: string, input: DevelopmentReportInput): Promise<DevelopmentReport>
}
