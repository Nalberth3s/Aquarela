import type { FieldAssessment } from '@/types'
import { developmentLevels, experienceFields } from '@/utils/labels'
import { ProgressBar } from '@/components/ui/ProgressBar'

/** Avaliação descritiva por campo de experiência da BNCC. */
export function FieldAssessmentList({ assessments, showComments = true }: { assessments: FieldAssessment[]; showComments?: boolean }) {
  return (
    <ul className="space-y-6">
      {assessments.map((a) => {
        const field = experienceFields[a.field]
        return (
          <li key={a.field}>
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="font-semibold text-on-surface">{field.label}</p>
              <p className="text-sm font-semibold text-outline">{developmentLevels[a.level]}</p>
            </div>
            <ProgressBar value={a.level} max={4} segmented tone={field.tone} label={`${field.label}: ${developmentLevels[a.level]}`} />
            {showComments && <p className="mt-2.5 leading-relaxed text-on-surface-variant">{a.comment}</p>}
          </li>
        )
      })}
    </ul>
  )
}

export function LevelLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-outline">
      {Object.entries(developmentLevels).map(([level, label]) => (
        <li key={level} className="flex items-center gap-2">
          <span className="flex gap-0.5" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={i <= Number(level) ? 'h-1.5 w-2.5 rounded-full bg-outline' : 'h-1.5 w-2.5 rounded-full bg-surface-container-high'} />
            ))}
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}
