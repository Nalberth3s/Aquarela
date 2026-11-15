import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Baby, HeartPulse, ImagePlus, LoaderCircle, Plus, Save, ShieldCheck, Trash, Users } from 'lucide-react'
import { getErrorMessage, studentService } from '@/services'
import type { ClassGroup, Guardian, Student, StudentInput } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { maskPhone, todayISO } from '@/utils/format'
import { shiftLabels, studentStatusLabels } from '@/utils/labels'
import { isEmail, isPhone } from '@/utils/validation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { TagInput } from '@/components/ui/TagInput'
import { PageHeader } from '@/components/dashboard/PageHeader'

const emptyGuardian: Guardian = { name: '', relationship: 'Mãe', phone: '', email: '' }

function toInput(s?: Student): StudentInput {
  return {
    name: s?.name ?? '',
    birthDate: s?.birthDate ?? '',
    classId: s?.classId ?? '',
    shift: s?.shift ?? 'integral',
    status: s?.status ?? 'em_adaptacao',
    enrolledAt: s?.enrolledAt ?? todayISO(),
    photoUrl: s?.photoUrl,
    authorizedPickup: s?.authorizedPickup ?? [],
    health: {
      allergies: s?.health.allergies ?? [],
      dietaryRestrictions: s?.health.dietaryRestrictions ?? [],
      notes: s?.health.notes ?? '',
    },
    guardians: s?.guardians.length ? s.guardians.map((g) => ({ ...g, email: g.email ?? '' })) : [{ ...emptyGuardian }],
  }
}

function Section({ icon: Icon, title, children }: { icon: typeof Baby; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-[2rem] bg-surface-container-lowest p-5 shadow-soft sm:p-7">
      <h2 className="flex items-center gap-2 text-lg">
        <Icon className="size-5 text-primary" aria-hidden /> {title}
      </h2>
      {children}
    </section>
  )
}

