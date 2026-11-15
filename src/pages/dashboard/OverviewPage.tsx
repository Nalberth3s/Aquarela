import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { FamilyHome } from './overview/FamilyHome'
import { StaffHome } from './overview/StaffHome'

/** Início da área interna: Área da Família para responsáveis, Painel de Gestão para a equipe. */
export default function OverviewPage() {
  const user = useCurrentUser()
  const isGuardian = user.role === 'guardian'
  useDocumentTitle(isGuardian ? 'Área da Família' : 'Painel de Gestão')
  return isGuardian ? <FamilyHome user={user} /> : <StaffHome user={user} />
}
