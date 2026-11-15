import { useId } from 'react'
import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneHex } from '@/utils/tones'

/** Formas orgânicas (viewBox 200×200) que imitam manchas de tinta. */
const shapes = [
  'M100 18c30 0 63 12 76 40 14 30 3 66-16 90-20 25-53 40-84 32C45 172 20 146 16 114 11 80 26 46 50 30c14-9 32-12 50-12Z',
  'M112 22c28 6 52 26 62 52 11 29 2 64-22 84-23 20-60 28-90 18-29-10-47-40-44-71 3-30 24-56 50-72 13-8 29-14 44-11Z',
  'M92 16c34-4 72 10 88 40 15 27 4 58-10 82-15 25-40 48-70 46-32-2-62-24-74-54-12-29-4-64 20-86 13-12 29-26 46-28Z',
]

interface WatercolorBlobProps {
  tone: Tone
  variant?: 0 | 1 | 2
  className?: string
  /** Opacidade do pigmento (0–1). */
  intensity?: number
}

/**
 * Mancha de aquarela em SVG: forma orgânica + turbulência nas bordas +
 * leve acúmulo de pigmento no contorno. Puramente decorativa.
 */
export function WatercolorBlob({ tone, variant = 0, className, intensity = 0.55 }: WatercolorBlobProps) {
  const filterId = `wc-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const color = toneHex[tone]

  return (
    <svg viewBox="0 0 200 200" className={cn('pointer-events-none select-none', className)} aria-hidden focusable="false">
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed={variant * 7 + 3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path d={shapes[variant]} fill={color.light} opacity={intensity} />
        <path
          d={shapes[variant]}
          fill="none"
          stroke={color.mid}
          strokeWidth="2.5"
          opacity={intensity * 0.45}
          transform="translate(100 100) scale(0.985) translate(-100 -100)"
        />
      </g>
    </svg>
  )
}
