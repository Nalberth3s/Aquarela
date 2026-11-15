/**
 * Campos de experiência da BNCC para a Educação Infantil.
 * Usados como eixos de acompanhamento do desenvolvimento.
 */
export type ExperienceField = 'eu_outro_nos' | 'corpo_gestos' | 'tracos_sons_cores' | 'escuta_fala' | 'espacos_tempos'

/** 1 = Observando · 2 = Em desenvolvimento · 3 = Consolidando · 4 = Consolidado */
export type DevelopmentLevel = 1 | 2 | 3 | 4

export interface FieldAssessment {
  field: ExperienceField
  level: DevelopmentLevel
  comment: string
}

export type ReportStatus = 'rascunho' | 'publicado'

export interface DevelopmentReport {
  id: string
  studentId: string
  period: string
  createdAt: string
  authorName: string
  status: ReportStatus
  summary: string
  assessments: FieldAssessment[]
  highlights: string[]
  nextSteps: string[]
}

export type ObservationKind = 'conquista' | 'rotina' | 'atencao'

export interface Observation {
  id: string
  studentId: string
  date: string
  authorName: string
  kind: ObservationKind
  field?: ExperienceField
  text: string
}

export type DevelopmentReportInput = Pick<
  DevelopmentReport,
  'studentId' | 'period' | 'status' | 'summary' | 'assessments' | 'highlights' | 'nextSteps'
>

export interface ReportFilters {
  studentId?: string
  status?: ReportStatus
}
