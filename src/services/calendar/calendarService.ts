import type { CalendarEvent, CalendarEventInput } from '@/types'

/**
 * Calendário de eventos da escola.
 * - Leitura pública (site): apenas eventos publicados.
 * - Gestão (coordenação): criar, editar, publicar e excluir.
 */
export interface CalendarService {
  /** Eventos publicados, em ordem de data. */
  listPublished(): Promise<CalendarEvent[]>
  getPublished(id: string): Promise<CalendarEvent>
  /** Todos os eventos, inclusive rascunhos (somente administração). */
  listAll(): Promise<CalendarEvent[]>
  getById(id: string): Promise<CalendarEvent>
  create(input: CalendarEventInput): Promise<CalendarEvent>
  update(id: string, input: CalendarEventInput): Promise<CalendarEvent>
  remove(id: string): Promise<void>
  /** Envia a imagem de capa e devolve a URL para salvar no evento. */
  uploadImage(file: File): Promise<string>
}
