import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { authService, getErrorMessage } from '@/services'
import { useAuth, useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/dashboard/PageHeader'

/** Troca de senha — obrigatória quando a conta foi criada com senha provisória. */
export default function ChangePasswordPage() {
  useDocumentTitle('Minha senha')
  const user = useCurrentUser()
  const { setUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.next.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.')
    if (form.next !== form.confirm) return setError('As senhas novas não conferem.')
    setSaving(true)
    setError(null)
    try {
      setUser(await authService.changePassword(form.current, form.next))
      showToast('Senha criada! Agora é só usar o sistema.', 'success')
      navigate('/area', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title={user.mustChangePassword ? 'Crie sua senha' : 'Trocar senha'}
        description={
          user.mustChangePassword
            ? 'Você entrou com uma senha provisória. Por segurança, crie uma senha pessoal para continuar.'
            : 'Escolha uma nova senha para a sua conta.'
        }
      />
      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-soft">
        <TextField
          label={user.mustChangePassword ? 'Senha provisória' : 'Senha atual'}
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
        />
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres."
          value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })}
        />
        <TextField
          label="Confirme a nova senha"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        {error && (
          <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={saving} icon={<KeyRound className="size-4" />}>
          Salvar senha
        </Button>
      </form>
    </div>
  )
}
