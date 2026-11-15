import { ArrowLeft } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { WatercolorBlob } from '@/components/school/WatercolorBlob'

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada')
  return (
    <section className="relative overflow-hidden py-28">
      <WatercolorBlob tone="lilac" variant={1} intensity={0.5} className="absolute top-0 left-1/2 w-[28rem] -translate-x-1/2" />
      <Container className="relative text-center">
        <p className="font-display text-7xl font-semibold text-on-surface/80">404</p>
        <h1 className="mt-4 text-3xl">Essa página se perdeu no caminho</h1>
        <p className="mx-auto mt-3 max-w-md text-on-surface-variant">O endereço pode ter mudado ou não existir mais.</p>
        <Button to="/" className="mt-8" icon={<ArrowLeft className="size-4" />}>
          Voltar ao início
        </Button>
      </Container>
    </section>
  )
}
