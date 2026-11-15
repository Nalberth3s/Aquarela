import type { CalendarEvent } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'
import { eventCategories } from './eventCategories'

/**
 * Capa do evento: a foto enviada pela coordenação ou, sem foto,
 * uma ilustração em aquarela com o ícone da categoria.
 */
export function EventCover({
  event,
  className,
  iconSize = 'size-12',
}: {
  event: Pick<CalendarEvent, 'imageUrl' | 'title' | 'category'>
  className?: string
  iconSize?: string
}) {
  if (event.imageUrl) {
    return <img src={event.imageUrl} alt={event.title} loading="lazy" className={cn('object-cover', className)} />
  }
  const meta = eventCategories[event.category]
  const t = toneClasses[meta.tone]
  const Icon = meta.icon
  return (
    <div role="img" aria-label={event.title} className={cn('relative flex items-center justify-center overflow-hidden', t.soft, className)}>
      <WatercolorBlob tone={meta.tone} variant={0} intensity={0.85} className="absolute -top-1/4 -left-1/5 w-3/4" />
      <WatercolorBlob tone={meta.tone === 'aqua' ? 'lilac' : 'aqua'} variant={2} intensity={0.45} className="absolute -right-1/5 -bottom-1/3 w-2/3" />
      <span className={cn('relative flex items-center justify-center rounded-full bg-white/80 p-4 shadow-soft backdrop-blur', t.text)}>
        <Icon className={iconSize} strokeWidth={1.6} aria-hidden />
      </span>
    </div>
  )
}
