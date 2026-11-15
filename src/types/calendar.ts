/** Calendário público de eventos da escola (site institucional). */
export type EventCategory = 'festa' | 'comemorativa' | 'cultural' | 'passeio' | 'reuniao' | 'feriado' | 'ferias'

export interface CalendarEventInput {
  title: string
  category: EventCategory
  /** YYYY-MM-DD */
  date: string
  /** Último dia, para eventos de vários dias. */
  endDate?: string
  /** Ex.: "8h às 11h" */
  time?: string
  location?: string
  /** Frase curta exibida nos cards. */
  summary: string
  /** Texto completo da página do evento. */
  description: string
  /** Lista "O que levar / como participar". */
  whatToBring: string[]
  /** Para quem é (ex.: "Toda a escola", "Famílias do Berçário"). */
  audience?: string
  imageUrl?: string
  /** Aparece em destaque no topo do calendário e na página inicial. */
  featured: boolean
  /** Rascunhos não aparecem no site. */
  published: boolean
}

export interface CalendarEvent extends CalendarEventInput {
  id: string
  updatedAt: string
}
