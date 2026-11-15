import type {
  AttendanceRecord,
  ClassGroup,
  ClassInput,
  GuardianAccessResult,
  Student,
  StudentFilters,
  StudentInput,
} from '@/types'

/**
 * Alunos e turmas. A visibilidade respeita o perfil do usuário
 * autenticado (regra aplicada pelo "servidor", nunca pela UI).
 */
export interface StudentService {
  list(filters?: StudentFilters): Promise<Student[]>
  getById(id: string): Promise<Student>
  listClasses(): Promise<ClassGroup[]>
  getClass(id: string): Promise<ClassGroup>
  getAttendance(studentId: string): Promise<AttendanceRecord[]>

  // ---- Gestão (coordenação) ----
  create(input: StudentInput): Promise<Student>
  update(id: string, input: StudentInput): Promise<Student>
  remove(id: string): Promise<void>
  /** Cria o acesso do responsável ao Portal da Família (senha provisória). */
  createGuardianAccess(studentId: string, guardianId: string): Promise<GuardianAccessResult>
  createClass(input: ClassInput): Promise<ClassGroup>
  updateClass(id: string, input: ClassInput): Promise<ClassGroup>
  deleteClass(id: string): Promise<void>
  uploadPhoto(file: File): Promise<string>
}
