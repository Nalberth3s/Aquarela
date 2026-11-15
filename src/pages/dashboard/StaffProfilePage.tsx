import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BookOpenText,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  IdCard,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  RotateCcw,
  Save,
  Users,
} from 'lucide-react'
import { getErrorMessage, staffService, userService } from '@/services'
import type { StaffDetail, StaffInput } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { formatAge, formatDate, formatRelativeDateTime, maskCpf, maskPhone, onlyDigits, whatsappNumber } from '@/utils/format'
import { shiftLabels } from '@/utils/labels'
import { missingFields } from '@/utils/staff'
import { isCpf, isEmail, isPhone } from '@/utils/validation'
import { whatsappLink } from '@/utils/whatsapp'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { TextField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { CredentialsModal, type Credentials } from '@/components/dashboard/CredentialsModal'
import { BackLink } from '@/components/dashboard/PageHeader'

const toInput = (m: StaffDetail): StaffInput => ({
  name: m.name,
  email: m.email,
  phone: m.phone ? maskPhone(m.phone) : '',
  cpf: m.cpf ? maskCpf(m.cpf) : '',
  birthDate: m.birthDate ?? '',
  jobTitle: m.jobTitle ?? '',
  hireDate: m.hireDate ?? '',
  address: m.address ?? '',
  emergencyContact: m.emergencyContact ?? '',
  notes: m.notes,
})

const dateLabel = (iso: string) => formatDate(iso, { day: 'numeric', month: 'short', year: 'numeric' })

function Stat({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
      <span className="flex size-9 items-center justify-center rounded-full bg-aqua-50 text-primary">{icon}</span>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-4 py-3">
      <dt className="text-xs text-on-surface-variant">{label}</dt>
      <dd className="mt-0.5 font-semibold break-words">{children || <span className="font-normal text-outline">Não informado</span>}</dd>
    </div>
  )
}

function EditModal({ member, onClose, onSaved }: { member: StaffDetail; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast()
  const [form, setForm] = useState(() => toInput(member))
  const [errors, setErrors] = useState<Partial<Record<keyof StaffInput, string>>>({})
  const [saving, setSaving] = useState(false)
  const set = (patch: Partial<StaffInput>) => setForm((f) => ({ ...f, ...patch }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (form.name.trim().length < 3) next.name = 'Informe o nome completo.'
    if (!isEmail(form.email)) next.email = 'E-mail inválido.'
    if (form.phone && !isPhone(form.phone)) next.phone = 'Telefone com DDD.'
    if (form.cpf && !isCpf(form.cpf)) next.cpf = 'CPF inválido.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await staffService.update(member.id, form)
      showToast('Ficha atualizada.', 'success')
      onSaved()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Editar ficha" subtitle={member.name} icon={<Pencil className="size-5" />}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Nome completo" required value={form.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} />
        <TextField label="E-mail (login)" required type="email" value={form.email} error={errors.email} onChange={(e) => set({ email: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Telefone / WhatsApp"
            inputMode="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => set({ phone: maskPhone(e.target.value) })}
          />
          <TextField label="CPF" inputMode="numeric" value={form.cpf} error={errors.cpf} onChange={(e) => set({ cpf: maskCpf(e.target.value) })} />
          <TextField label="Data de nascimento" type="date" value={form.birthDate} onChange={(e) => set({ birthDate: e.target.value })} />
          <TextField label="Cargo" value={form.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} />
          <TextField label="Data de admissão" type="date" value={form.hireDate} onChange={(e) => set({ hireDate: e.target.value })} />
          <TextField
            label="Contato de emergência"
            placeholder="Nome e telefone"
            value={form.emergencyContact}
            onChange={(e) => set({ emergencyContact: e.target.value })}
          />
        </div>
        <TextField label="Endereço" value={form.address} onChange={(e) => set({ address: e.target.value })} />
        <Button type="submit" className="w-full" loading={saving} icon={<Save className="size-4" />}>
          Salvar ficha
        </Button>
      </form>
    </Modal>
  )
}

function Profile({ member, reload }: { member: StaffDetail; reload: () => void }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(member.notes)
  const [savingNotes, setSavingNotes] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [resetting, setResetting] = useState(false)

  const wa = whatsappNumber(member.phone)
  const first = member.name.split(' ')[0]
  const missing = missingFields(member)
  const roleLabel = member.role === 'admin' ? 'Coordenação' : 'Professora'

  async function saveNotes() {
    setSavingNotes(true)
    try {
      await staffService.update(member.id, { ...toInput(member), notes })
      showToast('Anotações salvas.', 'success')
      reload()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  async function resetPassword() {
    setResetting(true)
    try {
      const { temporaryPassword } = await userService.resetPassword(member.id)
      setCredentials({ name: member.name, email: member.email, temporaryPassword, phone: member.phone, cpfLogin: !!member.cpf })
      reload()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
      {/* Mini perfil */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="text-center">
          <Avatar name={member.name} size="xl" className="mx-auto" />
          <h1 className="mt-3 text-2xl">{member.name}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">{member.jobTitle ?? roleLabel}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            <Badge tone={member.role === 'admin' ? 'lilac' : 'aqua'}>{roleLabel}</Badge>
            {!member.active && <Badge tone="neutral">Acesso desativado</Badge>}
            {member.active && member.mustChangePassword && <Badge tone="sun">Aguardando 1º acesso</Badge>}
          </div>

          <div className="mt-5 grid gap-2 text-left">
            {member.phone && (
              <p className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
                <Phone className="size-4 text-primary" aria-hidden /> <span className="font-semibold">{maskPhone(member.phone)}</span>
              </p>
            )}
            <p className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
              <Mail className="size-4 text-primary" aria-hidden /> <span className="truncate font-semibold">{member.email}</span>
            </p>
            {member.cpf && (
              <p className="flex items-center gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
                <IdCard className="size-4 text-primary" aria-hidden /> <span className="font-semibold">{maskCpf(member.cpf)}</span>
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {wa && (
              <Button
                variant="whatsapp"
                href={whatsappLink(wa, `Olá, ${first}! Aqui é da coordenação da Aquarela do Saber.`)}
                external
                icon={<MessageCircle className="size-4" />}
              >
                Conversar no WhatsApp
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {member.phone && (
                <Button variant="secondary" size="sm" href={`tel:${onlyDigits(member.phone)}`} icon={<Phone className="size-4" />}>
                  Ligar
                </Button>
              )}
              <Button variant="secondary" size="sm" href={`mailto:${member.email}`} icon={<Mail className="size-4" />}>
                E-mail
              </Button>
            </div>
            <Button variant="ghost" size="sm" loading={resetting} onClick={resetPassword} icon={<RotateCcw className="size-4" />}>
              Gerar nova senha e enviar
            </Button>
          </div>
          <p className="mt-3 text-xs text-outline">
            {member.lastLoginAt ? `Último acesso ${formatRelativeDateTime(member.lastLoginAt).toLowerCase()}` : 'Ainda não entrou no sistema'}
          </p>
        </Card>
      </aside>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat icon={<GraduationCap className="size-4" />} value={member.classes.length} label={member.classes.length === 1 ? 'turma' : 'turmas'} />
          <Stat icon={<Users className="size-4" />} value={member.studentCount} label="crianças" />
          <Stat icon={<BookOpenText className="size-4" />} value={member.diaries30d} label="diários em 30 dias" />
          <Stat icon={<ClipboardCheck className="size-4" />} value={member.rollCallDays30d} label="dias de chamada em 30 dias" />
        </div>

        <Card>
          <CardHeader
            title="Dados da funcionária"
            subtitle={missing.length ? `Falta preencher: ${missing.join(', ')}` : 'Ficha completa'}
            action={
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)} icon={<Pencil className="size-4" />}>
                Editar
              </Button>
            }
          />
          <dl className="grid gap-2 sm:grid-cols-2">
            <InfoRow label="Nome completo">{member.name}</InfoRow>
            <InfoRow label="CPF">{member.cpf && maskCpf(member.cpf)}</InfoRow>
            <InfoRow label="Nascimento">{member.birthDate && `${dateLabel(member.birthDate)} (${formatAge(member.birthDate)})`}</InfoRow>
            <InfoRow label="Telefone / WhatsApp">{member.phone && maskPhone(member.phone)}</InfoRow>
            <InfoRow label="Cargo">{member.jobTitle}</InfoRow>
            <InfoRow label="Admissão">{member.hireDate && `${dateLabel(member.hireDate)} (há ${formatAge(member.hireDate)})`}</InfoRow>
            <InfoRow label="Contato de emergência">{member.emergencyContact}</InfoRow>
            <InfoRow label="Conta criada em">{dateLabel(member.createdAt.slice(0, 10))}</InfoRow>
            <div className="sm:col-span-2">
              <InfoRow label="Endereço">{member.address}</InfoRow>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Turmas" subtitle="Definidas em Turmas → professora responsável" />
          {member.classes.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {member.classes.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
                  <GraduationCap className="size-5 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {c.segmentName} · {shiftLabels[c.shift]} · {c.studentCount} crianças
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Nenhuma turma ainda. Vincule em{' '}
              <Link to="/area/turmas" className="font-semibold text-primary hover:underline">
                Turmas
              </Link>
              .
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Atividade recente"
            subtitle={`${member.diariesTotal} diários no total · ${member.reportsTotal} relatórios`}
          />
          {member.recentDiaries.length ? (
            <ul className="divide-y divide-surface-container-high">
              {member.recentDiaries.map((d) => (
                <li key={d.id}>
                  <Link to={`/area/diario/${d.id}`} className="group flex items-center gap-3 py-2.5 text-sm">
                    {d.status === 'enviado' ? (
                      <CalendarCheck className="size-4 text-sage-600" aria-hidden />
                    ) : (
                      <FileText className="size-4 text-outline" aria-hidden />
                    )}
                    <span className="flex-1">
                      <span className="font-semibold group-hover:text-primary">{d.studentName}</span>
                      <span className="text-on-surface-variant"> · diário de {formatDate(d.date, { day: 'numeric', month: 'short' })}</span>
                    </span>
                    {d.status === 'rascunho' && <Badge tone="sun">Rascunho</Badge>}
                    <span className="hidden text-xs text-outline sm:inline">{formatRelativeDateTime(d.updatedAt)}</span>
                    <ChevronRight className="size-4 text-outline" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">Nenhum diário registrado ainda.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Anotações da coordenação" subtitle="Só a coordenação vê. Ex.: férias, atestados, formações, combinados." />
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Ex.: ${first} fez curso de primeiros socorros em março. Férias de 10 a 24 de julho.`}
            className="w-full resize-y rounded-2xl bg-surface-container-low p-4 text-sm leading-relaxed outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={saveNotes} loading={savingNotes} disabled={notes === member.notes} icon={<Save className="size-4" />}>
              Salvar anotações
            </Button>
          </div>
        </Card>
      </div>

      {editing && (
        <EditModal
          member={member}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
        />
      )}
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  )
}

/** Ficha de uma funcionária (dados, turmas e atividade no sistema). */
export default function StaffProfilePage() {
  const { id = '' } = useParams()
  const { data, loading, error, reload } = useAsync(() => staffService.get(id), [id])
  useDocumentTitle(data?.name ?? 'Funcionária')

  return (
    <>
      <BackLink to="/area/funcionarias" label="Funcionárias" />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : data ? (
        <Profile key={`${data.id}-${data.notes}`} member={data} reload={() => void reload()} />
      ) : null}
    </>
  )
}
