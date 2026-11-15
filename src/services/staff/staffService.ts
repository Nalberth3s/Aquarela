import type { StaffDetail, StaffInput, StaffMember } from '@/types'

/** Ficha das funcionárias (professoras e coordenação). Somente coordenação. */
export interface StaffService {
  list(): Promise<StaffMember[]>
  get(id: string): Promise<StaffDetail>
  update(id: string, input: StaffInput): Promise<StaffMember>
}
