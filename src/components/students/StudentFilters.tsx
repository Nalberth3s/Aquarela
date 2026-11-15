import { Search } from 'lucide-react'
import type { ClassGroup, StudentFilters as Filters, StudentStatus } from '@/types'
import { studentStatusLabels } from '@/utils/labels'

const selectClass =
  'h-11 rounded-full border border-surface-container-high bg-white px-4 text-sm font-semibold text-on-surface-variant outline-none focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100'

export function StudentFilters({
  value,
  onChange,
  classes,
}: {
  value: Filters
  onChange: (value: Filters) => void
  classes: ClassGroup[]
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Buscar aluno</span>
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-outline" aria-hidden />
        <input
          type="search"
          placeholder="Buscar pelo nome…"
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="h-11 w-full rounded-full border border-surface-container-high bg-white pr-4 pl-11 text-sm outline-none placeholder:text-outline/70 focus:border-aqua-400 focus:ring-4 focus:ring-aqua-100"
        />
      </label>
      {classes.length > 1 && (
        <select
          aria-label="Filtrar por turma"
          value={value.classId ?? ''}
          onChange={(e) => onChange({ ...value, classId: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Todas as turmas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.segmentName}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label="Filtrar por situação"
        value={value.status ?? ''}
        onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as StudentStatus | undefined })}
        className={selectClass}
      >
        <option value="">Todas as situações</option>
        {Object.entries(studentStatusLabels).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
