import { MapPin, Navigation } from 'lucide-react'
import type { SchoolInfo } from '@/types'
import { Button } from '@/components/ui/Button'

/** Mapa do Google (incorporado, sem chave de API) + atalho "Como chegar". */
export function LocationMap({ info }: { info: SchoolInfo }) {
  const hasCoords = info.latitude !== undefined && info.longitude !== undefined
  const query = hasCoords ? `${info.latitude},${info.longitude}` : `${info.address}, ${info.neighborhood}, ${info.city} - ${info.state}`
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&hl=pt-BR&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`

  return (
    <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-soft">
      <iframe
        src={embed}
        title={`Mapa: ${info.legalName}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/11] w-full border-0"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-start gap-2 text-sm text-on-surface-variant">
          <MapPin className="mt-0.5 size-4 shrink-0 text-coral-600" aria-hidden />
          {info.neighborhood}, {info.city} - {info.state}
        </p>
        <Button href={directions} external size="sm" icon={<Navigation className="size-4" />}>
          Como chegar
        </Button>
      </div>
    </div>
  )
}
