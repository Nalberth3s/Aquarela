import { useState, type FormEvent } from 'react'
import { MessageCircle } from 'lucide-react'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/FormField'

/**
 * Formulário rápido de visita: abre o WhatsApp da escola com a mensagem pronta.
 * (Para o cadastro completo de interesse, ver EnrollmentForm.)
 */
export function VisitWhatsAppForm() {
  const info = useSchoolInfo()
  const [guardian, setGuardian] = useState('')
  const [child, setChild] = useState('')
  const [errors, setErrors] = useState<{ guardian?: string; child?: string }>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = {
      guardian: guardian.trim() ? undefined : 'Informe seu nome.',
      child: child.trim() ? undefined : 'Informe o nome e a idade da criança.',
    }
    setErrors(next)
    if (next.guardian || next.child) return
    const message = `Olá! Gostaria de agendar uma visita na Aquarela do Saber. Nome: ${guardian.trim()}, Criança: ${child.trim()}`
    window.open(whatsappLink(info.whatsappNumber, message), '_blank', 'noopener')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <TextField
        label="Seu nome"
        placeholder="Nome do responsável"
        autoComplete="name"
        value={guardian}
        onChange={(e) => setGuardian(e.target.value)}
        error={errors.guardian}
      />
      <TextField
        label="Nome e idade da criança"
        placeholder="Ex: Alice, 3 anos"
        value={child}
        onChange={(e) => setChild(e.target.value)}
        error={errors.child}
      />
      <Button type="submit" variant="whatsapp" size="lg" className="mt-1 w-full whitespace-normal" icon={<MessageCircle className="size-5" />}>
        Falar no WhatsApp {info.whatsapp}
      </Button>
    </form>
  )
}
