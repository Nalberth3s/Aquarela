import { useId, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from './Button'

/** Lista editável de itens curtos (alergias, autorizados a buscar, "o que levar"...). */
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  hint?: string
}) {
  const [draft, setDraft] = useState('')
  const id = useId()

  function add() {
    const item = draft.trim()
    if (!item || values.includes(item)) return setDraft('')
    onChange([...values, item])
    setDraft('')
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {values.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full bg-surface-container-low py-1 pr-1 pl-3 text-sm">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="flex size-6 items-center justify-center rounded-full text-outline hover:bg-surface-container hover:text-coral-600"
                aria-label={`Remover ${v}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-2xl bg-surface-container-low px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
        />
        <Button variant="soft" onClick={add} icon={<Plus className="size-4" />}>
          Adicionar
        </Button>
      </div>
      {hint && <p className="mt-1 text-sm text-outline">{hint}</p>}
    </div>
  )
}
