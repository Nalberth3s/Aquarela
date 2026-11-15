import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightLeft,
  BedDouble,
  Bookmark,
  Brain,
  Camera,
  CalendarDays,
  Eye,
  Heart,
  HeartHandshake,
  Lightbulb,
  Lock,
  Send,
  SlidersHorizontal,
  Star,
  ThumbsUp,
  Utensils,
} from 'lucide-react'
import { diaryService, getErrorMessage } from '@/services'
import type { ClassGroup, DailyLog, DailyLogInput, DiaryStatus, Student } from '@/types'
import { useLocalDraft } from '@/hooks/useLocalDraft'
import { useToast } from '@/hooks/useToast'
import { firstName, formatDate } from '@/utils/format'
import { interactionLabels, mealLabels, participationLabels, restLabels } from '@/utils/labels'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ChoiceGroup, type Choice } from '@/components/ui/ChoiceGroup'
import { Modal } from '@/components/ui/Modal'
import { DayNoteField } from './DayNoteField'
import { DiaryPhotoPicker } from './DiaryPhotoPicker'
import { TodayDiaryCard } from './TodayDiaryCard'

function toChoices<T extends string>(labels: Record<T, string>, short?: Partial<Record<T, string>>): Choice<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: short?.[value] ?? labels[value] }))
}

const participation = toChoices(participationLabels, { em_desenvolvimento: 'Em desenv.' })
const interaction = toChoices(interactionLabels)
const meals = toChoices(mealLabels)
const rest = toChoices(restLabels)

/**
 * Formulário do Diário de Bordo (tela "Novo Registro Diário" do Stitch).
 * Recebe o valor inicial pronto — trocar de criança remonta o componente.
 */
