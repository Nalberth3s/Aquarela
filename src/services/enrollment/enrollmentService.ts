import type { EnrollmentRequest, EnrollmentRequestInput, EnrollmentStatus } from '@/types'

/** Pedidos de matrícula enviados pelo site e geridos pela administração. */
export interface EnrollmentService {
  submit(input: EnrollmentRequestInput): Promise<EnrollmentRequest>
  list(): Promise<EnrollmentRequest[]>
  updateStatus(id: string, status: EnrollmentStatus): Promise<EnrollmentRequest>
}
