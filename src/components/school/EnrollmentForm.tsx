import { useState } from 'react'
import { ArrowRight, CircleCheck, Sparkles } from 'lucide-react'
import { enrollmentService } from '@/services'
import type { EnrollmentRequest, EnrollmentRequestInput } from '@/types'
import { useForm } from '@/hooks/useForm'
import { firstName, maskPhone } from '@/utils/format'
import { shiftLabels } from '@/utils/labels'
import { suggestSegment } from '@/utils/school'
import { isEmail, isFilled, isPastDate, isPhone, type Errors } from '@/utils/validation'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/FormField'

const initialValues: EnrollmentRequestInput = {
  guardianName: '',
  email: '',
  phone: '',
  childName: '',
  childBirthDate: '',
  preferredShift: 'integral',
  howDidYouHear: '',
  message: '',
  wantsVisit: true,
}

function validate(v: EnrollmentRequestInput): Errors<EnrollmentRequestInput> {
  return {
    guardianName: isFilled(v.guardianName) ? undefined : 'Informe seu nome.',
    email: isEmail(v.email) ? undefined : 'Informe um e-mail válido.',
    phone: isPhone(v.phone) ? undefined : 'Informe um telefone com DDD.',
    childName: isFilled(v.childName) ? undefined : 'Informe o nome da criança.',
    childBirthDate: isPastDate(v.childBirthDate) ? undefined : 'Informe a data de nascimento.',
  }
}

export function EnrollmentForm() {
  const [result, setResult] = useState<EnrollmentRequest | null>(null)
  const { values, errors, submitting, submitError, setField, handleSubmit, reset } = useForm({
    initialValues,
    validate,
    onSubmit: async (v) => setResult(await enrollmentService.submit(v)),
  })

  if (result) {
    return (
      <div className="animate-fade-up rounded-3xl bg-sage-50 p-8 ring-1 ring-sage-100 sm:p-10" role="status">
        <CircleCheck className="size-10 text-sage-600" aria-hidden />
        <h3 className="mt-5 text-2xl">Recebemos seu interesse, {firstName(result.guardianName)}!</h3>
        <p className="mt-3 max-w-lg leading-relaxed text-on-surface-variant">
          Nossa secretaria entrará em contato em até 1 dia útil pelo telefone ou e-mail informado
          {result.wantsVisit ? ' para combinar o melhor horário da visita' : ''}.
        </p>
        <dl className="mt-6 grid gap-4 rounded-2xl bg-white p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-outline">Criança</dt>
            <dd className="font-semibold">{result.childName}</dd>
          </div>
          <div>
            <dt className="text-outline">Segmento indicado</dt>
            <dd className="font-semibold">{result.suggestedSegment}</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          className="mt-7"
          onClick={() => {
            setResult(null)
            reset()
          }}
        >
          Enviar outro pedido
        </Button>
      </div>
    )
  }

  const segment = values.childBirthDate ? suggestSegment(values.childBirthDate) : null

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="contents" role="group">
        <p className="col-span-full text-xs font-bold tracking-[0.16em] text-outline uppercase">
          Sobre você
        </p>
        <TextField
          label="Seu nome"
          required
          autoComplete="name"
          value={values.guardianName}
          onChange={(e) => setField('guardianName', e.target.value)}
          error={errors.guardianName}
          className="col-span-full"
        />
        <TextField
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Telefone / WhatsApp"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(62) 90000-0000"
          value={values.phone}
          onChange={(e) => setField('phone', maskPhone(e.target.value))}
          error={errors.phone}
        />
      </div>

      <div className="contents" role="group">
        <p className="col-span-full mt-4 text-xs font-bold tracking-[0.16em] text-outline uppercase">
          Sobre a criança
        </p>
        <TextField
          label="Nome da criança"
          required
          value={values.childName}
          onChange={(e) => setField('childName', e.target.value)}
          error={errors.childName}
        />
        <TextField
          label="Data de nascimento"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          value={values.childBirthDate}
          onChange={(e) => setField('childBirthDate', e.target.value)}
          error={errors.childBirthDate}
          hint={
            segment && !errors.childBirthDate ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-sage-600">
                <Sparkles className="size-3.5" aria-hidden /> Segmento indicado: {segment.name}
              </span>
            ) : undefined
          }
        />
        <SelectField
          label="Turno de interesse"
          value={values.preferredShift}
          onChange={(e) => setField('preferredShift', e.target.value as EnrollmentRequestInput['preferredShift'])}
        >
          {Object.entries(shiftLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {value === 'integral' ? 'Período integral' : `Meio período — ${label.toLowerCase()}`}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Como conheceu a escola?"
          value={values.howDidYouHear}
          onChange={(e) => setField('howDidYouHear', e.target.value)}
        >
          <option value="">Selecione (opcional)</option>
          <option>Indicação de amigos ou familiares</option>
          <option>Instagram</option>
          <option>Google</option>
          <option>Passei em frente à escola</option>
          <option>Outro</option>
        </SelectField>
        <TextAreaField
          label="Algo que gostaria de nos contar?"
          placeholder="Dúvidas, necessidades específicas, melhor horário para contato…"
          value={values.message}
          onChange={(e) => setField('message', e.target.value)}
          className="col-span-full"
        />
      </div>

      <label className="col-span-full flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-container-low/70 p-4">
        <input
          type="checkbox"
          checked={values.wantsVisit}
          onChange={(e) => setField('wantsVisit', e.target.checked)}
          className="mt-1 size-4 accent-aqua-800"
        />
        <span className="text-[0.95rem] text-on-surface-variant">
          <span className="font-semibold text-on-surface">Quero agendar uma visita.</span> Vamos sugerir horários em que você
          possa conhecer os espaços e conversar com a coordenação.
        </span>
      </label>

      {submitError && (
        <p className="col-span-full rounded-2xl bg-coral-50 p-4 text-sm text-coral-800" role="alert">
          {submitError}
        </p>
      )}

      <div className="col-span-full flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-outline">Seus dados são usados apenas para o contato da escola.</p>
        <Button type="submit" size="lg" loading={submitting} iconRight={<ArrowRight className="size-4" />}>
          Enviar interesse
        </Button>
      </div>
    </form>
  )
}
