import { schoolInfoMock } from '@/mocks/school'
import { schoolService } from '@/services'
import { useAsync } from './useAsync'

/**
 * Dados de contato da escola. Usa o conteúdo padrão como valor inicial
 * para que cabeçalho e rodapé nunca renderizem vazios.
 */
export function useSchoolInfo() {
  const { data } = useAsync(() => schoolService.getInfo(), [])
  return data ?? schoolInfoMock
}
