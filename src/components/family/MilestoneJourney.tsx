import { Check, Star } from 'lucide-react'
import type { Milestone } from '@/types'
import { cn } from '@/utils/cn'

/** Jornada Pedagógica — marcos do trimestre em linha do tempo tracejada. */
export function MilestoneJourney({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:border-l-2 before:border-dashed before:border-primary-fixed">
      {milestones.map((m) => {
        const current = m.status === 'em_andamento'
        return (
          <li key={m.id} className="relative flex gap-4">
            <span
              className={cn(
                'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-surface-container-lowest',
                current ? 'bg-sun-400 text-white' : 'bg-sage-50 text-sage-600',
              )}
            >
              {current ? <Star className="size-4 fill-current" aria-hidden /> : <Check className="size-4" aria-hidden />}
            </span>
            <div className={cn('flex-1 rounded-2xl p-4', current ? 'bg-sun-50' : 'bg-surface-container-low')}>
              <p className="text-xs font-semibold text-on-surface-variant">
                {m.month} • {current ? <span className="text-sun-600">Em andamento</span> : 'Concluído'}
              </p>
              <h3 className="mt-1 font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{m.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
