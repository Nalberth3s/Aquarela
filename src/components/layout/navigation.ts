import {
  BookOpenText,
  CalendarHeart,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  House,
  IdCard,
  Inbox,
  Megaphone,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

/** hideOnDesktop: no menu do computador o logo já leva ao início. */
export const publicNav: { to: string; label: string; hideOnDesktop?: boolean }[] = [
  { to: '/', label: 'Início', hideOnDesktop: true },
  { to: '/sobre', label: 'A Escola' },
  { to: '/proposta-pedagogica', label: 'Proposta' },
  { to: '/atividades', label: 'Atividades' },
  { to: '/estrutura', label: 'Estrutura' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/calendario', label: 'Calendário' },
  { to: '/contato', label: 'Contato' },
]

export interface DashboardNavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
  /** Rótulo alternativo por perfil (ex.: "Família" para responsáveis). */
  labelFor?: Partial<Record<UserRole, string>>
  /** Aparece na barra inferior do mobile. */
  mobile?: boolean
}

/** Menu da área interna. A API continua sendo a fonte da verdade para permissões. */
export const dashboardNav: DashboardNavItem[] = [
  { to: '/area', label: 'Início', icon: House, roles: ['admin', 'teacher', 'guardian'], mobile: true },
  {
    to: '/area/diario',
    label: 'Diário de Bordo',
    icon: BookOpenText,
    roles: ['admin', 'teacher', 'guardian'],
    mobile: true,
  },
  {
    to: '/area/alunos',
    label: 'Alunos',
    icon: Users,
    roles: ['admin', 'teacher', 'guardian'],
    labelFor: { guardian: 'Minha criança' },
    mobile: true,
  },
  { to: '/area/chamada', label: 'Chamada do Dia', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
  { to: '/area/turmas', label: 'Turmas', icon: GraduationCap, roles: ['admin', 'teacher'] },
  { to: '/area/relatorios', label: 'Relatórios', icon: FileText, roles: ['admin', 'teacher', 'guardian'] },
  {
    to: '/area/comunicados',
    label: 'Comunicados',
    icon: Megaphone,
    roles: ['admin', 'teacher', 'guardian'],
    mobile: true,
  },
  { to: '/area/agenda', label: 'Agenda', icon: CalendarDays, roles: ['admin', 'teacher', 'guardian'] },
  { to: '/area/calendario', label: 'Calendário do site', icon: CalendarHeart, roles: ['admin'] },
  { to: '/area/interessados', label: 'Interessados', icon: Inbox, roles: ['admin'] },
  { to: '/area/matriculas', label: 'Pré-matrículas', icon: ClipboardList, roles: ['admin'] },
  { to: '/area/funcionarias', label: 'Funcionárias', icon: IdCard, roles: ['admin'] },
  { to: '/area/equipe', label: 'Equipe e acessos', icon: UserCog, roles: ['admin'] },
  { to: '/area/banco', label: 'Banco', icon: Database, roles: ['admin'] },
]
