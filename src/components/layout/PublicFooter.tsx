import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { whatsappLink } from '@/utils/whatsapp'
import { InstagramIcon } from '@/components/ui/BrandIcons'
import { Container } from '@/components/ui/Container'
import { Logo } from './Logo'
import { publicNav } from './navigation'

export function PublicFooter() {
  const info = useSchoolInfo()
  const year = new Date().getFullYear()

  return (
    <footer id="contato" className="bg-surface-container-lowest pb-20 lg:pb-0">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr] lg:py-16">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
            {info.tagline}. Ensino infantil com criatividade, cuidado e diversão em {info.city} - {info.state}.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <p className="mb-4 text-xs font-semibold tracking-wider text-primary uppercase">Navegação</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm lg:grid-cols-1">
            {[...publicNav, { to: '/matriculas', label: 'Pré-matrícula' }, { to: '/entrar', label: 'Área da Família' }].map(
              (item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-on-surface-variant hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-wider text-primary uppercase">Contato</p>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-[1.1rem] shrink-0 text-primary" aria-hidden />
              <span>
                {info.address}, {info.neighborhood} • {info.city} - {info.state}, {info.zipCode}
              </span>
            </li>
            <li>
              <a
                href={whatsappLink(info.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="flex gap-2.5 hover:text-on-surface"
              >
                <MessageCircle className="mt-0.5 size-[1.1rem] shrink-0 text-whatsapp" aria-hidden />
                WhatsApp: {info.whatsapp}
              </a>
            </li>
            <li>
              <a href={info.instagramUrl} target="_blank" rel="noreferrer" className="flex gap-2.5 hover:text-on-surface">
                <InstagramIcon className="mt-0.5 size-[1.1rem] shrink-0 text-secondary" />
                Instagram: {info.instagram}
              </a>
            </li>
            <li>
              <a href={`mailto:${info.email}`} className="flex gap-2.5 break-all hover:text-on-surface">
                <Mail className="mt-0.5 size-[1.1rem] shrink-0 text-sage-600" aria-hidden />
                {info.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-[1.1rem] shrink-0 text-sun-600" aria-hidden />
              {info.openingHours}
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-surface-container">
        <Container className="py-5 text-center text-xs text-outline">
          © {year} {info.legalName}. Todos os direitos reservados.
        </Container>
      </div>
    </footer>
  )
}
