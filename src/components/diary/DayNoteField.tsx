import { useState } from 'react'
import { Heart, Quote, WandSparkles } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const MAX = 600

const templates = [
  'Participou ativamente da oficina de hoje, demonstrando curiosidade e alegria.',
  'Interagiu com carinho durante o lanche coletivo e compartilhou seus brinquedos.',
  'Explorou materiais novos com atenção e concentração.',
  'Descansou tranquilamente e acordou bem-disposto(a) para as atividades da tarde.',
]

/** "Como foi o dia?" — texto visível aos pais, com frases modelo. */
export function DayNoteField({
  value,
  onChange,
  childFirstName,
  error,
}: {
  value: string
  onChange: (value: string) => void
  childFirstName: string
  error?: string
}) {
  const { showToast } = useToast()
  const [showTemplates, setShowTemplates] = useState(false)

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <label htmlFor="day-note" className="flex items-center gap-2 font-semibold">
          <Heart className="size-[1.1rem] text-on-surface-variant" aria-hidden />
          Como foi o dia de {childFirstName}?
        </label>
        <span className="rounded-full bg-primary-fixed/60 px-2.5 py-1 text-xs font-semibold text-primary">
          Visível aos Pais
        </span>
      </div>
      <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
        <textarea
          id="day-note"
          rows={5}
          maxLength={MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          placeholder={`Conte como foi o dia de ${childFirstName}: descobertas, interações, conquistas…`}
          className="w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-outline-variant"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Ajuste de tom com IA estará disponível com a integração do backend.')}
            className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary"
          >
            <WandSparkles className="size-3.5" aria-hidden /> Ajustar Tom
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            aria-expanded={showTemplates}
            className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary"
          >
            <Quote className="size-3.5" aria-hidden /> Frases Modelo
          </button>
          <span className="ml-auto text-xs text-outline">{value.length} carac.</span>
        </div>
        {showTemplates && (
          <ul className="mt-3 space-y-2 border-t border-surface-container pt-3">
            {templates.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(value ? `${value.trim()} ${t}` : `${childFirstName} ${t.charAt(0).toLowerCase()}${t.slice(1)}`)
                    setShowTemplates(false)
                  }}
                  className="w-full rounded-xl bg-surface-container-low px-3 py-2 text-left text-sm hover:bg-aqua-50"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-coral-600" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
