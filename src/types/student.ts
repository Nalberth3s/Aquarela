import type { Tone } from './school'

export type StudentStatus = 'ativo' | 'em_adaptacao' | 'inativo'
export type Shift = 'manha' | 'tarde' | 'integral'

export interface Guardian {
  id?: string
  /** Conta do Portal da Família vinculada. */
  userId?: string | null
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface HealthInfo {
  allergies: string[]
  dietaryRestrictions: string[]
  notes?: string
}

export interface Student {
  id: string
  name: string
  birthDate: string
  classId: string
  shift: Shift
  status: StudentStatus
  enrolledAt: string
  photoUrl?: string
  guardians: Guardian[]
  authorizedPickup: string[]
  health: HealthInfo
}

export interface ClassGroup {
  id: string
  name: string
  segmentId: string
  segmentName: string
  shift: Shift
  teacherName: string
  teacherId?: string | null
  room: string
  capacity: number
  tone: Tone
  studentCount?: number
}

export interface ClassInput {
  name: string
  segmentId: 'bercario' | 'maternal' | 'jardim'
  segmentName: string
  shift: Shift
  room: string
  capacity: number
  tone: Tone
  teacherId: string | null
}

export type StudentInput = Omit<Student, 'id' | 'enrolledAt'> & { enrolledAt?: string }

export interface GuardianAccessResult {
  email: string
  /** null quando o e-mail já tinha conta e só foi vinculado. */
  temporaryPassword: string | null
  linkedExisting: boolean
}

export interface AttendanceRecord {
  month: string
  present: number
  schoolDays: number
}

export interface StudentFilters {
  search?: string
  classId?: string
  status?: StudentStatus
}
