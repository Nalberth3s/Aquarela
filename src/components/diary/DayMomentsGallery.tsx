import { Download } from 'lucide-react'
import type { DiaryPhoto } from '@/types'

/** "Momentos de Hoje" — fotos do cotidiano registradas no diário. */
export function DayMomentsGallery({ photos }: { photos: DiaryPhoto[] }) {
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">
      {photos.map((photo) => (
        <li
          key={photo.id}
          className="w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl bg-surface-container-lowest shadow-soft sm:w-auto"
        >
          <div className="relative aspect-[4/3] bg-surface-container">
            <img src={photo.url} alt={photo.caption ?? photo.title} loading="lazy" className="size-full object-cover" />
            <span className="absolute top-3 left-3 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              {photo.title}
            </span>
            <span className="absolute top-3 right-3 rounded-full bg-on-surface/60 px-2 py-0.5 text-xs font-semibold text-white">
              {photo.time}
            </span>
          </div>
          <div className="flex items-start gap-3 p-4">
            <p className="flex-1 text-sm leading-snug text-on-surface">
              {photo.caption ? `“${photo.caption}”` : photo.title}
            </p>
            <a
              href={photo.url}
              download
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aqua-50 text-primary hover:bg-aqua-100"
              aria-label={`Baixar foto: ${photo.title}`}
            >
              <Download className="size-4" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
