import type { RoutineStep, Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Reveal } from '@/components/ui/Reveal'

const tones: Tone[] = ['aqua', 'sun', 'coral', 'sage', 'lilac']

export function RoutineTimeline({ steps }: { steps: RoutineStep[] }) {
  return (
    <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => {
        const t = toneClasses[tones[i % tones.length]]
        return (
          <Reveal as="li" key={step.time} delay={(i % 4) * 80} className="relative py-4">
            <div className="flex items-center gap-3">
              <span className={cn('size-3 rounded-full ring-4 ring-surface', t.dot)} aria-hidden />
              <span className="h-px flex-1 bg-surface-container-high" aria-hidden />
            </div>
            <p className={cn('mt-4 font-display text-2xl font-semibold', t.text)}>{step.time}</p>
            <h3 className="mt-1 font-sans text-base font-bold tracking-normal">{step.title}</h3>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-on-surface-variant">{step.description}</p>
          </Reveal>
        )
      })}
    </ol>
  )
}
