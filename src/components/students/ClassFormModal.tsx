import { useState, type FormEvent } from 'react'
import { GraduationCap, Save, Trash } from 'lucide-react'
import { getErrorMessage, studentService } from '@/services'
import type { ClassGroup, ClassInput, ManagedUser, Tone } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { shiftLabels } from '@/utils/labels'
import { toneClasses } from '@/utils/tones'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'

const segments = [
  { id: 'bercario', name: 'Berçário' },
  { id: 'maternal', name: 'Maternal' },
  { id: 'jardim', name: 'Jardim' },
] as const
const tones: Tone[] = ['aqua', 'sage', 'sun', 'coral', 'lilac']

export function ClassFormModal({
  classGroup,
  teachers,
  onClose,
  onSaved,
}: {
  classGroup?: ClassGroup
  teachers: ManagedUser[]
  onClose: () => void
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const [form, setForm] = useState<ClassInput>(() => ({
    name: classGroup?.name ?? '',
    segmentId: (classGroup?.segmentId as ClassInput['segmentId']) ?? 'maternal',
    segmentName: classGroup?.segmentName ?? '',
    shift: classGroup?.shift ?? 'integral',
    room: classGroup?.room ?? '',
    capacity: classGroup?.capacity ?? 15,
    tone: classGroup?.tone ?? 'aqua',
    teacherId: classGroup?.teacherId ?? null,
  }))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2) return setError('Informe o nome da turma.')
    setSaving(true)
    setError(null)
    try {
      if (classGroup) await studentService.updateClass(classGroup.id, form)
      else await studentService.createClass(form)
      showToast(classGroup ? 'Turma atualizada.' : 'Turma criada!', 'success')
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!classGroup) return
    setSaving(true)
    try {
      await studentService.deleteClass(classGroup.id)
      showToast('Turma excluída.', 'success')
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
      setConfirmDelete(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={classGroup ? 'Editar turma' : 'Nova turma'} icon={<GraduationCap className="size-5" />}>
      <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <TextField label="Nome da turma" placeholder="Ex.: Girassol" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Segmento"
            value={form.segmentId}
            onChange={(e) => setForm({ ...form, segmentId: e.target.value as ClassInput['segmentId'] })}
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Nome da série (opcional)"
            placeholder="Ex.: Maternal II, Berçário A"
            value={form.segmentName}
            onChange={(e) => setForm({ ...form, segmentName: e.target.value })}
          />
          <SelectField label="Turno" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value as ClassInput['shift'] })}>
            {Object.entries(shiftLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <TextField label="Sala" placeholder="Ex.: Sala 3" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <TextField
            label="Vagas"
            type="number"
            min={1}
            value={String(form.capacity)}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || 1 })}
          />
          <SelectField
            label="Professora regente"
            value={form.teacherId ?? ''}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value || null })}
            hint={teachers.length ? undefined : 'Cadastre professoras em Equipe e acessos.'}
          >
            <option value="">A definir</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Cor da turma</p>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tone: t })}
                aria-label={`Cor ${t}`}
                aria-pressed={form.tone === t}
                className={cn('size-9 rounded-full', toneClasses[t].dot, form.tone === t && 'ring-2 ring-on-surface ring-offset-2')}
              />
            ))}
          </div>
        </div>
        {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600">{error}</p>}
        <Button type="submit" className="w-full" loading={saving && !confirmDelete} icon={<Save className="size-4" />}>
          Salvar turma
        </Button>
        {classGroup &&
          (confirmDelete ? (
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" loading={saving} onClick={remove}>
                Confirmar exclusão
              </Button>
            </div>
          ) : (
            <Button variant="ghost" className="w-full text-coral-600" onClick={() => setConfirmDelete(true)} icon={<Trash className="size-4" />}>
              Excluir turma
            </Button>
          ))}
      </form>
    </Modal>
  )
}
