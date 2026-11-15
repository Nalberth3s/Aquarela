import { Link } from 'react-router-dom'
import { ArrowRight, Check, ListTodo } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface FirstStepsCounts {
  teachers: number
  classes: number
  students: number
  families: number
}

/** Guia de configuração exibido para a coordenação até o sistema estar pronto. */
export function FirstStepsCard({ counts }: { counts: FirstStepsCounts }) {
  const steps = [
    { done: counts.teachers > 0, title: 'Cadastre as professoras', text: 'Cada uma recebe login e senha provisória.', to: '/area/equipe' },
    { done: counts.classes > 0, title: 'Crie as turmas', text: 'Berçário A, Maternal II… e escolha a regente.', to: '/area/turmas' },
    { done: counts.students > 0, title: 'Cadastre as crianças', text: 'Com responsáveis, autorizados e saúde.', to: '/area/alunos/novo' },
    { done: counts.families > 0, title: 'Libere o acesso das famílias', text: 'Na ficha da criança, em “Dar acesso ao Portal”.', to: '/area/alunos' },
  ]
  const done = steps.filter((s) => s.done).length
  if (done === steps.length) return null

  return (
    <section className="rounded-[2rem] bg-linear-to-br from-sun-50 to-coral-50 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-sun-600 shadow-soft">
          <ListTodo className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="text-lg leading-tight">Primeiros passos</h2>
          <p className="text-sm text-on-surface-variant">
            {done} de {steps.length} concluídos para deixar a escola pronta no sistema
          </p>
        </div>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link
              to={s.to}
              className={cn(
                'group flex items-start gap-3 rounded-2xl bg-white/80 p-3.5 transition hover:bg-white hover:shadow-soft',
                s.done && 'opacity-70',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  s.done ? 'bg-sage-600 text-white' : 'bg-sun-100 text-sun-600',
                )}
              >
                {s.done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block font-semibold', s.done && 'line-through')}>{s.title}</span>
                <span className="block text-sm text-on-surface-variant">{s.text}</span>
              </span>
              {!s.done && <ArrowRight className="mt-1 size-4 text-primary transition group-hover:translate-x-0.5" aria-hidden />}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
