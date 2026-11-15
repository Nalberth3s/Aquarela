import { useRef, useState, type FormEvent } from 'react'
import { ImagePlus, LoaderCircle, Save, Trash, UserRound } from 'lucide-react'
import { getErrorMessage, schoolService } from '@/services'
import type { TeamMember, TeamMemberInput, Tone } from '@/types'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { toneClasses } from '@/utils/tones'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'

const tones: Tone[] = ['aqua', 'lilac', 'coral', 'sun', 'sage']

/** Cadastro/edição de uma profissional exibida em "Quem cuida e educa". */
export function TeamMemberModal({
  open,
  member,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean
  member?: TeamMember
  nextOrder: number
  onClose: () => void
  onSaved: (member: TeamMember) => void
}) {
  const { showToast } = useToast()
  const [form, setForm] = useState<TeamMemberInput>(() => ({
    name: member?.name ?? '',
    role: member?.role ?? '',
    bio: member?.bio ?? '',
    photoUrl: member?.photoUrl ?? null,
    tone: member?.tone ?? 'aqua',
    sortOrder: member?.sortOrder ?? nextOrder,
    visible: member?.visible ?? true,
  }))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function upload(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const url = await schoolService.uploadImage(file)
      setForm((f) => ({ ...f, photoUrl: url }))
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2 || form.role.trim().length < 2) return setError('Preencha nome e função.')
    setSaving(true)
    setError(null)
    try {
      const saved = member
        ? await schoolService.updateTeamMember(member.id, form)
        : await schoolService.createTeamMember(form)
      showToast('Equipe atualizada no site.', 'success')
      onSaved(saved)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={member ? 'Editar profissional' : 'Adicionar profissional'}
      subtitle="Aparece na página “A Escola”, em Quem cuida e educa."
      icon={<UserRound className="size-5" />}
    >
      <form onSubmit={handleSubmit} noValidate className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="flex items-center gap-4">
          <Avatar name={form.name || '?'} src={form.photoUrl ?? undefined} size="xl" tone={form.tone} />
          <div className="flex flex-col gap-2">
            <Button
              variant="soft"
              size="sm"
              onClick={() => fileRef.current?.click()}
              icon={uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            >
              {form.photoUrl ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
            {form.photoUrl && (
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, photoUrl: null })} icon={<Trash className="size-4" />}>
                Remover foto
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField
          label="Função"
          placeholder="Ex.: Professora · Berçário A"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <TextAreaField
          label="Apresentação (opcional)"
          rows={3}
          value={form.bio ?? ''}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <div>
          <p className="mb-2 text-sm font-semibold">Cor (quando não há foto)</p>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tone: t })}
                aria-label={`Cor ${t}`}
                aria-pressed={form.tone === t}
                className={cn('size-9 rounded-full', toneClasses[t].bg, form.tone === t && 'ring-2 ring-on-surface ring-offset-2')}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Ordem"
            type="number"
            value={String(form.sortOrder ?? 0)}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            hint="Menor aparece primeiro"
          />
          <label className="mt-7 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.visible ?? true}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="size-4 accent-primary"
            />
            Mostrar no site
          </label>
        </div>
        {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600">{error}</p>}
        <Button type="submit" className="w-full" loading={saving} icon={<Save className="size-4" />}>
          Salvar
        </Button>
      </form>
    </Modal>
  )
}
