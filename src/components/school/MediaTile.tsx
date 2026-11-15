import { useState } from 'react'
import { Expand, Play } from 'lucide-react'
import type { SchoolMedia } from '@/types'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'

/**
 * Foto ou vídeo da galeria. O vídeo só é carregado quando a pessoa toca em
 * "play" (preload="none"), para não pesar a página no celular.
 */
export function MediaTile({
  media,
  onOpenPhoto,
  className,
}: {
  media: SchoolMedia
  onOpenPhoto?: (media: SchoolMedia) => void
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const t = toneClasses[media.tone]
  const isVideo = media.kind === 'video'

  return (
    <figure className={cn('flex h-full flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-soft', className)}>
      <div className={cn('relative overflow-hidden bg-on-surface', 'aspect-[3/4]')}>
        {isVideo && playing ? (
          <video
            src={media.src}
            poster={media.poster}
            controls
            autoPlay
            playsInline
            preload="none"
            className="size-full bg-black object-contain"
          >
            Seu navegador não reproduz vídeos.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => (isVideo ? setPlaying(true) : onOpenPhoto?.(media))}
            className="group absolute inset-0 size-full"
            aria-label={isVideo ? `Assistir: ${media.title}` : `Ampliar foto: ${media.title}`}
          >
            <img
              src={isVideo ? media.poster : media.src}
              alt={media.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" aria-hidden />
            {isVideo ? (
              <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lift transition group-hover:scale-110">
                <Play className="ml-1 size-7 fill-current" aria-hidden />
              </span>
            ) : (
              <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-on-surface opacity-0 transition group-hover:opacity-100">
                <Expand className="size-4" aria-hidden />
              </span>
            )}
            <span className={cn('absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold', t.bg, t.text)}>
              {isVideo ? '▶ Vídeo · ' : ''}
              {media.tag}
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex flex-1 flex-col p-4">
        <p className="font-semibold">{media.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{media.description}</p>
        {media.credits && <p className="mt-2 text-xs text-outline">{media.credits}</p>}
      </figcaption>
    </figure>
  )
}
