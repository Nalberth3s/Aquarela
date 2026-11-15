import { parseDate } from './format'

export interface SegmentSuggestion {
  id: 'bercario' | 'maternal' | 'jardim' | 'fora'
  name: string
}

/**
 * Indica o segmento pela idade da criança (em meses) numa data de referência.
 * Regra simplificada para a demo; a regra oficial (data de corte) virá da API.
 */
export function suggestSegment(birthDate: string, reference: Date = new Date()): SegmentSuggestion {
  if (!birthDate) return { id: 'fora', name: '—' }
  const birth = parseDate(birthDate)
  const months = (reference.getFullYear() - birth.getFullYear()) * 12 + reference.getMonth() - birth.getMonth()
  if (months < 4) return { id: 'fora', name: 'A partir de 4 meses' }
  if (months < 24) return { id: 'bercario', name: 'Berçário' }
  if (months < 48) return { id: 'maternal', name: 'Maternal' }
  if (months < 72) return { id: 'jardim', name: 'Jardim' }
  return { id: 'fora', name: 'Acima da faixa da Educação Infantil' }
}
