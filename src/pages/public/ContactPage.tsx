import type { ReactNode } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/layout/PageHero'
import { ContactForm } from '@/components/school/ContactForm'
import { LocationMap } from '@/components/school/LocationMap'

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm text-outline">{label}</p>
        <div className="font-semibold text-on-surface">{children}</div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  useDocumentTitle(
    'Contato',
    'Endereço, WhatsApp, e-mail, horário de atendimento e mapa do Centro Educacional Aquarela do Saber em Senador Canedo - GO.',
  )
  const info = useSchoolInfo()

  return (
    <>
      <PageHero
        eyebrow="Contato"
        tone="aqua"
        title="Estamos por perto"
        description="Tire dúvidas, agende uma visita ou simplesmente venha tomar um café com a gente."
      />
      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="space-y-7">
            <InfoRow icon={MapPin} label="Endereço">
              {info.address} — {info.neighborhood}
              <br />
              {info.city} - {info.state}, {info.zipCode}
            </InfoRow>
            <InfoRow icon={Phone} label="Telefone">
              {info.phone}
            </InfoRow>
            <InfoRow icon={MessageCircle} label="WhatsApp">
              {info.whatsapp}
            </InfoRow>
            <InfoRow icon={Mail} label="E-mail">
              <a href={`mailto:${info.email}`} className="break-all hover:text-aqua-800">
                {info.email}
              </a>
            </InfoRow>
            <InfoRow icon={Clock} label="Horário de atendimento">
              {info.openingHours}
            </InfoRow>

            <LocationMap info={info} />
          </div>

          <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-soft sm:p-10 lg:self-start">
            <h2 className="text-2xl">Envie uma mensagem</h2>
            <p className="mt-2 mb-8 text-on-surface-variant">Respondemos em horário comercial.</p>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  )
}
