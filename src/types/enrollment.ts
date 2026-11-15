import type { Shift } from './student'

export type EnrollmentStatus = 'novo' | 'em_contato' | 'visita_agendada' | 'matriculado' | 'arquivado'

export interface EnrollmentRequestInput {
  guardianName: string
  email: string
  phone: string
  childName: string
  childBirthDate: string
  preferredShift: Shift
  howDidYouHear?: string
  message?: string
  wantsVisit: boolean
}

export interface EnrollmentRequest extends EnrollmentRequestInput {
  id: string
  createdAt: string
  status: EnrollmentStatus
  suggestedSegment: string
  leadId?: string | null
}

/** Interessado: mini perfil de quem entrou em contato pelo site. */
export type LeadStatus = EnrollmentStatus

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: LeadStatus
  notes: string
  firstSource: 'contato' | 'pre_matricula'
  createdAt: string
  lastContactAt: string
  messageCount: number
  unreadCount: number
  enrollmentCount: number
  lastMessage: string | null
}

export interface LeadDetail extends Lead {
  messages: import('./school').ContactMessage[]
  enrollments: EnrollmentRequest[]
}
