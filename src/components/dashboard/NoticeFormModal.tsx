import { useState, type FormEvent } from 'react'
import { Megaphone, Send } from 'lucide-react'
import { communicationService, getErrorMessage } from '@/services'
import type { ClassGroup, NoticeCategory, NoticeInput, User } from '@/types'
import { useToast } from '@/hooks/useToast'
import { noticeCategoryLabels } from '@/utils/labels'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'

/** Novo comunicado. Professoras publicam só para as próprias turmas. */
export function NoticeFormModal({
  user,
  classes,
  onClose,
  onSaved,
}: {
  user: User
  classes: ClassGroup[]
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const isAdmin = user.role === 'admin'
  const [form, setForm] = useState<NoticeInput>({
    title: '',
    body: '',
    category: 'aviso',
    classId: isAdmin ? null : (classes[0]?.id ?? null),
    pinned: false,
    rsvp: null,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 3) return setError('Informe o título.')
    if (form.body.trim().length < 5) return setError('Escreva o comunicado.')
    if (form.rsvp && !form.rsvp.eventDate) return setError('Informe a data do evento para a confirmação de presença.')
    setSaving(true)
    setError(null)
    try {
      await communicationService.createNotice(form)
      showToast('Comunicado publicado para as famílias!', 'success')
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Novo comunicado" subtitle="Aparece na Área da Família na hora" icon={<Megaphone className="size-5" />}>
      <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <TextField label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextAreaField label="Mensagem" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Tipo"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as NoticeCategory })}
          >
            {Object.entries(noticeCategoryLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Para quem" value={form.classId ?? ''} onChange={(e) => setForm({ ...form, classId: e.target.value || null })}>
            {isAdmin && <option value="">Toda a escola</option>}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.segmentName} · Turma {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={!!form.rsvp}
            onChange={(e) => setForm({ ...form, rsvp: e.target.checked ? { eventDate: '' } : null })}
            className="size-4 accent-primary"
          />
          Pedir confirmação de presença (evento/reunião)
        </label>
        {form.rsvp && (
          <div className="grid gap-3 rounded-2xl bg-surface-container-low p-3 sm:grid-cols-3">
            <TextField
              label="Data"
              type="date"
              value={form.rsvp.eventDate}
              onChange={(e) => setForm({ ...form, rsvp: { ...form.rsvp!, eventDate: e.target.value } })}
            />
            <TextField
              label="Horário"
              placeholder="17h30"
              value={form.rsvp.eventTime ?? ''}
              onChange={(e) => setForm({ ...form, rsvp: { ...form.rsvp!, eventTime: e.target.value } })}
            />
            <TextField
              label="Local"
              placeholder="Na escola"
              value={form.rsvp.location ?? ''}
              onChange={(e) => setForm({ ...form, rsvp: { ...form.rsvp!, location: e.target.value } })}
            />
          </div>
        )}
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="size-4 accent-primary"
            />
            Marcar como importante (fica no topo)
          </label>
        )}
        {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600">{error}</p>}
        <Button type="submit" className="w-full" loading={saving} icon={<Send className="size-4" />}>
          Publicar comunicado
        </Button>
      </form>
    </Modal>
  )
}
