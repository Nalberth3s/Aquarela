import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpenText,
  CircleCheck,
  CirclePlus,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  MapPin,
  Megaphone,
  Search,
  SearchX,
  Users,
  X,
} from 'lucide-react'
import { communicationService, dashboardService, diaryService, studentService, userService } from '@/services'
import type { DailyLog, User } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { normalize, todayISO } from '@/utils/format'
import { roleLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { FirstStepsCard } from '@/components/dashboard/FirstStepsCard'
import { MessagesCard } from '@/components/dashboard/MessagesCard'
import { SchoolFeed } from '@/components/dashboard/SchoolFeed'
import { StatCard } from '@/components/dashboard/StatCard'
import { StudentRosterItem } from '@/components/dashboard/StudentRosterItem'

async function loadPanel(isAdmin: boolean) {
  const today = todayISO()
  const [summary, students, classes, rollCall, logs, feed, messages, users] = await Promise.all([
    dashboardService.getSummary(),
    studentService.list(),
    studentService.listClasses(),
    diaryService.getRollCall(today),
    diaryService.listLogs(),
    diaryService.listSchoolFeed(),
    communicationService.listMessages(),
    isAdmin ? userService.list() : Promise.resolve([]),
  ])
  const firstSteps = {
    teachers: users.filter((u) => u.role === 'teacher').length,
    classes: classes.length,
    students: students.length,
    families: users.filter((u) => u.role === 'guardian').length,
  }
  return { summary, students: students.filter((s) => s.status !== 'inativo'), classes, rollCall, logs, feed, messages, firstSteps }
}

/** Painel de Gestão Escolar — baseado na tela homônima do Stitch. */
export function StaffHome({ user }: { user: User }) {
  const info = useSchoolInfo()
  const { data, loading, error, reload } = useAsync(() => loadPanel(user.role === 'admin'), [user.id])
  const [classFilter, setClassFilter] = useState('todas')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const lastLogByStudent = useMemo(() => {
    const map = new Map<string, DailyLog>()
    for (const log of data?.logs ?? []) if (!map.has(log.studentId)) map.set(log.studentId, log)
    return map
  }, [data?.logs])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading && !data) {
    return (
      <div className="space-y-4" role="status" aria-label="Carregando">
        <Skeleton className="h-24 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }
  if (!data) return null

  const { summary, students, classes, rollCall, feed, messages, firstSteps } = data
  const present = new Set(rollCall.filter((r) => r.present).map((r) => r.studentId))
  const term = normalize(deferredQuery.trim())
  const visible = students.filter((s) => {
    const cls = classes.find((c) => c.id === s.classId)
    const matchesClass = classFilter === 'todas' || s.classId === classFilter
    const haystack = normalize([s.name, s.guardians[0]?.name, cls?.segmentName].join(' '))
    return matchesClass && (!term || haystack.includes(term))
  })

  return (
    <div className="animate-fade-in space-y-7">
      {/* Perfil */}
      <section className="flex items-center gap-4 rounded-3xl bg-linear-to-r from-surface-container-lowest to-aqua-50 p-4 shadow-soft sm:p-5">
        <div className="relative">
          <Avatar name={user.name} size="lg" className="rounded-2xl" />
          <span className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-sage-400 ring-2 ring-white" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl">{user.name}</h1>
          <span className="mt-0.5 inline-block rounded-full bg-lilac-100 px-2.5 py-0.5 text-xs font-semibold text-lilac-600">
            {user.role === 'admin' ? 'Coordenação' : roleLabels[user.role]}
          </span>
          <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
            <MapPin className="size-3.5" aria-hidden />
            {info.city} • Goiás
          </p>
        </div>
        <Link
          to="/area/comunicados"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low"
          aria-label="Comunicados"
        >
          <Bell className="size-5" />
        </Link>
      </section>

      {user.role === 'admin' && <FirstStepsCard counts={firstSteps} />}

      {!!summary.newContactMessages && (
        <Link
          to="/area/interessados"
          className="flex items-center gap-3 rounded-3xl bg-coral-50 p-4 font-semibold text-coral-600 ring-1 ring-coral-100 transition hover:shadow-soft"
        >
          <Inbox className="size-5" aria-hidden />
          <span className="flex-1">
            {summary.newContactMessages} {summary.newContactMessages === 1 ? 'mensagem nova' : 'mensagens novas'} de interessados pelo site
          </span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      {/* Indicadores */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            Painel Pedagógico Geral
          </h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-sage-600">
            <span className="size-2 animate-pulse rounded-full bg-sage-400" aria-hidden />
            Tempo Real
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Alunos Ativos"
            value={summary.students}
            icon={Users}
            tone="aqua"
            hint={
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 font-semibold text-sage-600">
                <ArrowUp className="size-3" aria-hidden /> {summary.attendanceRate}% frequência
              </span>
            }
          />
          <StatCard
            label="Turmas Regulares"
            value={summary.classes}
            icon={GraduationCap}
            tone="lilac"
            hint={<span className="text-on-surface-variant">Berçário a Jardim</span>}
          />
          <StatCard
            label="Relatórios Hoje"
            value={summary.dailyLogsToday}
            icon={BookOpenText}
            tone="sun"
            hint={
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 font-semibold text-sage-600">
                <CircleCheck className="size-3" aria-hidden /> Diário em dia
              </span>
            }
          />
          <StatCard
            label="Avisos Familiares"
            value={summary.activeNotices}
            icon={Megaphone}
            tone="coral"
            hint={<span className="text-on-surface-variant">Ativos no app dos pais</span>}
          />
        </div>
      </section>

      {/* Atalhos */}
      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Atalhos de Gestão</h2>
        <Link
          to="/area/diario/novo"
          className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-primary to-primary-container px-5 py-4 font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
        >
          <CirclePlus className="size-6" aria-hidden />
          <span className="flex-1">+ Novo Relatório do Aluno</span>
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/area/comunicados"
            className="flex items-center gap-2.5 rounded-2xl bg-surface-container-lowest p-3.5 font-semibold shadow-soft hover:shadow-lift"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-lilac-100 text-lilac-600">
              <Megaphone className="size-4" aria-hidden />
            </span>
            Comunicado
          </Link>
          <Link
            to="/area/chamada"
            className="flex items-center gap-2.5 rounded-2xl bg-surface-container-lowest p-3.5 font-semibold shadow-soft hover:shadow-lift"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-sage-100 text-sage-600">
              <ClipboardCheck className="size-4" aria-hidden />
            </span>
            Chamada do Dia
          </Link>
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Alunos */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl">Alunos da Escola</h2>
            <span className="text-sm text-on-surface-variant">{students.length} cadastrados</span>
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar por aluno, turma ou responsável</span>
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-outline" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por aluno, turma ou responsável…"
              className="h-12 w-full rounded-2xl bg-surface-container-lowest pr-11 pl-12 text-sm shadow-soft outline-none focus:ring-4 focus:ring-aqua-400/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-outline hover:bg-surface-container-low"
                aria-label="Limpar busca"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" role="tablist" aria-label="Filtrar por turma">
            {[{ id: 'todas', label: 'Todas' }, ...classes.map((c) => ({ id: c.id, label: c.segmentName }))].map((opt) => {
              const count = opt.id === 'todas' ? students.length : students.filter((s) => s.classId === opt.id).length
              const active = classFilter === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setClassFilter(opt.id)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                    active ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant shadow-soft',
                  )}
                >
                  {opt.label} ({count})
                </button>
              )
            })}
          </div>
          {visible.length ? (
            <ul className="mt-4 space-y-3">
              {visible.map((s) => (
                <StudentRosterItem
                  key={s.id}
                  student={s}
                  classGroup={classes.find((c) => c.id === s.classId)}
                  present={present.has(s.id)}
                  lastLog={lastLogByStudent.get(s.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={<SearchX className="size-5" />}
                title={students.length ? 'Nenhum aluno encontrado' : 'Nenhuma criança cadastrada ainda'}
                description={
                  students.length
                    ? 'Verifique o termo digitado ou troque a turma selecionada acima.'
                    : user.role === 'admin'
                      ? 'Siga os primeiros passos acima para cadastrar turmas e crianças.'
                      : 'Assim que a coordenação vincular crianças às suas turmas, elas aparecem aqui.'
                }
              />
            </div>
          )}
        </section>

        {/* Feed */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl">Atividades Recentes da Escola</h2>
            <Link to="/area/diario" className="text-sm font-semibold text-primary">
              Ver todas
            </Link>
          </div>
          {feed.length ? (
            <SchoolFeed items={feed} />
          ) : (
            <EmptyState title="Nada registrado hoje ainda" description="Os diários enviados hoje aparecem aqui, por turma." />
          )}
          <div className="mt-7">
            <MessagesCard messages={messages} onChanged={() => void reload()} />
          </div>
        </section>
      </div>
    </div>
  )
}
