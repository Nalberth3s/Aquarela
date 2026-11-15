import type { Pillar } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

export function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const t = toneClasses[pillar.tone]
  return (
    <div className="relative h-full rounded-3xl bg-white p-7 ring-1 ring-surface-container-high/80">
      <span className={cn('absolute top-0 left-7 h-1 w-12 rounded-b-full', t.dot)} aria-hidden />
      <span className="font-display text-sm text-outline">0{index + 1}</span>
      <h3 className="mt-3 text-xl">{pillar.title}</h3>
      <p className="mt-3 leading-relaxed text-on-surface-variant">{pillar.description}</p>
    </div>
  )
}
