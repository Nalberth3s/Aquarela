import { Bus, CalendarOff, Heart, Palette, PartyPopper, Sun, Users, type LucideIcon } from 'lucide-react'
import type { EventCategory, Tone } from '@/types'

export const eventCategories: Record<EventCategory, { label: string; tone: Tone; icon: LucideIcon }> = {
  festa: { label: 'Festa', tone: 'coral', icon: PartyPopper },
  comemorativa: { label: 'Data comemorativa', tone: 'lilac', icon: Heart },
  cultural: { label: 'Cultural', tone: 'sun', icon: Palette },
  passeio: { label: 'Passeio', tone: 'sage', icon: Bus },
  reuniao: { label: 'Reunião', tone: 'aqua', icon: Users },
  ferias: { label: 'Férias', tone: 'sun', icon: Sun },
  feriado: { label: 'Feriado', tone: 'aqua', icon: CalendarOff },
}
