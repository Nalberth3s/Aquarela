import { HeartPulse } from 'lucide-react'
import type { HealthInfo } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'

export function HealthCard({ health }: { health: HealthInfo }) {
  const empty = !health.allergies.length && !health.dietaryRestrictions.length && !health.notes
  return (
    <Card>
      <CardHeader title="Saúde e alimentação" action={<HeartPulse className="size-5 text-coral-400" aria-hidden />} />
      {empty ? (
        <p className="text-sm text-outline">Nenhuma alergia ou restrição informada.</p>
      ) : (
        <div className="space-y-4">
          {health.allergies.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Alergias</p>
              <div className="flex flex-wrap gap-2">
                {health.allergies.map((a) => (
                  <Badge key={a} tone="coral">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {health.dietaryRestrictions.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Restrições alimentares</p>
              <div className="flex flex-wrap gap-2">
                {health.dietaryRestrictions.map((r) => (
                  <Badge key={r} tone="sun">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {health.notes && <p className="rounded-2xl bg-surface-container-low/70 p-3 text-sm text-on-surface-variant">{health.notes}</p>}
        </div>
      )}
    </Card>
  )
}