export function DiaryEditor({
  student,
  classGroup,
  date,
  existing,
  onSwapStudent,
}: {
  student: Student
  classGroup?: ClassGroup
  date: string
  existing?: DailyLog
  onSwapStudent: () => void
}) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const draftKey = `aquarela.draft.${student.id}.${date}`

  const initial = useMemo<DailyLogInput>(() => {
    const blank: DailyLogInput = { studentId: student.id, date, dayNote: '', internalNote: '', photos: [] }
    if (existing) return { ...blank, ...existing }
    try {
      const raw = window.localStorage.getItem(draftKey)
      return raw ? { ...blank, ...(JSON.parse(raw) as DailyLogInput), photos: [] } : blank
    } catch {
      return blank
    }
  }, [student.id, date, existing, draftKey])

  const [form, setForm] = useState<DailyLogInput>(initial)
  const [saving, setSaving] = useState<DiaryStatus | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [noteError, setNoteError] = useState<string>()
  const draft = useLocalDraft(draftKey, { ...form, photos: [] })
  const name = firstName(student.name)

  const set = <K extends keyof DailyLogInput>(key: K, value: DailyLogInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const marked = [form.participation, form.interaction, form.meals, form.rest].filter(Boolean).length

  async function save(status: DiaryStatus) {
    if (status === 'enviado' && form.dayNote.trim().length < 20) {
      setNoteError('Escreva ao menos uma frase sobre o dia (mínimo de 20 caracteres) antes de enviar.')
      document.getElementById('day-note')?.focus()
      return
    }
    setNoteError(undefined)
    setSaving(status)
    try {
      const saved = await diaryService.saveLog(form, status)
      draft.clear()
      if (status === 'enviado') {
        showToast('Relatório enviado com sucesso aos responsáveis! 🌟', 'success')
        navigate(`/area/diario/${saved.id}`)
      } else {
        showToast('Rascunho salvo.', 'success')
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(null)
    }
  }

  const previewLog: DailyLog = {
    ...form,
    id: 'preview',
    authorName: classGroup?.teacherName ?? '',
    status: 'enviado',
    updatedAt: new Date().toISOString(),
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-aqua-50 text-primary">
          <CalendarDays className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">Diário Pedagógico</p>
          <h1 className="text-2xl leading-tight">{existing ? 'Editar Registro Diário' : 'Novo Registro Diário'}</h1>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs text-on-surface-variant"
          aria-live="polite"
        >
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          {draft.savedAt ? 'Rascunho salvo' : 'Salvando automático'}
        </span>
      </div>

      {/* Criança */}
      <section className="flex items-center gap-4 rounded-[2rem] bg-surface-container-lowest p-4 shadow-soft sm:p-5">
        <Avatar name={student.name} src={student.photoUrl} size="xl" className="ring-4 ring-primary-fixed" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl">{student.name}</h2>
          {classGroup && (
            <span className="mt-1 inline-block rounded-md bg-lilac-100 px-2 py-0.5 text-sm font-medium text-lilac-600">
              {classGroup.segmentName}
            </span>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <CalendarDays className="size-4" aria-hidden />
            {formatDate(date)}
          </p>
        </div>
        <button
          type="button"
          onClick={onSwapStudent}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-aqua-50"
          aria-label="Trocar criança"
          title="Trocar criança"
        >
          <ArrowRightLeft className="size-5" />
        </button>
      </section>

      {/* Avaliação da rotina */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-[1.1rem] text-on-surface-variant" aria-hidden />
            Avaliação da Rotina
          </h2>
          <span className="text-sm text-on-surface-variant">{marked} de 4 marcados</span>
        </div>
        <ChoiceGroup
          label="Participação pedagógica"
          icon={Brain}
          options={participation}
          value={form.participation}
          onChange={(v) => set('participation', v)}
          activeIcon={Star}
        />
        <ChoiceGroup
          label="Interação e convivência"
          icon={HeartHandshake}
          options={interaction}
          value={form.interaction}
          onChange={(v) => set('interaction', v)}
          tone="lilac"
          activeIcon={Heart}
        />
        <ChoiceGroup
          label="Alimentação & Lanches"
          icon={Utensils}
          options={meals}
          value={form.meals}
          onChange={(v) => set('meals', v)}
          tone="sun"
          activeIcon={ThumbsUp}
        />
        <ChoiceGroup
          label="Descanso da tarde"
          icon={BedDouble}
          options={rest}
          value={form.rest}
          onChange={(v) => set('rest', v)}
          activeIcon={BedDouble}
        />
        {form.rest === 'dormiu' && (
          <label className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-4 py-3 text-sm shadow-soft">
            Tempo de sono
            <input
              type="number"
              min={5}
              max={240}
              step={5}
              value={form.restMinutes ?? ''}
              onChange={(e) => set('restMinutes', e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-xl bg-surface-container-low px-3 py-1.5 text-right font-semibold outline-none"
            />
            minutos
          </label>
        )}
      </section>

      <DayNoteField value={form.dayNote} onChange={(v) => set('dayNote', v)} childFirstName={name} error={noteError} />

      {/* Fotos */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Camera className="size-[1.1rem] text-lilac-600" aria-hidden />
            Registro Fotográfico do Dia
          </h2>
          <span className="text-sm text-on-surface-variant">
            {form.photos.length} {form.photos.length === 1 ? 'selecionada' : 'selecionadas'}
          </span>
        </div>
        <DiaryPhotoPicker
          photos={form.photos}
          onChange={(photos) => set('photos', photos)}
          defaultTitle={form.activity?.title ?? 'Momento do dia'}
        />
      </section>

      {/* Observação interna */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <label htmlFor="internal-note" className="flex items-center gap-2 font-semibold">
            <Lock className="size-[1.1rem] text-on-surface-variant" aria-hidden />
            Observação Interna Pedagógica
          </label>
          <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold text-on-surface-variant">
            Apenas Equipe
          </span>
        </div>
        <div className="flex gap-3 rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-sun-600" aria-hidden />
          <textarea
            id="internal-note"
            rows={2}
            value={form.internalNote ?? ''}
            onChange={(e) => set('internalNote', e.target.value)}
            placeholder="Anotações para a equipe (não aparecem para a família)"
            className="w-full resize-none bg-transparent leading-relaxed outline-none placeholder:text-outline-variant"
          />
        </div>
      </section>

      {/* Ações */}
      <div className="space-y-3 pt-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() => save('enviado')}
          loading={saving === 'enviado'}
          disabled={!!saving}
          icon={<Send className="size-5" />}
        >
          Salvar e Enviar aos Responsáveis ✨
        </Button>
        <div className="grid grid-cols-[1.6fr_1fr] gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => save('rascunho')}
            loading={saving === 'rascunho'}
            disabled={!!saving}
            icon={<Bookmark className="size-4" />}
          >
            Salvar Rascunho
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setPreviewOpen(true)} icon={<Eye className="size-4" />}>
            Prévia
          </Button>
        </div>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Prévia para a família"
        subtitle="É assim que os responsáveis verão o registro"
        icon={<Eye className="size-5" />}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <TodayDiaryCard log={previewLog} teacherName={classGroup?.teacherName ?? ''} />
        </div>
      </Modal>
    </div>
  )
}
