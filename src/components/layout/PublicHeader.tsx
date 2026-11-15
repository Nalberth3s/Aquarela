import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, MessageCircle, UsersRound, X } from 'lucide-react'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { cn } from '@/utils/cn'
import { whatsappLink } from '@/utils/whatsapp'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Logo } from './Logo'
import { publicNav } from './navigation'

const mobileExtra = [
  { to: '/matriculas', label: 'Agende uma Visita' },
  { to: '/entrar', label: 'Área da Família' },
]

export function PublicHeader() {
  const info = useSchoolInfo()
  const { pathname } = useLocation()
  // O menu guarda a rota em que foi aberto: ao navegar, fecha sozinho.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const waLink = whatsappLink(info.whatsappNumber, 'Olá! Gostaria de agendar uma visita na Aquarela do Saber.')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/85 shadow-[0_4px_24px_rgb(59_130_166/0.06)] backdrop-blur-xl">
      <Container className="flex h-16 max-w-7xl! items-center justify-between gap-4 xl:h-20">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high xl:hidden"
            onClick={() => setOpenAt(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="menu-publico"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <span className="min-w-0 xl:hidden">
            <Logo compact className="whitespace-nowrap" />
          </span>
          <span className="hidden xl:block">
            <Logo className="whitespace-nowrap" />
          </span>
        </div>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {publicNav
              .filter((item) => !item.hideOnDesktop)
              .map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive ? 'bg-aqua-50 text-primary' : 'text-on-surface-variant hover:text-on-surface',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden xl:block">
            <Button to="/entrar" variant="soft" size="sm" icon={<UsersRound className="size-4" />}>
              Área da Família
            </Button>
          </span>
          <Button href={waLink} external variant="whatsapp" size="sm" icon={<MessageCircle className="size-4" />}>
            WhatsApp
          </Button>
        </div>
      </Container>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 top-16 -z-10 cursor-default bg-on-surface/10 xl:hidden"
            onClick={() => setOpenAt(null)}
          />
          <nav
            id="menu-publico"
            aria-label="Menu"
            className="absolute inset-x-4 top-[4.5rem] animate-fade-up rounded-2xl bg-surface-container-lowest/95 p-4 shadow-lift backdrop-blur-2xl xl:hidden"
          >
            <ul className="flex flex-col gap-1">
              {[...publicNav, ...mobileExtra].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        isActive ? 'bg-aqua-50 text-primary' : 'text-on-surface hover:bg-surface-container-low',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  )
}
