import { useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Save, Send } from 'lucide-react'
import { getErrorMessage, reportService, studentService } from '@/services'
import type { DevelopmentLevel, DevelopmentReport, DevelopmentReportInput, ExperienceField, ReportStatus, Student } from '@/types'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import { developmentLevels, experienceFields } from '@/utils/labels'
import { toneClasses } from '@/utils/tones'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { TagInput } from '@/components/ui/TagInput'
import { PageHeader } from '@/components/dashboard/PageHeader'

const fields = Object.keys(experienceFields) as ExperienceField[]

function defaultPeriod() {
  const now = new Date()
  return `${now.getMonth() < 6 ? '1º' : '2º'} semestre de ${now.getFullYear()}`
}

function ReportForm({ report, students, presetStudentId }: { report?: DevelopmentReport; students: Student[]; presetStudentId?: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState<DevelopmentReportInput>(() => ({
    studentId: report?.studentId ?? presetStudentId ?? students[0]?.id ?? '',
    period: report?.period ?? defaultPeriod(),
    status: report?.status ?? 'rascunho',
    summary: report?.summary ?? '',
    assessments: fields.map(
      (field) => report?.assessments.find((a) => a.field === field) ?? { field, level: 2 as DevelopmentLevel, comment: '' },
    ),
    highlights: report?.highlights ?? [],
    nextSteps: report?.nextSteps ?? [],
  }))
  const [saving, setSaving] = useState<ReportStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setAssessment = (field: ExperienceField, patch: { level?: DevelopmentLevel; comment?: string }) =>
    setForm((f) => ({ ...f, assessments: f.assessments.map((a) => (a.field === field ? { ...a, ...patch } : a)) }))

  async function save(status: ReportStatus, e?: FormEvent) {
    e?.preventDefault()
    if (!form.studentId) return setError('Escolha a criança.')
    if (form.summary.trim().length < 10) return setError('Escreva o parecer geral (mínimo de 10 caracteres).')
    setSaving(status)
    setError(null)
    try {
      const payload = { ...form, status }
      const saved = report ? await reportService.update(report.id, payload) : await reportService.create(payload)
      showToast(status === 'publicado' ? 'Relatório publicado para a família!' : 'Rascunho salvo.', 'success')
      navigate(`/area/relatorios/${saved.id}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(null)
    }
  }

  return (
    <form onSubmit={(e) => save('publicado', e)} noValidate className="mx-auto max-w-3xl space-y-6">
      <section className="grid gap-4 rounded-[2rem] bg-surface-container-lowest p-5 shadow-soft sm:grid-cols-2 sm:p-7">
        <SelectField label="Criança" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} disabled={!!report}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectField>
        <TextField label="Período" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
        <TextAreaField
          label="Parecer geral (visível à família)"
          rows={5}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="sm:col-span-2"
          placeholder="Como a criança viveu este período: conquistas, interesses, relações…"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg">Campos de experiência (BNCC)</h2>
        {form.assessments.map((a) => {
          const meta = experienceFields[a.field]
          const t = toneClasses[meta.tone]
          return (
            <div key={a.field} className="rounded-3xl bg-surface-container-lowest p-5 shadow-soft">
              <p className="font-semibold">{meta.label}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={meta.label}>
                {([1, 2, 3, 4] as DevelopmentLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={a.level === level}
                    onClick={() => setAssessment(a.field, { level })}
                    className={cn(
                      'rounded-xl px-2 py-2.5 text-sm font-semibold transition',
                      a.level === level ? cn(t.dot, 'text-white') : 'bg-surface-container-low text-on-surface-variant',
                    )}
                  >
                    {developmentLevels[level]}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={a.comment}
                onChange={(e) => setAssessment(a.field, { comment: e.target.value })}
                placeholder="Observação sobre este campo (opcional)"
                aria-label={`Comentário: ${meta.label}`}
                className="mt-3 w-full resize-none rounded-2xl bg-surface-container-low p-3 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-aqua-400/20"
              />
            </div>
          )
        })}
      </section>

      <section className="space-y-4 rounded-[2rem] bg-surface-container-lowest p-5 shadow-soft sm:p-7">
        <TagInput label="Destaques do período" values={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} placeholder="Ex.: Escreveu o próprio nome" />
        <TagInput label="Próximos passos" values={form.nextSteps} onChange={(v) => setForm({ ...form, nextSteps: v })} placeholder="Ex.: Estimular a escrita espontânea" />
      </section>

      {error && <p className="rounded-2xl bg-coral-50 p-3 text-sm text-coral-600">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" size="lg" loading={saving === 'rascunho'} disabled={!!saving} onClick={() => save('rascunho')} icon={<Save className="size-4" />}>
          Salvar rascunho
        </Button>
        <Button type="submit" size="lg" loading={saving === 'publicado'} disabled={!!saving} icon={<Send className="size-4" />}>
          Publicar para a família
        </Button>
      </div>
    </form>
  )
}

/** /area/relatorios/novo?aluno=ID e /area/relatorios/:id/editar */
export default function ReportFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  useDocumentTitle(id ? 'Editar relatório' : 'Novo relatório')
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([id ? reportService.getById(id) : Promise.resolve(undefined), studentService.list({ status: undefined })]).then(
        ([report, students]) => ({ report, students: students.filter((s) => s.status !== 'inativo') }),
      ),
    [id],
  )

  return (
    <>
      <PageHeader
        backTo={id ? `/area/relatorios/${id}` : '/area/relatorios'}
        backLabel="Relatórios"
        title={id ? 'Editar relatório' : 'Novo relatório de desenvolvimento'}
        description="Relatório descritivo organizado pelos campos de experiência da BNCC."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Skeleton className="mx-auto h-[40rem] max-w-3xl rounded-[2rem]" />
      ) : data.students.length === 0 ? (
        <ErrorState message="Nenhuma criança cadastrada nas suas turmas ainda." />
      ) : (
        <ReportForm key={id ?? 'novo'} report={data.report} students={data.students} presetStudentId={params.get('aluno') ?? undefined} />
      )}
    </>
  )
}
