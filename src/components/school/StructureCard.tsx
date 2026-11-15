import { Armchair, Blocks, BookOpen, ShieldCheck, Sprout, Sun, Trees, Utensils, type LucideIcon } from 'lucide-react'
import type { StructureSpace } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

const icons: Record<string, LucideIcon> = {
  armchair: Armchair,
  trees: Trees,
  sun: Sun,
  book: BookOpen,
  utensils: Utensils,
  sprout: Sprout,
  shield: ShieldCheck,
  blocks: Blocks,
}

export function StructureCard({ space }: { space: StructureSpace }) {
  const Icon = icons[space.icon] ?? Blocks
  const t = toneClasses[space.tone]
  return (
    <div className="group flex gap-4 rounded-3xl p-5 transition-colors hover:bg-white hover:shadow-soft">
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', t.bg, t.text)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-sans text-lg font-bold tracking-normal">{space.name}</h3>
        <p className="mt-1.5 leading-relaxed text-on-surface-variant">{space.description}</p>
      </div>
    </div>
  )
}
