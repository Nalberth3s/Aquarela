import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Lock, LockOpen, RotateCw, ShieldAlert, Trash2 } from 'lucide-react'
import { ApiError, devService, getErrorMessage, type TableStat } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { TextField } from '@/components/ui/FormField'
import { IconTile } from '@/components/ui/IconTile'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, SkeletonList } from '@/components/ui/States'
import { PageHeader } from '@/components/dashboard/PageHeader'

const CONFIRM_WORD = 'APAGAR'

/** Nome amigável de cada tabela; as que não estão aqui aparecem com o nome técnico. */
const tableLabels: Record<string, string> = {
  users: 'Contas de acesso',
  students: 'Alunos',
  guardians: 'Responsáveis',
  classes: 'Turmas',
  daily_logs: 'Diário de bordo',
  roll_calls: 'Chamadas',
  observations: 'Observações',
  milestones: 'Marcos de desenvolvimento',
  development_reports: 'Relatórios',
  notices: 'Comunicados',
  notice_rsvps: 'Confirmações de comunicados',
  teacher_messages: 'Recados',
  message_replies: 'Respostas de recados',
  calendar_events: 'Calendário',
  leads: 'Interessados',
  enrollment_requests: 'Pré-matrículas',
  contact_messages: 'Mensagens do site',
  team_members: 'Equipe do site',
  school_settings: 'Dados da escola',
  site_content: 'Textos do site',
}

function UnlockCard({ onUnlocked, notice }: { onUnlocked: (token: string, tables: TableStat[]) => void; notice?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { devToken, tables } = await devService.unlock(email.trim(), password)
      setPassword('')
      onUnlocked(devToken, tables)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <IconTile icon={Lock} tone="lilac" />
        <div>
          <h2 className="font-sans text-base font-bold tracking-normal">Acesso de desenvolvedor</h2>
          <p className="text-sm text-outline">Entre com o e-mail e a senha de dev para gerenciar o banco.</p>
        </div>
      </div>
      {notice && <p className="mb-4 rounded-2xl bg-sun-50 p-3 text-sm text-on-surface-variant">{notice}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="E-mail" type="email" autoComplete="off" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Senha"
          type="password"
          autoComplete="off"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" loading={loading} icon={<LockOpen className="size-4" />}>
          Entrar
        </Button>
      </form>
    </Card>
  )
}

function ResetModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [typed, setTyped] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (typed !== CONFIRM_WORD) return
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setTyped('')
        onClose()
      }}
      title="Apagar todo o banco?"
      subtitle="Não tem como desfazer"
      icon={<ShieldAlert className="size-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Todas as contas (inclusive a sua), alunos, turmas, diário, relatórios, comunicados, interessados e fotos enviadas serão
          apagados. Os textos do site voltam ao original e o sistema abre de novo no <strong>primeiro acesso</strong>.
        </p>
        <TextField
          label={`Digite ${CONFIRM_WORD} para confirmar`}
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value.toUpperCase())}
        />
        <Button
          type="submit"
          variant="danger"
          className="w-full"
          loading={loading}
          disabled={typed !== CONFIRM_WORD}
          icon={<Trash2 className="size-4" />}
        >
          Apagar tudo agora
        </Button>
      </form>
    </Modal>
  )
}

/** Coordenação + login de desenvolvedor: visão das tabelas e reset completo do banco. */
export default function DatabasePage() {
  useDocumentTitle('Banco de dados')
  const { logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const status = useAsync(() => devService.status(), [])
  // Token só em memória: recarregar a página pede o login de dev de novo.
  const [devToken, setDevToken] = useState<string | null>(null)
  const [tables, setTables] = useState<TableStat[]>([])
  const [notice, setNotice] = useState<string>()
  const [refreshing, setRefreshing] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const total = tables.reduce((sum, t) => sum + t.rows, 0)

  function lock(message?: string) {
    setDevToken(null)
    setTables([])
    setResetOpen(false)
    setNotice(message)
  }

  function handleDevError(err: unknown) {
    if (err instanceof ApiError && err.code === 'DEV_LOCKED') lock(err.message)
    else showToast(getErrorMessage(err), 'error')
  }

  async function refresh() {
    if (!devToken) return
    setRefreshing(true)
    try {
      setTables((await devService.tables(devToken)).tables)
    } catch (err) {
      handleDevError(err)
    } finally {
      setRefreshing(false)
    }
  }

  async function reset() {
    if (!devToken) return
    try {
      await devService.resetDatabase(devToken)
    } catch (err) {
      handleDevError(err)
      return
    }
    // A conta atual também foi apagada: sai da sessão e abre o primeiro acesso.
    navigate('/primeiro-acesso', { replace: true })
    await logout()
    showToast('Banco apagado. Crie a conta da coordenação de novo.', 'success')
  }

  return (
    <>
      <PageHeader
        title="Banco de dados"
        description="Ferramenta de desenvolvedor. Mostra o que está guardado e permite zerar o sistema."
        actions={
          devToken && (
            <>
              <Button variant="secondary" size="sm" loading={refreshing} icon={<RotateCw className="size-4" />} onClick={refresh}>
                Atualizar
              </Button>
              <Button variant="ghost" size="sm" icon={<Lock className="size-4" />} onClick={() => lock()}>
                Bloquear
              </Button>
            </>
          )
        }
      />

      {status.loading ? (
        <SkeletonList rows={2} />
      ) : !status.data?.enabled ? (
        <EmptyState
          icon={<Database className="size-5" />}
          title="Acesso de desenvolvedor desativado"
          description="Defina DEV_EMAIL e DEV_PASSWORD_HASH no servidor para liberar esta aba."
        />
      ) : !devToken ? (
        <UnlockCard
          notice={notice}
          onUnlocked={(token, list) => {
            setDevToken(token)
            setTables(list)
            setNotice(undefined)
          }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card className="animate-fade-up">
            <CardHeader
              title="Tabelas"
              subtitle={`${tables.length} tabelas · ${total.toLocaleString('pt-BR')} registros no total`}
            />
            <ul className="divide-y divide-surface-container-low">
              {tables.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-on-surface">{tableLabels[t.name] ?? t.name}</p>
                    <p className="truncate font-mono text-xs text-outline">{t.name}</p>
                  </div>
                  <span
                    className={
                      t.rows
                        ? 'rounded-full bg-aqua-50 px-3 py-1 text-sm font-semibold text-primary tabular-nums'
                        : 'rounded-full bg-surface-container-low px-3 py-1 text-sm text-outline tabular-nums'
                    }
                  >
                    {t.rows.toLocaleString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="h-fit animate-fade-up ring-1 ring-coral-100">
            <div className="mb-4 flex items-center gap-3">
              <IconTile icon={ShieldAlert} tone="coral" />
              <h2 className="font-sans text-base font-bold tracking-normal">Zona de perigo</h2>
            </div>
            <p className="text-sm text-on-surface-variant">
              Apaga <strong>todo o banco</strong> e as fotos enviadas, igual a começar do zero. Depois disso o sistema pede para criar a
              conta da coordenação de novo.
            </p>
            <Button variant="danger" className="mt-5 w-full" icon={<Trash2 className="size-4" />} onClick={() => setResetOpen(true)}>
              Apagar todo o banco
            </Button>
          </Card>
        </div>
      )}

      <ResetModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={reset} />
    </>
  )
}
