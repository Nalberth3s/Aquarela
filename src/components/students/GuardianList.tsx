import { CircleCheck, KeyRound, Phone, ShieldCheck } from 'lucide-react'
import type { Guardian, Student } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'

/**
 * Responsáveis e autorizados. Com `onCreateAccess` (coordenação), mostra
 * a situação do acesso de cada responsável ao Portal da Família.
 */
export function GuardianList({
  student,
  onCreateAccess,
  creatingId,
}: {
  student: Student
  onCreateAccess?: (guardian: Guardian) => void
  creatingId?: string
}) {
  return (
    <Card>
      <CardHeader title="Responsáveis" />
      <ul className="space-y-4">
        {student.guardians.map((g) => (
          <li key={g.id ?? g.name}>
            <div className="flex items-center gap-3">
              <Avatar name={g.name} size="sm" />
              <div className="min-w-0">
                <p className="font-semibold">{g.name}</p>
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-outline">
                  {g.relationship} · <Phone className="size-3" aria-hidden /> {g.phone}
                </p>
                {g.email && <p className="truncate text-xs text-outline">{g.email}</p>}
              </div>
            </div>
            {onCreateAccess &&
              (g.userId ? (
                <p className="mt-2 ml-12 inline-flex items-center gap-1 text-xs font-semibold text-sage-600">
                  <CircleCheck className="size-3.5" aria-hidden /> Tem acesso ao Portal da Família
                </p>
              ) : (
                <div className="mt-2 ml-12">
                  <Button
                    size="sm"
                    variant="soft"
                    disabled={!g.email || !!creatingId}
                    loading={creatingId === g.id}
                    onClick={() => onCreateAccess(g)}
                    icon={<KeyRound className="size-4" />}
                  >
                    Dar acesso ao Portal
                  </Button>
                  {!g.email && <p className="mt-1 text-xs text-outline">Cadastre o e-mail para liberar o acesso.</p>}
                </div>
              ))}
          </li>
        ))}
      </ul>
      {student.authorizedPickup.length > 0 && (
        <div className="mt-6 border-t border-surface-container-high pt-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-on-surface">
            <ShieldCheck className="size-4 text-sage-600" aria-hidden />
            Autorizados a buscar
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {student.authorizedPickup.map((name) => (
              <li key={name} className="rounded-full bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
