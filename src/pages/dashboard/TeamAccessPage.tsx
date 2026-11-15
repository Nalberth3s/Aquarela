import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, IdCard, Pencil, Plus, RotateCcw, Trash, UserCheck, UserPlus, UserX, Users } from 'lucide-react'
import { getErrorMessage, schoolService, userService } from '@/services'
import type { ManagedUser, TeamMember, UserRole } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { roleLabels } from '@/utils/labels'
import { maskCpf, maskPhone } from '@/utils/format'
import { isCpf, isEmail, isPhone } from '@/utils/validation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, SkeletonList } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { CredentialsModal, type Credentials } from '@/components/dashboard/CredentialsModal'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TeamMemberModal } from '@/components/dashboard/TeamMemberModal'

type Tab = 'contas' | 'site'
type RoleFilter = UserRole | 'todos'

const emptyForm = { name: '', email: '', phone: '', cpf: '', role: 'teacher' as UserRole, jobTitle: '', hireDate: '' }

function NewUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Credentials, u: ManagedUser) => void }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (patch: Partial<typeof emptyForm>) => setForm((f) => ({ ...f, ...patch }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (form.name.trim().split(/\s+/).length < 2) next.name = 'Informe nome e sobrenome.'
    if (!isEmail(form.email)) next.email = 'Informe um e-mail válido.'
    if (!isPhone(form.phone)) next.phone = 'Informe o WhatsApp com DDD.'
    if (form.cpf && !isCpf(form.cpf)) next.cpf = 'CPF inválido.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    setError(null)
    try {
      const { user, temporaryPassword } = await userService.create({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        jobTitle: form.jobTitle.trim() || (form.role === 'teacher' ? 'Professora' : 'Coordenação'),
      })
      onCreated({ name: user.name, email: user.email, temporaryPassword, phone: form.phone, cpfLogin: !!form.cpf }, user)
      setForm(emptyForm)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova conta de acesso" subtitle="Professora ou coordenação" icon={<UserPlus className="size-5" />}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <SelectField label="Perfil" value={form.role} onChange={(e) => set({ role: e.target.value as UserRole })}>
          <option value="teacher">Professora — vê e registra só as próprias turmas</option>
          <option value="admin">Coordenação — acesso total ao sistema</option>
        </SelectField>
        <TextField label="Nome completo" required value={form.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} />
        <TextField
          label="E-mail (será o login)"
          required
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => set({ email: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Telefone / WhatsApp"
            required
            inputMode="tel"
            placeholder="(62) 99999-9999"
            value={form.phone}
            error={errors.phone}
            hint="O login vai para este número."
            onChange={(e) => set({ phone: maskPhone(e.target.value) })}
          />
          <TextField
            label="CPF (opcional)"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={form.cpf}
            error={errors.cpf}
            hint="Também serve para entrar."
            onChange={(e) => set({ cpf: maskCpf(e.target.value) })}
          />
          <TextField
            label="Cargo"
            placeholder={form.role === 'teacher' ? 'Professora' : 'Coordenação'}
            value={form.jobTitle}
            onChange={(e) => set({ jobTitle: e.target.value })}
          />
          <TextField label="Data de admissão" type="date" value={form.hireDate} onChange={(e) => set({ hireDate: e.target.value })} />
        </div>
        <p className="rounded-2xl bg-aqua-50 p-3 text-sm text-primary">
          Contas das famílias são criadas no cadastro da criança, em “Responsáveis”. Os demais dados da funcionária ficam na aba
          “Funcionárias”.
        </p>
        {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600">{error}</p>}
        <Button type="submit" className="w-full" loading={saving} icon={<UserPlus className="size-4" />}>
          Criar conta com senha provisória
        </Button>
      </form>
    </Modal>
  )
}

/** Coordenação: contas de login e equipe exibida no site. */
export default function TeamAccessPage() {
  useDocumentTitle('Equipe e acessos')
  const me = useCurrentUser()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('contas')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos')
  const [newOpen, setNewOpen] = useState(false)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [memberModal, setMemberModal] = useState<{ open: boolean; member?: TeamMember }>({ open: false })
  const [confirm, setConfirm] = useState<{ title: string; text: string; action: () => Promise<void> } | null>(null)
  const [busy, setBusy] = useState(false)

  const users = useAsync(() => userService.list(), [])
  const team = useAsync(() => schoolService.listTeamAdmin(), [])
  const allUsers = users.data ?? []
  const visibleUsers = roleFilter === 'todos' ? allUsers : allUsers.filter((u) => u.role === roleFilter)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const resetPassword = (u: ManagedUser) =>
    run(async () => {
      const { temporaryPassword } = await userService.resetPassword(u.id)
      setCredentials({ name: u.name, email: u.email, temporaryPassword, phone: u.phone, cpfLogin: !!u.cpf })
      void users.reload()
    })

  const toggleActive = (u: ManagedUser) =>
    run(async () => {
      await userService.update(u.id, { name: u.name, email: u.email, active: !u.active })
      showToast(u.active ? 'Acesso desativado.' : 'Acesso reativado.', 'success')
      void users.reload()
    })

  return (
    <>
      <PageHeader
        title="Equipe e acessos"
        description="Quem entra no sistema e quem aparece na página da escola."
        actions={
          tab === 'contas' ? (
            <Button onClick={() => setNewOpen(true)} icon={<UserPlus className="size-4" />}>
              Nova conta
            </Button>
          ) : (
            <Button onClick={() => setMemberModal({ open: true })} icon={<Plus className="size-4" />}>
              Adicionar profissional
            </Button>
          )
        }
      />
      <Tabs
        className="mb-6"
        label="Seção"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'contas', label: 'Contas de acesso', count: allUsers.length },
          { value: 'site', label: 'Equipe no site', count: team.data?.length },
        ]}
      />

      {tab === 'contas' ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(['todos', 'admin', 'teacher', 'guardian'] as RoleFilter[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                aria-pressed={roleFilter === r}
                className={
                  roleFilter === r
                    ? 'rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-white'
                    : 'rounded-full bg-surface-container-lowest px-3.5 py-1.5 text-sm font-semibold text-on-surface-variant shadow-soft'
                }
              >
                {r === 'todos' ? 'Todos' : roleLabels[r]}
              </button>
            ))}
          </div>
          {users.error ? (
            <ErrorState message={users.error} onRetry={users.reload} />
          ) : users.loading && !users.data ? (
            <SkeletonList rows={4} />
          ) : visibleUsers.length ? (
            <ul className="grid gap-3">
              {visibleUsers.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
                  <Avatar name={u.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {u.name}
                      {u.id === me.id && <span className="text-xs font-medium text-outline">(você)</span>}
                    </p>
                    <p className="truncate text-sm text-on-surface-variant">
                      {u.email}
                      {u.phone && ` · ${maskPhone(u.phone)}`}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone={u.role === 'admin' ? 'lilac' : u.role === 'teacher' ? 'aqua' : 'sage'}>{roleLabels[u.role]}</Badge>
                      {!u.active && <Badge tone="neutral">Desativado</Badge>}
                      {u.active && u.mustChangePassword && <Badge tone="sun">Aguardando 1º acesso</Badge>}
                    </div>
                  </div>
                  {u.role !== 'guardian' && (
                    <Button variant="secondary" size="sm" to={`/area/funcionarias/${u.id}`} icon={<IdCard className="size-4" />}>
                      Ficha
                    </Button>
                  )}
                  {u.id !== me.id && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => resetPassword(u)} icon={<RotateCcw className="size-4" />}>
                        Nova senha
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => toggleActive(u)}
                        icon={u.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                      >
                        {u.active ? 'Desativar' : 'Reativar'}
                      </Button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirm({
                            title: 'Excluir conta?',
                            text: `${u.name} perde o acesso. Registros feitos por esta conta continuam salvos.`,
                            action: async () => {
                              await userService.remove(u.id)
                              showToast('Conta excluída.', 'success')
                              void users.reload()
                            },
                          })
                        }
                        className="flex size-9 items-center justify-center rounded-full text-coral-600 hover:bg-coral-50"
                        aria-label={`Excluir conta de ${u.name}`}
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Users className="size-5" />} title="Nenhuma conta neste perfil" />
          )}
        </>
      ) : team.error ? (
        <ErrorState message={team.error} onRetry={team.reload} />
      ) : team.loading && !team.data ? (
        <SkeletonList rows={4} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {(team.data ?? []).map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
              <Avatar name={m.name} src={m.photoUrl ?? undefined} size="lg" tone={m.tone} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-on-surface-variant">{m.role}</p>
                {!m.visible && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-outline">
                    <EyeOff className="size-3.5" aria-hidden /> Oculta no site
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    await schoolService.updateTeamMember(m.id, { ...m, visible: !m.visible })
                    void team.reload()
                  })
                }
                className="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
                aria-label={m.visible ? `Ocultar ${m.name} do site` : `Mostrar ${m.name} no site`}
              >
                {m.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setMemberModal({ open: true, member: m })}
                className="flex size-9 items-center justify-center rounded-full text-primary hover:bg-aqua-50"
                aria-label={`Editar ${m.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    title: 'Remover da equipe do site?',
                    text: `${m.name} deixa de aparecer na página “A Escola”.`,
                    action: async () => {
                      await schoolService.deleteTeamMember(m.id)
                      void team.reload()
                    },
                  })
                }
                className="flex size-9 items-center justify-center rounded-full text-coral-600 hover:bg-coral-50"
                aria-label={`Remover ${m.name}`}
              >
                <Trash className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewUserModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(c) => {
          setNewOpen(false)
          setCredentials(c)
          void users.reload()
        }}
      />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      {memberModal.open && (
        <TeamMemberModal
          open
          member={memberModal.member}
          nextOrder={(team.data?.length ?? 0) + 1}
          onClose={() => setMemberModal({ open: false })}
          onSaved={() => {
            setMemberModal({ open: false })
            void team.reload()
          }}
        />
      )}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.title ?? ''} icon={<Trash className="size-5" />}>
        <p className="text-on-surface-variant">{confirm?.text}</p>
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirm(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" loading={busy} onClick={() => confirm && run(confirm.action)}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  )
}
