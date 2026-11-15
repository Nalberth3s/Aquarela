import { ImageIcon } from 'lucide-react'
import type { Tone } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { WatercolorBlob } from './WatercolorBlob'

/**
 * Moldura de fotografia. Enquanto não houver fotos reais da escola,
 * exibe um espaço reservado discreto indicando o que deve ir ali.
 * Para usar uma foto: coloque o arquivo em src/assets e passe em `src`.
 */
export function PhotoFrame({
  src,
  alt,
  tone = 'aqua',
  className,
  caption,
}: {
  src?: string
  alt: string
  tone?: Tone
  className?: string
  caption?: string
}) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={cn('rounded-[2rem] object-cover', className)} />
  }
  const t = toneClasses[tone]
  return (
    <div
      role="img"
      aria-label={`Espaço para foto: ${alt}`}
      className={cn('relative overflow-hidden rounded-[2rem]', t.soft, className)}
    >
      <WatercolorBlob tone={tone} variant={1} intensity={0.7} className="absolute -top-1/4 -right-1/4 w-[85%]" />
      <WatercolorBlob tone={tone} variant={2} intensity={0.45} className="absolute -bottom-1/3 -left-1/5 w-[70%]" />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5 text-xs font-semibold text-on-surface-variant/80">
        <ImageIcon className="size-3.5" aria-hidden />
        <span>{caption ?? alt}</span>
      </div>
    </div>
  )
}
