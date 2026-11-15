import type { TeacherMessage } from '@/types'
import { formatRelativeDateTime } from './format'

export type MessageViewer = 'staff' | 'family'

/** Algo nesta conversa ainda não foi visto por quem está olhando? */
export function hasUnread(m: TeacherMessage, viewer: MessageViewer): boolean {
  if (viewer === 'staff') return !m.read || m.replies.some((r) => r.fromFamily && !r.read)
  return m.replies.some((r) => !r.fromFamily && !r.read)
}

/** "Visto por Profª Amanda hoje às 10:20" — o que a família enxerga. */
export function seenLabel(m: TeacherMessage): string | null {
  if (!m.read) return null
  const who = m.readByName ? ` por ${m.readByName.split(' ')[0]}` : ''
  return m.readAt ? `Visto${who} · ${formatRelativeDateTime(m.readAt).toLowerCase()}` : `Visto${who}`
}
