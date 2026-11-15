import { BedDouble, BookOpen, Check, CheckCheck, Palette, Utensils, type LucideIcon } from 'lucide-react'
import type { FeedIcon, SchoolFeedItem, Tone } from '@/types'
import { IconTile } from '@/components/ui/IconTile'

const icons: Record<FeedIcon, { icon: LucideIcon; tone: Tone }> = {
  arte: { icon: Palette, tone: 'aqua' },
  refeicao: { icon: Utensils, tone: 'lilac' },
  descanso: { icon: BedDouble, tone: 'sun' },
  leitura: { icon: BookOpen, tone: 'sage' },
}

/** "Atividades Recentes da Escola" — feed do painel de gestão. */
export function SchoolFeed({ items }: { items: SchoolFeedItem[] }) {
  return (
    <ul className="divide-y divide-surface-container rounded-3xl bg-surface-container-lowest px-4 shadow-soft">
      {items.map((item) => {
        const { icon, tone } = icons[item.icon]
        return (
          <li key={item.id} className="flex gap-3 py-4">
            <IconTile icon={icon} tone={tone} size="sm" className="rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{item.title}</p>
                <time className="shrink-0 text-xs text-on-surface-variant">{item.time}</time>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1 font-semibold text-sage-600">
                  {item.meta ? <CheckCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                  {item.status}
                </span>
                {item.meta && <span className="text-on-surface-variant">{item.meta}</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
