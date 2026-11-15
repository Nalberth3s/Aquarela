import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BookOpenText, ChevronRight, Megaphone, Star } from 'lucide-react'
import { communicationService, diaryService, reportService, studentService } from '@/services'
import type { User } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { firstName, todayISO } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { IconTile } from '@/components/ui/IconTile'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { DayMomentsGallery } from '@/components/diary/DayMomentsGallery'
import { TodayDiaryCard } from '@/components/diary/TodayDiaryCard'
import { ChildStatusCard } from '@/components/family/ChildStatusCard'
import { FamilyNoticeCard } from '@/components/family/FamilyNoticeCard'
import { MilestoneJourney } from '@/components/family/MilestoneJourney'
import { FamilyMessagesCard } from '@/components/family/FamilyMessagesCard'
import { TeacherContactCard } from '@/components/family/TeacherContactCard'

async function loadFamily(selectedId?: string) {
  const [students, classes, notices] = await Promise.all([
    studentService.list(),
    studentService.listClasses(),
    communicationService.listNotices(),
  ])
  const child = students.find((s) => s.id === selectedId) ?? students[0]
  if (!child) return { students, classes, notices, child: undefined, logs: [], milestones: [] }
  const [logs, milestones] = await Promise.all([
    diaryService.listLogs({ studentId: child.id }),
    reportService.listMilestones(child.id),
  ])
  return { students, classes, notices, child, logs, milestones }
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Área da Família — baseada na tela homônima do Stitch. */
export function FamilyHome({ user }: { user: User }) {
  const [selectedId, setSelectedId] = useState<string>()
  const [messagesKey, setMessagesKey] = useState(0)
  const { data, loading, error, reload } = useAsync(() => loadFamily(selectedId), [selectedId])

  if (error) return <ErrorState message={error} onRetry={reload} />
  if (loading && !data) {
    return (
      <div className="space-y-4" role="status" aria-label="Carregando">
        <Skeleton className="h-24" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    )
  }
  if (!data?.child) {
    return <EmptyState title="Nenhuma criança vinculada" description="Fale com a secretaria para vincular seu cadastro." />
  }

  const { child, students, classes, notices, logs, milestones } = data
  const classGroup = classes.find((c) => c.id === child.classId)
  const todayLog = logs.find((l) => l.date === todayISO())
  const unread = notices.filter((n) => n.pinned).length

  return (
    <div className="animate-fade-in space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Olá, {firstName(user.name)} 👋</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Acompanhe o dia e o desenvolvimento de {child.name}
          </p>
        </div>
        <Link
          to="/area/comunicados"
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest shadow-soft"
          aria-label={`Comunicados${unread ? ` (${unread} importante)` : ''}`}
        >
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-coral-400 ring-2 ring-white" />}
        </Link>
      </div>

      {students.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label="Escolher criança">
          {students.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === child.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold',
                s.id === child.id ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant shadow-soft',
              )}
            >
              {firstName(s.name)}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-7 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <div className="space-y-7">
          <ChildStatusCard student={child} classGroup={classGroup} present={!!todayLog} />

          {todayLog ? (
            <TodayDiaryCard log={todayLog} teacherName={classGroup?.teacherName ?? todayLog.authorName} />
          ) : (
            <Card>
              <EmptyState
                icon={<BookOpenText className="size-5" />}
                title="O diário de hoje ainda não chegou"
                description="Assim que a professora enviar o registro, ele aparece aqui."
              />
            </Card>
          )}

          {todayLog && todayLog.photos.length > 0 && (
            <section>
              <SectionTitle
                title="Momentos de Hoje"
                subtitle="Registros fotográficos do cotidiano"
                action={
                  <Link to="/area/diario" className="flex items-center gap-0.5 text-sm font-semibold text-primary">
                    Ver álbum <ChevronRight className="size-4" aria-hidden />
                  </Link>
                }
              />
              <DayMomentsGallery photos={todayLog.photos} />
            </section>
          )}
        </div>

        <div className="space-y-7">
          <section>
            <SectionTitle title="Comunicados & Avisos" />
            <div className="space-y-3">
              {notices.slice(0, 3).map((n) => (
                <FamilyNoticeCard key={n.id} notice={n} />
              ))}
              {notices.length === 0 && (
                <EmptyState icon={<Megaphone className="size-5" />} title="Nenhum comunicado no momento" />
              )}
            </div>
          </section>

          {milestones.length > 0 && (
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <IconTile icon={Star} tone="sun" size="sm" />
                <div className="flex-1">
                  <h2 className="text-lg leading-tight">Jornada Pedagógica</h2>
                  <p className="text-xs text-on-surface-variant">Conquistas e marcos do trimestre</p>
                </div>
                <span className="rounded-full bg-sun-50 px-2.5 py-1 text-xs font-semibold text-sun-600">3º Bimestre</span>
              </div>
              <MilestoneJourney milestones={milestones} />
              <Link
                to="/area/diario"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-aqua-50 py-3 text-sm font-semibold text-primary hover:bg-aqua-100"
              >
                <BookOpenText className="size-4" aria-hidden />
                Ver Diário Pedagógico Completo
              </Link>
            </Card>
          )}

          {classGroup && (
            <TeacherContactCard
              teacherName={classGroup.teacherName}
              classLabel={classGroup.segmentName}
              studentId={child.id}
              onSent={() => setMessagesKey((k) => k + 1)}
            />
          )}
          <FamilyMessagesCard studentId={child.id} refreshKey={messagesKey} />
        </div>
      </div>
    </div>
  )
}
