import { Link } from 'react-router-dom'
import type { Faq } from '@/types'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FaqList } from '@/components/school/FaqList'

export function FaqSection({ items }: { items: Faq[] }) {
  return (
    <section className="pt-20 sm:pt-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="Dúvidas" tone="aqua" title="Perguntas frequentes" />
          <p className="mt-5 leading-relaxed text-on-surface-variant">
            Não encontrou o que procurava?{' '}
            <Link to="/contato" className="font-semibold text-aqua-800 underline decoration-aqua-200 underline-offset-4">
              Fale com a gente
            </Link>
            .
          </p>
        </div>
        <FaqList items={items} />
      </Container>
    </section>
  )
}
