import { Link } from 'react-router-dom'
import { BookOpen, Footprints, Leaf, Music, Palette, Play, type LucideIcon } from 'lucide-react'
import type { Activity, ActivityCategory } from '@/types'
import { activityCategoryLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Card } from '@/components/ui/Card'
import { PhotoFrame } from './PhotoFrame'

const categoryIcon: Record<ActivityCategory, LucideIcon> = {
  arte: Palette,
  movimento: Footprints,
  linguagem: BookOpen,
  natureza: Leaf,
}

export function ActivityCard({ activity, showImage = true }: { activity: Activity; showImage?: boolean }) {
  const Icon = activity.id === 'musicalizacao' ? Music : categoryIcon[activity.category]
  const t = toneClasses[activity.tone]
  return (
    <Card padded={false} interactive className="flex h-full flex-col overflow-hidden">
      {showImage && (
        <div className="relative">
          <PhotoFrame
            src={activity.imageUrl}
            alt={activity.title}
            tone={activity.tone}
            caption="Foto da atividade"
            className="aspect-[16/10] w-full rounded-none rounded-t-3xl"
          />
          {activity.videoUrl && (
            <Link
              to="/galeria"
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur hover:bg-white"
            >
              <Play className="size-3.5 fill-current" aria-hidden />
              Ver vídeo
            </Link>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-outline uppercase">
          <Icon className={cn('size-4', t.text)} aria-hidden />
          {activityCategoryLabels[activity.category]}
        </div>
        <h3 className="mt-3 text-xl">{activity.title}</h3>
        <p className="mt-2 flex-1 leading-relaxed text-on-surface-variant">{activity.description}</p>
        <p className="mt-5 text-sm font-semibold text-on-surface-variant">
          <span className={cn('mr-2 inline-block size-1.5 rounded-full align-middle', t.dot)} aria-hidden />
          {activity.frequency}
        </p>
      </div>
    </Card>
  )
}
