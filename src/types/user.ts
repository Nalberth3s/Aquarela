export type UserRole = 'admin' | 'teacher' | 'guardian'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  /** Senha provisória: precisa ser trocada no primeiro login. */
  mustChangePassword?: boolean
  /** Turmas sob responsabilidade (professores). */
  classIds?: string[]
  /** Crianças vinculadas (responsáveis). */
  studentIds?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  token: string
  user: User
}

/** Conta de acesso gerida pela coordenação. */
export interface ManagedUser extends User {
  active: boolean
  phone?: string | null
  /** Só dígitos. */
  cpf?: string | null
  createdAt: string
}

export interface UserInput {
  name: string
  email: string
  role: UserRole
  phone?: string
  cpf?: string
  jobTitle?: string
  hireDate?: string
}

/** Ficha de funcionária (professora ou coordenação). */
export interface StaffMember extends ManagedUser {
  birthDate: string | null
  jobTitle: string | null
  hireDate: string | null
  address: string | null
  emergencyContact: string | null
  notes: string
  lastLoginAt: string | null
  classNames: string[]
  studentCount: number
  diaries30d: number
  lastDiaryAt: string | null
}

export interface StaffDetail extends StaffMember {
  rollCallDays30d: number
  diariesTotal: number
  reportsTotal: number
  classes: { id: string; name: string; shift: 'manha' | 'tarde' | 'integral'; segmentName: string; tone: string; studentCount: number }[]
  recentDiaries: { id: string; date: string; status: 'rascunho' | 'enviado'; updatedAt: string; studentId: string; studentName: string }[]
}

export interface StaffInput {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  jobTitle: string
  hireDate: string
  address: string
  emergencyContact: string
  notes: string
}

export interface SetupInput {
  name: string
  email: string
  password: string
}
