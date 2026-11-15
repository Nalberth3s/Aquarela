import { useState } from 'react'
import { Image } from 'lucide-react'
import type { SchoolMedia } from '@/types'
import { cn } from '@/utils/cn'
import { Modal } from '@/components/ui/Modal'
import { Reveal } from '@/components/ui/Reveal'
import { MediaTile } from './MediaTile'

/** Grade de fotos e vídeos com ampliação das fotos em um diálogo. */
export function MediaGallery({ items, className }: { items: SchoolMedia[]; className?: string }) {
  const [photo, setPhoto] = useState<SchoolMedia | null>(null)

  return (
    <>
      <ul className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4', className)}>
        {items.map((media, i) => (
          <Reveal as="li" key={media.id} delay={(i % 4) * 80}>
            <MediaTile media={media} onOpenPhoto={setPhoto} />
          </Reveal>
        ))}
      </ul>
      <Modal
        open={!!photo}
        onClose={() => setPhoto(null)}
        title={photo?.title ?? ''}
        subtitle={photo?.description}
        icon={<Image className="size-5" />}
      >
        {photo && (
          <img
            src={photo.src}
            alt={photo.title}
            className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
          />
        )}
      </Modal>
    </>
  )
}
