import type { StaffMember } from '@/types'

/** O que falta preencher na ficha (aparece como lembrete no cartão). */
export function missingFields(m: StaffMember): string[] {
  const missing: [unknown, string][] = [
    [m.phone, 'telefone'],
    [m.cpf, 'CPF'],
    [m.birthDate, 'nascimento'],
    [m.hireDate, 'admissão'],
    [m.address, 'endereço'],
    [m.emergencyContact, 'contato de emergência'],
  ]
  return missing.filter(([v]) => !v).map(([, label]) => label)
}
