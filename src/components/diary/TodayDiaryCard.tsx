import { Heart, Moon, Palette, Quote, Sparkles, Utensils, type LucideIcon } from 'lucide-react'
import type { DailyLog, Tone } from '@/types'
import { mealLabels, restLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Card } from '@/components/ui/Card'
import { IconTile } from '@/components/ui/IconTile'

function Tile({ icon: Icon, tone, label, title, detail }: { icon: LucideIcon; tone: Tone; label: string; title: string; detail?: string }) {
  const t = toneClasses[tone]
  return (
    <div className={cn('rounded-2xl p-3.5', t.soft)}>
      <p className={cn('flex items-center gap-1.5 text-xs font-semibold', t.text)}>
        <Icon className="size-4" aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-on-surface">{title}</p>
      {detail && <p className="text-xs text-on-surface-variant">{detail}</p>}
    </div>
  )
}

/** "Hoje na Aquarela" — resumo do diário do dia para a família. */
export function TodayDiaryCard({ log, teacherName }: { log: DailyLog; teacherName: string }) {
  const time = new Date(log.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <IconTile icon={Heart} tone="coral" size="sm" />
        <div className="flex-1">
          <h2 className="text-lg leading-tight">Hoje na Aquarela</h2>
          <p className="text-xs text-on-surface-variant">Diário de bordo em tempo real</p>
        </div>
        <span className="rounded-full bg-aqua-50 px-2.5 py-1 text-xs font-semibold text-primary">{time}</span>
      </div>

      <figure className="rounded-2xl bg-surface-container-low p-4">
        <Quote className="size-5 text-primary/40" aria-hidden />
        <blockquote className="mt-1 leading-relaxed text-on-surface italic">“{log.dayNote}”</blockquote>
        <figcaption className="mt-2 text-xs text-on-surface-variant">
          — Escrito com carinho por Profª {teacherName.split(' ')[0]}
        </figcaption>
      </figure>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Tile
          icon={Palette}
          tone="lilac"
          label="Atividade"
          title={log.activity?.title ?? 'Atividades do dia'}
          detail={log.activity?.detail}
        />
        <Tile
          icon={Utensils}
          tone="sage"
          label="Alimentação"
          title={log.meals ? mealLabels[log.meals] : '—'}
          detail={log.meals === 'comeu_tudo' ? 'Frutas e almoço 100%' : undefined}
        />
        <Tile
          icon={Moon}
          tone="aqua"
          label="Sono & Pausa"
          title={log.rest ? (log.rest === 'dormiu' ? 'Soneca tranquila' : restLabels[log.rest]) : '—'}
          detail={log.restMinutes ? `${log.restMinutes} min revigorantes` : undefined}
        />
        <Tile
          icon={Sparkles}
          tone="sun"
          label="Humor"
          title={log.mood?.title ?? 'Bem-disposta'}
          detail={log.mood?.detail}
        />
      </div>
    </Card>
  )
}
