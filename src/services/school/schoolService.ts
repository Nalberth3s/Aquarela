import type {
  Activity,
  ContactMessage,
  ContactMessageInput,
  Faq,
  Pillar,
  RoutineStep,
  SchoolInfo,
  SchoolMedia,
  SchoolValue,
  Segment,
  StructureSpace,
  TeamMember,
  TeamMemberInput,
} from '@/types'

/** Conteúdo institucional público (site). */
export interface SchoolService {
  getInfo(): Promise<SchoolInfo>
  listSegments(): Promise<Segment[]>
  listActivities(): Promise<Activity[]>
  listStructure(): Promise<StructureSpace[]>
  getRoutine(): Promise<RoutineStep[]>
  listPillars(): Promise<Pillar[]>
  listValues(): Promise<SchoolValue[]>
  listTeam(): Promise<TeamMember[]>
  listFaq(): Promise<Faq[]>
  /** Galeria de fotos e vídeos. */
  listMedia(): Promise<SchoolMedia[]>
  sendContactMessage(input: ContactMessageInput): Promise<{ protocol: string }>

  // ---- Gestão (coordenação) ----
  listTeamAdmin(): Promise<TeamMember[]>
  createTeamMember(input: TeamMemberInput): Promise<TeamMember>
  updateTeamMember(id: string, input: TeamMemberInput): Promise<TeamMember>
  deleteTeamMember(id: string): Promise<void>
  /** Envia uma imagem e devolve a URL pública. */
  uploadImage(file: File): Promise<string>
  /** Mensagens do formulário de contato (coordenação). */
  listContactMessages(): Promise<ContactMessage[]>
  setContactMessageRead(id: string, read: boolean): Promise<void>
  deleteContactMessage(id: string): Promise<void>
}
