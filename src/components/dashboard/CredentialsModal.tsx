import { useState } from 'react'
import { Check, Copy, KeyRound, MessageCircle } from 'lucide-react'
import { maskPhone, whatsappNumber } from '@/utils/format'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export interface Credentials {
  name: string
  email: string
  temporaryPassword: string
  /** Com telefone, o botão do WhatsApp abre a conversa direto com a pessoa. */
  phone?: string | null
  /** A conta tem CPF cadastrado (pode entrar com ele). */
  cpfLogin?: boolean
}

/**
 * Mostra o login e a senha provisória logo após criar um acesso.
 * A senha não fica salva em texto: se perder, é preciso gerar outra.
 */
export function CredentialsModal({ credentials, onClose }: { credentials: Credentials | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const waNumber = whatsappNumber(credentials?.phone)
  const loginUrl = `${window.location.origin}/entrar`
  const message = credentials
    ? `Olá, ${credentials.name.split(' ')[0]}! Seu acesso ao sistema da Aquarela do Saber:\n\nEndereço: ${loginUrl}\nE-mail: ${credentials.email}\nSenha provisória: ${credentials.temporaryPassword}\n\nNo primeiro acesso você vai criar uma senha pessoal.${credentials.cpfLogin ? '\nVocê também pode entrar usando seu CPF no lugar do e-mail.' : ''}`
    : ''

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* sem permissão de área de transferência */
    }
  }

  return (
    <Modal
      open={!!credentials}
      onClose={onClose}
      title="Acesso criado!"
      subtitle="Repasse estes dados para a pessoa entrar pela primeira vez."
      icon={<KeyRound className="size-5" />}
    >
      {credentials && (
        <>
          <dl className="space-y-3 rounded-2xl bg-surface-container-low p-4">
            <div>
              <dt className="text-xs text-on-surface-variant">Nome</dt>
              <dd className="font-semibold">{credentials.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">E-mail (login)</dt>
              <dd className="font-semibold break-all">{credentials.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Senha provisória</dt>
              <dd className="font-mono text-2xl font-bold tracking-wider text-primary">{credentials.temporaryPassword}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-on-surface-variant">
            Anote agora: por segurança ela não é mostrada de novo. Se perder, use “Gerar nova senha”.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={copy} icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}>
              {copied ? 'Copiado!' : 'Copiar mensagem'}
            </Button>
            <Button
              variant="whatsapp"
              href={waNumber ? whatsappLink(waNumber, message) : `https://wa.me/?text=${encodeURIComponent(message)}`}
              external
              icon={<MessageCircle className="size-4" />}
            >
              {waNumber ? `Enviar para ${maskPhone(credentials.phone ?? '')}` : 'Enviar pelo WhatsApp'}
            </Button>
          </div>
          <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>
            Fechar
          </Button>
        </>
      )}
    </Modal>
  )
}
