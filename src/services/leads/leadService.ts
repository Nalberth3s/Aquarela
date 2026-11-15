import type { Lead, LeadDetail, LeadStatus } from '@/types'

/** Interessados (pessoas que entraram em contato pelo site). Somente coordenação. */
export interface LeadService {
  list(filters?: { status?: LeadStatus; search?: string }): Promise<Lead[]>
  get(id: string): Promise<LeadDetail>
  update(id: string, patch: { name?: string; status?: LeadStatus; notes?: string }): Promise<Lead>
  /** Marca todas as mensagens da pessoa como lidas. */
  markRead(id: string): Promise<void>
  remove(id: string): Promise<void>
}
