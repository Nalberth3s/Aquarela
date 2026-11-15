import { useState } from 'react'
import { CircleCheck, MessageCircle, Send } from 'lucide-react'
import { schoolService } from '@/services'
import type { ContactMessageInput } from '@/types'
import { useForm } from '@/hooks/useForm'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { maskPhone } from '@/utils/format'
import { isEmail, isFilled, type Errors } from '@/utils/validation'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/FormField'

const initialValues: ContactMessageInput = { name: '', email: '', phone: '', message: '' }

function validate(v: ContactMessageInput): Errors<ContactMessageInput> {
  return {
    name: isFilled(v.name) ? undefined : 'Informe seu nome.',
    email: isEmail(v.email) ? undefined : 'Informe um e-mail válido.',
    message: v.message.trim().length >= 10 ? undefined : 'Escreva sua mensagem (mínimo de 10 caracteres).',
  }
}

function buildWhatsappText(v: ContactMessageInput, protocol?: string) {
  return [
    'Olá! Vim pelo site da Aquarela do Saber.',
    '',
    `*Nome:* ${v.name.trim()}`,
    `*E-mail:* ${v.email.trim()}`,
    v.phone ? `*Telefone:* ${v.phone}` : null,
    '',
    `*Mensagem:* ${v.message.trim()}`,
    protocol ? `\n_Protocolo ${protocol}_` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

/**
 * "Envie uma mensagem": salva no sistema (a coordenação lê em "Mensagens do site")
 * e abre o WhatsApp configurado com a mensagem pronta.
 */
export function ContactForm() {
  const info = useSchoolInfo()
  const target = info.contactFormWhatsapp ?? info.whatsappNumber
  const [sent, setSent] = useState<{ protocol?: string; link: string } | null>(null)
  const { values, errors, submitting, submitError, setField, handleSubmit, reset } = useForm({
    initialValues,
    validate,
    onSubmit: async (v) => {
      // Abre a aba já no clique (senão o navegador bloqueia o pop-up após o await).
      const tab = window.open('about:blank', '_blank')
      let protocol: string | undefined
      try {
        protocol = (await schoolService.sendContactMessage(v)).protocol
      } catch {
        // Mesmo se o registro falhar, a mensagem segue pelo WhatsApp.
      }
      const link = whatsappLink(target, buildWhatsappText(v, protocol))
      if (tab) tab.location.href = link
      else window.location.href = link
      setSent({ protocol, link })
    },
  })

  if (sent) {
    return (
      <div className="animate-fade-up rounded-3xl bg-sage-50 p-8 ring-1 ring-sage-100" role="status">
        <CircleCheck className="size-9 text-sage-600" aria-hidden />
        <h3 className="mt-4 text-2xl">Quase lá!</h3>
        <p className="mt-2 leading-relaxed text-on-surface-variant">
          Abrimos o WhatsApp com a sua mensagem pronta — é só tocar em <strong>enviar</strong> por lá.
          {sent.protocol && (
            <>
              {' '}
              Protocolo <strong className="text-on-surface">{sent.protocol}</strong>.
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="whatsapp" href={sent.link} external icon={<MessageCircle className="size-4" />}>
            Abrir o WhatsApp de novo
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSent(null)
              reset()
            }}
          >
            Nova mensagem
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <TextField
        label="Nome"
        required
        autoComplete="name"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
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
        label="Telefone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={(e) => setField('phone', maskPhone(e.target.value))}
      />
      <TextAreaField
        label="Mensagem"
        required
        rows={5}
        value={values.message}
        onChange={(e) => setField('message', e.target.value)}
        error={errors.message}
        className="col-span-full"
      />
      {submitError && (
        <p className="col-span-full rounded-2xl bg-coral-50 p-4 text-sm text-coral-800" role="alert">
          {submitError}
        </p>
      )}
      <div className="col-span-full flex flex-col items-start gap-2">
        <Button type="submit" size="lg" loading={submitting} icon={<Send className="size-4" />}>
          Enviar mensagem
        </Button>
        <p className="text-xs text-outline">Ao enviar, abrimos o WhatsApp com a sua mensagem pronta.</p>
      </div>
    </form>
  )
}
