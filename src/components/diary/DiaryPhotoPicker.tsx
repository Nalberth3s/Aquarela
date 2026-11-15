import { useRef, useState } from 'react'
import { CircleCheck, ImagePlus, LoaderCircle, X } from 'lucide-react'
import { diaryService, getErrorMessage } from '@/services'
import type { DiaryPhoto } from '@/types'
import { useToast } from '@/hooks/useToast'

/** Registro fotográfico do dia: miniaturas + botão de adicionar (galeria ou câmera). */
export function DiaryPhotoPicker({
  photos,
  onChange,
  defaultTitle,
}: {
  photos: DiaryPhoto[]
  onChange: (photos: DiaryPhoto[]) => void
  defaultTitle: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all([...files].map((f) => diaryService.uploadPhoto(f, defaultTitle)))
      onChange([...photos, ...uploaded])
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <figure key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container">
          <img src={photo.url} alt={photo.title} className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-coral-600 shadow"
            aria-label={`Remover foto ${photo.title}`}
          >
            <X className="size-4" />
          </button>
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-linear-to-t from-black/60 to-transparent p-3 text-sm font-semibold text-white">
            <CircleCheck className="size-4" aria-hidden />
            <input
              value={photo.title}
              onChange={(e) => onChange(photos.map((p) => (p.id === photo.id ? { ...p, title: e.target.value } : p)))}
              aria-label="Título da foto"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/70"
            />
          </figcaption>
        </figure>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-low text-center text-sm text-on-surface-variant transition hover:bg-surface-container"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-soft">
          {uploading ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        </span>
        <span className="font-semibold text-on-surface">+ Foto do Dia</span>
        Galeria ou Câmera
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
