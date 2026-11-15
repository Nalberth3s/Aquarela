import { useRef, useState, type FormEvent } from 'react'
import { ImagePlus, LoaderCircle, Plus, Save, Trash, X } from 'lucide-react'
import { calendarService, getErrorMessage } from '@/services'
import type { CalendarEvent, CalendarEventInput, EventCategory } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/FormField'
import { EventCard } from './EventCard'
import { eventCategories } from './eventCategories'

const empty: CalendarEventInput = {
  title: '',
  category: 'festa',
  date: '',
  summary: '',
  description: '',
  whatToBring: [],
  featured: false,
  published: true,
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-container-low p-4">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:ring-4 peer-focus-visible:ring-aqua-400/30',
          checked ? 'bg-primary' : 'bg-outline-variant',
        )}
        aria-hidden
      >
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-5.5' : 'left-0.5')} />
      </span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-on-surface-variant">{hint}</span>
      </span>
    </label>
  )
}

/** Cadastro/edição de evento do calendário, com prévia de como aparece no site. */
export function EventForm({
  initial,
  onSaved,
}: {
  initial?: CalendarEvent
  onSaved: (event: CalendarEvent) => void
}) {
  const { showToast } = useToast()
  const [form, setForm] = useState<CalendarEventInput>(() => {
    if (!initial) return empty
    const { id: _id, updatedAt: _u, ...rest } = initial
    return rest
  })
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; date?: string; summary?: string; endDate?: string }>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof CalendarEventInput>(key: K, value: CalendarEventInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  function addItem() {
    const item = newItem.trim()
    if (!item) return
    set('whatToBring', [...form.whatToBring, item])
    setNewItem('')
  }

  async function handleImage(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      set('imageUrl', await calendarService.uploadImage(file))
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = {
      title: form.title.trim() ? undefined : 'Informe o nome do evento.',
      date: form.date ? undefined : 'Informe a data.',
      summary: form.summary.trim() ? undefined : 'Escreva uma frase curta sobre o evento.',
      endDate: form.endDate && form.date && form.endDate < form.date ? 'A data final deve ser depois da inicial.' : undefined,
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setSaving(true)
    try {
      const payload = { ...form, endDate: form.endDate || undefined, description: form.description || form.summary }
      const saved = initial ? await calendarService.update(initial.id, payload) : await calendarService.create(payload)
      showToast(saved.published ? 'Evento salvo e publicado no site!' : 'Evento salvo como rascunho.', 'success')
      onSaved(saved)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const preview: CalendarEvent = {
    ...form,
    id: 'previa',
    updatedAt: '',
    title: form.title || 'Nome do evento',
    summary: form.summary || 'Uma frase curta sobre o evento aparece aqui.',
    date: form.date || new Date().toISOString().slice(0, 10),
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-6 rounded-[2rem] bg-surface-container-lowest p-5 shadow-soft sm:p-8">
        <TextField
          label="Nome do evento"
          required
          placeholder="Ex.: Arraiá da Aquarela — Festa Junina"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
        />

        <div>
          <p className="mb-2 text-sm font-semibold">Tipo de evento</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de evento">
            {(Object.keys(eventCategories) as EventCategory[]).map((key) => {
              const meta = eventCategories[key]
              const active = form.category === key
              const Icon = meta.icon
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set('category', key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition',
                    active ? 'bg-on-surface text-white' : cn(toneClasses[meta.tone].soft, toneClasses[meta.tone].text),
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Data"
            type="date"
            required
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            error={errors.date}
          />
          <TextField
            label="Até (opcional)"
            type="date"
            min={form.date}
            value={form.endDate ?? ''}
            onChange={(e) => set('endDate', e.target.value || undefined)}
            error={errors.endDate}
            hint="Para eventos de vários dias"
          />
          <TextField
            label="Horário"
            placeholder="Ex.: 15h às 19h"
            value={form.time ?? ''}
            onChange={(e) => set('time', e.target.value || undefined)}
          />
          <TextField
            label="Local"
            placeholder="Ex.: Pátio da escola"
            value={form.location ?? ''}
            onChange={(e) => set('location', e.target.value || undefined)}
          />
          <TextField
            label="Para quem"
            placeholder="Ex.: Toda a escola, Famílias do Berçário"
            value={form.audience ?? ''}
            onChange={(e) => set('audience', e.target.value || undefined)}
            className="sm:col-span-2"
          />
        </div>

        <TextField
          label="Resumo (aparece no card)"
          required
          maxLength={120}
          placeholder="Ex.: Quadrilha das turmas, barraquinhas e comidas típicas."
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          error={errors.summary}
          hint={`${form.summary.length}/120`}
        />
        <TextAreaField
          label="Informações completas"
          rows={6}
          placeholder="Conte tudo sobre o evento: programação, horários de cada turma, recados para as famílias…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-semibold">O que levar / como participar</p>
          {form.whatToBring.length > 0 && (
            <ul className="mb-3 space-y-2">
              {form.whatToBring.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => set('whatToBring', form.whatToBring.filter((_, j) => j !== i))}
                    className="flex size-7 items-center justify-center rounded-full text-outline hover:bg-surface-container hover:text-coral-600"
                    aria-label={`Remover "${item}"`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem()
                }
              }}
              placeholder="Ex.: Roupa caipira para a criança"
              aria-label="Novo item"
              className="h-11 flex-1 rounded-2xl bg-surface-container-low px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
            />
            <Button variant="soft" onClick={addItem} icon={<Plus className="size-4" />}>
              Adicionar
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Foto de capa (opcional)</p>
          {form.imageUrl ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={form.imageUrl} alt="Capa do evento" className="aspect-[16/8] w-full object-cover" />
              <button
                type="button"
                onClick={() => set('imageUrl', undefined)}
                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-coral-600 shadow"
              >
                <Trash className="size-3.5" aria-hidden /> Remover foto
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant p-8 text-sm text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              {uploading ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
              <span className="font-semibold">Escolher foto</span>
              Sem foto, usamos uma ilustração com as cores do tipo de evento.
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleImage(e.target.files?.[0])} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={form.published}
            onChange={(v) => set('published', v)}
            label="Publicar no site"
            hint="Desligado = rascunho, só a coordenação vê."
          />
          <Toggle
            checked={form.featured}
            onChange={(v) => set('featured', v)}
            label="Destaque"
            hint="Aparece grande no topo do calendário."
          />
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <p className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Prévia no site</p>
        <div className="pointer-events-none">
          <EventCard event={preview} />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={saving} icon={<Save className="size-5" />}>
          {initial ? 'Salvar alterações' : form.published ? 'Salvar e publicar' : 'Salvar rascunho'}
        </Button>
      </aside>
    </form>
  )
}
