import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  Clock,
  Eye,
  EyeOff,
  Headset,
  Heart,
  IdCard,
  Lock,
  Mail,
  MessageCircle,
  PartyPopper,
  PenLine,
  Send,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import officialLogo from '@/assets/brand/logo-oficial.svg'
import { authService, getErrorMessage, type DemoAccount } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { useToast } from '@/hooks/useToast'
import { firstName } from '@/utils/format'
import { roleLabels } from '@/utils/labels'
import { whatsappLink } from '@/utils/whatsapp'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

const inputClass =
  'h-13 w-full rounded-2xl bg-surface-container-low px-5 text-[0.95rem] text-on-surface outline-none placeholder:text-outline transition focus:bg-white focus:ring-4 focus:ring-aqua-400/20'

/** Portal da Família — baseado na tela "Login dos Pais" do Stitch. */
export default function LoginPage() {
  useDocumentTitle('Portal da Família')
  const info = useSchoolInfo()
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/area'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const { data: demoAccounts = [] } = useAsync(() => authService.listDemoAccounts(), [])

  // Sistema recém-instalado: ainda não há coordenação cadastrada.
  useEffect(() => {
    authService
      .getSetupStatus()
      .then((s) => s.needsSetup && navigate('/primeiro-acesso', { replace: true }))
      .catch(() => undefined)
  }, [navigate])

  async function signIn(credentials: { email: string; password: string }, key: string) {
    setSubmitting(key)
    setError(null)
    try {
      const user = await login(credentials)
      showToast(`Bem-vindo(a), ${firstName(user.name)}! Carregando a rotina pedagógica…`, 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(null)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Informe seu e-mail (ou CPF) e a senha de acesso.')
      return
    }
    void signIn({ email, password }, 'form')
  }

  function quickAccess({ user, password: demoPassword }: DemoAccount) {
    setEmail(user.email)
    setPassword(demoPassword)
    void signIn({ email: user.email, password: demoPassword }, user.id)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <WatercolorBlob tone="aqua" variant={0} intensity={0.55} className="absolute -top-24 -left-28 w-[28rem]" />
      <WatercolorBlob tone="lilac" variant={2} intensity={0.45} className="absolute top-40 -right-32 w-[26rem]" />
      <WatercolorBlob
        tone="sun"
        variant={1}
        intensity={0.4}
        className="absolute -bottom-24 left-1/3 hidden w-[24rem] lg:block"
      />

      <header className="relative z-10 flex h-16 items-center justify-between gap-3 bg-surface/70 px-4 backdrop-blur-xl sm:px-8">
        <Link
          to="/"
          className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-high"
          aria-label="Voltar ao site"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <p className="flex-1 truncate text-lg font-semibold">Portal da Família</p>
        <Button to="/matriculas" variant="soft" size="sm">
          Matrícula
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6 pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="relative rounded-3xl bg-white p-3 shadow-soft">
            <img src={officialLogo} alt="Centro Educacional Aquarela do Saber" className="h-24 w-auto" />
            <span className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <Heart className="size-4 fill-current" aria-hidden />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/60 px-3 py-1 text-xs font-semibold text-primary">
            <UsersRound className="size-3.5" aria-hidden />
            Espaço dos Pais & Família
          </span>
          <h1 className="mt-3 text-2xl">Portal da Família</h1>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            Acompanhe de pertinho cada risada, conquista e nova descoberta do seu tesouro.
          </p>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-5 shadow-lift sm:p-6">
          <span
            className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-aqua-400 via-lilac-400 to-sun-400"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => showToast('Enviando código de verificação para o WhatsApp cadastrado…')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sage-50 font-semibold text-sage-600 transition hover:bg-sage-100"
          >
            <MessageCircle className="size-5" aria-hidden />
            Entrar com WhatsApp Cadastrado
          </button>
          <p className="mt-2 text-center text-xs text-on-surface-variant">
            Receba um código de acesso rápido via WhatsApp
          </p>

          <p className="my-5 flex items-center gap-3 text-xs text-outline">
            <span className="h-px flex-1 bg-surface-container-high" />
            ou com senha
            <span className="h-px flex-1 bg-surface-container-high" />
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-id" className="flex items-center gap-2 text-sm font-semibold">
                <IdCard className="size-4 text-on-surface-variant" aria-hidden />
                E-mail ou CPF
              </label>
              <input
                id="login-id"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="ex: juliana.silva@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="size-4 text-on-surface-variant" aria-hidden />
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Enviamos as instruções de redefinição para o WhatsApp cadastrado.')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full"
              loading={submitting === 'form'}
              disabled={!!submitting}
              icon={<BookOpenText className="size-5" />}
            >
              {submitting === 'form' ? 'Carregando o diário…' : 'Entrar no Diário do Aluno'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() =>
              showToast('Para o primeiro acesso, confirme seu CPF com a coordenação para gerar sua chave inicial.')
            }
            className="mx-auto mt-4 flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            <PartyPopper className="size-4 text-sun-600" aria-hidden />
            Primeiro acesso da família? Toque aqui
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-outline">
            <ShieldCheck className="size-3.5" aria-hidden />
            Ambiente seguro • Dados pedagógicos protegidos
          </p>
        </section>

        {/* Contas de demonstração: somem quando o backend real não as fornecer. */}
        {demoAccounts.length > 0 && (
          <section className="rounded-3xl border border-dashed border-outline-variant p-4">
            <p className="mb-3 text-center text-xs font-semibold tracking-wider text-outline uppercase">
              Acesso de demonstração · senha{' '}
              <code className="font-bold normal-case">{demoAccounts[0].password}</code>
            </p>
            <ul className="grid gap-2">
              {demoAccounts.map((account) => (
                <li key={account.user.id}>
                  <button
                    type="button"
                    onClick={() => quickAccess(account)}
                    disabled={!!submitting}
                    className="flex w-full items-center gap-3 rounded-2xl bg-surface-container-lowest p-2.5 text-left shadow-soft transition hover:shadow-lift disabled:opacity-60"
                  >
                    <Avatar name={account.user.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{roleLabels[account.user.role]}</span>
                      <span className="block truncate text-xs text-on-surface-variant">{account.user.name}</span>
                    </span>
                    {submitting === account.user.id ? (
                      <span className="text-xs font-semibold text-outline">Entrando…</span>
                    ) : (
                      <ArrowRight className="size-4 text-outline" aria-hidden />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-3xl bg-surface-container-low p-5">
          <div className="mb-4 flex items-start gap-3">
            <Headset className="mt-0.5 size-5 text-on-surface-variant" aria-hidden />
            <div>
              <h2 className="text-lg">Precisa de ajuda para entrar?</h2>
              <p className="text-xs text-on-surface-variant">Estamos à disposição para acolher sua família</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={whatsappLink(info.whatsappNumber, 'Olá! Preciso de ajuda para acessar o Portal da Família.')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-3.5 transition hover:shadow-soft"
            >
              <MessageCircle className="size-5 text-on-surface-variant" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-on-surface-variant">WhatsApp da Secretaria</span>
                <span className="block font-semibold">{info.whatsapp}</span>
              </span>
              <ArrowRight className="size-4 text-primary" aria-hidden />
            </a>
            <a
              href={`mailto:${info.email}`}
              className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-3.5 transition hover:shadow-soft"
            >
              <Mail className="size-5 text-on-surface-variant" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-on-surface-variant">E-mail Institucional</span>
                <span className="block truncate font-semibold">{info.email}</span>
              </span>
              <Send className="size-4 text-primary" aria-hidden />
            </a>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs font-semibold text-on-surface-variant">
            <Clock className="size-4 shrink-0" aria-hidden />
            Horário da Coordenação: {info.openingHours}
          </p>
        </section>

        <section className="rounded-3xl bg-linear-to-br from-aqua-50 to-lilac-50 p-6 text-center">
          <h2 className="text-lg text-primary">Ainda não faz parte do nosso ninho?</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Venha conhecer nossa proposta pedagógica lúdica, acolhedora e inspirada no afeto.
          </p>
          <Button
            to="/matriculas"
            variant="inverse"
            className="mt-4 w-full shadow-soft"
            icon={<PenLine className="size-4" />}
          >
            Conhecer e Fazer Pré-matrícula
          </Button>
        </section>

        <Link
          to="/"
          className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao site da Aquarela do Saber
        </Link>
        <p className="text-center text-xs text-outline">
          © {new Date().getFullYear()} Aquarela do Saber • Educar com Amor e Arte
        </p>
      </main>
    </div>
  )
}
