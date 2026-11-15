import { Outlet } from 'react-router-dom'
import { BookOpenText, CalendarDays, House, MessageCircle, School } from 'lucide-react'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { whatsappLink } from '@/utils/whatsapp'
import { MobileTabBar } from './MobileTabBar'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

export function PublicLayout() {
  const info = useSchoolInfo()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-full bg-on-surface px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo" className="flex-1 pt-16 xl:pt-20">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileTabBar
        label="Atalhos"
        items={[
          { label: 'Início', icon: House, to: '/', end: true },
          { label: 'Escola', icon: School, to: '/sobre' },
          { label: 'Diário', icon: BookOpenText, to: '/entrar' },
          { label: 'Visita', icon: CalendarDays, to: '/matriculas' },
          {
            label: 'Contato',
            icon: MessageCircle,
            href: whatsappLink(info.whatsappNumber, 'Olá! Gostaria de informações sobre a Aquarela do Saber.'),
          },
        ]}
      />
    </div>
  )
}