function StudentForm({ student, classes }: { student?: Student; classes: ClassGroup[] }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState<StudentInput>(() => toInput(student))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const setGuardian = (i: number, patch: Partial<Guardian>) =>
    set('guardians', form.guardians.map((g, j) => (j === i ? { ...g, ...patch } : g)))

  async function upload(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      set('photoUrl', await studentService.uploadPhoto(file))
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUploading(false)
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (form.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.'
    if (!form.birthDate || form.birthDate > todayISO()) e.birthDate = 'Informe a data de nascimento.'
    form.guardians.forEach((g, i) => {
      if (g.name.trim().length < 2) e[`g${i}name`] = 'Informe o nome.'
      if (!isPhone(g.phone)) e[`g${i}phone`] = 'Telefone com DDD.'
      if (g.email && !isEmail(g.email)) e[`g${i}email`] = 'E-mail inválido.'
    })
    if (!form.guardians.length) e.guardians = 'Cadastre pelo menos um responsável.'
    return e
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return showToast('Confira os campos destacados.', 'error')
    setSaving(true)
    try {
      const payload: StudentInput = { ...form, classId: form.classId || null } as StudentInput
      const saved = student ? await studentService.update(student.id, payload) : await studentService.create(payload)
      showToast(student ? 'Cadastro atualizado.' : 'Criança cadastrada!', 'success')
      navigate(`/area/alunos/${saved.id}`, { replace: true })
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-6">
      <Section icon={Baby} title="Dados da criança">
        <div className="flex items-center gap-4">
          <Avatar name={form.name || '?'} src={form.photoUrl ?? undefined} size="xl" />
          <Button
            variant="soft"
            size="sm"
            onClick={() => fileRef.current?.click()}
            icon={uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          >
            {form.photoUrl ? 'Trocar foto' : 'Foto (opcional)'}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome completo" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} className="sm:col-span-2" />
          <TextField
            label="Data de nascimento"
            type="date"
            required
            max={todayISO()}
            value={form.birthDate}
            onChange={(e) => set('birthDate', e.target.value)}
            error={errors.birthDate}
          />
          <TextField label="Data de matrícula" type="date" value={form.enrolledAt ?? ''} onChange={(e) => set('enrolledAt', e.target.value)} />
          <SelectField label="Turma" value={form.classId ?? ''} onChange={(e) => set('classId', e.target.value)}>
            <option value="">Sem turma por enquanto</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.segmentName} · Turma {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Turno" value={form.shift} onChange={(e) => set('shift', e.target.value as StudentInput['shift'])}>
            {Object.entries(shiftLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <SelectField label="Situação" value={form.status} onChange={(e) => set('status', e.target.value as StudentInput['status'])}>
            {Object.entries(studentStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
        </div>
      </Section>

      <Section icon={Users} title="Responsáveis">
        {errors.guardians && <p className="text-sm text-coral-600">{errors.guardians}</p>}
        {form.guardians.map((g, i) => (
          <div key={g.id ?? i} className="rounded-2xl bg-surface-container-low p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Responsável {i + 1}</p>
              {form.guardians.length > 1 && (
                <button
                  type="button"
                  onClick={() => set('guardians', form.guardians.filter((_, j) => j !== i))}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-coral-600"
                >
                  <Trash className="size-4" aria-hidden /> Remover
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nome" value={g.name} onChange={(e) => setGuardian(i, { name: e.target.value })} error={errors[`g${i}name`]} />
              <SelectField label="Parentesco" value={g.relationship} onChange={(e) => setGuardian(i, { relationship: e.target.value })}>
                {['Mãe', 'Pai', 'Avó', 'Avô', 'Tia', 'Tio', 'Responsável legal', 'Outro'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </SelectField>
              <TextField
                label="Telefone / WhatsApp"
                inputMode="tel"
                value={g.phone}
                onChange={(e) => setGuardian(i, { phone: maskPhone(e.target.value) })}
                error={errors[`g${i}phone`]}
              />
              <TextField
                label="E-mail"
                type="email"
                value={g.email ?? ''}
                onChange={(e) => setGuardian(i, { email: e.target.value })}
                error={errors[`g${i}email`]}
                hint="Necessário para dar acesso ao Portal da Família."
              />
            </div>
          </div>
        ))}
        <Button variant="soft" onClick={() => set('guardians', [...form.guardians, { ...emptyGuardian, relationship: 'Pai' }])} icon={<Plus className="size-4" />}>
          Adicionar responsável
        </Button>
      </Section>

      <Section icon={ShieldCheck} title="Autorizados a buscar">
        <TagInput
          label="Pessoas autorizadas"
          values={form.authorizedPickup}
          onChange={(v) => set('authorizedPickup', v)}
          placeholder="Ex.: Lúcia Souza (avó)"
          hint="A criança só é entregue a estas pessoas."
        />
      </Section>

      <Section icon={HeartPulse} title="Saúde e alimentação">
        <TagInput label="Alergias" values={form.health.allergies} onChange={(v) => set('health', { ...form.health, allergies: v })} placeholder="Ex.: Amendoim" />
        <TagInput
          label="Restrições alimentares"
          values={form.health.dietaryRestrictions}
          onChange={(v) => set('health', { ...form.health, dietaryRestrictions: v })}
          placeholder="Ex.: Lactose"
        />
        <TextAreaField
          label="Observações de saúde"
          rows={3}
          value={form.health.notes ?? ''}
          onChange={(e) => set('health', { ...form.health, notes: e.target.value })}
          placeholder="Medicamentos, cuidados especiais…"
        />
      </Section>

      <div className="sticky bottom-20 z-10 lg:bottom-4">
        <Button type="submit" size="lg" className="w-full" loading={saving} icon={<Save className="size-5" />}>
          {student ? 'Salvar alterações' : 'Cadastrar criança'}
        </Button>
      </div>
    </form>
  )
}

/** /area/alunos/novo e /area/alunos/:id/editar (coordenação). */
export default function StudentFormPage() {
  const { id } = useParams()
  useDocumentTitle(id ? 'Editar cadastro' : 'Nova criança')
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([id ? studentService.getById(id) : Promise.resolve(undefined), studentService.listClasses()]).then(
        ([student, classes]) => ({ student, classes }),
      ),
    [id],
  )

  return (
    <>
      <PageHeader
        backTo={id ? `/area/alunos/${id}` : '/area/alunos'}
        backLabel={id ? 'Voltar ao perfil' : 'Alunos'}
        title={id ? 'Editar cadastro' : 'Nova criança'}
        description="Dados da criança, responsáveis, autorizados e saúde."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Skeleton className="mx-auto h-[40rem] max-w-3xl rounded-[2rem]" />
      ) : (
        <StudentForm key={id ?? 'nova'} student={data.student} classes={data.classes} />
      )}
    </>
  )
}
