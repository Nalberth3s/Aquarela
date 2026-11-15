import type { ReactNode } from 'react'
import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: Tone
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'coral',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-on-surface-variant uppercase',
            align === 'center' && 'justify-center',
          )}
        >
          <span className={cn('size-2 rounded-full', toneClasses[tone].dot)} aria-hidden />
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          'text-balance',
          Heading === 'h1' ? 'text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]' : 'text-3xl leading-tight sm:text-4xl',
        )}
      >
        {title}
      </Heading>
      {description && <p className="mt-5 text-lg leading-relaxed text-pretty text-on-surface-variant">{description}</p>}
    </div>
  )
}
