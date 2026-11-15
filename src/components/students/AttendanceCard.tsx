import type { AttendanceRecord } from '@/types'
import { percent } from '@/utils/format'
import { Card, CardHeader } from '@/components/ui/Card'

/** Frequência mensal em barras verticais simples (sem biblioteca de gráficos). */
export function AttendanceCard({ records }: { records: AttendanceRecord[] }) {
  const present = records.reduce((a, r) => a + r.present, 0)
  const total = records.reduce((a, r) => a + r.schoolDays, 0)
  const rate = percent(present, total)

  if (!records.length) {
    return (
      <Card>
        <CardHeader title="Frequência" />
        <p className="text-sm text-outline">Aparece assim que a Chamada do Dia começar a ser registrada.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Frequência" subtitle="Últimos meses" action={<span className="font-display text-2xl font-semibold">{rate}%</span>} />
      <ul className="flex h-36 items-end gap-3" aria-label="Frequência por mês">
        {records.map((r) => {
          const p = percent(r.present, r.schoolDays)
          return (
            <li key={r.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-on-surface-variant">{p}%</span>
              <div className="flex w-full max-w-10 flex-1 items-end overflow-hidden rounded-xl bg-surface-container-low">
                <div
                  className={p >= 85 ? 'w-full rounded-xl bg-sage-400' : 'w-full rounded-xl bg-sun-400'}
                  style={{ height: `${p}%` }}
                  title={`${r.present} de ${r.schoolDays} dias`}
                />
              </div>
              <span className="text-xs text-outline">{r.month.slice(0, 3)}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
