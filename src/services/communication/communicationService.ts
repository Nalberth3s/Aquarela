import type { Notice, NoticeInput, SchoolEvent, TeacherMessage, TeacherMessageInput } from '@/types'

/** Comunicados e agenda escolar, filtrados pelas turmas do usuário. */
export interface CommunicationService {
  listNotices(): Promise<Notice[]>
  listEvents(): Promise<SchoolEvent[]>
  /** Confirma (ou desfaz) a presença da família num evento com RSVP. */
  setAttendance(noticeId: string, confirmed: boolean): Promise<void>
  sendTeacherMessage(input: TeacherMessageInput): Promise<{ protocol: string }>
  createNotice(input: NoticeInput): Promise<void>
  deleteNotice(id: string): Promise<void>
  /** Recados: a equipe vê os das suas turmas; a família, os das suas crianças. */
  listMessages(): Promise<TeacherMessage[]>
  /** Equipe: marca como visto. Ambos: marca as respostas do outro lado como lidas. */
  markMessageRead(id: string): Promise<void>
  replyMessage(id: string, body: string): Promise<void>
}
