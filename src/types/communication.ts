export type NoticeCategory = 'aviso' | 'evento' | 'cardapio' | 'pedagogico'

export interface Notice {
  id: string
  title: string
  body: string
  date: string
  authorName: string
  category: NoticeCategory
  /** Sem classId = comunicado para toda a escola. */
  classId?: string
  pinned?: boolean
  /** Presença já confirmada pelo usuário atual (quando há RSVP). */
  rsvpConfirmed?: boolean
  /** Quando presente, a família pode confirmar presença. */
  rsvp?: { eventDate: string; eventTime?: string; location?: string }
  attachmentName?: string
}

export interface SchoolEvent {
  id: string
  title: string
  date: string
  time?: string
  description: string
  location?: string
  classId?: string
}

export type MessageSubject = 'saida_antecipada' | 'alimentacao_remedio' | 'outro'

/** Recado da família para a professora. */
export interface TeacherMessageInput {
  studentId: string
  subject: MessageSubject
  message: string
}

export interface NoticeInput {
  title: string
  body: string
  category: NoticeCategory
  classId?: string | null
  pinned: boolean
  rsvp?: { eventDate: string; eventTime?: string; location?: string } | null
}

export interface MessageReply {
  id: string
  authorName: string
  fromFamily: boolean
  body: string
  /** Lida pelo outro lado da conversa. */
  read: boolean
  createdAt: string
}

export interface TeacherMessage {
  id: string
  subject: MessageSubject
  message: string
  /** Visto pela equipe. */
  read: boolean
  readAt?: string | null
  readByName?: string | null
  createdAt: string
  studentId: string
  studentName: string
  fromName: string
  replies: MessageReply[]
}
