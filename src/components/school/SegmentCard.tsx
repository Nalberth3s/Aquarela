import type { Segment } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Card } from '@/components/ui/Card'
import { WatercolorBlob } from './WatercolorBlob'

export function SegmentCard({ segment, index }: { segment: Segment; index: number }) {
  const t = toneClasses[segment.tone]
  return (
    <Card interactive className="relative flex h-full flex-col overflow-hidden">
      <WatercolorBlob
        tone={segment.tone}
        variant={(index % 3) as 0 | 1 | 2}
        intensity={0.5}
        className="absolute -top-16 -right-16 w-48"
      />
      <span className={cn('relative font-display text-sm font-semibold', t.text)}>0{index + 1}</span>
      <h3 className="relative mt-6 text-2xl">{segment.name}</h3>
      <p className={cn('relative mt-1 text-sm font-semibold', t.text)}>{segment.ageRange}</p>
      <p className="relative mt-4 leading-relaxed text-on-surface-variant">{segment.description}</p>
      <ul className="relative mt-6 space-y-2 border-t border-surface-container-high pt-5 text-sm text-on-surface-variant">
        {segment.focus.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <span className={cn('size-1.5 rounded-full', t.dot)} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </Card>
  )
}
