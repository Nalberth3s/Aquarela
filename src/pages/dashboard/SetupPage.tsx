import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import officialLogo from '@/assets/brand/logo-oficial.svg'
import { authService, getErrorMessage } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { firstName } from '@/utils/format'
import { isEmail } from '@/utils/validation'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

/** Primeiro acesso: cria a conta da coordenação quando o sistema ainda está vazio. */
export default function SetupPage() {
  useDocumentTitle('Primeiro acesso')
  const { setUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { data: status, loading } = useAsync(() => authService.getSetupStatus(), [])
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!loading && status && !status.needsSetup) return <Navigate to="/entrar" replace />

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = {
      name: form.name.trim().split(/\s+/).length >= 2 ? undefined : 'Informe nome e sobrenome.',
      email: isEmail(form.email) ? undefined : 'Informe um e-mail válido.',
      password: form.password.length >= 8 ? undefined : 'Use pelo menos 8 caracteres.',
      confirm: form.confirm === form.password ? undefined : 'As senhas não conferem.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const session = await authService.completeSetup({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      setUser(session.user)
      showToast(`Bem-vinda, ${firstName(session.user.name)}! Vamos configurar a escola.`, 'success')
      navigate('/area', { replace: true })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <WatercolorBlob tone="aqua" variant={0} intensity={0.55} className="absolute -top-24 -left-28 w-[28rem]" />
      <WatercolorBlob tone="sun" variant={1} intensity={0.45} className="absolute -right-24 -bottom-24 w-[26rem]" />
      <main className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={officialLogo} alt="Centro Educacional Aquarela do Saber" className="h-24 w-auto rounded-3xl bg-white p-3 shadow-soft" />
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sun-50 px-3 py-1 text-xs font-semibold text-sun-600">
            <Sparkles className="size-3.5" aria-hidden /> Primeiro acesso
          </span>
          <h1 className="mt-3 text-2xl">Vamos configurar o sistema</h1>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            Crie a conta da coordenação. Com ela você cadastra professoras, turmas, crianças e dá acesso às famílias.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative space-y-4 overflow-hidden rounded-3xl bg-surface-container-lowest p-6 shadow-lift"
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-aqua-400 via-lilac-400 to-sun-400" aria-hidden />
          <TextField label="Seu nome completo" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
          <TextField label="E-mail" type="email" autoComplete="username" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <TextField
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            hint="Mínimo de 8 caracteres."
          />
          <TextField
            label="Confirme a senha"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            error={errors.confirm}
          />
          {submitError && (
            <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600" role="alert">
              {submitError}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={submitting} iconRight={<ArrowRight className="size-4" />}>
            Criar conta e começar
          </Button>
        </form>
      </main>
    </div>
  )
}
